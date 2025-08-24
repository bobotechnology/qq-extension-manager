// 插件兼容性检测工具
const fs = require('fs');
const path = require('path');

class PluginCompatibilityChecker {
    constructor(pluginsPath) {
        this.pluginsPath = pluginsPath;
        this.compatibilityConfig = this.loadCompatibilityConfig();
        this.results = [];
    }

    loadCompatibilityConfig() {
        try {
            const configPath = path.join(__dirname, 'plugin_compatibility.json');
            return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (e) {
            console.warn('无法加载兼容性配置文件');
            return { compatibility_settings: {}, plugin_specific_settings: {} };
        }
    }

    // 检查所有插件
    async checkAllPlugins() {
        if (!fs.existsSync(this.pluginsPath)) {
            console.log('插件目录不存在:', this.pluginsPath);
            return;
        }

        const pluginDirs = fs.readdirSync(this.pluginsPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        console.log(`🔍 开始检查 ${pluginDirs.length} 个插件的兼容性...`);
        console.log('');

        for (const pluginDir of pluginDirs) {
            await this.checkPlugin(pluginDir);
        }

        this.generateReport();
    }

    // 检查单个插件
    async checkPlugin(pluginName) {
        const pluginPath = path.join(this.pluginsPath, pluginName);
        const manifestPath = path.join(pluginPath, 'manifest.json');

        const result = {
            name: pluginName,
            path: pluginPath,
            compatible: true,
            issues: [],
            warnings: [],
            recommendations: []
        };

        try {
            // 检查manifest.json
            if (!fs.existsSync(manifestPath)) {
                result.issues.push('缺少 manifest.json 文件');
                result.compatible = false;
            } else {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
                await this.checkManifest(manifest, result);
            }

            // 检查插件代码
            await this.checkPluginCode(pluginPath, result);

            // 检查特定插件设置
            this.checkSpecificSettings(pluginName, result);

        } catch (error) {
            result.issues.push(`检查过程出错: ${error.message}`);
            result.compatible = false;
        }

        this.results.push(result);
        this.logPluginResult(result);
    }

    // 检查manifest.json
    async checkManifest(manifest, result) {
        // 检查是否使用了旧的LiteLoader API
        const manifestStr = JSON.stringify(manifest);
        
        if (manifestStr.includes('LiteLoader')) {
            result.warnings.push('manifest.json中包含LiteLoader引用，建议更新为QQExtension');
        }

        // 检查injects文件
        if (manifest.injects) {
            ['main', 'renderer', 'preload'].forEach(type => {
                if (manifest.injects[type]) {
                    const injectPath = path.join(path.dirname(result.path), manifest.injects[type]);
                    if (fs.existsSync(injectPath)) {
                        this.checkInjectFile(injectPath, type, result);
                    }
                }
            });
        }
    }

    // 检查注入文件
    checkInjectFile(filePath, type, result) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // 检查LiteLoader API使用
            const liteLoaderUsages = [
                'LiteLoader.api',
                'LiteLoader.path',
                'LiteLoader.versions',
                'LiteLoader.plugins'
            ];

            liteLoaderUsages.forEach(api => {
                if (content.includes(api)) {
                    result.warnings.push(`${type}文件中使用了旧API: ${api}`);
                    result.recommendations.push(`将 ${api} 替换为 ${api.replace('LiteLoader', 'QQExtension')}`);
                }
            });

            // 检查DOM查询
            const domQueries = [
                'querySelector.*liteloader',
                'getElementById.*liteloader',
                'getElementsByClassName.*liteloader'
            ];

            domQueries.forEach(query => {
                const regex = new RegExp(query, 'i');
                if (regex.test(content)) {
                    result.warnings.push(`${type}文件中可能包含被保护的DOM查询`);
                    result.recommendations.push('检查DOM选择器，确保不查询liteloader相关元素');
                }
            });

            // 检查网络请求
            if (content.includes('fetch') || content.includes('XMLHttpRequest')) {
                if (content.includes('liteloader')) {
                    result.warnings.push(`${type}文件中包含可能被拦截的网络请求`);
                    result.recommendations.push('检查网络请求URL，避免包含liteloader关键词');
                }
            }

        } catch (error) {
            result.warnings.push(`无法读取${type}文件: ${error.message}`);
        }
    }

    // 检查插件代码
    async checkPluginCode(pluginPath, result) {
        try {
            const files = this.getAllJSFiles(pluginPath);
            
            for (const file of files) {
                const content = fs.readFileSync(file, 'utf-8');
                
                // 检查控制台输出
                if (content.includes('console.') && content.includes('liteloader')) {
                    result.warnings.push('代码中包含可能被过滤的控制台输出');
                }

                // 检查文件系统访问
                const fsPatterns = ['fs.readFileSync', 'fs.writeFileSync', 'fs.existsSync'];
                fsPatterns.forEach(pattern => {
                    if (content.includes(pattern) && content.includes('liteloader')) {
                        result.warnings.push('代码中包含可能被保护的文件系统访问');
                    }
                });
            }
        } catch (error) {
            result.warnings.push(`代码检查失败: ${error.message}`);
        }
    }

