import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.routers.api import router as api_router
from app.database import db_manager

app = FastAPI(
    title="LEDGR — AI-Powered Finance Controller & Auditor",
    description="Enterprise-grade AI finance controller for automated database auditing, ML anomaly detection, settlement reconciliation, merchant risk scoring, and flag management.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router strictly under canonical /api prefix
app.include_router(api_router, prefix="/api")

# Mount frontend dist if present
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(FRONTEND_DIST):
    # Mount assets folder
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Serve index.html for SPA routes (fallback to index.html if not an API route)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # If it's an API route or docs or OpenAPI, don't intercept
        if full_path.startswith("api/") or full_path in ["docs", "redoc", "openapi.json"]:
            return None
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"status": "ok", "service": "LEDGR Autonomous AI Finance Controller & Auditor", "api_prefix": "/api"}
else:
    @app.get("/")
    async def root_status():
        return {"status": "ok", "service": "LEDGR Autonomous AI Finance Controller & Auditor", "api_prefix": "/api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
