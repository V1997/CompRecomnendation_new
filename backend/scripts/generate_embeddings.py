#!/usr/bin/env python3
"""
Generate Property Embeddings Script
Simple script to generate embeddings using the lightweight approach
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.ml.embedding_generator import generate_embeddings_main

if __name__ == "__main__":
    print("🚀 Starting Property Embedding Generation")
    print("   Method: NumPy + scikit-learn (lightweight)")
    print("   No additional dependencies required!")
    print("=" * 50)
    
    success = generate_embeddings_main()
    
    if success:
        print("\n" + "=" * 50)
        print("✅ SUCCESS: Embeddings generated successfully!")
        print("🎯 Next steps:")
        print("   1. Start the backend server: cd backend && python -m uvicorn app.main:app --reload")
        print("   2. Test fast recommendations: POST /api/v1/dataset/recommendations/fast/")
        print("   3. Enjoy <10ms response times!")
    else:
        print("\n" + "=" * 50)
        print("❌ FAILED: Embedding generation unsuccessful")
        print("💡 Troubleshooting:")
        print("   1. Ensure trained models exist in models/ directory")
        print("   2. Check that data/appraisals_dataset.json exists")
        print("   3. Review the error logs above")
