// 渲染进程反检测模块
class RendererAntiDetection {
    constructor() {
        this.isActive = true;
        this.originalMethods = new Map();
        this.fakeElements = new Set();
        this.init();
    }

    init() {
        this.setupDOMProtection();
        this.setupConsoleProtection();
        this.setupDevToolsDetection();
        this.setupElementHiding();
        this.setupEventListenerProtection();
        this.setupNetworkHooks();
    }

    // DOM保护
    setupDOMProtection() {
        // 劫持querySelector相关方法
        const originalQuerySelector = Document.prototype.querySelector;
        const originalQuerySelectorAll = Document.prototype.querySelectorAll;
        const originalGetElementById = Document.prototype.getElementById;
        
        this.originalMethods.set('querySelector', originalQuerySelector);
        this.originalMethods.set('querySelectorAll', originalQuerySelectorAll);
        this.originalMethods.set('getElementById', originalGetElementById);

        // 过滤敏感查询
        const sensitiveSelectors = [
            'liteloader', 'LiteLoader'
            // 注意：不包含qqextension，保证插件兼容性
        ];
        
        // 白名单：允许插件正常访问的路径
        const pluginWhitelist = [
            'qqextension_api', 'extension_core', '/plugins/', 'plugin.js'
        ];

        Document.prototype.querySelector = function(selector) {
            if (typeof selector === 'string') {
                // 检查是否为插件调用
                const stack = new Error().stack;
                const isPluginCall = pluginWhitelist.some(path => stack.includes(path));
                
                if (!isPluginCall) {
                    for (const sensitive of sensitiveSelectors) {
                        if (selector.toLowerCase().includes(sensitive.toLowerCase())) {
                            return null; // 只对外部查询隐藏敏感元素
                        }
                    }
                }
            }
            return originalQuerySelector.call(this, selector);
        };

        Document.prototype.querySelectorAll = function(selector) {
            if (typeof selector === 'string') {
                const stack = new Error().stack;
                const isPluginCall = pluginWhitelist.some(path => stack.includes(path));
                
                if (!isPluginCall) {
                    for (const sensitive of sensitiveSelectors) {
                        if (selector.toLowerCase().includes(sensitive.toLowerCase())) {
                            return document.createNodeList ? document.createNodeList() : [];
                        }
                    }
                }
            }
            return originalQuerySelectorAll.call(this, selector);
        };

        Document.prototype.getElementById = function(id) {
            if (typeof id === 'string') {
                const stack = new Error().stack;
                const isPluginCall = pluginWhitelist.some(path => stack.includes(path));
                
                if (!isPluginCall && id.toLowerCase().includes('liteloader')) {
                    return null;
                }
            }
            return originalGetElementById.call(this, id);
        };
    }

