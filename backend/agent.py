"""
LEDGR Agent Interface (Root Convenience Module)
Re-exports ask function from app.services.ai_controller
"""
from app.services.ai_controller import query_ai_controller

def ask(question: str):
    """Queries the autonomous AI Controller and returns structured response."""
    return query_ai_controller(question)

__all__ = ["ask"]

