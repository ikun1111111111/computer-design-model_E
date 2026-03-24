import sys
import os
import json

sys.path.append(os.path.join(os.path.dirname(__file__), "../../"))

from app.services.neo4j_service import neo4j_service


def load_json_data():
    json_path = os.path.join(os.path.dirname(__file__), "../../../紫砂.json")
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


def import_zisha():
    print("Starting zisha data import...")

    data = load_json_data()
    basic = data.get("基本信息", {})
    name = basic.get("名称", "紫砂")
    world_heritage = basic.get("世界非遗", {})
    world_flag = "是" if world_heritage.get("入选") else "否"

    main_query = """
    MERGE (heritage:Heritage {name: $name, type: "Craft"})
    SET heritage.aliases = $aliases,
        heritage.非遗级别 = $level,
        heritage.入选时间 = $time,
        heritage.非遗编号 = $number,
        heritage.类别 = $category,
        heritage.世界非遗 = $world_heritage
    RETURN heritage
    """
    neo4j_service.query(main_query, {
        "name": name,
        "aliases": basic.get("别名", []),
        "level": basic.get("非遗级别"),
        "time": basic.get("入选时间"),
        "number": basic.get("非遗编号"),
        "category": basic.get("类别"),
        "world_heritage": world_flag
    })

    history = data.get("历史起源")
    if history:
        history_query = """
        MATCH (heritage:Heritage {name: $name})
        MERGE (history:History {name: $history_name})
        SET history.起源时间 = $origin_time,
            history.起源地点 = $origin_place,
            history.发源地 = $origin_source
        CREATE (heritage)-[:HAS_HISTORY]->(history)
        RETURN history
        """
        neo4j_service.query(history_query, {
            "name": name,
            "history_name": f"{name}历史",
            "origin_time": history.get("起源时间"),
            "origin_place": history.get("起源地点"),
            "origin_source": history.get("发源地")
        })

        for period in history.get("发展历程", []):
            period_query = """
            MATCH (history:History {name: $history_name})
            MERGE (p:Period {name: $period_name})
            SET p.朝代 = $dynasty,
                p.时期 = $period,
                p.描述 = $description
            CREATE (history)-[:HAS_PERIOD]->(p)
            RETURN p
            """
            neo4j_service.query(period_query, {
                "history_name": f"{name}历史",
                "period_name": f"{period.get('朝代')}-{period.get('时期')}",
                "dynasty": period.get("朝代"),
                "period": period.get("时期"),
                "description": period.get("描述")
            })

    for school in data.get("流派分类", {}).get("主要流派", []):
        school_query = """
        MATCH (heritage:Heritage {name: $name})
        MERGE (s:School {name: $school_name})
        SET s.代表地区 = $regions,
            s.特点 = $features,
            s.代表剧目 = $works
        CREATE (heritage)-[:HAS_SCHOOL]->(s)
        RETURN s
        """
        neo4j_service.query(school_query, {
            "name": name,
            "school_name": school.get("名称"),
            "regions": school.get("代表地区", []),
            "features": school.get("特点"),
            "works": school.get("代表剧目", [])
        })

    craft = data.get("制作工艺", {})
    if craft:
        features = craft.get("造型特点", {})
        features_str = "\n".join([f"{k}: {v}" for k, v in features.items()]) if isinstance(features, dict) else ""
        craft_query = """
        MATCH (heritage:Heritage {name: $name})
        MERGE (craft:Craft {name: $craft_name})
        SET craft.造型特点 = $features
        CREATE (heritage)-[:HAS_CRAFT]->(craft)
        RETURN craft
        """
        neo4j_service.query(craft_query, {
            "name": name,
            "craft_name": f"{name}制作工艺",
            "features": features_str
        })

        for step in craft.get("制作流程", []):
            step_query = """
            MATCH (craft:Craft {name: $craft_name})
            MERGE (s:Step {name: $step_name})
            SET s.步骤序号 = $step_num,
                s.说明 = $description,
                s.要点 = $points
            CREATE (craft)-[:HAS_STEP]->(s)
            RETURN s
            """
            neo4j_service.query(step_query, {
                "craft_name": f"{name}制作工艺",
                "step_name": step.get("名称"),
                "step_num": step.get("步骤"),
                "description": step.get("说明"),
                "points": step.get("要点", [])
            })

    display = data.get("展示应用", {})
    if display:
        perf_query = """
        MATCH (heritage:Heritage {name: $name})
        MERGE (perf:Performance {name: $perf_name})
        CREATE (heritage)-[:HAS_PERFORMANCE]->(perf)
        RETURN perf
        """
        neo4j_service.query(perf_query, {
            "name": name,
            "perf_name": f"{name}展示应用"
        })

        for item in display.get("展示方式", []):
            tech_query = """
            MATCH (perf:Performance {name: $perf_name})
            MERGE (t:Technique {name: $tech_name})
            SET t.说明 = $description
            CREATE (perf)-[:HAS_TECHNIQUE]->(t)
            RETURN t
            """
            neo4j_service.query(tech_query, {
                "perf_name": f"{name}展示应用",
                "tech_name": item.get("名称"),
                "description": item.get("说明")
            })

        for category, items in display.get("应用场合", {}).items():
            for entry in items:
                tech_query = """
                MATCH (perf:Performance {name: $perf_name})
                MERGE (t:Technique {name: $tech_name})
                SET t.说明 = $description
                CREATE (perf)-[:HAS_TECHNIQUE]->(t)
                RETURN t
                """
                neo4j_service.query(tech_query, {
                    "perf_name": f"{name}展示应用",
                    "tech_name": f"{category}-{entry}",
                    "description": category
                })

    for inheritor in data.get("代表传承人", []):
        inheritor_query = """
        MATCH (heritage:Heritage {name: $name})
        MERGE (p:Person {name: $person_name})
        SET p.流派 = $school,
            p.级别 = $level,
            p.简介 = $intro,
            p.type = "传承人"
        CREATE (heritage)-[:HAS_INHERITOR]->(p)
        RETURN p
        """
        neo4j_service.query(inheritor_query, {
            "name": name,
            "person_name": inheritor.get("姓名"),
            "school": inheritor.get("流派"),
            "level": inheritor.get("级别"),
            "intro": inheritor.get("简介")
        })

    works = data.get("经典作品", [])
    if not works:
        works = data.get("经典剧目", [])
    for work in works:
        work_query = """
        MATCH (heritage:Heritage {name: $name})
        MERGE (d:Drama {name: $work_name})
        SET d.类型 = $type,
            d.流派 = $school,
            d.简介 = $intro
        CREATE (heritage)-[:HAS_DRAMA]->(d)
        RETURN d
        """
        neo4j_service.query(work_query, {
            "name": name,
            "work_name": work.get("作品名") or work.get("剧名"),
            "type": work.get("类型"),
            "school": work.get("流派"),
            "intro": work.get("简介")
        })

    print("[OK] Zisha data imported successfully!")


if __name__ == "__main__":
    try:
        import_zisha()
    finally:
        neo4j_service.close()
