from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
from datetime import datetime
from final_predictor import PneumoniaAI
import traceback

@asynccontextmanager
async def lifespan(app: FastAPI):
    global ai_engine
    print("🚀 Loading Pneumonia AI Model...")
    ai_engine = PneumoniaAI(model_path="models/final_pnuemonia_model.h5")
    print("✅ AI Engine Ready!")
    yield
    print("🔴 AI Engine Shutdown")

app = FastAPI(title="Pneumonia Detection API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_engine = None
history_db = {}

@app.get("/")
async def root():
    return {
        "message": "Pneumonia Detection API",
        "status": "online",
        "model": "Deep Learning Ensemble",
        "version": "1.0"
    }

@app.get("/api/health")
async def health():
    return {
        "status": "online", 
        "model": "High-Accuracy Pneumonia Detector",
        "endpoints": ["/api/analyze", "/api/history/{id}", "/api/health"]
    }

@app.post("/api/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        print(f"📥 Received file: {file.filename}")
        
        # Save uploaded file temporarily
        temp_path = f"temp_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
        
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        print(f"📁 Saved to: {temp_path}")
        print("🔍 Starting analysis...")
        
        # Perform COMPLETE analysis
        result = ai_engine.full_analysis(temp_path)
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            print(f"🗑️ Cleaned temp file")
        
        if result["status"] == "error":
            return JSONResponse(
                status_code=400, 
                content={"status": "error", "message": result["message"]}
            )
        
        # Generate analysis ID
        analysis_id = f"res_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        timestamp = datetime.now().isoformat()
        
        # Build complete response
        full_response = {
            "id": analysis_id,
            "status": "success",
            "timestamp": timestamp,
            "filename": file.filename,
            "analysis": {
                "diagnosis": result["diagnosis"],
                "confidence": result["confidence"],  # Already 0-1
                "severity": result["severity"],
                "risk_factors": result.get("risk_factors", []),
                "recommendations": result.get("recommendations", []),
                "risk_level": result.get("risk_level", "LOW")
            },
            "model_scores": result.get("model_scores", {}),
            "ensemble_score": result.get("ensemble_score", 0),
            "ensemble_diagnosis": result.get("ensemble_diagnosis", "NORMAL"),
            "threshold_used": result.get("threshold_used", 0.5),
            "heatmap": result.get("heatmap", {}),
            "segmentation": result.get("segmentation", {}),
            "raw_score": result.get("raw_score", 0),
          "detectionTimestamp": datetime.now().isoformat()
        }
        
        # Store in history
        history_db[analysis_id] = full_response
        print(f"✅ Analysis completed: {analysis_id}")
        
        return JSONResponse(content=full_response)

    except Exception as e:
        print(f"❌ Error analyzing image: {str(e)}")
        traceback.print_exc()
        return JSONResponse(
            status_code=500, 
            content={
                "status": "error", 
                "message": f"Analysis failed: {str(e)}"
            }
        )

@app.get("/api/history/{analysis_id}")
async def get_history(analysis_id: str):
    if analysis_id in history_db:
        return history_db[analysis_id]
    raise HTTPException(status_code=404, detail="Analysis ID not found")

@app.delete("/api/history/{analysis_id}")
async def delete_history(analysis_id: str):
    if analysis_id in history_db:
        del history_db[analysis_id]
        return {"status": "success", "message": "Record deleted"}
    raise HTTPException(status_code=404, detail="Analysis ID not found")

@app.get("/api/history")
async def list_history():
    return {
        "count": len(history_db),
        "analyses": list(history_db.keys())[-10:]  # Last 10 analyses
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)