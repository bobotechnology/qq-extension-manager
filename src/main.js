require("./qqextension_api/main.js");
require("./extension_core/plugin_manager.js");

// 反检测系统暂时禁用，避免UI死循环问题
// const { AntiDetectionSystem } = require("./anti_detection/system.js");

// // 初始化反检测系统
// const antiDetectionSystem = new AntiDetectionSystem();
// antiDetectionSystem.start().then(() => {
//     const status = antiDetectionSystem.getStatus();
//     console.log(`[QQ] 安全系统已启动 - 会话: ${status.dynamicSession ? status.dynamicSession.substring(0, 8) : 'N/A'}`);
// }).catch(error => {
//     console.log(`[QQ] 安全系统启动失败: ${error.message}`);
// });

const { MainManager } = require("./extension_core/main.js");
const { protocolRegister } = require("./protocol_scheme/main.js");
const path = require("path");


const manager = new MainManager().init();


function proxyBrowserWindowConstruct(target, argArray, newTarget) {
    const window = Reflect.construct(target, argArray, newTarget);

    // 监听send
    window.webContents.send = new Proxy(window.webContents.send, {
        apply(target, thisArg, [channel, ...args]) {
            if (channel.includes("RM_IPCFROM_")) {
                if (args?.[1]?.cmdName == "nodeIKernelSessionListener/onSessionInitComplete") {
                    manager.onLogin(args[1].payload.uid);
                }
            }
            return Reflect.apply(target, thisArg, [channel, ...args]);
        }
    });

    // 加载Preload
    window.webContents._getPreloadPaths = new Proxy(window.webContents._getPreloadPaths, {
        apply(target, thisArg, argArray) {
            return [
                ...Reflect.apply(target, thisArg, argArray),
                path.join(QQExtension.path.root, "src/preload.js")
            ];
        }
    });

    // 加载自定义协议
    protocolRegister(window.webContents.session.protocol);

    // 加载插件
    manager.onBrowserWindowCreated(window);

    return window;
}


// 监听窗口创建
require.cache["electron"] = new Proxy(require.cache["electron"], {
    get(target, property, receiver) {
        const module = Reflect.get(target, property, receiver);
        return property != "exports" ? module : new Proxy(module, {
            get(target, property, receiver) {
                const exports = Reflect.get(target, property, receiver);
                return property != "BrowserWindow" ? exports : new Proxy(exports, {
                    construct: proxyBrowserWindowConstruct
                });
            }
        });
    }
});


if (!globalThis.qwqnt) {
    const main_path = "./application.asar/app_launcher/index.js";
    require(require("path").join(process.resourcesPath, "app", main_path));
    setImmediate(() => global.launcher.installPathPkgJson.main = main_path);
}