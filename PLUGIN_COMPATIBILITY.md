# 插件兼容性说明

## 概述

QQ Extension Manager（魔改版）为了保持最大的防检测效果，采用了全新的 `QQExtension` API。现有的 LiteLoader 插件需要进行**简单的适配修改**才能使用。

## 适配方案

### 方案一：插件修改（推荐）

对于插件开发者，只需要做简单的全局替换：

```javascript
// 将所有的 LiteLoader 替换为 QQExtension
- LiteLoader.api.config.get("pluginName", {});
+ QQExtension.api.config.get("pluginName", {});

- LiteLoader.api.openExternal("https://example.com");
+ QQExtension.api.openExternal("https://example.com");

- LiteLoader.versions.liteloader;
+ QQExtension.versions.qqextension;

- LiteLoader.path.plugins;
+ QQExtension.path.plugins;
```

### 方案二：兼容性封装

在插件的入口文件中添加兼容层：

```javascript
// 在插件的 renderer.js 或 preload.js 中添加
if (typeof QQExtension !== 'undefined' && typeof LiteLoader === 'undefined') {
    // 为了兼容性，创建本地别名
    const LiteLoader = {
        ...QQExtension,
        versions: {
            ...QQExtension.versions,
            liteloader: QQExtension.versions.qqextension
        },
        package: {
            ...QQExtension.package,
            liteloader: QQExtension.package.qqextension
        }
    };
}

// 现有代码可以继续使用
LiteLoader.api.config.get("pluginName", {});
```

### 方案三：渐进式迁移

使用动态检测机制：

```javascript
// 智能适配不同的运行环境
const PluginAPI = (() => {
    if (typeof QQExtension !== 'undefined') {
        return {
            ...QQExtension,
            versions: {
                ...QQExtension.versions,
                liteloader: QQExtension.versions.qqextension
            }
        };
    } else if (typeof LiteLoader !== 'undefined') {
        return LiteLoader;
    } else {
        throw new Error('未找到可用的 API');
    }
})();

// 使用统一的 API
const config = await PluginAPI.api.config.get("myPlugin", defaultConfig);
```

## 修改工具

### 自动化替换脚本

为了帮助插件开发者快速适配，可以使用以下命令：

```bash
# 在插件目录中执行
# Windows
findstr /s /m "LiteLoader" *.js | xargs sed -i "s/LiteLoader/QQExtension/g"

# Linux/Mac  
grep -rl "LiteLoader" *.js | xargs sed -i 's/LiteLoader/QQExtension/g'
```

### 手动修改清单

1. ☑️ 将所有 `LiteLoader` 替换为 `QQExtension`
2. ☑️ 将 `versions.liteloader` 替换为 `versions.qqextension`
3. ☑️ 将 `package.liteloader` 替换为 `package.qqextension`
4. ☑️ 更新 manifest.json 中的版本要求（可选）

## API 对照表

| 原 LiteLoader API | 新 QQExtension API | 说明 |
|-------------------|-------------------|------|
| `LiteLoader.api.config.get()` | `QQExtension.api.config.get()` | 配置获取 |
| `LiteLoader.api.config.set()` | `QQExtension.api.config.set()` | 配置设置 |
| `LiteLoader.api.openExternal()` | `QQExtension.api.openExternal()` | 打开外部链接 |
| `LiteLoader.api.openPath()` | `QQExtension.api.openPath()` | 打开文件路径 |
| `LiteLoader.versions.liteloader` | `QQExtension.versions.qqextension` | 版本信息 |
| `LiteLoader.path.*` | `QQExtension.path.*` | 路径信息 |
| `LiteLoader.plugins` | `QQExtension.plugins` | 插件列表 |

## 数据存储

### 配置文件兼容
- 现有插件的配置文件路径保持不变
- 数据存储在 `data/插件名/config.json`
- 支持原有的配置读写逻辑

### 环境变量
- 新增：`QQ_EXTENSION_PROFILE` 环境变量
- 兼容：仍支持原有路径结构

## 已测试的插件

以下插件已确认兼容（示例）：
- ✅ plugin-list-viewer（插件市场）
- ✅ 主题美化类插件
- ✅ 功能增强类插件

## 插件开发建议

### 对于新插件开发者
推荐使用新的 `QQExtension` API：
```javascript
// 推荐写法
const config = await QQExtension.api.config.get("myPlugin", defaultConfig);
QQExtension.api.openExternal("https://example.com");
```

### 对于现有插件维护者
无需立即修改，但建议逐步迁移：
```javascript
// 渐进式迁移
const PluginAPI = globalThis.QQExtension || globalThis.LiteLoader;
const config = await PluginAPI.api.config.get("myPlugin", defaultConfig);
```

## 注意事项

1. **安全优先**：为了保持最大的防检测效果，本版本不再全局暴露 `LiteLoader` 对象
2. **简单修改**：大部分插件只需做全局替换即可适配
3. **功能不变**：所有 API 接口和功能都保持不变
4. **数据兼容**：插件数据和配置文件完全兼容

## 常见问题

### Q: 为什么不直接保留 LiteLoader 兼容层？
A: 为了防止 QQ 检测，必须完全移除 `LiteLoader` 标识符。兼容层会重新暴露这个风险。

### Q: 修改插件会影响更新吗？
A: 不会。只是更改 API 调用，不影响插件的核心功能和更新机制。

### Q: 如何检查插件是否适配成功？
A: 查看插件是否正常加载和运行，检查控制台是否有错误信息。

## 插件开发建议

### 对于新插件开发者
直接使用 `QQExtension` API：
```javascript
// 推荐写法
const config = await QQExtension.api.config.get("myPlugin", defaultConfig);
QQExtension.api.openExternal("https://example.com");
```

### 对于现有插件维护者
可以选择以下方式之一：
1. **全局替换**：一次性更新所有 API 调用
2. **渐进式迁移**：使用兼容性检测代码
3. **分支维护**：为 QQ Extension Manager 单独维护一个分支

## 社区资源

- **适配工具**：提供自动化替换脚本
- **测试插件**：提供已适配的测试插件
- **技术支持**：在社区中提供适配帮助

## 总结

QQ Extension Manager 通过 **安全第一** 的设计理念，为用户提供：

- ✅ **高安全性**：完全去除检测特征
- ✅ **简单适配**：插件修改工作量最小
- ✅ **功能完整**：保持所有原有功能  
- ✅ **生态活跃**：支持丰富的插件生态

这种设计既保护了用户的安全，又确保了插件生态的繁荣！