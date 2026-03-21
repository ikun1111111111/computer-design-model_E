/**
 * 练习追踪器测试
 * 测试练习时长、准确率统计等功能
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PracticeTracker, tracker } from '../src/utils/practiceTracker';

// Mock fetch
global.fetch = vi.fn();

describe('PracticeTracker', () => {
  let practiceTracker;

  beforeEach(() => {
    practiceTracker = new PracticeTracker(1);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('start()', () => {
    it('应该正确初始化练习追踪', () => {
      practiceTracker.start('embroidery', 'suzhou_embroidery', '苏绣·平针基础');

      expect(practiceTracker.startTime).toBeInstanceOf(Date);
      expect(practiceTracker.scenario).toBe('embroidery');
      expect(practiceTracker.craftId).toBe('suzhou_embroidery');
      expect(practiceTracker.craftName).toBe('苏绣·平针基础');
      expect(practiceTracker.accuracySamples).toEqual([]);
    });

    it('应该在开始新练习时重置数据', () => {
      practiceTracker.start('embroidery', 'suzhou_embroidery', '苏绣·平针基础');
      practiceTracker.recordAccuracy(80);

      // 重新开始
      practiceTracker.start('clay', 'purple_clay', '紫砂·拍泥片');

      expect(practiceTracker.scenario).toBe('clay');
      expect(practiceTracker.accuracySamples).toEqual([]);
    });
  });

  describe('recordAccuracy()', () => {
    it('应该记录有效的准确率采样', () => {
      practiceTracker.start('embroidery', 'suzhou_embroidery', '苏绣·平针基础');

      practiceTracker.recordAccuracy(75);
      practiceTracker.recordAccuracy(80);
      practiceTracker.recordAccuracy(85);

      expect(practiceTracker.accuracySamples).toEqual([75, 80, 85]);
    });

    it('应该忽略无效的准确率值', () => {
      practiceTracker.start('embroidery', 'suzhou_embroidery', '苏绣·平针基础');

      practiceTracker.recordAccuracy(-10);  // 无效
      practiceTracker.recordAccuracy(50);   // 有效
      practiceTracker.recordAccuracy(150);  // 无效
      practiceTracker.recordAccuracy(100);  // 有效

      expect(practiceTracker.accuracySamples).toEqual([50, 100]);
    });
  });

  describe('getAverageAccuracy()', () => {
    it('应该计算平均准确率', () => {
      practiceTracker.start('embroidery', 'suzhou_embroidery', '苏绣·平针基础');

      practiceTracker.recordAccuracy(70);
      practiceTracker.recordAccuracy(80);
      practiceTracker.recordAccuracy(90);

      expect(practiceTracker.getAverageAccuracy()).toBe(80);
    });

    it('应该在没有采样时返回 0', () => {
      expect(practiceTracker.getAverageAccuracy()).toBe(0);
    });
  });

  describe('end()', () => {
    it('应该返回练习统计数据', () => {
      practiceTracker.start('embroidery', 'suzhou_embroidery', '苏绣·平针基础');

      // 模拟时间流逝
      vi.advanceTimersByTime(5000); // 5 秒

      practiceTracker.recordAccuracy(80);
      practiceTracker.recordAccuracy(85);

      const stats = practiceTracker.end();

      expect(stats).toMatchObject({
        duration: 5,
        accuracy: 82.5,
        score: 82.5,
        scenario: 'embroidery',
        craftId: 'suzhou_embroidery',
        craftName: '苏绣·平针基础'
      });
    });

    it('应该在没有开始时返回 null', () => {
      const stats = practiceTracker.end();
      expect(stats).toBeNull();
    });
  });

  describe('pause() and resume()', () => {
    it('应该能够暂停和恢复练习', () => {
      practiceTracker.start('embroidery', 'suzhou_embroidery', '苏绣·平针基础');

      expect(practiceTracker.startTime).toBeInstanceOf(Date);
      expect(practiceTracker.endTime).toBeNull();

      practiceTracker.pause();
      expect(practiceTracker.endTime).toBeInstanceOf(Date);

      practiceTracker.resume();
      expect(practiceTracker.endTime).toBeNull();
      expect(practiceTracker.startTime).toBeInstanceOf(Date);
    });
  });

  describe('reset()', () => {
    it('应该重置所有追踪数据', () => {
      practiceTracker.start('embroidery', 'suzhou_embroidery', '苏绣·平针基础');
      practiceTracker.recordAccuracy(80);
      practiceTracker.pause();

      practiceTracker.reset();

      expect(practiceTracker.startTime).toBeNull();
      expect(practiceTracker.endTime).toBeNull();
      expect(practiceTracker.scenario).toBeNull();
      expect(practiceTracker.accuracySamples).toEqual([]);
    });
  });
});

describe('savePracticeRecord', () => {
  let savePracticeRecord;

  beforeEach(async () => {
    // 动态导入以获取最新 Mock
    const module = await import('../src/utils/practiceTracker');
    savePracticeRecord = module.savePracticeRecord;
  });

  it('应该成功保存练习记录', async () => {
    const mockResponse = { status: 'success', record_id: 123 };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await savePracticeRecord(1, {
      craftId: 'suzhou_embroidery',
      craftName: '苏绣·平针基础',
      duration: 300,
      score: 85.0,
      accuracy: 82.5,
      scenario: 'embroidery',
      feedback: '动作标准'
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalled();
  });

  it('应该处理请求失败的情况', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await savePracticeRecord(1, {
      craftId: 'suzhou_embroidery',
      craftName: '苏绣·平针基础',
      duration: 300,
      score: 85.0,
      accuracy: 82.5
    });

    // 现在会回退到本地存储，所以应该成功
    expect(result.success).toBe(true);
    expect(result.data.local).toBe(true);
  });
});

describe('getUserStats', () => {
  let getUserStats;

  beforeEach(async () => {
    const module = await import('../src/utils/practiceTracker');
    getUserStats = module.getUserStats;
  });

  it('应该获取用户统计数据', async () => {
    const mockStats = {
      total_practice_hours: 12.5,
      average_accuracy: 85.0,
      mastered_crafts: 3,
      total_works: 15,
      total_practice_sessions: 20
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats
    });

    const stats = await getUserStats(1);
    expect(stats).toEqual(mockStats);
  });

  it('应该在请求失败时返回本地存储数据', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const stats = await getUserStats(1);
    // 现在会回退到本地存储，而不是返回 null
    expect(stats).toBeDefined();
    expect(typeof stats.total_practice_hours).toBe('number');
  });
});

describe('getUserProfile', () => {
  let getUserProfile;

  beforeEach(async () => {
    const module = await import('../src/utils/practiceTracker');
    getUserProfile = module.getUserProfile;
  });

  it('应该获取用户完整档案', async () => {
    const mockProfile = {
      user: {
        id: 1,
        name: '李明',
        level: 'apprentice'
      },
      abilities: {
        stability: 60,
        accuracy: 75,
        speed: 55,
        creativity: 70,
        knowledge: 65
      },
      stats: {
        total_practice_hours: 12.5,
        average_accuracy: 85,
        mastered_crafts: 3,
        total_works: 15
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile
    });

    const profile = await getUserProfile(1);
    expect(profile).toEqual(mockProfile);
  });
});

describe('integration', () => {
  it('完整练习流程测试', async () => {
    vi.useFakeTimers();
    const tracker = new PracticeTracker(1);
    const module = await import('../src/utils/practiceTracker');
    const savePracticeRecord = module.savePracticeRecord;

    // Mock 保存成功
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success', record_id: 1 })
    });

    // 开始练习
    tracker.start('embroidery', 'suzhou_embroidery', '苏绣·平针基础');

    // 模拟练习过程
    vi.advanceTimersByTime(10000); // 10 秒

    // 模拟多次准确率采样
    tracker.recordAccuracy(75);
    tracker.recordAccuracy(80);
    tracker.recordAccuracy(85);
    tracker.recordAccuracy(82);
    tracker.recordAccuracy(78);

    // 结束练习
    const stats = tracker.end();
    expect(stats.duration).toBe(10);
    expect(stats.accuracy).toBe(80);

    // 保存记录
    const result = await savePracticeRecord(1, stats);
    expect(result.success).toBe(true);

    vi.useRealTimers();
  });
});
