# Microsoft Edge 扩展商店发布保姆级操作指南

本指南手把手指导如何将 **TruthGuard 事实检察官** 发布至微软 Edge 浏览器扩展商店（Microsoft Edge Add-ons Store）。

---

## 🗂️ 目录与已为你准备好的材料

所有发布材料均已在项目 `TruthGuard/store-assets/` 目录下生成：

| 材料文件 | 说明与用途 |
| :--- | :--- |
| `truthguard-edge-v1.0.0.zip` | **核心扩展安装包**（标准 POSIX 规范，已包含 MV3 清单与全部代码图标） |
| `store-logo-300x300.png` | **商店 Logo**（微软商店强制要求的 300x300 PNG 尺寸） |
| `small-promo-440x280.png` | **商店推荐磁贴**（440x280 推广展示图） |
| `STORE_LISTING_ZH.md` | **商店文案（中文）**（包含名称、简短描述、详细描述、搜索词、审核员测试备注） |
| `STORE_LISTING_EN.md` | **商店文案（英文）**（用于国际化市场发布，提升全球曝光） |
| `PRIVACY_POLICY.md` / `privacy.html` | **隐私政策**（已内置在 public 目录中，支持一键静态托管） |
| `SCREENSHOT_GUIDE.md` | **截图指引**（教你如何在 Edge 中 1 秒生成标准 1280x800 截图） |

---

## 🚀 完整发布流程（7 步走）

### 第一步：注册/登录微软开发者中心
1. 访问微软 Edge 扩展开发者门户：[Microsoft Partner Center (Edge Add-ons)](https://partner.microsoft.com/dashboard/microsoftedge)
2. 使用您的任意微软账号（Outlook, Hotmail, 个人/工作账号）登录。
3. 如果是首次使用，根据提示填写**开发者个人信息**（发布商显示名称、联系邮箱、国家/地区）。
   * 🌟 **提示**：微软 Edge 扩展开发者账号**完全免费**（不同于谷歌 Chrome 需收费 5 美元）。

---

### 第二步：创建新扩展并上传安装包
1. 进入仪表板后，点击右上角的 **「创建新扩展 (Create new extension)」** 按钮。
2. 拖拽或上传我们生成好的安装包：
   * 文件路径：`TruthGuard/store-assets/truthguard-edge-v1.0.0.zip`
3. 系统将自动解析 `manifest.json`，校验版本号（`1.0.0`）、权限与清单文件。稍等数秒直到提示上传成功。

---

### 第三步：填写扩展属性 (Properties)
在左侧菜单点击 **「属性 (Properties)」**：
1. **主要类别 (Category)**：选择 `Productivity (生产力)`。
2. **次要类别 (Secondary category)**：选择 `Search tools (搜索工具)` 或 `Developer tools`。
3. **支持 URL (Support URL)**：填写您的 GitHub Issues 页面或项目官网（例如 `https://github.com/FreshmanJ/TruthGuard/issues`）。
4. **隐私政策 URL (Privacy policy URL - 必填)**：
   * 填写部署后的隐私页面链接（例如 `https://truthguard.pages.dev/privacy.html`）；
   * 或者将 `store-assets/PRIVACY_POLICY.md` 粘贴到 GitHub 仓库/Gist，填写该链接。
5. **网站 (Website URL)**：填写项目主页或 GitHub 仓库地址。

---

### 第四步：设置商店详情与多语言文案 (Store listings)
在左侧菜单点击 **「商店详情 (Store listings)」**：
1. 点击 **「添加语言」**，建议添加 **中文（简体）** 和 **英语（美国）**。
2. 打开 `store-assets/STORE_LISTING_ZH.md`：
   * **扩展名称**：`TruthGuard 事实检察官`
   * **简短描述 (Summary)**：复制对应简短描述（不超过 280 字符）。
   * **详细描述 (Description)**：直接复制 Markdown 格式的完整描述。
   * **搜索词 (Search terms)**：复制预设的 21 个关键词。
3. 上传视觉素材：
   * **扩展商店徽标 (Store logo)**：上传 `store-assets/store-logo-300x300.png`（必填）。
   * **小型推广磁贴 (Small promotional tile)**：上传 `store-assets/small-promo-440x280.png`（选填，上传后有机会被 Edge 商店首页推荐）。
   * **屏幕截图 (Screenshots)**：参考 `SCREENSHOT_GUIDE.md` 截取 1~4 张 1280x800 图片并上传。

---

### 第五步：设置市场与定价 (Availability)
在左侧菜单点击 **「可用性 (Availability)」**：
1. **市场 (Markets)**：选择所有市场（全球分发）或仅中国/特定地区。
2. **可见性 (Visibility)**：选择 `Public (公开)`。
3. **定价 (Pricing)**：免费 (Free)。

---

### 第六步：填写审核员测试说明 (Notes for certification - 核心！)
在左侧菜单点击 **「审核附注 (Notes for certification)」**：
> ⚠️ **注意**：这是审核能否一次性通过的关键！微软审核员会在隔离沙盒中人工测试扩展。

直接复制 `store-assets/STORE_LISTING_ZH.md` 第 5 节的英文测试说明粘贴进去。该说明清晰阐述了：
* 扩展功能与使命（基于元宝搜索的事实审校）；
* 为什么需要申请 `<all_urls>`、`storage` 与 `scripting` 权限；
* 详细的 6 步复现与测试方法；
* 开箱即用的测试 API 配置说明。

---

### 第七步：提交审核与上线
1. 检查各分项左侧是否均已亮起绿色对勾（完成标记）。
2. 点击右上角 **「发布 (Publish)」**。
3. **审核周期**：通常为 **1 ~ 3 个工作日**。
4. 审核结果将通过注册邮箱通知您；审核通过后，扩展将自动发布至 Microsoft Edge Add-ons 商店，全球用户均可一键安装！

---

## 💡 后续版本更新迭代
后续若有代码更新：
1. 修改 `package.json` 和 `manifest.json` 中的 `version`（例如改为 `1.0.1`）；
2. 运行 `cd TruthGuard && node scripts/package-extension.js`；
3. 登录 Partner Center -> 点击当前扩展 -> 「Update」上传新 zip 即可提交更新。
