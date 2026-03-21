"""
数据库种子数据脚本
添加测试用户数据和练习记录
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from app.db.mysql_db import SessionLocal, User, PracticeRecord, UserWork, UserAbility, UserLevel, engine, Base

def create_seed_data():
    """创建种子数据"""
    db = SessionLocal()

    try:
        print("=" * 50)
        print("开始添加种子数据...")
        print("=" * 50)

        # 1. 创建测试用户（如果不存在）
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            user = User(
                id=1,
                name="李明",
                avatar_url="/avatars/default.png",
                level=UserLevel.APPRENTICE,
                experience_points=0,
                title="初级学徒"
            )
            db.add(user)
            db.commit()
            print("[OK] 创建测试用户：李明 (ID=1)")
        else:
            print("[.] 用户已存在：李明")

        # 2. 创建用户能力数据（如果不存在）
        abilities = db.query(UserAbility).filter(UserAbility.user_id == 1).first()
        if not abilities:
            abilities = UserAbility(
                user_id=1,
                stability=50.0,
                accuracy=50.0,
                speed=50.0,
                creativity=50.0,
                knowledge=50.0
            )
            db.add(abilities)
            db.commit()
            print("[OK] 创建用户能力数据")
        else:
            print("[.] 用户能力数据已存在")

        # 3. 添加练习记录 - 苏绣 (更丰富的数据)
        su_embroidery_records = [
            {"duration": 180, "score": 72.5, "accuracy": 75.0, "feedback": "起针动作需要更轻柔"},
            {"duration": 240, "score": 78.3, "accuracy": 80.0, "feedback": "平针基础有进步"},
            {"duration": 300, "score": 82.1, "accuracy": 83.5, "feedback": "动作标准，继续保持"},
            {"duration": 270, "score": 85.6, "accuracy": 87.0, "feedback": "Excellent!"},
            {"duration": 320, "score": 88.2, "accuracy": 89.5, "feedback": "非常稳定的表现"},
            {"duration": 350, "score": 90.1, "accuracy": 91.0, "feedback": "针法细腻，值得表扬"},
            {"duration": 310, "score": 87.5, "accuracy": 88.0, "feedback": "收针动作完美"},
        ]

        # 删除旧的苏绣记录
        db.query(PracticeRecord).filter(
            PracticeRecord.user_id == 1,
            PracticeRecord.craft_id == "suzhou_embroidery"
        ).delete()
        db.commit()

        for i, record in enumerate(su_embroidery_records):
            pr = PracticeRecord(
                user_id=1,
                craft_id="suzhou_embroidery",
                craft_name="苏绣·平针基础",
                scenario="embroidery",
                duration=record["duration"],
                score=record["score"],
                accuracy=record["accuracy"],
                feedback=record["feedback"],
                completed_at=datetime.now() - timedelta(days=len(su_embroidery_records)-i-1, hours=random.randint(0, 23))
            )
            db.add(pr)
        db.commit()
        print(f"[OK] 添加 {len(su_embroidery_records)} 条苏绣练习记录")

        # 4. 添加练习记录 - 紫砂
        purple_clay_records = [
            {"duration": 200, "score": 68.0, "accuracy": 70.0, "feedback": "拍泥力度需均匀"},
            {"duration": 260, "score": 75.5, "accuracy": 76.0, "feedback": "手掌姿势正确"},
            {"duration": 290, "score": 80.2, "accuracy": 82.0, "feedback": "泥片厚度均匀"},
            {"duration": 310, "score": 83.5, "accuracy": 85.0, "feedback": "拍打节奏稳定"},
            {"duration": 340, "score": 86.0, "accuracy": 87.5, "feedback": "手法娴熟"},
        ]

        # 删除旧的紫砂记录
        db.query(PracticeRecord).filter(
            PracticeRecord.user_id == 1,
            PracticeRecord.craft_id == "purple_clay"
        ).delete()
        db.commit()

        for i, record in enumerate(purple_clay_records):
            pr = PracticeRecord(
                user_id=1,
                craft_id="purple_clay",
                craft_name="紫砂·拍泥片",
                scenario="clay",
                duration=record["duration"],
                score=record["score"],
                accuracy=record["accuracy"],
                feedback=record["feedback"],
                completed_at=datetime.now() - timedelta(days=len(purple_clay_records)-i-1, hours=random.randint(0, 23))
            )
            db.add(pr)
        db.commit()
        print(f"[OK] 添加 {len(purple_clay_records)} 条紫砂练习记录")

        # 5. 添加练习记录 - 剪纸
        paper_cutting_records = [
            {"duration": 150, "score": 65.0, "accuracy": 68.0, "feedback": "剪刀角度需调整"},
            {"duration": 180, "score": 72.0, "accuracy": 74.0, "feedback": "图案对称性良好"},
            {"duration": 200, "score": 78.0, "accuracy": 80.0, "feedback": "线条流畅"},
            {"duration": 220, "score": 82.0, "accuracy": 84.0, "feedback": "纹样精美"},
        ]

        # 删除旧的剪纸记录
        db.query(PracticeRecord).filter(
            PracticeRecord.user_id == 1,
            PracticeRecord.craft_id == "paper_cutting"
        ).delete()
        db.commit()

        for i, record in enumerate(paper_cutting_records):
            pr = PracticeRecord(
                user_id=1,
                craft_id="paper_cutting",
                craft_name="剪纸·基础纹样",
                scenario="paper_cutting",
                duration=record["duration"],
                score=record["score"],
                accuracy=record["accuracy"],
                feedback=record["feedback"],
                completed_at=datetime.now() - timedelta(days=len(paper_cutting_records)-i-1, hours=random.randint(0, 23))
            )
            db.add(pr)
        db.commit()
        print(f"[OK] 添加 {len(paper_cutting_records)} 条剪纸练习记录")

        # 6. 删除并添加用户作品
        db.query(UserWork).filter(UserWork.user_id == 1).delete()
        db.commit()

        works = [
            {
                "craft_id": "suzhou_embroidery",
                "craft_name": "苏绣·平针基础",
                "title": "荷花刺绣",
                "description": "学习平针技法完成的荷花图案，花瓣层次分明",
                "image_url": "/works/embroidery_001.jpg",
                "ai_generated": False
            },
            {
                "craft_id": "purple_clay",
                "craft_name": "紫砂·拍泥片",
                "title": "紫砂壶坯",
                "description": "第一次尝试制作紫砂壶，壶身圆润",
                "image_url": "/works/clay_001.jpg",
                "ai_generated": False
            },
            {
                "craft_id": "paper_cutting",
                "craft_name": "剪纸·基础纹样",
                "title": "福字窗花",
                "description": "传统福字图案，寓意吉祥如意",
                "image_url": "/works/paper_001.jpg",
                "ai_generated": False
            }
        ]

        for work in works:
            w = UserWork(
                user_id=1,
                craft_id=work["craft_id"],
                craft_name=work["craft_name"],
                title=work["title"],
                description=work["description"],
                image_url=work["image_url"],
                ai_generated=work["ai_generated"],
                status="completed"
            )
            db.add(w)
        db.commit()
        print(f"[OK] 添加 {len(works)} 件用户作品")

        # 7. 根据练习记录更新用户能力值
        all_records = db.query(PracticeRecord).filter(PracticeRecord.user_id == 1).all()
        if all_records and abilities:
            # 计算各项能力
            total_records = len(all_records)

            # 准确度 - 平均准确率
            avg_accuracy = sum(r.accuracy for r in all_records) / total_records

            # 稳定性 - 基于分数波动
            scores = [r.score for r in all_records]
            avg_score = sum(scores) / len(scores)
            variance = sum((s - avg_score) ** 2 for s in scores) / len(scores)
            stability = max(0, min(100, 100 - variance / 10))

            # 速度 - 基于时长
            total_duration = sum(r.duration for r in all_records)
            avg_duration = total_duration / total_records
            speed = min(100, (1800 / avg_duration) * 80) if avg_duration > 0 else 50

            # 创意 - 基于不同技法数量
            unique_crafts = len(set(r.craft_id for r in all_records))
            creativity = min(100, unique_crafts * 20 + total_records * 2)

            # 知识 - 基于总时长
            knowledge = min(100, (total_duration / 3600) * 20)

            # 更新能力值
            abilities.stability = round(stability, 1)
            abilities.accuracy = round(avg_accuracy, 1)
            abilities.speed = round(speed, 1)
            abilities.creativity = round(creativity, 1)
            abilities.knowledge = round(knowledge, 1)

            # 更新用户经验
            total_exp = int(sum(r.score * (r.duration / 600) for r in all_records))
            user.experience_points = total_exp

            # 根据经验更新等级
            if total_exp >= 5000:
                user.level = UserLevel.GRANDMASTER
                user.title = "非遗宗师"
            elif total_exp >= 2000:
                user.level = UserLevel.MASTER
                user.title = "工艺大师"
            elif total_exp >= 800:
                user.level = UserLevel.ADVANCED
                user.title = "高级学徒"
            elif total_exp >= 200:
                user.level = UserLevel.APPRENTICE
                user.title = "初级学徒"
            else:
                user.level = UserLevel.BEGINNER
                user.title = "初学者"

            db.commit()
            print("[OK] 更新用户能力值")
            print(f"  - 稳定性：{abilities.stability}")
            print(f"  - 准确度：{abilities.accuracy}")
            print(f"  - 速度：{abilities.speed}")
            print(f"  - 创意：{abilities.creativity}")
            print(f"  - 知识：{abilities.knowledge}")
            print(f"  - 经验值：{user.experience_points}")
            print(f"  - 等级：{user.level.value} ({user.title})")

        # 8. 打印统计数据
        print("\n" + "=" * 50)
        print("种子数据统计")
        print("=" * 50)
        print(f"  - 总练习次数：{total_records}")
        print(f"  - 总练习时长：{total_duration}秒 ({total_duration/60:.1f}分钟)")
        print(f"  - 平均准确率：{avg_accuracy:.1f}%")
        print(f"  - 掌握技法数：{unique_crafts}")
        print(f"  - 作品数量：{len(works)}")

        print("\n" + "=" * 50)
        print("种子数据添加完成！")
        print("=" * 50)

    except Exception as e:
        db.rollback()
        print(f"错误：{e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_seed_data()
