from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="BannerOS API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PROFILES = {
    "HASL": {
        "id": "HASL", "displayName": "HASL",
        "formats": [
            {"name": "square", "width": 1080, "height": 1080},
            {"name": "landscape", "width": 1920, "height": 1080},
            {"name": "portrait", "width": 1080, "height": 1350},
        ],
    },
    "OUTMAX": {
        "id": "OUTMAX", "displayName": "OUTMAX",
        "formats": [
            {"name": "wide", "width": 1920, "height": 720},
            {"name": "standard", "width": 1200, "height": 628},
            {"name": "vertical", "width": 1080, "height": 1920},
        ],
    },
}
workspaces: list[dict[str, str]] = []
UPLOAD_ROOT = Path(__file__).resolve().parents[2] / ".banneros" / "uploads"
MAX_UPLOAD_BYTES = 20 * 1024 * 1024


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    profile: str = Field(pattern="^(HASL|OUTMAX)$")


class ExportPlanRequest(BaseModel):
    profile: str = Field(pattern="^(HASL|OUTMAX)$")
    concept: str = Field(min_length=1, max_length=500)
    assets: list[str] = Field(min_length=1, max_length=20)


class CropRequest(BaseModel):
    sourceWidth: int = Field(gt=0, le=10000)
    sourceHeight: int = Field(gt=0, le=10000)
    targetWidth: int = Field(gt=0, le=10000)
    targetHeight: int = Field(gt=0, le=10000)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "banneros-api"}


@app.get("/api/profiles")
def list_profiles() -> list[dict]:
    return list(PROFILES.values())


@app.get("/api/workspaces")
def list_workspaces() -> list[dict[str, str]]:
    return workspaces


@app.post("/api/workspaces", status_code=201)
def create_workspace(payload: WorkspaceCreate) -> dict[str, str]:
    workspace = {
        "id": str(uuid4()),
        "name": payload.name.strip(),
        "profile": payload.profile,
        "createdAt": datetime.now(UTC).isoformat(),
    }
    workspaces.append(workspace)
    return workspace


@app.post("/api/exports/plan")
def create_export_plan(payload: ExportPlanRequest) -> dict:
    profile = PROFILES[payload.profile]
    return {
        "profile": payload.profile,
        "concept": payload.concept.strip(),
        "assets": payload.assets,
        "status": "planned",
        "outputs": [
            {
                "fileName": f"{payload.profile.lower()}-{item['name']}.png",
                "format": item["name"],
                "width": item["width"],
                "height": item["height"],
            }
            for item in profile["formats"]
        ],
    }


@app.post("/api/crop/preview")
def preview_crop(payload: CropRequest) -> dict[str, int | float]:
    source_ratio = payload.sourceWidth / payload.sourceHeight
    target_ratio = payload.targetWidth / payload.targetHeight
    if source_ratio > target_ratio:
        width = round(payload.sourceHeight * target_ratio)
        return {"x": round((payload.sourceWidth - width) / 2), "y": 0, "width": width, "height": payload.sourceHeight, "scale": payload.targetHeight / payload.sourceHeight}
    height = round(payload.sourceWidth / target_ratio)
    return {"x": 0, "y": round((payload.sourceHeight - height) / 2), "width": payload.sourceWidth, "height": height, "scale": payload.targetWidth / payload.sourceWidth}


@app.post("/api/assets/upload", status_code=201)
async def upload_asset(file: UploadFile = File(...)) -> dict[str, str | int]:
    safe_name = Path(file.filename or "asset").name
    if safe_name in {"", ".", ".."}:
        safe_name = "asset"
    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds the 20 MB limit")
    asset_id = str(uuid4())
    destination = UPLOAD_ROOT / f"{asset_id}-{safe_name}"
    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(content)
    return {"id": asset_id, "name": safe_name, "path": str(destination), "size": len(content), "mimeType": file.content_type or "application/octet-stream"}
