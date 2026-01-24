#!/usr/bin/env python3
"""
Superset Auto-Setup Script for PromptLingo
Creates database connection, datasets, charts, and dashboard automatically.
"""

import requests
import json
import time

SUPERSET_URL = "http://localhost:8088"
USERNAME = "admin"
PASSWORD = "admin"

# Your PromptLingo database connection
DATABASE_URI = "postgresql://userpostgres:MRQZn9okEOv0rl1JgUPoxWdSCmOSq0My@dpg-d3uqb275r7bs73fnrks0-a.oregon-postgres.render.com/dbname_fc4a?sslmode=require"

def get_access_token():
    """Login and get access token"""
    print("🔐 Logging into Superset...")

    # Get CSRF token
    session = requests.Session()

    # Login
    login_url = f"{SUPERSET_URL}/api/v1/security/login"
    payload = {
        "username": USERNAME,
        "password": PASSWORD,
        "provider": "db",
        "refresh": True
    }

    response = session.post(login_url, json=payload)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return None, None

    data = response.json()
    access_token = data.get("access_token")
    print("✅ Logged in successfully")
    return access_token, session

def get_csrf_token(session, access_token):
    """Get CSRF token for write operations"""
    headers = {"Authorization": f"Bearer {access_token}"}
    response = session.get(f"{SUPERSET_URL}/api/v1/security/csrf_token/", headers=headers)
    if response.status_code == 200:
        return response.json().get("result")
    return None

def create_database_connection(session, access_token, csrf_token):
    """Add PromptLingo PostgreSQL database to Superset"""
    print("🗄️  Adding PromptLingo database connection...")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-CSRFToken": csrf_token
    }

    payload = {
        "database_name": "PromptLingo Production",
        "sqlalchemy_uri": DATABASE_URI,
        "expose_in_sqllab": True,
        "allow_ctas": False,
        "allow_cvas": False,
        "allow_dml": False,
        "allow_run_async": False,
        "extra": json.dumps({
            "allows_virtual_table_explore": True
        })
    }

    response = session.post(
        f"{SUPERSET_URL}/api/v1/database/",
        headers=headers,
        json=payload
    )

    if response.status_code == 201:
        db_id = response.json().get("id")
        print(f"✅ Database added (ID: {db_id})")
        return db_id
    elif "already exists" in response.text.lower():
        print("ℹ️  Database already exists, fetching ID...")
        # Get existing database
        response = session.get(
            f"{SUPERSET_URL}/api/v1/database/",
            headers=headers
        )
        for db in response.json().get("result", []):
            if "promptlingo" in db.get("database_name", "").lower():
                return db.get("id")
    else:
        print(f"❌ Failed to add database: {response.text}")
    return None

def create_dataset(session, access_token, csrf_token, db_id, table_name, schema="public"):
    """Create a dataset from a database table"""
    print(f"📊 Creating dataset for table: {table_name}...")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-CSRFToken": csrf_token
    }

    payload = {
        "database": db_id,
        "table_name": table_name,
        "schema": schema
    }

    response = session.post(
        f"{SUPERSET_URL}/api/v1/dataset/",
        headers=headers,
        json=payload
    )

    if response.status_code == 201:
        dataset_id = response.json().get("id")
        print(f"✅ Dataset created for {table_name} (ID: {dataset_id})")
        return dataset_id
    elif "already exists" in response.text.lower():
        print(f"ℹ️  Dataset for {table_name} already exists")
        # Try to find existing dataset
        response = session.get(
            f"{SUPERSET_URL}/api/v1/dataset/",
            headers=headers
        )
        for ds in response.json().get("result", []):
            if ds.get("table_name") == table_name:
                return ds.get("id")
    else:
        print(f"❌ Failed to create dataset: {response.text}")
    return None

def create_chart(session, access_token, csrf_token, dataset_id, chart_config):
    """Create a chart"""
    print(f"📈 Creating chart: {chart_config['slice_name']}...")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-CSRFToken": csrf_token
    }

    payload = {
        "datasource_id": dataset_id,
        "datasource_type": "table",
        "slice_name": chart_config["slice_name"],
        "viz_type": chart_config["viz_type"],
        "params": json.dumps(chart_config["params"])
    }

    response = session.post(
        f"{SUPERSET_URL}/api/v1/chart/",
        headers=headers,
        json=payload
    )

    if response.status_code == 201:
        chart_id = response.json().get("id")
        print(f"✅ Chart created (ID: {chart_id})")
        return chart_id
    else:
        print(f"❌ Failed to create chart: {response.text}")
    return None