    // 获取所有JS文件
    getAllJSFiles(dir) {
        const files = [];
        
        function scanDir(currentDir) {
            const items = fs.readdirSync(currentDir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item.name);
                
                if (item.isDirectory()) {
                    scanDir(fullPath);
                } else if (item.name.endsWith('.js')) {
                    files.push(fullPath);
                }
            }
        }
        
        scanDir(dir);
        return files;
    }

    // 检查特定插件设置
    checkSpecificSettings(pluginName, result) {
        const specificSettings = this.compatibilityConfig.plugin_specific_settings;
        
        if (specificSettings[pluginName]) {
            const settings = specificSettings[pluginName];
            result.recommendations.push(`已找到${pluginName}的特定兼容性设置`);
            
            if (settings.notes) {
                result.recommendations.push(`说明: ${settings.notes}`);
            }
        } else {
            result.recommendations.push('建议为此插件添加特定的兼容性设置');
        }
    }

    // 输出插件检查结果
    logPluginResult(result) {
        const status = result.compatible ? '✅' : '❌';
        const warningCount = result.warnings.length;
        const issueCount = result.issues.length;
        
        console.log(`${status} ${result.name}`);
        
        if (issueCount > 0) {
            console.log(`   🚨 ${issueCount}个问题:`);
            result.issues.forEach(issue => {
                console.log(`      • ${issue}`);
            });
        }
        
        if (warningCount > 0) {
            console.log(`   ⚠️  ${warningCount}个警告:`);
            result.warnings.forEach(warning => {
                console.log(`      • ${warning}`);
            });
        }
        
        if (result.recommendations.length > 0) {
            console.log(`   💡 建议:`);
            result.recommendations.slice(0, 2).forEach(rec => {
                console.log(`      • ${rec}`);
            });
        }
        
        console.log('');
    }

    // 生成兼容性报告
    generateReport() {
        const compatible = this.results.filter(r => r.compatible).length;
        const total = this.results.length;
        const compatibility = ((compatible / total) * 100).toFixed(1);

        console.log('📊 兼容性检查报告');
        console.log('==================');
        console.log(`总插件数: ${total}`);
        console.log(`兼容插件: ${compatible}`);
        console.log(`兼容率: ${compatibility}%`);
        console.log('');

        // 按兼容性分类
        const incompatible = this.results.filter(r => !r.compatible);
        const withWarnings = this.results.filter(r => r.compatible && r.warnings.length > 0);

        if (incompatible.length > 0) {
            console.log('❌ 不兼容的插件:');
            incompatible.forEach(result => {
                console.log(`   • ${result.name}: ${result.issues.join(', ')}`);
            });
            console.log('');
        }

        if (withWarnings.length > 0) {
            console.log('⚠️  有警告的插件:');
            withWarnings.forEach(result => {
                console.log(`   • ${result.name}: ${result.warnings.length}个警告`);
            });
            console.log('');
        }

        console.log('💡 总体建议:');
        console.log('   • 将所有LiteLoader API替换为QQExtension API');
        console.log('   • 避免在代码中直接引用liteloader关键词');
        console.log('   • 测试插件在新环境下的功能完整性');
        console.log('   • 参考 PLUGIN_COMPATIBILITY.md 了解迁移指南');
        console.log('');

        // 保存详细报告
        this.saveDetailedReport();
    }

    // 保存详细报告到文件
    saveDetailedReport() {
        const reportPath = path.join(__dirname, '..', '..', 'compatibility_report.json');
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.results.length,
                compatible: this.results.filter(r => r.compatible).length,
                compatibility_rate: ((this.results.filter(r => r.compatible).length / this.results.length) * 100).toFixed(1) + '%'
            },
            results: this.results
        };

        try {
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
            console.log(`📄 详细报告已保存到: ${reportPath}`);
        } catch (error) {
            console.warn('保存报告失败:', error.message);
        }
    }
}

module.exports = { PluginCompatibilityChecker };

// 如果直接运行此脚本
if (require.main === module) {
    const pluginsPath = process.argv[2] || path.join(__dirname, '..', '..', '..', 'plugins');
    const checker = new PluginCompatibilityChecker(pluginsPath);
    
    console.log('🔧 QQ Extension Manager - 插件兼容性检查工具');
    console.log('===========================================');
    console.log('');
    
    checker.checkAllPlugins().catch(console.error);
}