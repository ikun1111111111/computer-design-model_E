import React, { useState } from 'react';
import CertificateDisplay from '../components/CertificateDisplay';
import { generateCertificateData } from '../utils/certificateGenerator';

/**
 * 证书预览页面
 * 用于展示和测试证书模板效果
 * 后续可与用户档案系统 (E-002) 集成获取真实数据
 */
const CertificatePreview = () => {
  // 示例证书数据 (后续可从 E-002 用户档案系统获取)
  const [certificateData, setCertificateData] = useState(() => {
    return generateCertificateData(
      '张三',
      '皮影戏制作技艺',
      '进阶'
    );
  });

  // 表单状态
  const [formData, setFormData] = useState({
    userName: '张三',
    ichItem: '皮影戏制作技艺',
    level: '进阶'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = () => {
    const newData = generateCertificateData(
      formData.userName,
      formData.ichItem,
      formData.level
    );
    setCertificateData(newData);
  };

  const levelOptions = [
    { value: '入门', label: '入门 (Initiate)', color: '茶绿' },
    { value: '进阶', label: '进阶 (Practitioner)', color: '天青' },
    { value: '精通', label: '精通 (Artisan)', color: '朱红' },
    { value: '大师', label: '大师 (Master)', color: '墨黑' }
  ];

  const ichItemOptions = [
    '皮影戏制作技艺',
    '剪纸艺术',
    '刺绣工艺',
    '陶瓷制作',
    '木雕技艺',
    '竹编工艺',
    '漆器制作',
    '其他'
  ];

  return (
    <div className="min-h-screen bg-rice-paper py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="font-calligraphy text-3xl text-ink-black mb-2">
            电子证书
          </h1>
          <p className="font-xiaowei text-charcoal text-sm">
            数字传承人项目 · 非遗工艺学习认证
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：证书预览 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-sm p-6 card-shadow">
              <h2 className="font-xiaowei text-lg text-ink-black mb-4 border-b border-tea-green pb-2">
                证书预览
              </h2>
              <CertificateDisplay certificateData={certificateData} />
            </div>
          </div>

          {/* 右侧：控制面板 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-sm p-6 card-shadow">
              <h2 className="font-xiaowei text-lg text-ink-black mb-4 border-b border-tea-green pb-2">
                证书信息配置
              </h2>

              <div className="space-y-4">
                {/* 用户姓名 */}
                <div>
                  <label className="block text-sm font-xiaowei text-charcoal mb-1">
                    姓名
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tea-green/50 rounded-sm
                               font-serif text-ink-black focus:outline-none focus:border-cyan-glaze"
                    placeholder="请输入姓名"
                  />
                </div>

                {/* 非遗项目 */}
                <div>
                  <label className="block text-sm font-xiaowei text-charcoal mb-1">
                    非遗项目名称
                  </label>
                  <select
                    name="ichItem"
                    value={formData.ichItem}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tea-green/50 rounded-sm
                               font-serif text-ink-black focus:outline-none focus:border-cyan-glaze
                               bg-white"
                  >
                    {ichItemOptions.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                {/* 等级 */}
                <div>
                  <label className="block text-sm font-xiaowei text-charcoal mb-1">
                    获得等级
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tea-green/50 rounded-sm
                               font-serif text-ink-black focus:outline-none focus:border-cyan-glaze
                               bg-white"
                  >
                    {levelOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 生成按钮 */}
                <button
                  onClick={handleGenerate}
                  className="w-full py-3 bg-ink-black text-rice-paper font-xiaowei
                             rounded-sm hover:bg-vermilion transition-colors mt-4"
                >
                  生成证书
                </button>

                {/* 说明信息 */}
                <div className="mt-6 p-3 bg-tea-green/20 rounded-sm">
                  <p className="text-xs font-serif text-charcoal leading-relaxed">
                    <strong className="text-ink-black">说明：</strong><br />
                    此页面为证书模板预览，后续将与用户档案系统集成，
                    自动获取用户学习进度和成绩生成个性化证书。
                  </p>
                </div>

                {/* 证书信息展示 */}
                {certificateData && (
                  <div className="mt-4 p-3 bg-rice-paper rounded-sm space-y-1">
                    <p className="text-xs font-serif text-charcoal">
                      <span className="text-ink-black font-bold">证书编号：</span>
                      {certificateData.certificateId}
                    </p>
                    <p className="text-xs font-serif text-charcoal">
                      <span className="text-ink-black font-bold">颁发日期：</span>
                      {certificateData.date}
                    </p>
                    {certificateData.time && (
                      <p className="text-xs font-serif text-charcoal">
                        <span className="text-ink-black font-bold">颁发时间：</span>
                        {certificateData.time}（{certificateData.chineseHour}）
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 等级说明 */}
        <div className="mt-6 bg-white rounded-sm p-6 card-shadow">
          <h2 className="font-xiaowei text-lg text-ink-black mb-4 border-b border-tea-green pb-2">
            等级说明
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {levelOptions.map(opt => (
              <div
                key={opt.value}
                className="p-3 rounded-sm text-center border border-tea-green/30"
              >
                <p className="font-calligraphy text-xl mb-1" style={{
                  color: opt.color === '茶绿' ? '#CCD4BF' :
                         opt.color === '天青' ? '#5796B3' :
                         opt.color === '朱红' ? '#C04851' : '#2B2B2B'
                }}>
                  {opt.value}
                </p>
                <p className="text-xs text-charcoal font-serif">{opt.color}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