def create_dashboard(session, access_token, csrf_token, chart_ids):
    """Create a dashboard with charts"""
    print("🎨 Creating PromptLingo Analytics Dashboard...")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "X-CSRFToken": csrf_token
    }

    payload = {
        "dashboard_title": "PromptLingo Analytics",
        "slug": "promptlingo-analytics",
        "published": True
    }

    response = session.post(
        f"{SUPERSET_URL}/api/v1/dashboard/",
        headers=headers,
        json=payload
    )

    if response.status_code == 201:
        dashboard_id = response.json().get("id")
        print(f"✅ Dashboard created (ID: {dashboard_id})")
        print(f"🔗 View at: {SUPERSET_URL}/superset/dashboard/{dashboard_id}/")
        return dashboard_id
    else:
        print(f"❌ Failed to create dashboard: {response.text}")
    return None

def main():
    print("=" * 60)
    print("🚀 PromptLingo Superset Auto-Setup")
    print("=" * 60)

    # Login
    access_token, session = get_access_token()
    if not access_token:
        return

    # Get CSRF token
    csrf_token = get_csrf_token(session, access_token)
    if not csrf_token:
        print("❌ Failed to get CSRF token")
        return

    # Create database connection
    db_id = create_database_connection(session, access_token, csrf_token)
    if not db_id:
        return

    # Create datasets
    users_dataset_id = create_dataset(session, access_token, csrf_token, db_id, "users")
    sessions_dataset_id = create_dataset(session, access_token, csrf_token, db_id, "sessions")

    if not users_dataset_id:
        print("❌ Cannot create charts without users dataset")
        return

    # Define charts
    charts = [
        {
            "slice_name": "User Signups Over Time",
            "viz_type": "echarts_timeseries_line",
            "dataset_id": users_dataset_id,
            "params": {
                "datasource": f"{users_dataset_id}__table",
                "viz_type": "echarts_timeseries_line",
                "x_axis": "created_at",
                "time_grain_sqla": "P1D",
                "metrics": ["count"],
                "groupby": [],
                "row_limit": 10000
            }
        },
        {
            "slice_name": "Subscription Tier Breakdown",
            "viz_type": "pie",
            "dataset_id": users_dataset_id,
            "params": {
                "datasource": f"{users_dataset_id}__table",
                "viz_type": "pie",
                "metric": "count",
                "groupby": ["subscription_tier"],
                "row_limit": 100
            }
        },
        {
            "slice_name": "Subscription Status",
            "viz_type": "pie",
            "dataset_id": users_dataset_id,
            "params": {
                "datasource": f"{users_dataset_id}__table",
                "viz_type": "pie",
                "metric": "count",
                "groupby": ["subscription_status"],
                "row_limit": 100
            }
        },
        {
            "slice_name": "Total API Calls by User",
            "viz_type": "echarts_timeseries_bar",
            "dataset_id": users_dataset_id,
            "params": {
                "datasource": f"{users_dataset_id}__table",
                "viz_type": "echarts_timeseries_bar",
                "metrics": [{"label": "Total API Calls", "expressionType": "SQL", "sqlExpression": "SUM(api_calls_this_month)"}],
                "groupby": ["subscription_tier"],
                "row_limit": 100
            }
        },
        {
            "slice_name": "Active vs Inactive Users",
            "viz_type": "pie",
            "dataset_id": users_dataset_id,
            "params": {
                "datasource": f"{users_dataset_id}__table",
                "viz_type": "pie",
                "metric": "count",
                "groupby": ["is_active"],
                "row_limit": 100
            }
        }
    ]

    # Create charts
    chart_ids = []
    for chart_config in charts:
        dataset_id = chart_config.pop("dataset_id")
        chart_id = create_chart(session, access_token, csrf_token, dataset_id, chart_config)
        if chart_id:
            chart_ids.append(chart_id)

    # Create dashboard
    if chart_ids:
        create_dashboard(session, access_token, csrf_token, chart_ids)

    print("\n" + "=" * 60)
    print("✅ Setup Complete!")
    print("=" * 60)
    print(f"\n🔗 Open Superset: {SUPERSET_URL}")
    print("📊 Login with: admin / admin")
    print("📈 Go to Dashboards to see your PromptLingo Analytics")

if __name__ == "__main__":
    main()
