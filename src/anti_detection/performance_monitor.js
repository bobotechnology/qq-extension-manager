// 性能监控模块 - 防止系统资源过度消耗
class PerformanceMonitor {
    constructor() {
        this.isActive = false;
        this.metrics = {
            cpuUsage: 0,
            memoryUsage: 0,
            threadCount: 0,
            lastUpdate: Date.now()
        };
        
        this.thresholds = {
            maxMemoryMB: 200,       // 最大内存使用 200MB
            maxCpuPercent: 15,      // 最大CPU使用 15%
            maxThreadCount: 10,     // 最大线程数 10
            checkInterval: 30000,   // 检查间隔 30秒
            alertCooldown: 60000    // 警告冷却时间 60秒
        };
        
        this.lastAlert = 0;
        this.intervals = new Set();
        this.warningCallbacks = new Set();
        this.resourceLimiter = new ResourceLimiter();
    }

    // 启动性能监控
    start() {
        if (this.isActive) return;
        
        this.log('启动性能监控...');
        
        // 定期检查系统资源
        const monitorInterval = setInterval(() => {
            try {
                this.checkSystemResources();
            } catch (error) {
                this.log(`性能监控错误: ${error.message}`, 'error');
            }
        }, this.thresholds.checkInterval);
        
        this.intervals.add(monitorInterval);
        
        // 启动资源限制器
        this.resourceLimiter.start();
        
        this.isActive = true;
        this.log('性能监控已启动');
    }

    // 检查系统资源
    checkSystemResources() {
        if (!this.isActive) return;

        const memoryUsage = this.getMemoryUsage();
        const processCount = this.getProcessCount();
        
        this.updateMetrics({
            memoryUsage: memoryUsage,
            processCount: processCount
        });

        // 检查内存使用
        if (memoryUsage > this.thresholds.maxMemoryMB) {
            this.handleResourceAlert('high_memory', memoryUsage);
            return 'high_memory';
        }

        // 检查进程数量
        if (processCount > this.thresholds.maxThreadCount) {
            this.handleResourceAlert('too_many_processes', processCount);
            return 'too_many_processes';
        }

        return 'normal';
    }

    // 获取内存使用情况
    getMemoryUsage() {
        try {
            const memoryInfo = process.memoryUsage();
            return Math.round(memoryInfo.heapUsed / 1024 / 1024); // MB
        } catch (error) {
            this.log(`获取内存信息失败: ${error.message}`, 'error');
            return 0;
        }
    }

    // 获取进程数量（估算）
    getProcessCount() {
        try {
            // 简单估算：基于活跃的定时器和监听器数量
            const timerCount = this.intervals.size;
            const listenerCount = process.listenerCount('uncaughtException') +
                                 process.listenerCount('unhandledRejection');
            return timerCount + listenerCount;
        } catch (error) {
            return 1;
        }
    }

    // 更新性能指标
    updateMetrics(newMetrics) {
        this.metrics = {
            ...this.metrics,
            ...newMetrics,
            lastUpdate: Date.now()
        };
    }

    // 处理资源警告
    handleResourceAlert(type, value) {
        const now = Date.now();
        
        // 冷却时间检查
        if (now - this.lastAlert < this.thresholds.alertCooldown) {
            return;
        }
        
        this.lastAlert = now;
        
        this.log(`资源使用警告 [${type}]: ${value}`, 'warn');
        
        // 触发警告回调
        this.warningCallbacks.forEach(callback => {
            try {
                callback(type, value, this.metrics);
            } catch (error) {
                this.log(`警告回调错误: ${error.message}`, 'error');
            }
        });
        
        // 自动优化措施
        this.applyAutoOptimization(type, value);
    }

    // 应用自动优化措施
    applyAutoOptimization(type, value) {
        switch (type) {
            case 'high_memory':
                this.optimizeMemoryUsage();
                break;
            case 'too_many_processes':
                this.optimizeProcessCount();
                break;
        }
    }

    // 优化内存使用
    optimizeMemoryUsage() {
        this.log('应用内存优化措施...', 'warn');
        
        // 强制垃圾回收
        if (global.gc) {
            try {
                global.gc();
                this.log('已执行垃圾回收');
            } catch (error) {
                this.log(`垃圾回收失败: ${error.message}`, 'error');
            }
        }
        
        // 通知外部系统降低资源使用
        this.notifyResourceReduction('memory');
    }

    // 优化进程数量
    optimizeProcessCount() {
        this.log('应用进程优化措施...', 'warn');
        
        // 通知外部系统减少进程
        this.notifyResourceReduction('processes');
    }

