/**
 * 电子证书生成工具
 * 用于生成符合东方美学的非遗工艺学习证书
 */

/**
 * 绘制证书到 Canvas
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {Object} data - 证书数据
 * @param {string} data.userName - 用户姓名
 * @param {string} data.ichItem - 非遗项目名称
 * @param {string} data.level - 等级 (入门/进阶/精通/大师)
 * @param {string} data.date - 颁发日期
 * @param {string} data.certificateId - 证书编号
 * @param {number} width - 证书宽度 (像素)
 * @param {number} height - 证书高度 (像素)
 */
export const drawCertificate = (canvas, data, width = 800, height = 600) => {
  const ctx = canvas.getContext('2d');

  // 设置画布尺寸
  canvas.width = width;
  canvas.height = height;

  // 背景 - 宣纸色
  ctx.fillStyle = '#F7F5F0';
  ctx.fillRect(0, 0, width, height);

  // 添加纸张纹理
  addPaperTexture(ctx, width, height);

  // 外边框 - 多层边框设计
  drawBorder(ctx, width, height);

  // 云纹装饰 - 四角
  drawCornerOrnaments(ctx, width, height);

  // 顶部 - 证书标题
  drawTitle(ctx, width);

  // 正文内容
  drawContent(ctx, width, height, data);

  // 底部 - 签名和日期
  drawFooter(ctx, width, height, data);

  // 印章
  drawSeal(ctx, width, height);

  // 二维码 (占位符)
  drawQRCodePlaceholder(ctx, width, height, data.certificateId);
};

/**
 * 添加宣纸纹理
 */
const addPaperTexture = (ctx, width, height) => {
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.fillStyle = '#2B2B2B';

  // 创建噪点纹理
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 1.5;
    ctx.fillRect(x, y, size, size);
  }
  ctx.restore();
};

/**
 * 绘制多层边框
 */
const drawBorder = (ctx, width, height) => {
  const margin = 30;

  // 外层边框 - 墨黑色
  ctx.strokeStyle = '#2B2B2B';
  ctx.lineWidth = 3;
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  // 内层边框 - 朱红色
  ctx.strokeStyle = '#C04851';
  ctx.lineWidth = 2;
  ctx.strokeRect(margin + 8, margin + 8, width - margin * 2 - 16, height - margin * 2 - 16);

  // 最内层细线 - 天青色
  ctx.strokeStyle = '#5796B3';
  ctx.lineWidth = 1;
  ctx.strokeRect(margin + 14, margin + 14, width - margin * 2 - 28, height - margin * 2 - 28);
};

/**
 * 绘制四角云纹装饰
 */
const drawCornerOrnaments = (ctx, width, height) => {
  const size = 60;
  const offset = 35;
  ctx.strokeStyle = '#C04851';
  ctx.lineWidth = 1.5;

  // 绘制简化云纹 (四角)
  const corners = [
    { x: offset, y: offset, rotate: 0 },
    { x: width - offset, y: offset, rotate: Math.PI / 2 },
    { x: width - offset, y: height - offset, rotate: Math.PI },
    { x: offset, y: height - offset, rotate: -Math.PI / 2 }
  ];

  corners.forEach(({ x, y, rotate }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);

    // 简化回纹装饰
    ctx.beginPath();
    ctx.moveTo(-size / 2, 0);
    ctx.lineTo(-size / 2, -size / 3);
    ctx.lineTo(-size / 6, -size / 3);
    ctx.lineTo(-size / 6, -size / 6);
    ctx.lineTo(0, -size / 6);
    ctx.stroke();

    ctx.restore();
  });
};

/**
 * 绘制证书标题
 */
