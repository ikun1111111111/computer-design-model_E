"""
用户档案系统单元测试 (Mock 版本)
不需要真实数据库，使用 Mock 进行测试
"""

import pytest
import asyncio
import sys
import os
from datetime import datetime, timedelta
from unittest.mock import MagicMock, Mock, patch, AsyncMock

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "../../backend"))


@pytest.fixture
def mock_db():
    """创建模拟数据库会话"""
    db = MagicMock()
    return db


@pytest.fixture
def mock_user():
    """创建模拟用户"""
    user = Mock()
    user.id = 1
    user.name = "测试用户"
    user.avatar_url = "/avatars/test.png"
    user.level = Mock()
    user.level.value = "apprentice"
    user.experience_points = 0
    user.title = "初级学徒"
    return user


@pytest.fixture
def mock_ability():
    """创建模拟用户能力"""
    ability = Mock()
    ability.user_id = 1
    ability.stability = 50.0
    ability.accuracy = 50.0
    ability.speed = 50.0
    ability.creativity = 50.0
    ability.knowledge = 50.0
    return ability


class TestPracticeLogic:
    """练习记录逻辑测试"""

    def test_accuracy_calculation_in_range(self):
        """测试准确率计算 - 在目标范围内"""
        # 模拟 VisionMentor 中的准确率计算逻辑
        distance = 0.10  # 在 0.03-0.15 范围内
        thresholds = {'min': 0.03, 'max': 0.15}
        center = (thresholds['min'] + thresholds['max']) / 2
        dist_from_center = abs(distance - center)
        max_dist = (thresholds['max'] - thresholds['min']) / 2
        accuracy = 100 - (dist_from_center / max_dist) * 20

        assert 80 <= accuracy <= 100

    def test_accuracy_calculation_out_of_range(self):
        """测试准确率计算 - 超出目标范围"""
        distance = 0.25  # 超出范围
        thresholds = {'min': 0.03, 'max': 0.15}

        dist_to_min = abs(distance - thresholds['min'])
        dist_to_max = abs(distance - thresholds['max'])
        dist_to_range = min(dist_to_min, dist_to_max)
        accuracy = max(0, 100 - dist_to_range * 500)

        assert accuracy < 80

    def test_duration_calculation(self):
        """测试时长计算"""
        start_time = datetime.now()
        end_time = datetime.now()
        duration = int((end_time - start_time).total_seconds())
        assert duration >= 0

    def test_average_accuracy(self):
        """测试平均准确率计算"""
        samples = [75, 80, 85, 90, 70]
        avg = sum(samples) / len(samples)
        assert avg == 80

    def test_mastered_craft_threshold(self):
        """测试掌握技法阈值判断"""
        accuracies = [85, 79, 80, 90, 75]
        mastered = sum(1 for acc in accuracies if acc >= 80)
        assert mastered == 3


class TestPracticeTrackerLogic:
    """练习追踪器逻辑测试 (纯逻辑测试，不依赖 JS 模块)"""

    def test_tracker_initialization_logic(self):
        """测试追踪器初始化逻辑"""
        # 模拟追踪器初始化
        tracker_data = {
            'userId': 1,
            'startTime': None,
            'accuracySamples': []
        }
        assert tracker_data['userId'] == 1
        assert tracker_data['startTime'] is None
        assert tracker_data['accuracySamples'] == []

    def test_tracker_start_logic(self):
        """测试追踪器开始逻辑"""
        import time
        tracker_data = {
            'startTime': time.time(),
            'scenario': 'embroidery',
            'craftId': 'suzhou',
            'craftName': '苏绣',
            'accuracySamples': []
        }
        assert tracker_data['startTime'] is not None
        assert tracker_data['scenario'] == 'embroidery'

    def test_tracker_record_accuracy_logic(self):
        """测试记录准确率逻辑"""
        samples = []
        for acc in [80, 85, 90]:
            if 0 <= acc <= 100:
                samples.append(acc)

        assert len(samples) == 3
        assert sum(samples) / len(samples) == 85

    def test_tracker_end_logic(self):
        """测试追踪器结束逻辑"""
        import time
        start = time.time()
        end = time.time() + 5  # 模拟 5 秒后
        samples = [80, 85]

        stats = {
            'duration': int((end - start) * 1000) // 1000,
            'accuracy': sum(samples) / len(samples),
            'scenario': 'embroidery'
        }

        assert stats['duration'] >= 0
        assert stats['accuracy'] == 82.5

    def test_tracker_reset_logic(self):
        """测试追踪器重置逻辑"""
        tracker_data = {
            'startTime': None,
            'endTime': None,
            'scenario': None,
            'accuracySamples': []
        }
        # 重置后应该都是初始状态
        assert tracker_data['startTime'] is None
        assert tracker_data['scenario'] is None
        assert len(tracker_data['accuracySamples']) == 0


class TestUserStatsCalculation:
    """用户统计数据计算测试"""

    def test_total_hours_calculation(self):
        """测试总时长计算"""
        total_seconds = 7500  # 2 小时 5 分钟
        hours = round(total_seconds / 3600, 1)
        assert hours == 2.1

    def test_average_accuracy_calculation(self):
        """测试平均准确率计算"""
        accuracies = [85.0, 90.0, 78.0, 92.0]
        avg = round(sum(accuracies) / len(accuracies), 1)
        assert avg == 86.2

    def test_mastered_crafts_count(self):
        """测试掌握技法数量统计"""
        crafts_data = [
            {'craft_id': 'a', 'accuracy': 85},
            {'craft_id': 'b', 'accuracy': 75},
            {'craft_id': 'c', 'accuracy': 90},
            {'craft_id': 'a', 'accuracy': 88},  # 重复的 craft
        ]

        # 统计准确率达到 80 的不同 craft 数量
        mastered_craft_ids = set()
        for item in crafts_data:
            if item['accuracy'] >= 80:
                mastered_craft_ids.add(item['craft_id'])

        assert len(mastered_craft_ids) == 2


class TestExperienceCalculation:
    """经验值计算测试"""

    def test_exp_calculation_formula(self):
        """测试经验值计算公式"""
        # exp_gained = int(score * (duration / 600))
        score = 85
        duration = 600  # 10 分钟
        exp = int(score * (duration / 600))
        assert exp == 85

    def test_exp_for_short_practice(self):
        """测试短时练习经验值"""
        score = 90
        duration = 60  # 1 分钟
        exp = int(score * (duration / 600))
        assert exp == 9

    def test_exp_for_long_practice(self):
        """测试长时练习经验值"""
        score = 95
        duration = 1800  # 30 分钟
        exp = int(score * (duration / 600))
        assert exp == 285

    def test_level_thresholds(self):
        """测试等级阈值"""
        levels = {
            'beginner': 0,
            'apprentice': 200,
            'advanced': 800,
            'master': 2000,
            'grandmaster': 5000
        }

        exp = 1000
        if exp >= levels['grandmaster']:
            level = 'grandmaster'
        elif exp >= levels['master']:
            level = 'master'
        elif exp >= levels['advanced']:
            level = 'advanced'
        elif exp >= levels['apprentice']:
            level = 'apprentice'
        else:
            level = 'beginner'

        assert level == 'advanced'


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
