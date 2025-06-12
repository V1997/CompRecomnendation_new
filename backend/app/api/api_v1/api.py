from fastapi import APIRouter
from app.api.api_v1.endpoints import recommendations, feedback, performance, upload, dataset

api_router = APIRouter()

api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
api_router.include_router(performance.router, prefix="/performance", tags=["performance"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(dataset.router, prefix="/dataset", tags=["dataset"])
api_router.include_router(dataset.router, prefix="/model", tags=["model"])
