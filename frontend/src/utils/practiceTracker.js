/**
 * 练习追踪工具
 * 用于记录用户练习时长、准确率等数据
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8002/api/v1';
const STORAGE_KEY = 'practice_records';

/**
 * 从本地存储获取记录
 */
export const getLocalRecords = () => {
  const records = localStorage.getItem(STORAGE_KEY);
  return records ? JSON.parse(records) : [];
};

/**
 * 保存记录到本地存储
 */
const saveLocalRecords = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

/**
 * 练习追踪器类
 */
export class PracticeTracker {
  constructor(userId = 1) {
    this.userId = userId;
    this.startTime = null;
    this.endTime = null;
    this.scenario = null;
    this.craftId = null;
    this.craftName = null;
    this.accuracySamples = [];
  }

  /**
   * 开始练习
   */
  start(scenario, craftId, craftName) {
    this.startTime = new Date();
    this.scenario = scenario;
    this.craftId = craftId;
    this.craftName = craftName;
    this.accuracySamples = [];
    console.log(`[PracticeTracker] 练习开始 - ${craftName} (${scenario})`);
  }

  /**
   * 暂停练习
   */
  pause() {
    if (this.startTime) {
      this.endTime = new Date();
      console.log(`[PracticeTracker] 练习暂停`);
    }
  }

  /**
   * 恢复练习
   */
  resume() {
    if (this.endTime) {
      this.startTime = new Date();
      this.endTime = null;
      console.log(`[PracticeTracker] 练习恢复`);
    }
  }

  /**
   * 记录一次准确率采样
   */
  recordAccuracy(accuracy) {
    if (accuracy >= 0 && accuracy <= 100) {
      this.accuracySamples.push(accuracy);
    }
  }

  /**
   * 计算平均准确率
   */
  getAverageAccuracy() {
    if (this.accuracySamples.length === 0) return 0;
    const sum = this.accuracySamples.reduce((a, b) => a + b, 0);
    return sum / this.accuracySamples.length;
  }

  /**
   * 结束练习并获取统计数据
   */
  end() {
    if (!this.startTime) return null;

    this.endTime = new Date();
    const duration = Math.floor((this.endTime - this.startTime) / 1000); // 秒
    const avgAccuracy = this.getAverageAccuracy();

    // 计算得分（基于准确率）
    const score = avgAccuracy;

    console.log(`[PracticeTracker] 练习结束 - 时长：${duration}s, 准确率：${avgAccuracy.toFixed(1)}%`);

    return {
      duration,
      score,
      accuracy: avgAccuracy,
      scenario: this.scenario,
      craftId: this.craftId,
      craftName: this.craftName
    };
  }

  /**
   * 重置追踪器
   */
  reset() {
    this.startTime = null;
    this.endTime = null;
    this.scenario = null;
    this.craftId = null;
    this.craftName = null;
    this.accuracySamples = [];
  }
}

/**
 * 保存练习记录到后端（失败则使用本地存储）
 */
export const savePracticeRecord = async (userId, recordData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/user/profile/${userId}/practice-record?` +
      new URLSearchParams({
        craft_id: recordData.craftId,
        craft_name: recordData.craftName,
        duration: recordData.duration.toString(),
        score: recordData.score.toString(),
        accuracy: recordData.accuracy.toString(),
        scenario: recordData.scenario || '',
        feedback: recordData.feedback || ''
      }),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('API 不可用，使用本地存储');
    }

    const result = await response.json();
    console.log('[PracticeTracker] 练习记录保存成功', result);
    return { success: true, data: result };
  } catch (error) {
    console.log('[PracticeTracker] 后端不可用，使用本地存储');

    // 使用本地存储
    const records = getLocalRecords();
    const newRecord = {
      id: Date.now(),
      userId,
      ...recordData,
      completedAt: new Date().toISOString()
    };
    records.push(newRecord);
    saveLocalRecords(records);

    return { success: true, data: { record_id: newRecord.id, local: true } };
  }
};

/**
 * 获取用户统计数据（优先 API，失败则使用本地存储）
 */
export const getUserStats = async (userId = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/profile/${userId}/stats`);

    if (!response.ok) {
      throw new Error('API 不可用');
    }

    const stats = await response.json();
    return stats;
  } catch (error) {
    // 使用本地存储计算统计数据
    const records = getLocalRecords();
    console.log('[getUserStats] 本地存储记录:', records);

    const totalDuration = records.reduce((sum, r) => sum + (r.duration || 0), 0);
    const totalHours = (totalDuration / 3600).toFixed(2);

    const avgAccuracy = records.length > 0
      ? (records.reduce((sum, r) => sum + (r.accuracy || 0), 0) / records.length).toFixed(1)
      : 0;

    // 统计掌握的技法（准确率>=80 的不同 craft）
    const masteredCrafts = new Set(
      records
        .filter(r => r.accuracy >= 80)
        .map(r => r.craftId)
    ).size;

    const totalWorks = records.filter(r => r.completedWork).length || records.length;

    const result = {
      total_practice_hours: parseFloat(totalHours),
      average_accuracy: parseFloat(avgAccuracy),
      mastered_crafts: masteredCrafts,
      total_works: totalWorks,
      total_practice_sessions: records.length
    };
    console.log('[getUserStats] 计算结果:', result);
    return result;
  }
};

