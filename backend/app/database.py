import os
import re
import sqlite3
from typing import List, Dict, Any, Optional
from app.services.data_connectors import ingest_csv_to_sqlite, ingest_excel_to_sqlite

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Default active database
_active_database: str = "ledgr.db"

class DatabaseManager:
    def __init__(self, data_dir: str = DATA_DIR):
        self.data_dir = data_dir
        self.active_db = _active_database

    @property
    def active_db_name(self) -> str:
        return self.get_active_db_name()

    @property
    def active_database(self) -> str:
        return self.get_active_db_name()

    def get_active_db_name(self) -> str:
        global _active_database
        return _active_database

    def get_connection(self, db_name: Optional[str] = None, read_only: bool = False, **kwargs) -> sqlite3.Connection:
        return get_db_connection(db_name)

    def set_active_database(self, db_name: str) -> bool:
        return set_active_database(db_name)

    def list_databases(self) -> List[Dict[str, Any]]:
        return list_available_databases()

    def get_schema_summary(self, db_name: Optional[str] = None) -> Dict[str, Any]:
        return inspect_database_schema(db_name)

    def execute_query(self, sql: str, params: Optional[tuple] = None, db_name: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self.get_connection(db_name)
        cursor = conn.cursor()
        if params:
            cursor.execute(sql, params)
        else:
            cursor.execute(sql)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = cursor.fetchall()
        result = [dict(zip(columns, row)) for row in rows]
        conn.close()
        return result

    def execute_read_sql(self, sql: str, params: Optional[tuple] = None, db_name: Optional[str] = None, max_rows: int = 200) -> Dict[str, Any]:
        conn = self.get_connection(db_name)
        cursor = conn.cursor()
        if params:
            cursor.execute(sql, params)
        else:
            cursor.execute(sql)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = cursor.fetchall()
        
        is_aggregate = any(agg in sql.upper() for agg in ["COUNT(", "SUM(", "AVG(", "MIN(", "MAX("])
        if not is_aggregate and len(rows) > max_rows:
            limited_rows = rows[:max_rows]
            truncated = True
        else:
            limited_rows = rows
            truncated = False

        result = [dict(zip(columns, row)) for row in limited_rows]
        conn.close()
        return {"rows": result, "columns": columns, "row_count": len(result), "total_matched": len(rows), "truncated": truncated}

db_manager = DatabaseManager()

def get_data_dir() -> str:
    return DATA_DIR

def sanitize_filename(filename: str) -> str:
    """Sanitizes filename to prevent directory traversal and invalid characters."""
    base = os.path.basename(filename)
    clean = re.sub(r"[^\w\.\-\_]", "_", base)
    return clean or "uploaded_database.db"

def set_active_database(db_name: str) -> bool:
    """Safely switches the active database, preventing path traversal."""
    global _active_database
    clean_name = sanitize_filename(db_name)
    db_path = os.path.join(DATA_DIR, clean_name)
    
    # Must exist strictly inside DATA_DIR
    if os.path.exists(db_path) and os.path.isfile(db_path):
        _active_database = clean_name
        db_manager.active_db = clean_name
        return True
    return False

def get_active_database_name() -> str:
    global _active_database
    return _active_database

def get_db_connection(db_name: Optional[str] = None) -> sqlite3.Connection:
    global _active_database
    target_name = sanitize_filename(db_name) if db_name else _active_database
    db_path = os.path.join(DATA_DIR, target_name)
    
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Database '{target_name}' was not found in data directory.")
        
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def list_available_databases() -> List[Dict[str, Any]]:
    global _active_database
    dbs = []
    if os.path.exists(DATA_DIR):
        for f in os.listdir(DATA_DIR):
            if f.endswith((".db", ".sqlite", ".sqlite3")):
                path = os.path.join(DATA_DIR, f)
                if os.path.isfile(path):
                    size_kb = round(os.path.getsize(path) / 1024, 2)
                    dbs.append({
                        "name": f,
                        "size_kb": size_kb,
                        "is_active": (f == _active_database),
                        "path": path
                    })
    return dbs

def save_uploaded_database(filename: str, file_bytes: bytes) -> Dict[str, Any]:
    """
    Safely stores and validates an uploaded database (SQLite, CSV, Excel).
    Automatically inspects schema, counts rows, selects the database, and returns metadata.
    """
    global _active_database
    if not file_bytes:
        return {"success": False, "message": "Uploaded file is empty."}

    clean_name = sanitize_filename(filename)
    name_lower = clean_name.lower()

    if name_lower.endswith(".csv"):
        target_name = os.path.splitext(clean_name)[0] + ".db"
        target_path = os.path.join(DATA_DIR, target_name)
        try:
            result = ingest_csv_to_sqlite(file_bytes, clean_name, target_path)
            _active_database = target_name
            db_manager.active_db = target_name
            schema = inspect_database_schema(target_name)
            return {
                "success": True,
                "filename": target_name,
                "table_name": result.get("table_name", "data"),
                "row_count": result.get("row_count", 0),
                "tables_count": schema.get("total_tables", 1),
                "total_rows": schema.get("total_rows", 0),
                "schema": schema,
                "message": f"CSV successfully ingested into '{target_name}' ({schema.get('total_rows', 0)} rows) and activated."
            }
        except Exception as e:
            return {"success": False, "message": f"Failed to ingest CSV: {str(e)}"}

    elif name_lower.endswith((".xlsx", ".xls")):
        target_name = os.path.splitext(clean_name)[0] + ".db"
        target_path = os.path.join(DATA_DIR, target_name)
        try:
            result = ingest_excel_to_sqlite(file_bytes, clean_name, target_path)
            _active_database = target_name
            db_manager.active_db = target_name
            schema = inspect_database_schema(target_name)
            return {
                "success": True,
                "filename": target_name,
                "tables": result.get("tables", []),
                "total_rows": result.get("total_rows", 0),
                "tables_count": schema.get("total_tables", len(result.get("tables", []))),
                "schema": schema,
                "message": f"Excel sheets successfully ingested into '{target_name}' and activated."
            }
        except Exception as e:
            return {"success": False, "message": f"Failed to ingest Excel file: {str(e)}"}

    elif name_lower.endswith((".db", ".sqlite", ".sqlite3")):
        target_path = os.path.join(DATA_DIR, clean_name)
        
        # 1. Header magic bytes verification
        if len(file_bytes) < 16 or not file_bytes.startswith(b"SQLite format 3\x00"):
            return {
                "success": False,
                "message": "Uploaded file is not a valid SQLite database header format."
            }

        # 2. Write file
        try:
            with open(target_path, "wb") as f:
                f.write(file_bytes)
        except Exception as e:
            return {"success": False, "message": f"Failed to write file to disk: {str(e)}"}

        # 3. Integrity verification
        try:
            conn = sqlite3.connect(target_path)
            cursor = conn.cursor()
            cursor.execute("PRAGMA integrity_check;")
            check = cursor.fetchone()
            if not check or check[0] != "ok":
                conn.close()
                if os.path.exists(target_path):
                    os.remove(target_path)
                return {"success": False, "message": "Uploaded database failed SQLite integrity check."}

            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
            tables = [r[0] for r in cursor.fetchall()]
            conn.close()

            if not tables:
                # Still allow valid empty DB but notify
                pass

        except Exception as e:
            if os.path.exists(target_path):
                os.remove(target_path)
            return {"success": False, "message": f"Invalid or corrupted SQLite database: {str(e)}"}

        # 4. Activate and inspect schema
        _active_database = clean_name
        db_manager.active_db = clean_name
        schema = inspect_database_schema(clean_name)

        return {
            "success": True,
            "filename": clean_name,
            "total_tables": schema.get("total_tables", 0),
            "total_rows": schema.get("total_rows", 0),
            "tables": list(schema.get("tables", {}).keys()),
            "schema": schema,
            "message": f"Database '{clean_name}' successfully verified, uploaded, and activated ({schema.get('total_tables', 0)} tables, {schema.get('total_rows', 0):,} records)."
        }
    else:
        return {
            "success": False,
            "message": "Unsupported file format. Please upload SQLite (.db, .sqlite), CSV (.csv), or Excel (.xlsx)."
        }

def inspect_database_schema(db_name: Optional[str] = None) -> Dict[str, Any]:
    """Inspects tables, columns, data types, and row counts of any SQLite database."""
    target_name = sanitize_filename(db_name) if db_name else _active_database
    db_path = os.path.join(DATA_DIR, target_name)
    
    if not os.path.exists(db_path):
        return {
            "database": target_name,
            "table_count": 0,
            "total_tables": 0,
            "total_records": 0,
            "total_rows": 0,
            "tables": {}
        }

    try:
        conn = sqlite3.connect(db_path, check_same_thread=False)
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        tables = [row[0] for row in cursor.fetchall()]
        
        schema_info = {}
        total_records = 0
        
        for tbl in tables:
            cursor.execute(f"PRAGMA table_info(\"{tbl}\");")
            columns = [{"cid": col[0], "name": col[1], "type": col[2], "notnull": col[3], "pk": col[5]} for col in cursor.fetchall()]
            
            try:
                cursor.execute(f"SELECT COUNT(*) FROM \"{tbl}\";")
                count = cursor.fetchone()[0]
            except Exception:
                count = 0
                
            total_records += count
            schema_info[tbl] = {
                "columns": columns,
                "row_count": count
            }
            
        conn.close()
        return {
            "database": target_name,
            "table_count": len(tables),
            "total_tables": len(tables),
            "total_records": total_records,
            "total_rows": total_records,
            "tables": schema_info
        }
    except Exception as e:
        return {
            "database": target_name,
            "error": str(e),
            "table_count": 0,
            "total_tables": 0,
            "total_records": 0,
            "total_rows": 0,
            "tables": {}
        }
