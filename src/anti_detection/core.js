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
        // 只保留安全的功能
        this.setupMemoryProtection();
        this.setupFakeFeatures();
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
    }

    // 设置假特征
    setupFakeFeatures() {
        // 创建假的LiteLoader特征
        this.fakeFeatures.set('fake_liteloader_path', 'C:\\FakePrograms\\LiteLoader');
        this.fakeFeatures.set('fake_liteloader_version', '1.0.0-fake');
        this.fakeFeatures.set('fake_plugin_count', 0);
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