    // 通知资源减少
    notifyResourceReduction(resourceType) {
        // 这里可以通知反检测系统减少资源使用
        if (typeof window !== 'undefined' && window.rendererAntiDetection) {
            // 渲染进程优化
            try {
                // 减少DOM监控频率
                window.rendererAntiDetection.enterLowResourceMode && 
                    window.rendererAntiDetection.enterLowResourceMode();
            } catch (error) {
                this.log(`渲染进程优化失败: ${error.message}`, 'error');
            }
        }
    }

    // 添加警告回调
    addWarningCallback(callback) {
        if (typeof callback === 'function') {
            this.warningCallbacks.add(callback);
        }
    }

    // 移除警告回调
    removeWarningCallback(callback) {
        this.warningCallbacks.delete(callback);
    }

    // 获取性能指标
    getMetrics() {
        return { ...this.metrics };
    }

    // 获取建议的资源使用策略
    getResourceStrategy() {
        const memoryUsage = this.metrics.memoryUsage;
        
        if (memoryUsage > this.thresholds.maxMemoryMB * 0.8) {
            return 'conservative'; // 保守模式
        } else if (memoryUsage > this.thresholds.maxMemoryMB * 0.5) {
            return 'balanced';     // 平衡模式
        } else {
            return 'normal';       // 正常模式
        }
    }

    // 停止性能监控
    stop() {
        if (!this.isActive) return;
        
        this.log('停止性能监控...');
        
        // 清理定时器
        this.intervals.forEach(interval => {
            try {
                clearInterval(interval);
            } catch (error) {
                this.log(`清理定时器错误: ${error.message}`, 'error');
            }
        });
        this.intervals.clear();
        
        // 停止资源限制器
        this.resourceLimiter.stop();
        
        // 清理回调
        this.warningCallbacks.clear();
        
        this.isActive = false;
        this.log('性能监控已停止');
    }

    // 日志输出
    log(message, level = 'info') {
        const timestamp = new Date().toISOString().substring(11, 19);
        const colors = {
            info: '\x1b[32m',    // 绿色
            warn: '\x1b[33m',    // 黄色
            error: '\x1b[31m'    // 红色
        };
        
        const color = colors[level] || colors.info;
        const reset = '\x1b[0m';
        
        console.log(`${color}[Performance Monitor ${timestamp}]${reset} ${message}`);
    }
}

// 资源限制器
class ResourceLimiter {
    constructor() {
        this.limits = {
            maxIntervals: 20,      // 最大定时器数量
            maxObservers: 10,      // 最大观察者数量
            maxEventListeners: 50  // 最大事件监听器数量
        };
        this.counters = {
            intervals: 0,
            observers: 0,
            eventListeners: 0
        };
        this.originalSetInterval = null;
        this.originalClearInterval = null;
        this.isActive = false;
    }

    start() {
        if (this.isActive) return;
        
        // 劫持 setInterval 来限制定时器数量
        this.originalSetInterval = global.setInterval;
        this.originalClearInterval = global.clearInterval;
        
        const limiter = this;
        
        global.setInterval = function(callback, delay, ...args) {
            if (limiter.counters.intervals >= limiter.limits.maxIntervals) {
                console.warn('[ResourceLimiter] 定时器数量超出限制，忽略新的定时器');
                return null;
            }
            
            limiter.counters.intervals++;
            const intervalId = limiter.originalSetInterval.call(this, 
                function(...callbackArgs) {
                    try {
                        callback.apply(this, callbackArgs);
                    } catch (error) {
                        console.error('[ResourceLimiter] 定时器回调错误:', error);
                    }
                }, 
                delay, 
                ...args
            );
            
            // 包装 intervalId 以便跟踪
            return {
                [Symbol.toPrimitive]() { return intervalId; },
                _limiterTracked: true,
                _originalId: intervalId
            };
        };
        
        global.clearInterval = function(intervalId) {
            if (intervalId && intervalId._limiterTracked) {
                limiter.counters.intervals--;
                return limiter.originalClearInterval(intervalId._originalId);
            }
            return limiter.originalClearInterval(intervalId);
        };
        
        this.isActive = true;
    }

    stop() {
        if (!this.isActive) return;
        
        // 恢复原始方法
        if (this.originalSetInterval) {
            global.setInterval = this.originalSetInterval;
        }
        if (this.originalClearInterval) {
            global.clearInterval = this.originalClearInterval;
        }
        
        this.isActive = false;
    }

    getCounters() {
        return { ...this.counters };
    }
}

module.exports = { PerformanceMonitor, ResourceLimiter };