/**
 * 用户能力雷达图组件
 * 使用 SVG 绘制五维能力雷达图（五边形）
 */

import React, { useEffect, useRef, useState } from 'react';

const AbilityRadarChart = ({
  abilities,
  width = 400,
  height = 400,
  className = ''
}) => {
  const svgRef = useRef(null);

  // 五维能力数据
  const dimensions = [
    { key: 'stability', label: '稳定性', color: '#5796B3' },  // cyan-glaze
    { key: 'accuracy', label: '准确度', color: '#C04851' },   // vermilion
    { key: 'speed', label: '速度', color: '#CCD4BF' },        // tea-green
    { key: 'creativity', label: '创意', color: '#8B5A2B' },   // bronze
    { key: 'knowledge', label: '知识', color: '#2B2B2B' },    // ink-black
  ];

  // 计算雷达图顶点坐标（正五边形）
  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) / 2 - 60;

  // 正五边形每个顶点的角度（从顶部开始，顺时针）
  const getAngle = (index) => {
    return (index * 72 - 90) * (Math.PI / 180); // 72 度 = 360/5，-90 度让第一个点在顶部
  };

  // 计算指定索引和值的坐标
  const getPoint = (index, value) => {
    const angle = getAngle(index);
    const r = (value / 100) * radius;
    return {
      x: center.x + r * Math.cos(angle),
      y: center.y + r * Math.sin(angle)
    };
  };

  // 生成雷达图路径
  const generatePath = (dataScale = 1) => {
    const points = dimensions.map((dim, i) => {
      const value = (abilities?.[dim.key] || 0) * dataScale;
      return getPoint(i, value);
    });

    if (points.length === 0) return '';

    const pathData = points.map((point, i) => {
      return i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`;
    }).join(' ');

    return `${pathData} Z`;
  };

  // 生成五边形网格线（5 个层级）
  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="mx-auto"
      >
        {/* 背景五边形网格 */}
        {gridLevels.map((level, levelIndex) => {
          const points = dimensions.map((_, i) => {
            const angle = getAngle(i);
            const r = (level / 100) * radius;
            return `${center.x + r * Math.cos(angle)},${center.y + r * Math.sin(angle)}`;
          }).join(' ');

          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="#E5E5E5"
              strokeWidth="1.5"
              opacity={levelIndex === gridLevels.length - 1 ? 0.6 : 0.3}
            />
          );
        })}

        {/* 五边形轴线（从中心到顶点） */}
        {dimensions.map((dim, i) => {
          const outerPoint = getPoint(i, 100);
          return (
            <line
              key={`axis-${dim.key}`}
              x1={center.x}
              y1={center.y}
              x2={outerPoint.x}
              y2={outerPoint.y}
              stroke="#D4D4D4"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity="0.5"
            />
          );
        })}

        {/* 雷达图填充区域 - 渐变边框 */}
        <path
          d={generatePath()}
          fill="rgba(192, 72, 81, 0.15)"
          stroke="#C04851"
          strokeWidth="3"
          className="transition-all duration-700 ease-in-out"
        />

        {/* 雷达图内层高光 */}
        <path
          d={generatePath(0.98)}
          fill="none"
          stroke="rgba(192, 72, 81, 0.5)"
          strokeWidth="1"
          className="transition-all duration-700 ease-in-out"
        />

        {/* 顶点标记和标签 */}
        {dimensions.map((dim, i) => {
          const point = getPoint(i, abilities?.[dim.key] || 0);
          const labelPoint = getPoint(i, 100);

          // 计算标签位置（在五边形顶点外侧）
          const labelOffset = 35;
          const labelAngle = getAngle(i);
          const labelX = center.x + (radius + labelOffset) * Math.cos(labelAngle);
          const labelY = center.y + (radius + labelOffset) * Math.sin(labelAngle);

          return (
            <g key={`label-${dim.key}`}>
              {/* 顶点圆点 */}
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill={dim.color}
                stroke="#fff"
                strokeWidth="3"
                className="transition-all duration-500"
              />
              {/* 外圈光环 */}
              <circle
                cx={point.x}
                cy={point.y}
                r="10"
                fill="none"
                stroke={dim.color}
                strokeWidth="1"
                opacity="0.5"
              />
              {/* 维度标签 */}
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-serif"
                style={{
                  fontSize: '14px',
                  fill: dim.color,
                  fontWeight: '600',
                  fontFamily: '"Noto Serif SC", serif'
                }}
              >
                {dim.label}
              </text>
              {/* 能力值 */}
              <text
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                dy="1"
                className="font-bold"
                style={{
                  fontSize: '11px',
                  fill: '#fff',
                  fontWeight: '700'
                }}
              >
                {Math.round(abilities?.[dim.key] || 0)}
              </text>
            </g>
          );
        })}

        {/* 中心装饰圆 */}
        <circle
          cx={center.x}
          cy={center.y}
          r="8"
          fill="url(#centerGradient)"
        />

        {/* 渐变定义 */}
        <defs>
          <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C04851" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#C04851" stopOpacity="0.3" />
          </radialGradient>
          <linearGradient id="abilityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C04851" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#5796B3" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default AbilityRadarChart;
