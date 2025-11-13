# Truth_Plug - 网页内容真实性验证插件

<div align="center">

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/Chrome-Extension-yellow.svg)

一个基于 AI 的浏览器扩展，用于验证网页内容的真实性和可靠性

</div>

## 📖 项目简介

Truth_Plug 是一个智能的 Chrome 浏览器扩展插件，能够自动分析网页内容的真实性。插件通过 Coze AI 技术对网页段落进行智能分析，将内容与官方信息源进行比对，并为每个段落提供真实性评分（0-100分），帮助用户快速识别虚假或误导性信息。

### ✨ 核心功能

- 🔍 **智能段落分析**：自动提取和分析网页文本内容
- 🎯 **真实性评分**：为每个段落提供 0-100 的可信度评分
- 📊 **可视化标注**：在网页上直观显示段落评分结果
- 📝 **详细说明**：提供评分依据和与官方信息源的对比详情
- 🚀 **实时验证**：快速响应，即时获取分析结果

### 🎨 适用场景

- 📰 新闻阅读时快速判断内容真实性
- 🎓 学术研究中验证网络资料可靠性
- 🔎 信息筛选过程中识别虚假或误导性内容
- 📡 媒体监测和事实核查工作

## 🏗️ 项目结构

```
Truth_Plug/
├── manifest.json              # Chrome 扩展清单文件
├── README.md                  # 项目说明文档
├── docs.md                    # API 文档
├── 项目报告.md                # 详细项目报告
├── background/                # 后台脚本
│   └── service_worker.js      # Service Worker 主文件
├── content_scripts/           # 内容脚本
│   ├── main.js                # 核心功能实现
│   └── styles.css             # 页面标注样式
├── popup/                     # 弹出窗口
│   ├── popup.html             # 弹出窗口界面
│   └── popup.js               # 弹出窗口逻辑
├── icons/                     # 图标资源
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── server/                    # 可选的本地服务器
    ├── index.js               # Express 服务器
    ├── package.json           # Node.js 依赖
    ├── README.md              # 服务器说明
    └── start.bat              # Windows 启动脚本
```

## 🚀 快速开始

### 前置要求

