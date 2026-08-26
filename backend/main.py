from pathlib import Path
from typing import Any
from uuid import uuid4
import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Engineering PDF App API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA = Path(__file__).parent / "data"
DATA.mkdir(exist_ok=True)

class ProjectIn(BaseModel):
    name: str
    source_file: str | None = None
    markups: dict[str, Any] | dict[int, Any]

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/projects")
def save_project(project: ProjectIn):
    project_id = str(uuid4())
    payload = {"id": project_id, **project.model_dump()}
    (DATA / f"{project_id}.json").write_text(json.dumps(payload, indent=2))
    return payload

@app.get("/projects/{project_id}")
def get_project(project_id: str):
    path = DATA / f"{project_id}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    return json.loads(path.read_text())
