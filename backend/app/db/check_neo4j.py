#!/usr/bin/env python3
"""
查询 Neo4j 数据库验证数据
"""
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "../../"))

from app.services.neo4j_service import neo4j_service


def check_all_data():
    """查询并显示所有数据"""
    print("=" * 50)
    print("Neo4j 数据库内容查询")
    print("=" * 50)

    try:
        # 查询所有 Heritage 节点
        print("\n[非遗项目 Heritage]")
        result = neo4j_service.query("""
            MATCH (h:Heritage)
            RETURN h.name as name, h.type as type, h.category as category
        """)
        for record in result:
            print(f"  - {record['name']} ({record['type']}) [{record['category']}]")

        # 查询所有 Technique 节点
        print("\n[技法 Technique]")
        result = neo4j_service.query("""
            MATCH (t:Technique)
            RETURN t.name as name
        """)
        for record in result:
            print(f"  - {record['name']}")

        # 查询所有 Person 节点
        print("\n[传承人 Person]")
        result = neo4j_service.query("""
            MATCH (p:Person)
            RETURN p.name as name
        """)
        for record in result:
            print(f"  - {record['name']}")

        # 查询所有 Region 节点
        print("\n[地区 Region]")
        result = neo4j_service.query("""
            MATCH (r:Region)
            RETURN r.name as name, r.province as province
        """)
        for record in result:
            print(f"  - {record['name']} ({record['province']})")

        # 统计
        print("\n[统计]")
        result = neo4j_service.query("""
            MATCH (n)
            RETURN labels(n)[0] as label, count(n) as count
            ORDER BY count DESC
        """)
        for record in result:
            print(f"  {record['label']}: {record['count']} 个")

        # 关系统计
        print("\n[关系统计]")
        result = neo4j_service.query("""
            MATCH ()-[r]->()
            RETURN type(r) as type, count(r) as count
            ORDER BY count DESC
        """)
        for record in result:
            print(f"  {record['type']}: {record['count']} 条")

    except Exception as e:
        print(f"[ERROR] 查询失败: {e}")
    finally:
        neo4j_service.close()

    print("\n" + "=" * 50)


if __name__ == "__main__":
    check_all_data()
