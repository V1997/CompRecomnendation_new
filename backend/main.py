from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api_v1.api import api_router
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Property Valuation API",
    description="AI-powered property comparable recommendation system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize components on server startup"""
    logger.info("🚀 Starting Property Valuation API...")
    
    # Initialize the OPTIMIZED recommendation engine (NumPy + scikit-learn)
    try:
        from app.ml.optimized_recommendation_engine import optimized_engine
        
        logger.info("🔄 Initializing optimized recommendation engine...")
        success = await optimized_engine.initialize()
        
        if success:
            logger.info("✅ Optimized recommendation engine loaded successfully!")
            logger.info("   🎯 Zero dataset loading during queries")
            logger.info("   ⚡ 2-10ms response time for all properties")
            logger.info("   📊 Uses pre-computed embeddings + NumPy search")
            logger.info("   🔧 Dependencies: NumPy + scikit-learn only")
        else:
            logger.warning("⚠️  Optimized engine not ready")
            logger.info("💡 Generate embeddings: python scripts/generate_embeddings.py")
            
    except Exception as e:
        logger.warning(f"⚠️  Could not initialize optimized engine: {e}")
        logger.info("💡 Run: python scripts/generate_embeddings.py")
    
    logger.info("🎉 API startup complete - ready for requests!")

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Property Valuation API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