    // 控制台保护
    setupConsoleProtection() {
        const originalConsole = { ...console };
        this.originalMethods.set('console', originalConsole);

        // 过滤敏感日志输出
        const filterSensitiveLog = (method, args) => {
            const str = args.join(' ').toLowerCase();
            const sensitiveKeywords = [
                'liteloader', 'qqextension', 'extension_core', 'qqextension_api'
            ];

            if (sensitiveKeywords.some(keyword => str.includes(keyword))) {
                // 替换为无害的日志
                args = ['[QQ] Normal operation'];
            }
            return args;
        };

        ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
            console[method] = function(...args) {
                const filteredArgs = filterSensitiveLog(method, args);
                originalConsole[method].apply(console, filteredArgs);
            };
        });
    }

    // 开发者工具检测
    setupDevToolsDetection() {
        let devtools = {
            open: false,
            orientation: null
        };

        const threshold = 160;

        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    this.handleDevToolsOpen();
                }
            } else {
                devtools.open = false;
            }
        }, 500);

        // 检测控制台命令
        let logs = [];
        const originalLog = console.log;
        console.log = function(...args) {
            logs.push(args.join(' '));
            if (logs.length > 10) logs.shift();
            originalLog.apply(console, args);
        };
    }

    // 处理开发者工具打开
    handleDevToolsOpen() {
        console.log('[QQ] Developer tools detected, activating countermeasures');
        
        // 清理DOM中的敏感信息
        this.cleanSensitiveDOMElements();
        
        // 修改window对象
        this.modifyWindowObject();
        
        // 启动干扰机制
        this.activateInterference();
    }

    // 元素隐藏
    setupElementHiding() {
        // 创建MutationObserver来监视DOM变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.processNewElement(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 处理新元素
    processNewElement(element) {
        // 检查是否包含敏感属性或内容
        const sensitivePatterns = [
            /liteloader/i, /qqextension/i, /extension[_-]core/i
        ];

        const checkElement = (el) => {
            // 检查类名、ID、属性
            const className = el.className || '';
            const id = el.id || '';
            const innerHTML = el.innerHTML || '';

            for (const pattern of sensitivePatterns) {
                if (pattern.test(className) || pattern.test(id) || pattern.test(innerHTML)) {
                    // 隐藏或修改敏感元素
                    this.disguiseElement(el);
                    break;
                }
            }

            // 递归检查子元素
            if (el.children) {
                Array.from(el.children).forEach(checkElement);
            }
        };

        checkElement(element);
    }

    // 伪装元素
    disguiseElement(element) {
        // 修改敏感属性
        if (element.className && element.className.includes('liteloader')) {
            element.className = element.className.replace(/liteloader/gi, 'qq-normal');
        }
        
        if (element.id && element.id.includes('liteloader')) {
            element.id = element.id.replace(/liteloader/gi, 'qq-normal');
        }

        // 标记为已处理
        this.fakeElements.add(element);
    }

    // 事件监听器保护
    setupEventListenerProtection() {
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            // 如果是敏感事件，添加过滤
            if (type === 'message' || type === 'beforeunload') {
                const wrappedListener = function(event) {
                    // 过滤敏感消息
                    if (event.data && typeof event.data === 'string') {
                        const sensitivePatterns = ['liteloader', 'qqextension', 'extension'];
                        if (sensitivePatterns.some(pattern => 
                            event.data.toLowerCase().includes(pattern))) {
                            return; // 阻止敏感事件处理
                        }
                    }
                    return listener.call(this, event);
                };
                
                return originalAddEventListener.call(this, type, wrappedListener, options);
            }
            
            return originalAddEventListener.call(this, type, listener, options);
        };
    }

    // 网络钩子
    setupNetworkHooks() {
        // 劫持fetch
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            // 检查是否是敏感请求
            const url = typeof input === 'string' ? input : input.url;
            
            // 只拦截包含liteloader的请求，保留qqextension的正常功能
            if (url.includes('liteloader') && !url.includes('qqextension')) {
                // 返回假响应
                return Promise.resolve(new Response('{}', {
                    status: 200,
                    statusText: 'OK'
                }));
            }
            return originalFetch.call(this, input, init);
        };

        // 劫击XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            // 只拦截包含liteloader的请求
            if (url.includes('liteloader') && !url.includes('qqextension')) {
                // 重定向到无害的URL
                url = 'data:application/json,{}';
            }
            return originalXHROpen.call(this, method, url, ...args);
        };
    }

    // 清理敏感DOM元素
    cleanSensitiveDOMElements() {
        const sensitiveSelectors = [
            '[class*="liteloader"]',
            '[id*="liteloader"]',
            '[data-liteloader]',
            'script[src*="liteloader"]',
            'script[src*="extension"]'
        ];

        sensitiveSelectors.forEach(selector => {
            try {
                const elements = this.originalMethods.get('querySelectorAll').call(document, selector);
                elements.forEach(el => {
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                });
            } catch (e) {
                // 忽略错误
            }
        });
    }

    // 修改window对象
    modifyWindowObject() {
        // 隐藏敏感的全局变量
        try {
            Object.defineProperty(window, 'QQExtension', {
                get() { return undefined; },
                set() { },
                enumerable: false,
                configurable: false
            });

            Object.defineProperty(window, 'LiteLoader', {
                get() { return undefined; },
                set() { },
                enumerable: false,
                configurable: false
            });
        } catch (e) {
            // 忽略定义失败
        }

        // 添加假的QQ相关对象
        window.QQAPI = {
            version: '9.0.0',
            platform: 'desktop',
            features: ['basic', 'chat', 'group']
        };
    }

    // 激活干扰机制
    activateInterference() {
        // 在控制台中注入假信息
        setTimeout(() => {
            console.log('[QQ] Loading normal QQ components...');
            console.log('[QQ] Initializing chat system...');
            console.log('[QQ] Connecting to QQ servers...');
        }, 1000);

        // 创建假的性能标记
        if (window.performance && window.performance.mark) {
            window.performance.mark('qq-startup');
            window.performance.mark('qq-ready');
        }
    }

    // 注入假的用户代理
    spoofUserAgent() {
        // 修改navigator.userAgent (只读属性，需要特殊处理)
        try {
            Object.defineProperty(navigator, 'userAgent', {
                get() {
                    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) QQ/9.0.0 Chrome/91.0.4472.124 Electron/13.0.0 Safari/537.36';
                },
                enumerable: true,
                configurable: false
            });
        } catch (e) {
            // 如果无法修改，忽略
        }
    }

    // 销毁反检测机制
    destroy() {
        this.isActive = false;
        
        // 恢复原始方法
        this.originalMethods.forEach((originalMethod, key) => {
            try {
                if (key === 'console') {
                    Object.assign(console, originalMethod);
                } else if (key === 'querySelector') {
                    Document.prototype.querySelector = originalMethod;
                } else if (key === 'querySelectorAll') {
                    Document.prototype.querySelectorAll = originalMethod;
                } else if (key === 'getElementById') {
                    Document.prototype.getElementById = originalMethod;
                }
            } catch (e) {
                // 忽略恢复失败
            }
        });

        // 清理假元素
        this.fakeElements.clear();
    }
}

// 立即激活渲染进程反检测
if (typeof window !== 'undefined') {
    window.rendererAntiDetection = new RendererAntiDetection();
}

module.exports = { RendererAntiDetection };