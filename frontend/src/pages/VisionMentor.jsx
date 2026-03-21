import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HandTracking from '../components/HandTracking';
import { tracker, savePracticeRecord } from '../utils/practiceTracker';
import Button from '../components/Button';

const VisionMentor = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scenarioParam = searchParams.get('scenario');
  const [activeScenario, setActiveScenario] = useState(scenarioParam || 'embroidery'); // 'embroidery' | 'clay'

  useEffect(() => {
    if (scenarioParam && (scenarioParam === 'embroidery' || scenarioParam === 'clay')) {
      setActiveScenario(scenarioParam);
    }
  }, [scenarioParam]);

  // Practice tracking state
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceDuration, setPracticeDuration] = useState(0);
  const [accuracySamples, setAccuracySamples] = useState([]);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);
  const [displayTime, setDisplayTime] = useState('0:00'); // 用于显示的格式化时间
  const durationTimerRef = useRef(null);
  const durationRef = useRef(0); // 用 ref 保存最新时长，避免闭包问题
  const isPracticingRef = useRef(false); // 用 ref 保存练习状态
  const userId = 1; // Default user ID

  const [metricValue, setMetricValue] = useState(0);
  const [feedbackStatus, setFeedbackStatus] = useState('waiting'); // 'waiting' | 'good' | 'warning' | 'error'
  const [feedbackMessage, setFeedbackMessage] = useState('等待检测...');

  // Theme configuration based on scenario
  const theme = {
    embroidery: {
      title: '苏绣 · 运针检测',
      color: 'cyan-glaze',
      accent: '#5796B3',
      bg: 'bg-cyan-glaze/10',
      border: 'border-cyan-glaze',
      text: 'text-cyan-glaze',
      icon: '🪡', // Needle
      metricLabel: '指间距 (针法力度)',
      instruction: '请通过摄像头展示您的拨针动作，保持拇指与食指的自然开合。',
    },
    clay: {
      title: '紫砂 · 拍打成型',
      color: 'vermilion',
      accent: '#C04851',
      bg: 'bg-vermilion/10',
      border: 'border-vermilion',
      text: 'text-vermilion',
      icon: '🏺', // Amphora/Pot
      metricLabel: '手掌开合 (拍泥力度)',
      instruction: '请展示拍打泥片的动作，保持手掌与泥片接触面的稳定性。',
    },
  };

  const currentTheme = theme[activeScenario];

  /**
   * 开始练习
   */
  const startPractice = () => {
    tracker.reset();
    tracker.start(
      activeScenario,
      activeScenario === 'embroidery' ? 'suzhou_embroidery' : 'purple_clay',
      activeScenario === 'embroidery' ? '苏绣·平针基础' : '紫砂·拍泥片'
    );
    setIsPracticing(true);
    isPracticingRef.current = true; // 同步更新 ref
    setPracticeDuration(0);
    setDisplayTime('0:00');
    setAccuracySamples([]);
    durationRef.current = 0;

    // 清除之前的定时器
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }

    // 重新开始计时器 - 直接更新显示时间
    durationTimerRef.current = setInterval(() => {
      const newValue = durationRef.current + 1;
      durationRef.current = newValue;
      const minutes = Math.floor(newValue / 60);
      const seconds = String(newValue % 60).padStart(2, '0');
      const newTime = `${minutes}:${seconds}`;
      setDisplayTime(newTime);
      console.log('[Timer] 时长:', newTime);
    }, 1000);

    console.log('[Timer] 开始练习，计时器启动');
  };

  /**
   * 结束练习
   */
  const endPractice = async () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    setIsPracticing(false);
    isPracticingRef.current = false; // 同步更新 ref

    const stats = tracker.end();
    if (stats) {
      // 使用 tracker 计算的时长（基于 startTime 和 endTime 的差值）
      const result = await savePracticeRecord(userId, {
        ...stats,
        feedback: feedbackMessage
      });

      if (result.success) {
        setSessionStats({
          duration: stats.duration,
          accuracy: stats.accuracy.toFixed(1),
          score: stats.score.toFixed(1)
        });
        setShowSessionSummary(true);
      }
    }
  };

  /**
   * 处理手部检测结果
   */
  const handleHandResults = useCallback((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];

      // Calculate Euclidean distance
      const distance = Math.sqrt(
        Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2)
      );

      setMetricValue(distance);

      // 计算当前准确率 (基于距离是否在目标范围内)
      const thresholds = activeScenario === 'embroidery'
        ? { min: 0.03, max: 0.15 }
        : { min: 0.05, max: 0.2 };

      let currentAccuracy = 0;
      if (distance < thresholds.min || distance > thresholds.max) {
        // 超出范围，准确率降低
        const distToMin = Math.abs(distance - thresholds.min);
        const distToMax = Math.abs(distance - thresholds.max);
        const distToRange = Math.min(distToMin, distToMax);
        currentAccuracy = Math.max(0, 100 - distToRange * 500);
      } else {
        // 在范围内，计算完美度
        const center = (thresholds.min + thresholds.max) / 2;
        const distFromCenter = Math.abs(distance - center);
        const maxDist = (thresholds.max - thresholds.min) / 2;
        currentAccuracy = 100 - (distFromCenter / maxDist) * 20; // 80-100 分
      }

      // 记录准确率采样（使用函数式更新获取最新状态）
      setAccuracySamples(prev => [...prev, currentAccuracy]);

      // 同步更新 tracker（使用 ref 检查状态，避免闭包问题）
      if (isPracticingRef.current) {
        tracker.recordAccuracy(currentAccuracy);
      }

      // Feedback logic
      if (distance < thresholds.min) {
        setFeedbackStatus('error');
        setFeedbackMessage(activeScenario === 'embroidery' ? '捏针过紧 (易断线)' : '拍打过重 (泥片易裂)');
      } else if (distance > thresholds.max) {
        setFeedbackStatus('warning');
        setFeedbackMessage(activeScenario === 'embroidery' ? '针距过宽 (走线不稳)' : '手掌张开过大 (受力不均)');
      } else {
        setFeedbackStatus('good');
        setFeedbackMessage('动作标准 (Good)');
      }
    } else {
      setMetricValue(0);
      setFeedbackStatus('waiting');
      setFeedbackMessage('未检测到手部动作');
    }
  }, [activeScenario]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-rice-paper font-serif text-ink-black selection:bg-vermilion selection:text-white relative overflow-hidden">
      {/* Background Noise Texture */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none bg-noise mix-blend-multiply"></div>

      <Navbar />

      <main className="relative z-10 container mx-auto px-6 py-12 pt-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-2 border-ink-black/10 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-calligraphy text-ink-black mb-4">
              视觉导师 <span className="text-2xl text-ink-black/60 font-serif">Vision Mentor</span>
            </h1>
            <p className="text-lg text-ink-black/70 max-w-2xl">
              结合计算机视觉技术，实时分析您的非遗技艺动作，提供专业指导与纠错。
            </p>
          </div>

          {/* Scenario Switcher */}
          <div className="flex gap-4 mt-6 md:mt-0">
            <button
              onClick={() => setActiveScenario('embroidery')}
              className={`px-6 py-2 rounded-full border-2 transition-all duration-300 flex items-center gap-2 font-bold ${
                activeScenario === 'embroidery'
                  ? 'bg-cyan-glaze text-white border-cyan-glaze shadow-lg transform -translate-y-1'
                  : 'bg-transparent text-ink-black/60 border-ink-black/20 hover:border-cyan-glaze hover:text-cyan-glaze'
              }`}
            >
              <span>🪡</span> 苏绣模式
            </button>
            <button
              onClick={() => setActiveScenario('clay')}
              className={`px-6 py-2 rounded-full border-2 transition-all duration-300 flex items-center gap-2 font-bold ${
                activeScenario === 'clay'
                  ? 'bg-vermilion text-white border-vermilion shadow-lg transform -translate-y-1'
                  : 'bg-transparent text-ink-black/60 border-ink-black/20 hover:border-vermilion hover:text-vermilion'
              }`}
            >
              <span>🏺</span> 紫砂模式
            </button>
          </div>
        </div>

        {/* Practice Control Bar */}
        <div className="mb-8 bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-ink-black/50 uppercase tracking-widest">练习时长</div>
              <div className="text-2xl font-serif text-ink-black">
                {displayTime}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-ink-black/50 uppercase tracking-widest">当前状态</div>
              <div className={`text-lg font-bold ${
                isPracticing ? 'text-green-600' : 'text-gray-400'
              }`}>
                {isPracticing ? '练习中...' : '未开始'}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {!isPracticing ? (
              <Button onClick={startPractice} className="px-8">
                开始练习
              </Button>
            ) : (
              <Button onClick={endPractice} variant="outline" className="px-8 border-vermilion text-vermilion hover:bg-vermilion hover:text-white">
                结束练习
              </Button>
            )}
          </div>
        </div>

        {/* Session Summary Modal */}
        {showSessionSummary && sessionStats && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
              <button
                onClick={() => setShowSessionSummary(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>

              <div className="text-center mb-6">
                <div className="text-3xl font-calligraphy text-ink-black mb-2">练习完成</div>
                <p className="text-ink-black/60">本次练习数据已保存</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-cyan-glaze/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-serif text-cyan-glaze">
                    {Math.floor(sessionStats.duration / 60)}:{String(sessionStats.duration % 60).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-ink-black/50 mt-1">练习时长</div>
                </div>
                <div className="bg-vermilion/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-serif text-vermilion">{sessionStats.accuracy}%</div>
                  <div className="text-xs text-ink-black/50 mt-1">平均准确率</div>
                </div>
                <div className="bg-tea-green/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-serif text-tea-green">{sessionStats.score}</div>
                  <div className="text-xs text-ink-black/50 mt-1">得分</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowSessionSummary(false);
                    navigate('/my-practice');
                  }}
                >
                  查看学习进度
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowSessionSummary(false)}
                >
                  继续练习
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Camera Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`relative p-2 rounded-2xl border-2 ${currentTheme.border} bg-white shadow-xl transition-colors duration-500`}>
              {/* Decorative Corner Accents */}
              <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 ${currentTheme.border} -translate-x-1 -translate-y-1 rounded-tl-lg`}></div>
              <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 ${currentTheme.border} translate-x-1 -translate-y-1 rounded-tr-lg`}></div>
              <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 ${currentTheme.border} -translate-x-1 translate-y-1 rounded-bl-lg`}></div>
              <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 ${currentTheme.border} translate-x-1 translate-y-1 rounded-br-lg`}></div>

              {/* The Hand Tracking Component */}
              <HandTracking onResults={handleHandResults} scenario={activeScenario} />
              
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-center text-sm">
                {currentTheme.instruction}
              </div>
            </div>
          </div>

          {/* Right Column: Analysis Panel */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Status Card */}
            <div className={`bg-white p-6 rounded-xl shadow-lg border-t-4 ${currentTheme.border}`}>
              <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${currentTheme.text}`}>
                {currentTheme.icon} 实时反馈
              </h3>
              
              <div className={`text-center py-8 rounded-lg mb-4 transition-colors duration-300 ${
                feedbackStatus === 'good' ? 'bg-green-100 text-green-800' :
                feedbackStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                feedbackStatus === 'error' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-500'
              }`}>
                <div className="text-3xl font-bold mb-2">
                  {feedbackStatus === 'waiting' ? 'Waiting...' : 
                   feedbackStatus === 'good' ? 'Excellent' : 
                   feedbackStatus === 'warning' ? 'Adjust' : 'Alert'}
                </div>
                <div className="font-medium">{feedbackMessage}</div>
              </div>

              {/* Metric Visualization */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-ink-black/70">
                  <span>{currentTheme.metricLabel}</span>
                  <span className="font-mono">{(metricValue * 100).toFixed(1)}</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
                  {/* Target Zone Marker */}
                  <div className="absolute top-0 bottom-0 bg-green-200/50 w-[20%] left-[20%] border-l border-r border-green-400"></div>
                  
                  {/* Value Bar */}
                  <div 
                    className={`h-full transition-all duration-200 ease-out ${
                      feedbackStatus === 'good' ? 'bg-green-500' :
                      feedbackStatus === 'warning' ? 'bg-yellow-500' :
                      feedbackStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.min(metricValue * 300, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-ink-black/40">
                  <span>紧闭</span>
                  <span>适中</span>
                  <span>张开</span>
                </div>
              </div>
            </div>

            {/* Technical Info Card */}
            <div className="bg-white/60 p-6 rounded-xl border border-ink-black/5">
              <h4 className="text-lg font-bold text-ink-black mb-3">技术参数</h4>
              <ul className="space-y-2 text-sm text-ink-black/70">
                <li className="flex justify-between">
                  <span>模型框架:</span>
                  <span className="font-mono font-bold">MediaPipe Hands</span>
                </li>
                <li className="flex justify-between">
                  <span>检测延迟:</span>
                  <span className="font-mono text-green-600">~15ms</span>
                </li>
                <li className="flex justify-between">
                  <span>关键点数量:</span>
                  <span className="font-mono">21 / Hand</span>
                </li>
                <li className="flex justify-between">
                  <span>算法:</span>
                  <span className="font-mono">Euclidean Distance</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default VisionMentor;
