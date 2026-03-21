import React, { useEffect, useRef, useState } from 'react';
import { drawCertificate, exportCertificateAsPNG, exportCertificateAsPDF } from '../utils/certificateGenerator';

/**
 * 证书展示组件
 * 用于在页面上展示和下载证书
 */
const CertificateDisplay = ({ certificateData, showActions = true }) => {
  const canvasRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (canvasRef.current && certificateData) {
      drawCertificate(canvasRef.current, certificateData);
    }
  }, [certificateData]);

  const handleDownloadPNG = async () => {
    setIsDownloading(true);
    try {
      exportCertificateAsPNG(canvasRef.current, `certificate-${certificateData?.certificateId}.png`);
    } catch (error) {
      console.error('下载 PNG 失败:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await exportCertificateAsPDF(canvasRef.current, `certificate-${certificateData?.certificateId}.pdf`);
    } catch (error) {
      console.error('下载 PDF 失败:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!certificateData) {
    return (
      <div className="flex items-center justify-center h-64 text-charcoal">
        <p>暂无证书数据</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* 证书 Canvas */}
      <div className="relative card-shadow rounded-sm overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full max-w-4xl h-auto"
          style={{ maxWidth: '800px' }}
        />
      </div>

      {/* 操作按钮 */}
      {showActions && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleDownloadPNG}
            disabled={isDownloading}
            className="px-6 py-2 bg-ink-black text-rice-paper font-xiaowei rounded-sm
                       hover:bg-vermilion transition-colors disabled:opacity-50"
          >
            下载 PNG
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-6 py-2 bg-ink-black text-rice-paper font-xiaowei rounded-sm
                       hover:bg-vermilion transition-colors disabled:opacity-50"
          >
            下载 PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default CertificateDisplay;
