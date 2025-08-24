// 简化的性能监控模块
class PerformanceMonitor {
    constructor() {
        this.isActive = false;
        this.intervals = new Set();
    }

    // 启动性能监控
    start() {
        if (this.isActive) return;
        this.isActive = true;
        console.log('[Performance Monitor] 性能监控已启动');
    }

    // 停止性能监控
    stop() {
        if (!this.isActive) return;
        
        // 清理定时器
        this.intervals.forEach(interval => {
            try {
                clearInterval(interval);
            } catch (error) {
                console.error('[Performance Monitor] 清理定时器错误:', error);
            }
        });
        this.intervals.clear();
        
        this.isActive = false;
        console.log('[Performance Monitor] 性能监控已停止');
    }

    // 获取基本性能指标
    getMetrics() {
        try {
            const memoryInfo = process.memoryUsage();
            return {
                memoryUsage: Math.round(memoryInfo.heapUsed / 1024 / 1024), // MB
                lastUpdate: Date.now()
            };
        } catch (error) {
            return { memoryUsage: 0, lastUpdate: Date.now() };
        }
    }

    // 添加警告回调（兼容性）
    addWarningCallback() {
        // 空实现，保持兼容性
    }

    // 移除警告回调（兼容性）
    removeWarningCallback() {
        // 空实现，保持兼容性
    }
}

// 简化的资源限制器
class ResourceLimiter {
    constructor() {
        this.isActive = false;
    }

    start() {
        this.isActive = true;
    }

    stop() {
        this.isActive = false;
    }

    getCounters() {
        return { intervals: 0, observers: 0, eventListeners: 0 };
    }
}

module.exports = { PerformanceMonitor, ResourceLimiter };