# QQ Extension Manager 插件开发指南

> 本指南将帮助您从零开始开发 QQ Extension Manager 插件

## 📖 目录

- [快速开始](#快速开始)
- [插件结构](#插件结构)
- [Manifest 配置](#manifest-配置)
- [API 参考](#api-参考)
- [开发流程](#开发流程)
- [最佳实践](#最佳实践)
- [调试与测试](#调试与测试)
- [发布与分发](#发布与分发)

---

## 🚀 快速开始

### 环境准备

1. **安装 QQ Extension Manager**
   - 确保已正确安装并运行 QQ Extension Manager
   - 验证 QQExtension API 可用

2. **开发工具**
   - 任意代码编辑器（推荐 VS Code）
   - Node.js 16+ （用于开发工具）
   - Git（版本控制）

### 创建第一个插件

```bash
# 创建插件目录
mkdir my-first-plugin
cd my-first-plugin

# 创建基本文件结构
mkdir src
touch manifest.json
touch src/main.js
touch src/renderer.js
touch src/preload.js
```

---

## 📁 插件结构

### 标准目录结构

```
my-plugin/
├── manifest.json          # 插件配置文件（必需）
├── README.md              # 插件说明文档
├── LICENSE                # 开源协议
├── src/                   # 源代码目录
│   ├── main.js           # 主进程脚本
│   ├── renderer.js       # 渲染进程脚本
│   ├── preload.js        # 预加载脚本
│   └── style.css         # 样式文件
├── assets/                # 资源文件
│   ├── icon.png          # 插件图标
│   └── images/           # 图片资源
└── config/                # 配置文件
    └── default.json      # 默认配置
```

---

## 📋 Manifest 配置

### 基本配置

```json
{
  "manifest_version": 4,
  "type": "extension",
  "name": "我的插件",
  "slug": "my-plugin",
  "description": "这是一个示例插件",
  "version": "1.0.0",
  "author": [
    {
      "name": "开发者姓名",
      "link": "https://github.com/your-username"
    }
  ],
  "injects": {
    "main": "./src/main.js",
    "renderer": "./src/renderer.js",
    "preload": "./src/preload.js"
  }
}
```

### 完整配置选项

```json
{
  "manifest_version": 4,
  "type": "extension",
  "name": "完整示例插件",
  "slug": "full-example-plugin",
  "description": "展示所有配置选项的示例插件",
  "version": "1.0.0",
  "author": [
    {
      "name": "主要开发者",
      "link": "https://github.com/main-dev"
    },
    {
      "name": "贡献者",
      "link": "https://github.com/contributor"
    }
  ],
  "repository": {
    "repo": "your-username/plugin-repo",
    "branch": "main"
  },
  "injects": {
    "main": "./src/main.js",
    "renderer": "./src/renderer.js",
    "preload": "./src/preload.js"
  },
  "dependencies": ["framework-plugin"],
  "permissions": [
    "file-access",
    "network-request"
  ],
  "icons": {
    "16": "./assets/icon-16.png",
    "32": "./assets/icon-32.png",
    "64": "./assets/icon-64.png"
  }
}
```

### 配置字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `manifest_version` | number | ✅ | Manifest 版本，当前为 4 |
| `type` | string | ✅ | 插件类型：`extension`、`theme`、`framework` |
| `name` | string | ✅ | 插件显示名称 |
| `slug` | string | ✅ | 插件唯一标识符（小写，连字符分隔） |
| `description` | string | ✅ | 插件描述 |
| `version` | string | ✅ | 插件版本（语义化版本） |
| `author` | array | ✅ | 作者信息数组 |
| `repository` | object | ❌ | 仓库信息 |
| `injects` | object | ✅ | 注入脚本配置 |
| `dependencies` | array | ❌ | 依赖的其他插件 |
| `permissions` | array | ❌ | 权限声明 |
| `icons` | object | ❌ | 图标文件路径 |

---

## 🔧 API 参考

### 核心 API

#### QQExtension 全局对象

```javascript
// 获取插件信息
const pluginInfo = QQExtension.plugins.get('plugin-slug');

// 获取路径信息
const paths = QQExtension.path;
console.log(paths.root);    // QQ Extension Manager 根目录
console.log(paths.profile); // 用户数据目录
console.log(paths.plugins); // 插件目录

// 获取版本信息
const versions = QQExtension.versions;
console.log(versions.qqextension); // QQ Extension Manager 版本
console.log(versions.qqnt);        // QQNT 版本
```

#### 配置管理 API

```javascript
// 获取配置
const config = QQExtension.api.config.get('my-plugin', {
  setting1: 'default-value',
  setting2: true
});

// 设置配置
QQExtension.api.config.set('my-plugin', {
  setting1: 'new-value',
  setting2: false
});

// 监听配置变化
QQExtension.api.config.onUpdate('my-plugin', (newConfig) => {
  console.log('配置已更新:', newConfig);
});
```

#### 文件操作 API

```javascript
// 打开文件路径
QQExtension.api.openPath('/path/to/directory');

// 打开外部链接
QQExtension.api.openExternal('https://example.com');
```

### 主进程 API (main.js)

```javascript
// 获取主窗口
const { BrowserWindow } = require('electron');
const mainWindow = BrowserWindow.getFocusedWindow();

// IPC 通信
const { ipcMain } = require('electron');
ipcMain.handle('my-plugin-action', async (event, data) => {
  // 处理来自渲染进程的请求
  return { success: true, result: 'processed' };
});

// 插件生命周期钩子
exports.onBrowserWindowCreated = (window) => {
  console.log('新窗口创建:', window.id);
};

exports.onLogin = (uid) => {
  console.log('用户登录:', uid);
};
```

### 渲染进程 API (renderer.js)

```javascript
// DOM 操作
document.addEventListener('DOMContentLoaded', () => {
  // 添加自定义 UI
  const button = document.createElement('button');
  button.textContent = '我的功能';
  button.onclick = () => {
    console.log('按钮被点击');
  };
  document.body.appendChild(button);
});

// IPC 通信
const { ipcRenderer } = require('electron');

// 发送消息到主进程
ipcRenderer.invoke('my-plugin-action', { data: 'test' })
  .then(result => {
    console.log('收到回复:', result);
  });

// 监听主进程消息
ipcRenderer.on('plugin-notification', (event, message) => {
  console.log('收到通知:', message);
});
```

### 预加载脚本 API (preload.js)

```javascript
// 安全地暴露 API 到渲染进程
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('myPluginAPI', {
  // 暴露安全的方法
  sendMessage: (data) => ipcRenderer.invoke('my-plugin-action', data),
  
  // 暴露配置访问
  getConfig: () => QQExtension.api.config.get('my-plugin'),
  setConfig: (config) => QQExtension.api.config.set('my-plugin', config)
});
```

---

## 🔄 开发流程

### 1. 规划阶段

```markdown
1. 确定插件功能和目标
2. 设计用户界面（如需要）
3. 选择技术方案
4. 制定开发计划
```

### 2. 开发阶段

```bash
# 创建插件目录
mkdir my-awesome-plugin
cd my-awesome-plugin

# 初始化 manifest.json
cat > manifest.json << 'EOF'
{
  "manifest_version": 4,
  "type": "extension",
  "name": "我的超棒插件",
  "slug": "my-awesome-plugin",
  "description": "一个超棒的插件",
  "version": "1.0.0",
  "author": [{"name": "我", "link": "https://github.com/me"}],
  "injects": {
    "main": "./src/main.js",
    "renderer": "./src/renderer.js"
  }
}
EOF

# 创建源代码
mkdir src
```

### 3. 主进程开发 (src/main.js)

```javascript
// src/main.js
const { ipcMain } = require('electron');

// 插件初始化
function onLoad() {
  console.log('插件已加载');
  
  // 注册 IPC 处理器
  ipcMain.handle('my-plugin:get-data', async () => {
    return { message: 'Hello from main process!' };
  });
}

// 窗口创建钩子
function onBrowserWindowCreated(window) {
  console.log('新窗口创建:', window.id);
}

// 用户登录钩子
function onLogin(uid) {
  console.log('用户登录:', uid);
}

// 导出钩子函数
module.exports = {
  onLoad,
  onBrowserWindowCreated,
  onLogin
};
```

### 4. 渲染进程开发 (src/renderer.js)

```javascript
// src/renderer.js
async function initPlugin() {
  console.log('渲染进程插件初始化');
  
  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addUI);
  } else {
    addUI();
  }
}

function addUI() {
  // 创建插件 UI
  const pluginContainer = document.createElement('div');
  pluginContainer.id = 'my-awesome-plugin';
  pluginContainer.innerHTML = `
    <div style="padding: 10px; background: #f0f0f0; margin: 10px;">
      <h3>我的超棒插件</h3>
      <button id="plugin-action-btn">执行操作</button>
    </div>
  `;
  
  // 添加到页面
  document.body.appendChild(pluginContainer);
  
  // 绑定事件
  document.getElementById('plugin-action-btn').onclick = async () => {
    try {
      const result = await window.electronAPI.invoke('my-plugin:get-data');
      alert(result.message);
    } catch (error) {
      console.error('操作失败:', error);
    }
  };
}

// 初始化插件
initPlugin();
```

### 5. 样式开发 (src/style.css)

```css
/* src/style.css */
#my-awesome-plugin {
  font-family: 'Microsoft YaHei', sans-serif;
}

#my-awesome-plugin h3 {
  color: #333;
  margin: 0 0 10px 0;
}

#plugin-action-btn {
  background: #007acc;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

#plugin-action-btn:hover {
  background: #005a9e;
}
```

---

## ✨ 最佳实践

### 1. 代码规范

```javascript
// ✅ 好的实践
const pluginConfig = QQExtension.api.config.get('my-plugin', {
  enabled: true,
  theme: 'light'
});

// ❌ 避免的实践
var config = window.myPluginConfig || {};
```

### 2. 错误处理

```javascript
// ✅ 完善的错误处理
async function safeOperation() {
  try {
    const result = await QQExtension.api.someOperation();
    return result;
  } catch (error) {
    console.error('[我的插件] 操作失败:', error);
    // 降级处理或用户提示
    return null;
  }
}

// ❌ 缺乏错误处理
async function unsafeOperation() {
  const result = await QQExtension.api.someOperation();
  return result;
}
```

### 3. 性能优化

```javascript
// ✅ 防抖处理
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedSave = debounce((config) => {
  QQExtension.api.config.set('my-plugin', config);
}, 500);

// ✅ 内存管理
let observers = [];

function addObserver(observer) {
  observers.push(observer);
}

function cleanup() {
  observers.forEach(observer => observer.disconnect());
  observers = [];
}
```

### 4. 安全实践

```javascript
// ✅ 安全的 DOM 操作
function createSafeElement(tag, attributes = {}) {
  const element = document.createElement(tag);
  Object.keys(attributes).forEach(key => {
    if (key === 'textContent') {
      element.textContent = attributes[key];
    } else {
      element.setAttribute(key, attributes[key]);
    }
  });
  return element;
}

// ❌ 不安全的 innerHTML
function unsafeSetHTML(container, html) {
  container.innerHTML = html; // 可能导致 XSS
}
```

---

## 🔍 调试与测试

### 1. 开发者工具

```javascript
// 在渲染进程中启用调试
if (process.env.NODE_ENV === 'development') {
  // 打开开发者工具
  window.electronAPI.openDevTools();
}

// 日志记录
const Logger = {
  info: (message, ...args) => console.log(`[插件] ${message}`, ...args),
  error: (message, ...args) => console.error(`[插件] ${message}`, ...args),
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[插件] ${message}`, ...args);
    }
  }
};
```

### 2. 单元测试

```javascript
// test/plugin.test.js
const assert = require('assert');

describe('我的插件测试', () => {
  it('应该正确初始化配置', () => {
    const defaultConfig = { enabled: true };
    const config = getDefaultConfig();
    assert.deepEqual(config, defaultConfig);
  });
  
  it('应该正确处理用户输入', () => {
    const input = 'test input';
    const result = processUserInput(input);
    assert.strictEqual(typeof result, 'string');
  });
});
```

### 3. 集成测试

```javascript
// 模拟 QQExtension API
global.QQExtension = {
  api: {
    config: {
      get: (pluginId, defaultConfig) => defaultConfig,
      set: (pluginId, config) => true
    }
  }
};

// 测试插件加载
require('./src/main.js');
```

---

## 📦 发布与分发

### 1. 版本管理

```json
{
  "version": "1.2.3",
  "changelog": {
    "1.2.3": [
      "修复：解决配置保存问题",
      "新增：支持深色主题",
      "优化：提升启动速度"
    ],
    "1.2.2": [
      "修复：内存泄漏问题"
    ]
  }
}
```

### 2. 打包脚本

```bash
#!/bin/bash
# package.sh

# 创建发布目录
mkdir -p dist

# 复制必要文件
cp manifest.json dist/
cp -r src dist/
cp -r assets dist/
cp README.md dist/
cp LICENSE dist/

# 创建压缩包
cd dist
zip -r "../my-plugin-v$(node -p "require('./manifest.json').version").zip" .
cd ..

echo "打包完成！"
```

### 3. 发布清单

- [ ] 代码测试通过
- [ ] 文档完整
- [ ] 版本号正确
- [ ] 更新日志完整
- [ ] 许可证文件存在
- [ ] 插件图标准备就绪
- [ ] 兼容性测试通过

---

## 📚 示例插件

### 简单主题插件

```json
{
  "manifest_version": 4,
  "type": "theme",
  "name": "深色主题",
  "slug": "dark-theme",
  "description": "为 QQ 提供深色主题",
  "version": "1.0.0",
  "author": [{"name": "主题作者"}],
  "injects": {
    "renderer": "./theme.css"
  }
}
```

```css
/* theme.css */
body {
  background-color: #1e1e1e !important;
  color: #ffffff !important;
}

.chat-container {
  background-color: #252526 !important;
}
```

### 功能扩展插件

```javascript
// 消息增强插件示例
class MessageEnhancer {
  constructor() {
    this.enabled = true;
    this.init();
  }
  
  init() {
    // 监听消息发送
    this.interceptMessageSend();
    
    // 添加右键菜单
    this.addContextMenu();
  }
  
  interceptMessageSend() {
    // 拦截并增强消息
    const originalSend = window.sendMessage;
    window.sendMessage = (message) => {
      if (this.enabled) {
        message = this.enhanceMessage(message);
      }
      return originalSend(message);
    };
  }
  
  enhanceMessage(message) {
    // 添加时间戳
    message.timestamp = Date.now();
    return message;
  }
  
  addContextMenu() {
    document.addEventListener('contextmenu', (e) => {
      // 添加自定义右键菜单选项
    });
  }
}

// 初始化插件
new MessageEnhancer();
```

---

## 🤝 贡献指南

### 提交插件到社区

1. **创建 GitHub 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/your-plugin.git
   git push -u origin main
   ```

2. **提交到插件市场**
   - 在 GitHub Discussions 中发布插件信息
   - 遵循社区规范
   - 提供详细的使用文档

3. **维护插件**
   - 及时修复 bug
   - 响应用户反馈
   - 保持与 QQ Extension Manager 的兼容性

---

## 📞 获得帮助

- **文档**: 查看官方文档
- **社区**: 加入开发者社区
- **问题反馈**: 在 GitHub Issues 中报告问题
- **示例代码**: 参考官方示例插件

---

## 📄 许可证

本指南采用 MIT 许可证。插件开发者可以选择任何兼容的开源许可证。

---

**祝您开发愉快！🎉**