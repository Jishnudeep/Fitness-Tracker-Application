from fastapi import APIRouter, HTTPException, Depends
from app.schemas.template import Template, TemplateCreate, TemplateUpdate
from app.services.template_service import TemplateService
from typing import List, Any
from app.auth import get_current_user

router = APIRouter(
    prefix="/templates",
    tags=["templates"]
)

@router.get("/", response_model=List[Template])
async def get_templates(user: Any = Depends(get_current_user)):
    return await TemplateService.get_templates(user.id)

@router.post("/", response_model=Template)
async def create_template(template: TemplateCreate, user: Any = Depends(get_current_user)):
    return await TemplateService.create_template(user.id, template)

@router.patch("/{template_id}", response_model=Template)
async def update_template(template_id: str, template: TemplateUpdate, user: Any = Depends(get_current_user)):
    return await TemplateService.update_template(user.id, template_id, template)

@router.delete("/{template_id}")
async def delete_template(template_id: str, user: Any = Depends(get_current_user)):
    success = await TemplateService.delete_template(user.id, template_id)
    if not success:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"status": "success"}
