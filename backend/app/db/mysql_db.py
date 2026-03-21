from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Float, Enum, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from app.core.config import settings
import enum

# Database URL
DATABASE_URL = f"mysql+mysqlconnector://{settings.MYSQL_USER}:{settings.MYSQL_PASSWORD}@{settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DATABASE}"

# Create engine
engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# ============== 枚举类型 ==============

class UserLevel(enum.Enum):
    """用户等级"""
    BEGINNER = "beginner"  # 初学者
    APPRENTICE = "apprentice"  # 初级学徒
    ADVANCED = "advanced"  # 高级学徒
    MASTER = "master"  # 工艺大师
    GRANDMASTER = "grandmaster"  # 非遗宗师


# ============== 用户档案相关模型 ==============

class User(Base):
    """用户表"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, default="李明")
    avatar_url = Column(String(255), default="/avatars/default.png")
    level = Column(Enum(UserLevel), default=UserLevel.APPRENTICE)
    experience_points = Column(Integer, default=0)
    title = Column(String(50), default="初级学徒")
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关联
    practice_records = relationship("PracticeRecord", back_populates="user", cascade="all, delete-orphan")
    works = relationship("UserWork", back_populates="user", cascade="all, delete-orphan")
    abilities = relationship("UserAbility", back_populates="user", uselist=False, cascade="all, delete-orphan")


class PracticeRecord(Base):
    """练习记录表"""
    __tablename__ = "practice_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    craft_id = Column(String(50), nullable=False)  # 工艺 ID
    craft_name = Column(String(100), nullable=False)  # 工艺名称
    scenario = Column(String(50), nullable=True)  # 场景 (embroidery/clay)
    duration = Column(Integer, nullable=False)  # 练习时长 (秒)
    score = Column(Float, nullable=False)  # 得分 (0-100)
    accuracy = Column(Float, nullable=False)  # 准确率 (0-100)
    feedback = Column(Text, nullable=True)  # 反馈信息
    completed_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 反向关联
    user = relationship("User", back_populates="practice_records")


class UserWork(Base):
    """用户作品表"""
    __tablename__ = "user_works"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    craft_id = Column(String(50), nullable=False)
    craft_name = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=False)
    ai_generated = Column(Boolean, default=False)
    prompt_used = Column(Text, nullable=True)
    style = Column(String(100), nullable=True)
    status = Column(String(20), default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)

    # 反向关联
    user = relationship("User", back_populates="works")


class UserAbility(Base):
    """用户能力表"""
    __tablename__ = "user_abilities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    stability = Column(Float, default=50.0)  # 稳定性 (0-100)
    accuracy = Column(Float, default=50.0)  # 准确度 (0-100)
    speed = Column(Float, default=50.0)  # 速度 (0-100)
    creativity = Column(Float, default=50.0)  # 创造力 (0-100)
    knowledge = Column(Float, default=50.0)  # 知识 (0-100)

    # 反向关联
    user = relationship("User", back_populates="abilities")


# ============== 对话相关模型 ==============

class Conversation(Base):
    """对话表 - 存储用户与知识馆长的对话历史"""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True, nullable=False)  # 会话 ID，用于区分不同用户/会话
    user_query = Column(Text, nullable=False)  # 用户问题
    agent_answer = Column(Text, nullable=False)  # AI 回答
    context_entities = Column(Text, default="")  # 上下文实体，逗号分隔
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关联的追问选项
    follow_ups = relationship("FollowUpQuestion", back_populates="conversation", cascade="all, delete-orphan")


class FollowUpQuestion(Base):
    """追问建议表 - 存储为用户生成的追问选项"""
    __tablename__ = "follow_up_questions"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    question_text = Column(Text, nullable=False)  # 追问文本
    sort_order = Column(Integer, default=0)  # 排序顺序

    # 反向关联
    conversation = relationship("Conversation", back_populates="follow_ups")


def init_db():
    """初始化数据库，创建所有表"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
