# 51talk 用户访谈会 H5 邀请函

一个精美的移动端H5邀请函页面，用于邀请用户参加51talk用户访谈会。

## 功能特点

### 🎨 视觉设计
- **品牌色彩**：采用51talk品牌橙色/黄色系
- **温暖专业**：营造重视用户的氛围
- **移动优先**：完美适配各种手机屏幕
- **响应式布局**：适配微信、手机浏览器

### 📱 核心功能
- **邀请展示**：精美的邀请函展示
- **酬金突出**：800元访谈酬金醒目展示
- **地图导航**：集成百度地图导航功能
- **表单交互**：用户称呼输入和时间段选择
- **成功反馈**：提交成功后的确认弹窗

### 🔧 技术特性
- **表单验证**：实时输入验证和错误提示
- **防重复提交**：避免用户多次点击
- **本地备份**：数据本地存储作为备份
- **微信分享**：自定义分享卡片信息
- **网络监控**：网络状态检测和处理
- **性能优化**：图片压缩和加载优化

## 文件结构

```
邀请函/
├── index.html      # 主页面文件
├── style.css       # 样式文件
├── script.js       # 交互脚本
├── logo.png        # 51talk Logo
├── 需求文档.md      # 详细需求文档
├── README.md       # 说明文档
└── CLAUDE.md       # Claude Code 指导文档
```

## 使用方法

### 1. 直接使用
直接在手机浏览器中打开 `index.html` 文件即可使用。

### 2. 本地服务器
推荐使用本地服务器进行测试：

```bash
# 使用 Python 3
python -m http.server 8000

# 使用 Node.js
npx serve .

# 使用 PHP
php -S localhost:8000
```

然后在手机浏览器中访问：`http://你的IP地址:8000`

### 3. 在线部署
将整个文件夹上传到Web服务器即可使用。

## 配置说明

### 后端API配置
在 `script.js` 中找到以下代码并替换为实际的API地址：

```javascript
// 第 138 行左右
const apiUrl = 'https://your-api-endpoint.com/api/registration';
```

### 微信分享配置
需要在微信环境中配置JS-SDK，参考 `script.js` 中的 `initWeChatShare` 函数。

### 地图链接
当前使用百度地图链接：
`https://j.map.baidu.com/fc/dcN`

可在 `index.html` 中修改：
```html
<a href="https://j.map.baidu.com/fc/dcN" target="_blank" class="map-link">
```

## 数据结构

后端需要接收以下格式的JSON数据：

```json
{
  "user_name": "王女士",
  "selected_slot": "AM",
  "submit_time": "2025-11-19T10:30:00.000Z",
  "ip_address": "192.168.1.1"
}
```

字段说明：
- `user_name`: 用户填写的称呼
- `selected_slot`: 时间段 ('AM' 或 'PM')
- `submit_time`: 提交时间戳
- `ip_address`: 用户IP地址（可选）

## 后台管理需求

### 数据库表结构建议：
```sql
CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL,
    selected_slot ENUM('AM', 'PM') NOT NULL,
    submit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);
```

### 管理功能：
- 查看所有报名用户列表
- 导出Excel文件（用于现场签到）
- 数据筛选和搜索

## 浏览器兼容性

- ✅ iOS Safari 12+
- ✅ Android Chrome 70+
- ✅ 微信内置浏览器
- ✅ QQ浏览器
- ✅ UC浏览器

## 微信分享设置

页面已配置分享信息：
- **标题**: 51talk 用户访谈会诚挚邀请
- **描述**: 期待您的参与，共创更好产品体验
- **图标**: 51talk Logo

## 性能优化

- 图片大小：推荐控制在100KB以内
- CSS优化：关键CSS内联，非关键CSS异步加载
- JavaScript：使用防抖节流，优化用户体验
- 缓存策略：设置适当的缓存头

## 注意事项

1. **HTTPS要求**：微信分享功能需要HTTPS协议
2. **域名备案**：正式部署需要备案域名
3. **API安全**：后端API需要添加安全验证
4. **数据备份**：建议定期备份数据库
5. **测试验证**：上线前在微信环境中充分测试

## 技术支持

如有问题，请参考：
- 需求文档：`需求文档.md`
- Claude Code 指导：`CLAUDE.md`

## 开发团队

**项目类型**: 51talk 用户访谈会邀请函
**开发日期**: 2025年11月
**目标用户**: 51talk现有用户（家长/学员）
**活动日期**: 2025年11月29日