const default_config = require("../settings/static/config.json");
const { ipcMain, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");


const admZip = (() => {
    const major_node = path.join(process.resourcesPath, "app", "major.node");
    require(major_node).load("internal_admzip", module);
    return exports.admZip.default;
})();


const qwqnt_path = path.join(globalThis.qwqnt?.framework?.paths?.data ?? "", "QQExtension");
const root_path = path.join(__dirname, "..", "..");
const profile_path = process.env.QQ_EXTENSION_PROFILE ?? (globalThis.qwqnt ? qwqnt_path : root_path);
const data_path = path.join(profile_path, "data");
const plugins_path = path.join(profile_path, "plugins");
const qqextension_package = require(path.join(root_path, "package.json"));
const qqnt_package = require(path.join(process.resourcesPath, "app/package.json"))


function setConfig(slug, new_config) {
    try {
        const config_path = path.join(data_path, slug, "config.json");
        fs.mkdirSync(path.dirname(config_path), { recursive: true });
        fs.writeFileSync(config_path, JSON.stringify(new_config, null, 4), "utf-8");
        return true;
    } catch {
        return false;
    }
}


function getConfig(slug, default_config) {
    try {
        const config_path = path.join(data_path, slug, "config.json");
        if (fs.existsSync(config_path)) {
            const config = JSON.parse(fs.readFileSync(config_path, "utf-8"));
            return Object.assign({}, default_config, config);
        }
        else {
            setConfig(slug, default_config);
            return Object.assign({}, default_config, {});
        }
    } catch {
        return default_config;
    }
}


function pluginInstall(plugin_path, undone = false) {
    try {
        if (fs.statSync(plugin_path).isFile()) {
            // 通过 ZIP 格式文件安装插件
            if (path.extname(plugin_path).toLowerCase() == ".zip") {
                const plugin_zip = new admZip(plugin_path);
                for (const entry of plugin_zip.getEntries()) {
                    if (entry.entryName == "manifest.json" && !entry.isDirectory) {
                        const { slug } = JSON.parse(entry.getData());
                        if (slug in QQExtension.plugins) QQExtension.api.plugin.delete(slug, false, false);
                        const config = QQExtension.api.config.get("QQExtension", default_config);
                        if (undone) delete config.installing_plugins[slug];
                        else config.installing_plugins[slug] = {
                            plugin_path: plugin_path,
                            plugin_type: "zip"
                        };
                        QQExtension.api.config.set("QQExtension", config);
                        return true;
                    }
                }
            }
            // 通过 manifest.json 文件安装插件
            if (path.basename(plugin_path) == "manifest.json") {
                const { slug } = JSON.parse(fs.readFileSync(plugin_path));
                if (slug in QQExtension.plugins) QQExtension.api.plugin.delete(slug, false, false);
                const config = QQExtension.api.config.get("QQExtension", default_config);
                if (undone) delete config.installing_plugins[slug];
                else config.installing_plugins[slug] = {
                    plugin_path: plugin_path,
                    plugin_type: "json"
                };
                QQExtension.api.config.set("QQExtension", config);
                return true;
            }
        }
    } catch (error) {
        console.error(error);
    }
    return false;
}


function pluginDelete(slug, delete_data = false, undone = false) {
    if (!(slug in QQExtension.plugins)) return true;
    const { plugin, data } = QQExtension.plugins[slug].path;
    const config = QQExtension.api.config.get("QQExtension", default_config);
    if (undone) delete config.deleting_plugins[slug];
    else config.deleting_plugins[slug] = {
        plugin_path: plugin,
        data_path: delete_data ? data : null
    };
    QQExtension.api.config.set("QQExtension", config);
}


function pluginDisable(slug, undone = false) {
    const config = QQExtension.api.config.get("QQExtension", default_config);
    if (undone) config.disabled_plugins = config.disabled_plugins.filter(item => item != slug);
    else config.disabled_plugins = config.disabled_plugins.concat(slug);
    QQExtension.api.config.set("QQExtension", config);
}


const QQExtension = {
    path: {
        root: root_path,
        profile: profile_path,
        data: data_path,
        plugins: plugins_path
    },
    versions: {
        qqnt: qqnt_package.version,
        qqextension: qqextension_package.version,
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
    },
    os: {
        platform: process.platform
    },
    package: {
        qqextension: qqextension_package,
        qqnt: qqnt_package
    },
    plugins: {},
    api: {
        config: {
            set: setConfig,
            get: getConfig
        },
        plugin: {
            install: pluginInstall,
            delete: pluginDelete,
            disable: pluginDisable
        },
        openExternal: shell.openExternal,
        openPath: shell.openPath
    }
};


// 将QQExtension对象挂载到全局
const whitelist = [
    QQExtension.path.root,
    QQExtension.path.profile,
    QQExtension.path.data,
    QQExtension.path.plugins,
];
try {
    whitelist.push(fs.realpathSync(QQExtension.path.root));
    whitelist.push(fs.realpathSync(QQExtension.path.profile));
    whitelist.push(fs.realpathSync(QQExtension.path.plugins));
    whitelist.push(fs.realpathSync(QQExtension.path.data));
} catch { };
Object.defineProperty(globalThis, "QQExtension", {
    configurable: false,
    get() {
        const stack = new Error().stack.split("\n")[2];
        if (whitelist.some(item => stack.includes(item))) {
            return QQExtension;
        }
    }
});


// 将QQExtension对象挂载到window
ipcMain.on("QQExtension.QQExtension.QQExtension", (event) => {
    event.returnValue = {
        ...QQExtension,
        api: void null
    }
});


ipcMain.handle("QQExtension.QQExtension.api", (event, name, method, args) => {
    try {
        if (name == method) return QQExtension.api[method](...args);
        else return QQExtension.api[name][method](...args);
    } catch (error) {
        return null;
    }
});