const drawTitle = (ctx, width) => {
  const y = 100;

  // 书法字体标题
  ctx.save();
  ctx.font = 'bold 48px "Ma Shan Zheng", cursive';
  ctx.fillStyle = '#2B2B2B';
  ctx.textAlign = 'center';
  ctx.fillText('结业证书', width / 2, y);

  // 标题下方的朱红装饰线
  ctx.strokeStyle = '#C04851';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 60, y + 15);
  ctx.lineTo(width / 2 + 60, y + 15);
  ctx.stroke();

  // 两端装饰点
  ctx.fillStyle = '#C04851';
  ctx.beginPath();
  ctx.arc(width / 2 - 70, y + 15, 3, 0, Math.PI * 2);
  ctx.arc(width / 2 + 70, y + 15, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

/**
 * 绘制证书正文
 */
const drawContent = (ctx, width, height, data) => {
  const centerY = height / 2 - 20;

  ctx.save();
  ctx.fillStyle = '#2B2B2B';
  ctx.textAlign = 'center';

  // 第一行：兹证明
  ctx.font = '18px "ZCOOL XiaoWei", serif';
  ctx.fillText('兹证明', width / 2, centerY - 80);

  // 用户姓名 (书法体，更大)
  ctx.font = 'bold 36px "Ma Shan Zheng", cursive';
  ctx.fillStyle = '#C04851';
  ctx.fillText(data.userName, width / 2, centerY - 35);

  // 学习完成描述
  ctx.font = '16px "ZCOOL XiaoWei", serif';
  ctx.fillStyle = '#2B2B2B';
  const learnText = `已完成「${data.ichItem}」非遗工艺课程的全部学习内容`;
  ctx.fillText(learnText, width / 2, centerY + 15);

  // 等级信息
  ctx.font = 'bold 24px "Ma Shan Zheng", cursive';
  ctx.fillStyle = '#5796B3';
  ctx.fillText(`荣获 ${data.level} 等级`, width / 2, centerY + 60);

  ctx.restore();
};

/**
 * 绘制底部信息 (颁发机构、日期、证书编号)
 */
const drawFooter = (ctx, width, height, data) => {
  const footerY = height - 120;

  ctx.save();

  // 左侧：颁发机构
  ctx.font = '16px "ZCOOL XiaoWei", serif';
  ctx.fillStyle = '#2B2B2B';
  ctx.textAlign = 'left';
  ctx.fillText('数字传承人项目组', 80, footerY);

  // 机构名称下方的英文
  ctx.font = '12px serif';
  ctx.fillStyle = '#4A4A4A';
  ctx.fillText('The Digital Inheritor Project', 80, footerY + 20);

  // 右侧：日期（包含具体时间）
  ctx.textAlign = 'right';
  ctx.font = '16px "ZCOOL XiaoWei", serif';
  ctx.fillStyle = '#2B2B2B';

  // 显示完整日期时间
  const dateTimeText = data.date + (data.time ? ` ${data.time}` : '');
  ctx.fillText(dateTimeText, width - 80, footerY);

  // 日期下方的干支纪年和时辰
  ctx.font = '12px serif';
  ctx.fillStyle = '#4A4A4A';
  const lunarYear = getLunarYear(data.date);
  const timeInfo = data.chineseHour ? `· ${data.chineseHour}` : '';
  ctx.fillText(lunarYear + timeInfo, width - 80, footerY + 20);

  // 底部中央：证书编号
  ctx.textAlign = 'center';
  ctx.font = '10px monospace';
  ctx.fillStyle = '#666';
  ctx.fillText(`证书编号：${data.certificateId}`, width / 2, height - 40);

  ctx.restore();
};

/**
 * 绘制印章
 */
const drawSeal = (ctx, width, height) => {
  const sealSize = 80;
  const sealX = width - 150;
  const sealY = height - 140;

  ctx.save();

  // 印章外框
  ctx.strokeStyle = '#C04851';
  ctx.lineWidth = 2;
  ctx.fillStyle = 'rgba(192, 72, 81, 0.1)';

  // 圆角矩形印章 (兼容不支持 roundRect 的浏览器)
  ctx.beginPath();
  const x = sealX - sealSize / 2;
  const y = sealY - sealSize / 2;
  const w = sealSize;
  const h = sealSize;
  const r = 8;
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 印章内的文字 (简化版)
  ctx.fillStyle = '#C04851';
  ctx.font = 'bold 14px "Ma Shan Zheng", cursive';
  ctx.textAlign = 'center';
  ctx.fillText('数字', sealX, sealY - 10);
  ctx.fillText('传承', sealX, sealY + 8);
  ctx.fillText('人', sealX, sealY + 26);

  // 印章边框装饰
  ctx.strokeStyle = '#C04851';
  ctx.lineWidth = 1;
  ctx.strokeRect(sealX - sealSize / 2 + 10, sealY - sealSize / 2 + 10, sealSize - 20, sealSize - 20);

  ctx.restore();
};

/**
 * 绘制二维码占位符 (实际使用时可替换为真实二维码)
 */
const drawQRCodePlaceholder = (ctx, width, height, certificateId) => {
  const qrSize = 70;
  const qrX = 80;
  const qrY = height - 150;

  ctx.save();

  // 二维码背景
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(qrX, qrY, qrSize, qrSize);

  // 二维码边框
  ctx.strokeStyle = '#2B2B2B';
  ctx.lineWidth = 1;
  ctx.strokeRect(qrX, qrY, qrSize, qrSize);

  // 简化的二维码图案 (实际应使用二维码库生成)
  ctx.fillStyle = '#2B2B2B';
  const pattern = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0]
  ];

  const cellSize = qrSize / 7;
  pattern.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell) {
        ctx.fillRect(
          qrX + j * cellSize + 2,
          qrY + i * cellSize + 2,
          cellSize - 4,
          cellSize - 4
        );
      }
    });
  });

  // 二维码下方文字
  ctx.font = '8px monospace';
  ctx.fillStyle = '#666';
  ctx.textAlign = 'center';
  ctx.fillText('扫码验证', qrX + qrSize / 2, qrY + qrSize + 12);

  ctx.restore();
};

