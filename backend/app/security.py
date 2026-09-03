import re
from typing import Tuple

FORBIDDEN_KEYWORDS = [
    r"\bDROP\b",
    r"\bDELETE\b",
    r"\bINSERT\b",
    r"\bUPDATE\b",
    r"\bALTER\b",
    r"\bCREATE\b",
    r"\bTRUNCATE\b",
    r"\bREPLACE\b",
    r"\bATTACH\b",
    r"\bDETACH\b",
    r"\bPRAGMA\b",
    r"\bGRANT\b",
    r"\bREVOKE\b",
    r"\bEXEC\b",
    r"\bEXECUTE\b",
    r"\bVACUUM\b",
    r"\bREINDEX\b"
]

def validate_readonly_sql(sql: str) -> Tuple[bool, str]:
    """
    Validates that the provided SQL query is strictly read-only and safe to execute.
    Returns (is_valid, error_message).
    """
    if not sql or not sql.strip():
        return False, "Query string cannot be empty."

    cleaned_sql = sql.strip()
    
    # Strip comments -- single line and multi-line
    cleaned_sql = re.sub(r"--.*", "", cleaned_sql)
    cleaned_sql = re.sub(r"/\*.*?\*/", "", cleaned_sql, flags=re.DOTALL)
    cleaned_sql = cleaned_sql.strip()

    # Check for multiple statements separated by semicolon (allow trailing semicolon)
    statements = [s.strip() for s in cleaned_sql.split(";") if s.strip()]
    if len(statements) > 1:
        return False, "Multi-statement queries are forbidden for security. Only a single SELECT query is allowed."

    if not statements:
        return False, "No valid SQL query found."

    single_query = statements[0]

    # Must start with SELECT or WITH
    if not re.match(r"^(SELECT|WITH)\b", single_query, re.IGNORECASE):
        return False, "Only SELECT queries are allowed for AI database exploration."

    # Check for forbidden keywords
    for pattern in FORBIDDEN_KEYWORDS:
        if re.search(pattern, single_query, re.IGNORECASE):
            match = re.search(pattern, single_query, re.IGNORECASE).group(0)
            return False, f"Security Violation: Forbidden write/administrative SQL keyword '{match.upper()}' detected."

    return True, ""
