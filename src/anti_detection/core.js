// 反检测核心模块
const { exec, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class AntiDetectionCore {
    constructor() {
        this.processMonitors = new Map();
        this.memoryProtectors = new Set();
        this.isActive = true;
        this.decoyProcs = [];
        this.fakeFeatures = new Map();
        this.intervals = new Set(); // 跟踪所有定时器
        this.performanceMetrics = {
            cpuUsage: 0,
            memoryUsage: 0,
            lastCheck: Date.now()
        };
        
        // 启动反检测机制
        this.init();
    }

    init() {
        // 暂时禁用所有可能导致系统不稳定的功能
        // this.setupProcessMonitoring();
        // this.setupAntiDebug();
        this.setupMemoryProtection();
        // 暂时禁用诱饵进程，避免死循环
        // this.setupDecoyProcesses();
        this.setupFakeFeatures();
        // this.setupNetworkDeception();
    }

    // 进程监控和对抗
    setupProcessMonitoring() {
        const suspiciousProcesses = [
            'procmon.exe', 'procmon64.exe',
            'wireshark.exe', 'x64dbg.exe', 'x32dbg.exe',
            'ida.exe', 'ida64.exe', 'ollydbg.exe',
            'cheatengine.exe', 'processhacker.exe',
            'autoruns.exe', 'regmon.exe', 'filemon.exe',
            'tcpview.exe', 'portmon.exe'
        ];

        const checkProcesses = () => {
            exec('tasklist /fo csv', (error, stdout) => {
                if (error) return;
                
                const processes = stdout.toLowerCase();
                for (const proc of suspiciousProcesses) {
                    if (processes.includes(proc.toLowerCase())) {
                        this.handleDetectedThreat(proc);
                    }
                }
            });
        };

        // 每30秒检查一次可疑进程（降低频率减少系统负载）
        const processInterval = setInterval(() => {
            try {
                if (this.isActive && this.shouldPerformCheck()) {
                    checkProcesses();
                }
            } catch (error) {
                console.error('[AntiDetection] Process monitoring error:', error);
            }
        }, 30000);
        
        this.intervals.add(processInterval);
        
        // 启动时立即检查
        if (this.shouldPerformCheck()) {
            checkProcesses();
        }
    }

    // 反调试机制
    setupAntiDebug() {
        // 检测调试器存在
        const detectDebugger = () => {
            try {
                // 时间戳检测
                const start = process.hrtime.bigint();
                // 执行一些操作
                for (let i = 0; i < 1000; i++) {
                    Math.random();
                }
                const end = process.hrtime.bigint();
                const elapsed = Number(end - start) / 1000000; // 转换为毫秒
                
                // 如果执行时间异常长，可能被调试
                if (elapsed > 50) {
                    this.handleDetectedThreat('debugger_timing');
                }
            } catch (e) {
                // 忽略错误
            }
        };

        // 异常检测
        const setupExceptionTrap = () => {
            process.on('uncaughtException', (err) => {
                if (err.message.includes('debug') || err.message.includes('breakpoint')) {
                    this.handleDetectedThreat('debugger_exception');
                }
            });
        };

        const debugInterval = setInterval(() => {
            try {
                if (this.isActive && this.shouldPerformCheck()) {
                    detectDebugger();
                }
            } catch (error) {
                console.error('[AntiDetection] Debug detection error:', error);
            }
        }, 10000); // 增加间隔到10秒
        
        this.intervals.add(debugInterval);
        setupExceptionTrap();
    }

    // 内存保护
    setupMemoryProtection() {
        // 关键数据混淆
        const protectMemory = () => {
            // 创建假的内存数据来误导分析
            const fakeData = {
                LiteLoader: 'DecoySystem',
                liteloader: 'fake_module',
                plugins: ['fake_plugin_1', 'fake_plugin_2'],
                version: '0.0.0-decoy'
            };
            
            // 将假数据写入全局作用域
            Object.defineProperty(globalThis, '_decoy_liteloader', {
                value: fakeData,
                writable: false,
                enumerable: false,
                configurable: false
            });
        };

        protectMemory();

        // 定期清理敏感内存 - 降低频率，减少性能影响
        const gcInterval = setInterval(() => {
            try {
                if (this.isActive && global.gc && this.shouldPerformCheck()) {
                    global.gc();
                }
            } catch (error) {
                console.error('[AntiDetection] GC error:', error);
            }
        }, 120000); // 增加到2分钟
        
        this.intervals.add(gcInterval);
    }

    // 创建诱饵进程
    setupDecoyProcesses() {
        try {
            // 创建看似正常的子进程
            const decoyScript = `
                const { exec } = require('child_process');
                setInterval(() => {
                    // 模拟正常的QQ活动
                    exec('echo "Normal QQ Process Activity"', () => {});
                }, 10000);
            `;
            
            const tempFile = path.join(require('os').tmpdir(), `qq_normal_${Date.now()}.js`);
            fs.writeFileSync(tempFile, decoyScript);
            
            const decoyProc = spawn(process.execPath, [tempFile], {
                detached: true,
                stdio: 'ignore'
            });
            
            decoyProc.unref();
            this.decoyProcs.push({ proc: decoyProc, file: tempFile });
            
            // 清理临时文件
            setTimeout(() => {
                try {
                    fs.unlinkSync(tempFile);
                } catch {}
            }, 60000);
            
        } catch (e) {
            // 忽略创建诱饵进程失败
        }
    }

    // 设置假特征
    setupFakeFeatures() {
        // 创建假的LiteLoader特征
        this.fakeFeatures.set('fake_liteloader_path', 'C:\\FakePrograms\\LiteLoader');
        this.fakeFeatures.set('fake_liteloader_version', '1.0.0-fake');
        this.fakeFeatures.set('fake_plugin_count', 0);
        
        // 在文件系统中创建假目录结构（如果可能）
        try {
            const fakeDir = path.join(require('os').tmpdir(), 'FakeLiteLoader');
            if (!fs.existsSync(fakeDir)) {
                fs.mkdirSync(fakeDir, { recursive: true });
                
                // 创建假的配置文件
                const fakeConfig = {
                    name: "FakeLiteLoader",
                    version: "1.0.0-fake",
                    plugins: []
                };
                
                fs.writeFileSync(
                    path.join(fakeDir, 'config.json'), 
                    JSON.stringify(fakeConfig, null, 2)
                );
            }
        } catch (e) {
            // 忽略创建假目录失败
        }
    }

    // 网络欺骗
    setupNetworkDeception() {
        // 如果检测到网络监控，发送假数据
        const sendFakeTraffic = () => {
            try {
                // 模拟假的HTTP请求
                const https = require('https');
                const fakeUrls = [
                    'https://www.baidu.com',
                    'https://www.tencent.com',
                    'https://www.qq.com'
                ];
                
                const url = fakeUrls[Math.floor(Math.random() * fakeUrls.length)];
                https.get(url, () => {}).on('error', () => {});
                
            } catch (e) {
                // 忽略网络错误
            }
        };

        // 每60秒发送一次假流量（降低网络负载）
        const trafficInterval = setInterval(() => {
            try {
                if (this.isActive && this.shouldPerformCheck()) {
                    sendFakeTraffic();
                }
            } catch (error) {
                console.error('[AntiDetection] Fake traffic error:', error);
            }
        }, 60000);
        
        this.intervals.add(trafficInterval);
    }

    // 处理检测到的威胁
    handleDetectedThreat(threat) {
        console.log(`\x1b[33m[QQExtension Anti-Detection]\x1b[0m 检测到潜在威胁: ${threat}`);
        
        // 激活对抗措施
        this.activateCountermeasures(threat);
    }

    // 激活对抗措施
    activateCountermeasures(threat) {
        // 1. 增加混淆
        this.increaseCamouflage();
        
        // 2. 清理敏感数据
        this.cleanSensitiveData();
        
        // 3. 启动更多诱饵
        this.deployMoreDecoys();
        
        // 4. 修改行为模式
        this.changeBehaviorPattern();
    }

    // 增加伪装
    increaseCamouflage() {
        // 动态修改进程标题
        if (process.title.includes('QQExtension')) {
            process.title = 'QQ Normal Process';
        }
        
        // 添加更多假环境变量
        process.env.FAKE_QQ_VERSION = '9.0.0.12345';
        process.env.FAKE_QQ_PLUGINS = 'none';
    }

    // 清理敏感数据
    cleanSensitiveData() {
        // 清理可能暴露的变量
        try {
            delete globalThis.QQExtension_DEBUG;
            delete globalThis.LITELOADER_DEBUG;
            delete process.env.LITELOADERQQNT_PROFILE;
        } catch {}
    }

    // 部署更多诱饵
    deployMoreDecoys() {
        // 创建更多假进程
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                this.setupDecoyProcesses();
            }, i * 1000);
        }
    }

    // 改变行为模式
    changeBehaviorPattern() {
        // 随机延迟关键操作
        const originalSetTimeout = global.setTimeout;
        global.setTimeout = function(callback, delay, ...args) {
            const randomDelay = delay + Math.random() * 100;
            return originalSetTimeout(callback, randomDelay, ...args);
        };
    }

    // 代码混淆
    obfuscateCode(code) {
        // 简单的字符串混淆
        return code.split('').map(char => {
            if (Math.random() > 0.9) {
                return char + String.fromCharCode(8203); // 零宽度空格
            }
            return char;
        }).join('');
    }

    // 动态字符串解密
    static decryptString(encrypted, key) {
        try {
            const decipher = crypto.createDecipher('aes192', key);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch {
            return encrypted;
        }
    }

    // 生成动态特征
    generateDynamicSignature() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        return crypto.createHash('md5').update(`${timestamp}_${random}`).digest('hex');
    }

    // 性能检查 - 防止系统资源过度消耗
    shouldPerformCheck() {
        const now = Date.now();
        const timeSinceLastCheck = now - this.performanceMetrics.lastCheck;
        
        // 如果距离上次检查不足30秒，跳过
        if (timeSinceLastCheck < 30000) {
            return false;
        }
        
        this.performanceMetrics.lastCheck = now;
        
        try {
            // 检查内存使用量
            const memUsage = process.memoryUsage();
            const memUsageMB = memUsage.heapUsed / 1024 / 1024;
            
            // 如果内存使用量过高，减少检测频率
            if (memUsageMB > 200) {
                return Math.random() < 0.3; // 30%概率执行
            }
            
            return true;
        } catch (error) {
            // 如果无法检查性能，默认允许执行
            return true;
        }
    }

    // 清理所有定时器和资源
    cleanup() {
        this.isActive = false;
        
        // 清理所有定时器
        this.intervals.forEach(interval => {
            try {
                clearInterval(interval);
            } catch (error) {
                console.error('[AntiDetection] Error clearing interval:', error);
            }
        });
        this.intervals.clear();
        
        // 清理诱饵进程
        this.decoyProcs.forEach(({ proc, file }) => {
            try {
                proc.kill('SIGTERM');
                setTimeout(() => {
                    try {
                        if (!proc.killed) {
                            proc.kill('SIGKILL');
                        }
                    } catch {}
                }, 5000);
                
                if (file && require('fs').existsSync(file)) {
                    require('fs').unlinkSync(file);
                }
            } catch (error) {
                console.error('[AntiDetection] Error cleaning decoy process:', error);
            }
        });
        this.decoyProcs = [];
        
        // 清理假数据
        this.fakeFeatures.clear();
        
        // 清理全局对象
        try {
            delete globalThis._decoy_liteloader;
        } catch {}
    }

    // 销毁证据 - 向后兼容
    destroy() {
        this.cleanup();
    }
}

module.exports = { AntiDetectionCore };