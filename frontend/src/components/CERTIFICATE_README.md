# 电子证书生成模块说明文档

## 概述

本模块为"数字传承人"项目提供电子证书生成功能，支持生成符合东方美学的非遗工艺学习证书。

## 已完成功能

### 1. 证书模板设计

**视觉设计特点：**
- 宣纸色背景 (#F7F5F0) 带噪点纹理
- 三层边框设计（墨黑、朱红、天青）
- 四角云纹装饰
- 书法字体标题（"结业证书"）
- 底部印章（"数字传承人"）
- 二维码验证区域（占位符）
- 干支纪年装饰

### 2. 证书数据结构

```javascript
{
  userName: '张三',           // 用户姓名
  ichItem: '皮影戏制作技艺',   // 非遗项目名称
  level: '进阶',              // 等级 (入门/进阶/精通/大师)
  date: '2026 年 3 月 17 日',    // 颁发日期
  certificateId: 'CERT-xxx',  // 证书编号（自动生成）
  issueDate: '2026-03-17T...' // ISO 格式颁发时间
}
```

### 3. 等级系统

| 等级 | 颜色 | 说明 |
|------|------|------|
| 入门 | 茶绿 (#CCD4BF) | 完成基础课程 |
| 进阶 | 天青 (#5796B3) | 完成进阶课程 |
| 精通 | 朱红 (#C04851) | 完成高阶课程 |
| 大师 | 墨黑 (#2B2B2B) | 完成大师课程 |

### 4. 导出功能

- **PNG 格式**: 直接下载证书图片
- **PDF 格式**: 使用 jsPDF 生成 A4 横向 PDF

## 文件结构

```
frontend/src/
├── utils/
│   └── certificateGenerator.js    # 证书生成工具函数
├── components/
│   └── CertificateDisplay.jsx     # 证书展示组件
├── pages/
│   └── CertificatePreview.jsx     # 证书预览页面
└── main.jsx                       # 路由配置（已添加 /certificate-preview）
```

## 使用方法

### 基础使用

```jsx
import CertificateDisplay from './components/CertificateDisplay';
import { generateCertificateData } from './utils/certificateGenerator';

// 生成证书数据
const certificateData = generateCertificateData(
  '张三',              // 姓名
  '皮影戏制作技艺',    // 非遗项目
  '进阶'              // 等级
);

// 在组件中渲染
<CertificateDisplay certificateData={certificateData} />
```

### 自定义 Canvas 绘制

```jsx
import { drawCertificate, exportCertificateAsPNG } from './utils/certificateGenerator';

const canvas = document.getElementById('myCanvas');
const data = { /* 证书数据 */ };

// 绘制证书
drawCertificate(canvas, data, 800, 600);

// 导出为 PNG
exportCertificateAsPNG(canvas, 'my-certificate.png');
```

## 与 E-002（用户档案系统）集成

待 E-002 完成后，可通过以下方式集成：

### 1. 从用户档案获取数据

```jsx
// 从用户档案系统获取学习记录
const { userPractices, achievements } = useUserPractice();

// 自动生成证书
useEffect(() => {
  if (achievements.completedCourses.length > 0) {
    const certificate = generateCertificateData(
      user.name,
      achievements.completedCourses[0].ichItem,
      achievements.completedCourses[0].level
    );
    setCertificateData(certificate);
  }
}, [achievements]);
```

### 2. 证书列表存储

```jsx
// 在用户档案中添加证书历史
const userCertificates = [
  {
    id: 'CERT-20260317-ABC123',
    ichItem: '苏绣·平针基础',
    level: '入门',
    issueDate: '2026-03-17',
    imageUrl: '/certificates/cert-001.png'
  },
  // ...
];
```

## 二维码验证（待实现）

当前二维码为占位符图案，后续可集成功能：

1. 生成包含证书编号的 URL
2. 扫码跳转到验证页面
3. 显示证书详情和真伪验证

### 建议实现方案

```javascript
// 使用 qrcode 库生成真实二维码
import QRCode from 'qrcode';

const generateQRCode = async (certificateId) => {
  const verifyUrl = `${window.location.origin}/verify/${certificateId}`;
  return await QRCode.toDataURL(verifyUrl);
};
```

## 后续优化方向

1. **模板多样性**: 添加多种证书模板（横版/竖版、不同配色）
2. **批量生成**: 支持为多个学员批量生成证书
3. **邮件发送**: 证书生成后自动发送邮件
4. **社交分享**: 一键分享到微信、微博等平台
5. **区块链存证**: 将证书哈希上链，实现不可篡改

## 设计说明

### 配色方案

| 颜色 | 色值 | 用途 |
|------|------|------|
| 墨黑 | #2B2B2B | 主文字色、外边框 |
| 朱红 | #C04851 | 印章、强调色 |
| 天青 | #5796B3 | 等级文字、装饰 |
| 茶绿 | #CCD4BF | 边框、背景 |
| 宣纸白 | #F7F5F0 | 证书背景 |

### 字体使用

- **标题**: Ma Shan Zheng（马善政毛笔楷书）
- **正文**: ZCOOL XiaoWei（小薇宋体）
- **装饰**: Noto Serif SC（思源宋体）

## 技术依赖

- `jspdf` - PDF 生成
- Canvas API - 证书绘制
- React 19 - 组件框架

## 开发者

数字传承人项目组
2026 年 3 月