- Google Chrome 浏览器（版本 88+）
- Coze API 密钥（[获取地址](https://www.coze.cn/open/oauth/pats)）

### 安装步骤

#### 方法一：直接使用（推荐）

1. **克隆或下载项目**
   ```bash
   git clone https://github.com/Halifax07/Truth_Plug.git
   cd Truth_Plug
   ```

2. **配置 Coze API**
   
   打开 `content_scripts/main.js`，找到以下配置并替换为你的密钥：
   ```javascript
   const COZE_API_KEY = 'your_api_key_here';  // 替换为你的 Coze API Key
   const BOT_ID = 'your_bot_id_here';          // 替换为你的 Bot ID
   ```

3. **加载扩展到 Chrome**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 Truth_Plug 项目文件夹

4. **开始使用**
   - 访问任意网页
   - 点击浏览器工具栏的插件图标
   - 点击"分析当前页面"按钮

#### 方法二：使用本地服务器

如果需要使用本地服务器作为中间层：

1. **安装服务器依赖**
   ```bash
   cd server
   npm install
   ```

2. **配置服务器**
   
   编辑 `server/index.js`，替换你的 Coze API 令牌：
   ```javascript
   const COZE_API_TOKEN = 'your_coze_token_here';
   ```

3. **启动服务器**
   
   Windows:
   ```bash
   双击 start.bat
   ```
   
   或使用命令行:
   ```bash
   npm start
   ```

4. **加载扩展**（同方法一的步骤 3-4）

## 💡 使用说明

### 基本使用

1. **打开插件**
   - 点击浏览器工具栏中的 Truth_Plug 图标

2. **分析页面**
   - 在弹出窗口中点击"分析当前页面"按钮
   - 等待分析完成（通常需要 10-30 秒）

3. **查看结果**
   - 网页段落会显示真实性评分标注
   - 弹出窗口显示详细的分析结果
   - 高分（70+）显示为绿色
   - 中等分（40-70）显示为橙色
   - 低分（<40）显示为红色

### 评分说明

| 分数范围 | 可信度 | 说明 |
|---------|--------|------|
| 90-100  | 极高 | 内容与官方信息源高度一致 |
| 70-89   | 较高 | 大部分内容可靠，细节可能有差异 |
| 40-69   | 中等 | 部分内容可靠，需要进一步核实 |
| 0-39    | 较低 | 内容与官方信息源差异较大 |

## 🔧 技术架构

### 核心技术栈

- **前端**
  - HTML5 / CSS3 / JavaScript (ES6+)
  - Chrome Extension API (Manifest V3)

- **AI 服务**
  - Coze API（扣子 AI）
  - 自然语言处理
  - 内容比对与验证

- **后端**（可选）
  - Node.js + Express
  - Axios（HTTP 请求）
  - CORS 跨域支持

### 工作流程

```
用户点击分析
    ↓
popup.js 获取当前页面 URL
    ↓
content_scripts/main.js 提取页面内容
    ↓
调用 Coze API 进行分析
    ↓
Coze AI 分段并与官方源比对
    ↓
返回评分结果
    ↓
在页面上显示标注
    ↓
在弹出窗口显示详细结果
```

## 📝 API 说明

### Coze API 调用示例

```javascript
POST https://api.coze.cn/v3/chat
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "bot_id": "YOUR_BOT_ID",
  "user_id": "edge_extension_user_123",
  "stream": false,
  "auto_save_history": true,
  "additional_messages": [
    {
      "role": "user",
      "content": "https://example.com/article",
      "content_type": "text"
    }
  ]
}
```

### 响应数据格式

```json
{
  "code": 0,
  "data": {
    "messages": [
      {
        "role": "assistant",
        "type": "answer",
        "content": "[{\"paragraph_identifier\":\"p_1\",\"original_paragraph_text\":\"...\",\"score\":90,\"justification\":\"...\",\"comparison_details\":\"...\",\"retrieved_official_source_url\":\"...\"}]"
      }
    ]
  }
}
```

## ⚙️ 配置说明

### 必需配置

在 `content_scripts/main.js` 中配置：

```javascript
// Coze API 配置
const COZE_API_KEY = 'pat_xxxxx';  // 你的 Coze Personal Access Token
const BOT_ID = '7503536807309606923';  // 你的 Bot ID
const COZE_CHAT_API_URL = 'https://api.coze.cn/v3/chat';
```

### 可选配置

在 `popup.js` 中可调整：

```javascript
// 请求超时设置（毫秒）
let requestTimeoutMs = 5 * 60 * 1000;  // 默认 5 分钟
```

## 🛠️ 开发说明

### 本地开发

1. **修改代码后重新加载**
   - 访问 `chrome://extensions/`
   - 找到 Truth_Plug 扩展
   - 点击刷新图标

2. **调试**
   - 内容脚本：在网页上右键 → 检查 → Console
   - 弹出窗口：右键点击插件图标 → 检查弹出内容
   - 后台脚本：在扩展管理页面点击"Service Worker"链接

### 常见问题

**Q: 提示"服务器未运行"**  
A: 如果使用本地服务器模式，确保已运行 `node server/index.js`

**Q: 分析结果为空**  
A: 检查 Coze API 密钥是否正确配置，查看控制台错误信息

**Q: 请求超时**  
A: 某些复杂页面可能需要更长处理时间，可在高级设置中增加超时时间

**Q: 无法找到匹配段落**  
A: 部分网页使用特殊结构，插件会在弹出窗口显示结果作为备用

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- [Coze 开放平台](https://www.coze.cn/)
- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [项目 GitHub 仓库](https://github.com/Halifax07/Truth_Plug)

## 👥 作者

**Halifax07**

- GitHub: [@Halifax07](https://github.com/Halifax07)

## 🙏 致谢

- 感谢 [Coze AI](https://www.coze.cn/) 提供强大的 AI 能力支持
- 感谢所有为本项目做出贡献的开发者

## 📮 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [GitHub Issue](https://github.com/Halifax07/Truth_Plug/issues)
- 发送邮件到项目维护者

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star！**

Made with ❤️ by Halifax07

</div>
