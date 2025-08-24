# QQ Extension Manager

> QQNT 功能扩展管理器 —— 轻量 · 简洁 · 开源

![License](https://img.shields.io/github/license/bobotechnology/qq-extension-manager)
![Release](https://img.shields.io/github/v/release/bobotechnology/qq-extension-manager)
![Downloads](https://img.shields.io/github/downloads/bobotechnology/qq-extension-manager/total)

## 📖 项目简介

QQ Extension Manager 是一个功能强大的 QQNT 扩展管理器，让您能够轻松安装、管理和使用各种插件来增强 QQ 的功能。

### ✨ 主要特性

- 🔌 **插件管理**: 支持插件的安装、卸载、启用和禁用
- 🎨 **主题支持**: 支持自定义主题和样式
- 🛡️ **安全防护**: 内置先进的反检测系统
- 🔄 **兼容性**: 支持现有插件的无缝迁移
- 🌐 **开源**: 完全开源，社区驱动

## 🚀 快速开始

### 系统要求

- Windows 10/11 (64位)
- QQNT 9.7.8 或更高版本
- Node.js 16+ (开发需要)

### 安装步骤

1. **下载最新版本**
   ```
   https://github.com/bobotechnology/qq-extension-manager/releases/latest
   ```

2. **解压到QQ目录**
   ```
   将 qq-extension-manager 文件夹放入 QQ 安装目录
   ```

3. **替换dbghelp.dll**
   ```
   将提供的 dbghelp.dll 替换到 QQ 根目录
   ```

4. **重启QQ**
   ```
   重新启动 QQ，扩展管理器会自动激活
   ```

## 📁 项目结构

```
qq-extension-manager/
├── src/                          # 源代码目录
│   ├── main.js                   # 主进程入口
│   ├── preload.js                # 预加载脚本
│   ├── renderer.js               # 渲染进程
│   ├── qqextension_api/          # 核心API
│   ├── extension_core/           # 核心管理模块
│   ├── settings/                 # 设置界面
│   ├── anti_detection/           # 反检测系统
│   └── protocol_scheme/          # 协议处理
├── plugins/                      # 插件目录
├── package.json                  # 项目配置
└── README.md                     # 说明文档
```

## 🔧 开发指南

### 环境配置

```bash
# 克隆仓库
git clone https://github.com/bobotechnology/qq-extension-manager.git

# 进入目录
cd qq-extension-manager

# 安装依赖
npm install
```

### API 使用

```javascript
// 获取配置
const config = QQExtension.api.config.get('plugin-name', defaultConfig);

// 设置配置
QQExtension.api.config.set('plugin-name', newConfig);

// 获取插件信息
const plugins = QQExtension.plugins;

// 获取路径信息
const paths = QQExtension.path;
```

## 🔌 插件开发

### 基本结构

```json
{
  "manifest_version": 4,
  "type": "extension",
  "name": "示例插件",
  "slug": "example-plugin",
  "description": "这是一个示例插件",
  "version": "1.0.0",
  "author": [
    {
      "name": "开发者",
      "link": "https://github.com/developer"
    }
  ],
  "injects": {
    "main": "./src/main.js",
    "renderer": "./src/renderer.js",
    "preload": "./src/preload.js"
  }
}
```

### 插件兼容性

为了确保插件与反检测系统的兼容性，请遵循以下原则：

- ✅ 使用 `QQExtension` API 而不是旧的 `LiteLoader` API
- ✅ 避免在代码中直接引用 `liteloader` 关键词
- ✅ 使用推荐的DOM选择器模式
- ✅ 测试插件在各种安全模式下的功能

## 🛡️ 安全特性

### 反检测系统

QQ Extension Manager 内置了先进的反检测系统，包括：

- **进程监控**: 检测并对抗分析工具
- **内存保护**: 保护敏感数据不被扫描
- **DOM保护**: 隐藏敏感的页面元素
- **网络保护**: 拦截可疑的网络请求
- **动态特征**: 每次启动生成不同的特征

### 安全模式

支持三种安全模式：

- **严格模式**: 最大安全性，可能影响部分插件功能
- **平衡模式**: 安全性与兼容性并重（推荐）
- **宽松模式**: 最大兼容性，降低安全防护

## 📊 兼容性检查

使用内置的兼容性检测工具：

```bash
# 检查所有插件
node src/anti_detection/compatibility_checker.js

# 检查特定目录
node src/anti_detection/compatibility_checker.js /path/to/plugins
```

## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 贡献类型

- 🐛 Bug 修复
- ✨ 新功能
- 📚 文档改进
- 🔧 性能优化
- 🛡️ 安全增强

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 🔗 相关链接

- **项目主页**: https://github.com/bobotechnology/qq-extension-manager
- **问题反馈**: https://github.com/bobotechnology/qq-extension-manager/issues
- **开发文档**: https://github.com/bobotechnology/qq-extension-manager/wiki
- **插件市场**: https://github.com/bobotechnology/qq-extension-manager/discussions

## ⚠️ 免责声明

本项目仅用于学习交流目的，请用户遵守相关法律法规和腾讯QQ使用条款。使用本软件可能存在账号风险，请用户自行承担相关责任。

## 💖 致谢

感谢所有为本项目做出贡献的开发者和社区成员！

---

**Made with ❤️ by BoboTechnology Team**