/**
 * 计算用户能力五维数据（基于练习记录）
 * 五维：稳定性 (stability)、准确度 (accuracy)、速度 (speed)、创意 (creativity)、知识 (knowledge)
 * @param {Array} records - 练习记录数组
 * @returns {Object} 能力五维数据 (0-100 分)
 */
export const calculateAbilities = (records) => {
  if (!records || records.length === 0) {
    return {
      stability: 0,
      accuracy: 0,
      speed: 0,
      creativity: 0,
      knowledge: 0
    };
  }

  // 1. 准确度 - 基于所有练习的平均准确率
  const accuracies = records.map(r => r.accuracy || 0);
  const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

  // 2. 稳定性 - 基于分数的波动（方差越小越稳定）
  const scores = records.map(r => r.score || 0);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  let variance = 0;
  if (scores.length > 1) {
    variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
  }
  // 方差越小越稳定，转换为 0-100 分
  const stability = Math.max(0, Math.min(100, 100 - variance / 10));

  // 3. 速度 - 基于练习时长（完成时间越短速度越快，但有质量要求）
  // 假设标准完成时间是 1800 秒 (30 分钟)，但要结合准确率
  const durations = records.map(r => r.duration || 0);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  let speed = 50;
  if (avgDuration > 0) {
    // 标准时间内的完成，速度分数基于时间和准确率
    const timeScore = Math.min(100, (1800 / avgDuration) * 70);
    const qualityMultiplier = avgAccuracy / 100;
    speed = timeScore * qualityMultiplier;
  }

  // 4. 创意 - 基于完成的不同技法数量和作品数量（这里简化为练习次数）
  // 每练习一种不同的技法增加创意分数
  const uniqueCrafts = new Set(records.map(r => r.craftId)).size;
  const creativity = Math.min(100, uniqueCrafts * 20 + records.length * 2);

  // 5. 知识 - 基于练习的总时长（练习越久知识越丰富）
  const totalDuration = records.reduce((sum, r) => sum + (r.duration || 0), 0);
  // 每 3600 秒 (1 小时) 增加约 10 分知识分
  const knowledge = Math.min(100, (totalDuration / 3600) * 20);

  return {
    stability: Math.round(stability * 10) / 10,
    accuracy: Math.round(avgAccuracy * 10) / 10,
    speed: Math.round(speed * 10) / 10,
    creativity: Math.round(creativity * 10) / 10,
    knowledge: Math.round(knowledge * 10) / 10
  };
};

/**
 * 获取用户完整档案（优先 API，失败则使用本地存储）
 */
export const getUserProfile = async (userId = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/profile?user_id=${userId}`);

    if (!response.ok) {
      throw new Error('API 不可用');
    }

    const profile = await response.json();
    return profile;
  } catch (error) {
    // 使用本地存储
    const records = getLocalRecords();
    const stats = await getUserStats();
    const abilities = calculateAbilities(records);

    console.log('[getUserProfile] fallback stats:', stats);
    console.log('[getUserProfile] calculated abilities:', abilities);

    return {
      user: {
        id: userId,
        name: '用户',
        level: 'apprentice',
        experience_points: records.length * 10,
        title: '初级学徒'
      },
      abilities: abilities,
      stats: stats
    };
  }
};

/**
 * 创建单例追踪器实例
 */
export const createTracker = (userId = 1) => {
  return new PracticeTracker(userId);
};

// 导出单例
export const tracker = createTracker();
