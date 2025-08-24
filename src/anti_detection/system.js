// 反检测系统主集成模块
const { AntiDetectionCore } = require('./core.js');
const { DynamicFeatureGenerator } = require('./dynamic_features.js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class AntiDetectionSystem {
    constructor() {
        this.isActive = false;
        this.core = null;
        this.dynamicFeatures = null;
        
        // 加载兼容性配置
        try {
            const compatConfig = require('./plugin_compatibility.json');
            this.compatibilityConfig = compatConfig;
        } catch (e) {
            this.compatibilityConfig = { compatibility_settings: {} };
        }
        
        this.config = {
            enableProcessMonitoring: true,
            enableMemoryProtection: true,
            enableDOMProtection: true,
            enableNetworkDeception: true,
            enableDynamicFeatures: true,
            logLevel: 'normal', // 'silent', 'normal', 'verbose'
            compatibilityMode: 'balanced' // 'strict', 'balanced', 'permissive'
        };
        
        this.threats = new Set();
        this.startTime = Date.now();
        this.pluginWhitelist = new Set();
        
        // 初始化插件白名单
        this.initializePluginWhitelist();
    }

    // 初始化插件白名单
    initializePluginWhitelist() {
        const globalWhitelist = this.compatibilityConfig.compatibility_settings?.global_whitelist || [];
        globalWhitelist.forEach(item => this.pluginWhitelist.add(item));
        
        // 添加插件特定设置
        const pluginSettings = this.compatibilityConfig.plugin_specific_settings || {};
        Object.values(pluginSettings).forEach(plugin => {
            if (plugin.special_permissions) {
                plugin.special_permissions.forEach(permission => {
                    this.pluginWhitelist.add(permission);
                });
            }
        });
        
        this.log(`已加载 ${this.pluginWhitelist.size} 个插件兼容性规则`);
    }

    // 检查是否为插件调用
    isPluginCall(stack) {
        if (!stack) return false;
        
        return Array.from(this.pluginWhitelist).some(pattern => 
            stack.includes(pattern)
        );
    }

    // 获取兼容性模式设置
    getCompatibilityModeSettings() {
        const mode = this.config.compatibilityMode;
        return this.compatibilityConfig.compatibility_mode?.[mode] || 
               this.compatibilityConfig.compatibility_mode?.balanced;
    }
    async start() {
        if (this.isActive) return;
        
        try {
            this.log('启动QQ扩展管理器安全系统...');
            
            // 1. 初始化动态特征生成器
            if (this.config.enableDynamicFeatures) {
                this.dynamicFeatures = new DynamicFeatureGenerator();
                await this.setupDynamicFeatures();
            }
            
            // 2. 启动核心反检测系统
            this.core = new AntiDetectionCore();
            
            // 3. 设置系统级保护
            this.setupSystemProtection();
            
            // 4. 设置进程保护
            this.setupProcessProtection();
            
            // 5. 设置网络保护
            if (this.config.enableNetworkDeception) {
                this.setupNetworkProtection();
            }
            
            // 6. 设置文件系统保护
            this.setupFileSystemProtection();
            
            // 7. 启动监控循环
            this.startMonitoring();
            
            this.isActive = true;
            this.log('安全系统启动完成');
            
        } catch (error) {
            this.log(`安全系统启动失败: ${error.message}`, 'error');
        }
    }

    // 设置动态特征
    async setupDynamicFeatures() {
        if (!this.dynamicFeatures) return;
        
        // 生成动态IPC通道
        const originalIPC = 'QQExtension.QQExtension';
        const dynamicIPC = this.dynamicFeatures.generateDynamicIPCChannel('extension');
        
        // 重新定义全局对象名称
        const dynamicGlobalName = this.dynamicFeatures.createDynamicModuleName('QQExt');
        
        // 生成假的文件结构
        this.dynamicFeatures.generateFakeFileStructure();
        
        this.log(`动态特征已生成 - 会话: ${this.dynamicFeatures.getDynamicFeature('session_id').substring(0, 8)}`);
    }

    // 设置系统级保护
    setupSystemProtection() {
        // 保护关键环境变量
        const protectedEnvVars = [
            'QQ_EXTENSION_PROFILE', 'QQEXTENSION_ROOT', 'NODE_ENV'
        ];
        
        protectedEnvVars.forEach(varName => {
            if (process.env[varName]) {
                // 备份原值
                const originalValue = process.env[varName];
                
                // 创建代理
                Object.defineProperty(process.env, varName, {
                    get() {
                        const stack = new Error().stack;
                        if (this.isAuthorizedAccess(stack)) {
                            return originalValue;
                        }
                        return undefined;
                    },
                    set() {
                        // 阻止修改
                        return false;
                    },
                    enumerable: false,
                    configurable: false
                });
            }
        });
        
        // 保护process.argv
        const originalArgv = [...process.argv];
        Object.defineProperty(process, 'argv', {
            get() {
                // 返回清洁的argv，移除敏感参数
                return originalArgv.filter(arg => 
                    !arg.includes('liteloader') && 
                    !arg.includes('extension') &&
                    !arg.includes('debug')
                );
            },
            enumerable: true,
            configurable: false
        });
    }

    // 设置进程保护
    setupProcessProtection() {
        // 修改进程标题
        const originalTitle = process.title;
        process.title = this.dynamicFeatures ? 
            `QQ Desktop ${this.dynamicFeatures.getDynamicFeature('version')}` : 
            'QQ Desktop Application';
        
        // 隐藏敏感的进程信息
        if (process.pid) {
            this.log(`进程保护已启用 - PID: ${process.pid}`);
        }
        
        // 监控进程状态
        process.on('SIGTERM', () => this.handleShutdown('SIGTERM'));
        process.on('SIGINT', () => this.handleShutdown('SIGINT'));
        process.on('beforeExit', () => this.handleShutdown('beforeExit'));
    }

    // 设置网络保护
    setupNetworkProtection() {
        // 劫持require模块以保护网络相关模块
        const Module = require('module');
        const originalRequire = Module.prototype.require;
        
        Module.prototype.require = function(id) {
            // 检查是否为网络监控工具
            const suspiciousModules = [
                'wireshark', 'tcpdump', 'netstat', 'ss', 'lsof'
            ];
            
            if (suspiciousModules.some(mod => id.includes(mod))) {
                throw new Error(`Module not found: ${id}`);
            }
            
            return originalRequire.apply(this, arguments);
        };
    }

    // 设置文件系统保护
    setupFileSystemProtection() {
        // 保护敏感文件访问
        const originalReadFileSync = fs.readFileSync;
        const originalExistsSync = fs.existsSync;
        const originalStatSync = fs.statSync;
        
        // 敏感路径模式（只保护liteloader，不保护qqextension）
        const sensitivePatterns = [
            /(?<!qq)liteloader(?!.*qqextension)/i  // 只匹配liteloader，但不包含qqextension的情况
        ];
        
        // 白名单：允许访问的路径
        const allowedPaths = [
            'qqextension_api', 'extension_core', '/plugins/', 'plugin.js',
            'QQExtension', 'qq-extension-manager'
        ];
        
        fs.readFileSync = function(filePath, options) {
            const pathStr = filePath.toString();
            
            // 检查是否为允许的路径
            const isAllowed = allowedPaths.some(path => pathStr.includes(path));
            
            if (!isAllowed && sensitivePatterns.some(pattern => pattern.test(pathStr))) {
                const stack = new Error().stack;
                if (!this.isAuthorizedAccess(stack)) {
                    throw new Error(`ENOENT: no such file or directory, open '${pathStr}'`);
                }
            }
            
            return originalReadFileSync.call(this, filePath, options);
        }.bind(this);
        
        fs.existsSync = function(filePath) {
            const pathStr = filePath.toString();
            
            const isAllowed = allowedPaths.some(path => pathStr.includes(path));
            
            if (!isAllowed && sensitivePatterns.some(pattern => pattern.test(pathStr))) {
                const stack = new Error().stack;
                if (!this.isAuthorizedAccess(stack)) {
                    return false;
                }
            }
            
            return originalExistsSync.call(this, filePath);
        }.bind(this);
    }

    // 检查是否为授权访问
    isAuthorizedAccess(stack) {
        const authorizedPaths = [
            'qqextension_api', 'extension_core', 'anti_detection'
        ];
        
        return authorizedPaths.some(path => stack.includes(path));
    }

    // 启动监控循环
    startMonitoring() {
        const monitoringInterval = 5000; // 5秒
        
        const monitor = () => {
            if (!this.isActive) return;
            
            try {
                // 检查系统状态
                this.checkSystemIntegrity();
                
                // 检查威胁状态
                this.checkThreatLevel();
                
                // 更新动态特征
                if (this.dynamicFeatures) {
                    this.updateDynamicFeatures();
                }
                
            } catch (error) {
                this.log(`监控错误: ${error.message}`, 'error');
            }
            
            setTimeout(monitor, monitoringInterval);
        };
        
        setTimeout(monitor, monitoringInterval);
        this.log('系统监控已启动');
    }

    // 检查系统完整性
    checkSystemIntegrity() {
        const uptime = Date.now() - this.startTime;
        
        // 检查是否有异常的内存使用
        if (process.memoryUsage().external > 100 * 1024 * 1024) { // 100MB
            this.handleThreat('high_memory_usage');
        }
        
        // 检查运行时间异常
        if (uptime < 1000 && this.threats.size > 0) {
            this.handleThreat('quick_restart_with_threats');
        }
    }

    // 检查威胁级别
    checkThreatLevel() {
        const threatCount = this.threats.size;
        
        if (threatCount > 5) {
            this.activateHighSecurityMode();
        } else if (threatCount > 2) {
            this.activateMediumSecurityMode();
        }
    }

    // 更新动态特征
    updateDynamicFeatures() {
        if (!this.dynamicFeatures) return;
        
        // 每30分钟更新一次动态特征
        const updateInterval = 30 * 60 * 1000;
        if ((Date.now() - this.startTime) % updateInterval < 5000) {
            this.dynamicFeatures.generateDynamicPaths();
            this.log('动态特征已更新');
        }
    }

    // 激活高安全模式
    activateHighSecurityMode() {
        this.log('激活高安全模式', 'warn');
        
        // 增强保护措施
        if (this.core) {
            this.core.deployMoreDecoys();
            this.core.increaseCamouflage();
        }
        
        // 清理更多敏感数据
        this.deepCleanSensitiveData();
    }

    // 激活中等安全模式
    activateMediumSecurityMode() {
        this.log('激活中等安全模式', 'warn');
        
        if (this.core) {
            this.core.changeBehaviorPattern();
        }
    }

    // 深度清理敏感数据
    deepCleanSensitiveData() {
        // 清理全局变量
        const sensitiveGlobals = [
            'LiteLoader', '_liteloader', 'LITELOADER', 
            'QQExtension_DEBUG', 'EXTENSION_DEBUG'
        ];
        
        sensitiveGlobals.forEach(name => {
            try {
                delete globalThis[name];
                delete global[name];
            } catch {}
        });
        
        // 强制垃圾回收
        if (global.gc) {
            global.gc();
        }
    }

    // 处理威胁
    handleThreat(threatType) {
        this.threats.add(threatType);
        this.log(`检测到威胁: ${threatType}`, 'warn');
        
        if (this.core) {
            this.core.handleDetectedThreat(threatType);
        }
    }

    // 处理关机
    handleShutdown(signal) {
        this.log(`接收到关机信号: ${signal}`);
        this.stop();
    }

    // 停止反检测系统
    stop() {
        if (!this.isActive) return;
        
        this.log('正在停止安全系统...');
        
        try {
            // 清理核心系统
            if (this.core) {
                this.core.destroy();
            }
            
            // 清理动态特征
            if (this.dynamicFeatures) {
                this.dynamicFeatures.cleanup();
            }
            
            // 清理威胁记录
            this.threats.clear();
            
            this.isActive = false;
            this.log('安全系统已停止');
            
        } catch (error) {
            this.log(`停止安全系统时出错: ${error.message}`, 'error');
        }
    }

    // 获取系统状态
    getStatus() {
        return {
            active: this.isActive,
            uptime: Date.now() - this.startTime,
            threatCount: this.threats.size,
            threats: Array.from(this.threats),
            dynamicSession: this.dynamicFeatures ? 
                this.dynamicFeatures.getDynamicFeature('session_id') : null
        };
    }

    // 日志输出
    log(message, level = 'info') {
        if (this.config.logLevel === 'silent') return;
        
        const timestamp = new Date().toISOString().substring(11, 19);
        const colors = {
            info: '\x1b[32m',    // 绿色
            warn: '\x1b[33m',    // 黄色
            error: '\x1b[31m',   // 红色
            verbose: '\x1b[36m'  // 青色
        };
        
        const color = colors[level] || colors.info;
        const reset = '\x1b[0m';
        
        if (level === 'verbose' && this.config.logLevel !== 'verbose') return;
        
        console.log(`${color}[QQExtension Security ${timestamp}]${reset} ${message}`);
    }
}

module.exports = { AntiDetectionSystem };