/**
 * 获取干支纪年 (简化版)
 */
const getLunarYear = (dateStr) => {
  const year = new Date(dateStr).getFullYear();
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  return `${heavenlyStems[stemIndex]}${earthlyBranches[branchIndex]}年`;
};

/**
 * 获取时辰（中国传统计时单位，2 小时为一个时辰）
 * @param {number} hour - 小时 (0-23)
 * @returns {string} 时辰名称
 */
const getChineseHour = (hour) => {
  const chineseHours = [
    { name: '子时', time: '23:00-01:00' },
    { name: '丑时', time: '01:00-03:00' },
    { name: '寅时', time: '03:00-05:00' },
    { name: '卯时', time: '05:00-07:00' },
    { name: '辰时', time: '07:00-09:00' },
    { name: '巳时', time: '09:00-11:00' },
    { name: '午时', time: '11:00-13:00' },
    { name: '未时', time: '13:00-15:00' },
    { name: '申时', time: '15:00-17:00' },
    { name: '酉时', time: '17:00-19:00' },
    { name: '戌时', time: '19:00-21:00' },
    { name: '亥时', time: '21:00-23:00' }
  ];

  if (hour === 0) return chineseHours[0].name;
  return chineseHours[Math.ceil(hour / 2) % 12].name;
};

/**
 * 生成证书数据
 */
export const generateCertificateData = (userName, ichItem, level, date = null) => {
  const now = date || new Date();
  const dateStr = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 添加具体时间（精确到时分）
  const timeStr = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  // 添加时辰
  const chineseHour = getChineseHour(now.getHours());

  // 生成唯一证书编号
  const certificateId = `CERT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return {
    userName,
    ichItem,
    level,
    date: dateStr,
    time: timeStr,
    chineseHour: chineseHour,
    certificateId,
    issueDate: now.toISOString()
  };
};

/**
 * 将 Canvas 导出为 PNG
 */
export const exportCertificateAsPNG = (canvas, fileName = 'certificate.png') => {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

/**
 * 将 Canvas 导出为 PDF (需要 jsPDF 库)
 */
export const exportCertificateAsPDF = async (canvas, fileName = 'certificate.pdf') => {
  // 动态导入 jsPDF
  const jsPDF = (await import('jspdf')).default;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
  pdf.save(fileName);
};
