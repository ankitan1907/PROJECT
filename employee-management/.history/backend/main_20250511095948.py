from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Form
import json
import os
import random
import pandas as pd
import geopandas as gpd
import netCDF4
from netCDF4 import Dataset
from io import BytesIO

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import numpy as np
from pydantic import BaseModel

# Create the FastAPI app
app = FastAPI(title="OceanEye API", description="Backend API for OceanEye oceanography application")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data files
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Models
class AnomalyData(BaseModel):
    id: str
    timestamp: str
    location: Dict[str, float]
    temperature: float
    salinity: float
    algae_concentration: float
    is_anomaly: bool
    anomaly_type: Optional[str] = None
    severity: Optional[int] = None

class BiodiversityData(BaseModel):
    id: str
    timestamp: str
    location: Dict[str, float]
    species_count: int
    coral_health_index: float
    species: List[Dict[str, Any]]
    migration_patterns: Optional[List[Dict[str, Any]]] = None

class DisasterPrediction(BaseModel):
    id: str
    disaster_type: str
    probability: float
    location: Dict[str, float]
    predicted_time: str
    severity: int
    advisory: str

class MapFeature(BaseModel):
    id: str
    feature_type: str
    name: str
    coordinates: List[float]
    description: Optional[str] = None
    properties: Optional[Dict[str, Any]] = None

# Mock data generation functions
def generate_mock_anomaly_data(count: int = 50) -> List[Dict[str, Any]]:
    """Generate mock anomaly data"""
    anomalies = []
    
    # Base time for the dataset
    base_time = datetime.now() - timedelta(days=30)
    
    for i in range(count):
        # Create timestamp with progressive dates
        timestamp = (base_time + timedelta(days=i/2)).isoformat()
        
        # Random location in ocean
        location = {
            "lat": random.uniform(-60, 60),
            "lng": random.uniform(-180, 180)
        }
        
        # Random values for measurements
        temperature = random.uniform(0, 30)
        salinity = random.uniform(30, 40)
        algae = random.uniform(0, 100)
        
        # Determine if this is an anomaly
        is_anomaly = random.random() < 0.2
        anomaly_type = None
        severity = None
        
        if is_anomaly:
            # Assign anomaly type and adjust values to be more extreme
            anomaly_types = ["temperature_spike", "salinity_change", "algal_bloom"]
            anomaly_type = random.choice(anomaly_types)
            severity = random.randint(1, 5)
            
            if anomaly_type == "temperature_spike":
                temperature += random.uniform(5, 15)
            elif anomaly_type == "salinity_change":
                salinity += random.uniform(-10, 10)
            elif anomaly_type == "algal_bloom":
                algae += random.uniform(50, 150)
        
        anomalies.append({
            "id": f"anomaly-{i}",
            "timestamp": timestamp,
            "location": location,
            "temperature": round(temperature, 2),
            "salinity": round(salinity, 2),
            "algae_concentration": round(algae, 2),
            "is_anomaly": is_anomaly,
            "anomaly_type": anomaly_type,
            "severity": severity
        })
    
    return anomalies

def generate_mock_biodiversity_data(count: int = 30) -> List[Dict[str, Any]]:
    """Generate mock biodiversity data"""
    biodiversity_data = []
    
    # Species list
    species_list = [
        {"name": "Bottlenose Dolphin", "scientific_name": "Tursiops truncatus", "count": 0, "endangered": False},
        {"name": "Blue Whale", "scientific_name": "Balaenoptera musculus", "count": 0, "endangered": True},
        {"name": "Great White Shark", "scientific_name": "Carcharodon carcharias", "count": 0, "endangered": False},
        {"name": "Green Sea Turtle", "scientific_name": "Chelonia mydas", "count": 0, "endangered": True},
        {"name": "Giant Squid", "scientific_name": "Architeuthis dux", "count": 0, "endangered": False},
        {"name": "Coral (Various species)", "scientific_name": "Anthozoa", "count": 0, "endangered": True},
    ]
    
    # Base time for the dataset
    base_time = datetime.now() - timedelta(days=365)
    
    for i in range(count):
        # Create timestamp with progressive dates (monthly data)
        timestamp = (base_time + timedelta(days=i*12)).isoformat()
        
        # Random location in ocean
        location = {
            "lat": random.uniform(-60, 60),
            "lng": random.uniform(-180, 180)
        }
        
        # Create a copy of species list for this entry
        current_species = []
        total_count = 0
        
        for species in species_list:
            # Generate random count for each species
            species_copy = species.copy()
            count = random.randint(10, 1000)
            species_copy["count"] = count
            total_count += count
            current_species.append(species_copy)
        
        # Generate coral health index (0-10)
        coral_health = round(random.uniform(3, 10), 1)
        
        # Add seasonal migration patterns
        has_migration = random.random() < 0.3
        migration_patterns = None
        
        if has_migration:
            migration_patterns = [
                {
                    "species": random.choice(species_list)["name"],
                    "direction": random.choice(["north", "south", "east", "west"]),
                    "distance_km": random.randint(100, 5000),
                    "season": random.choice(["spring", "summer", "fall", "winter"])
                }
            ]
        
        biodiversity_data.append({
            "id": f"bio-{i}",
            "timestamp": timestamp,
            "location": location,
            "species_count": total_count,
            "coral_health_index": coral_health,
            "species": current_species,
            "migration_patterns": migration_patterns
        })
    
    return biodiversity_data

def generate_mock_disaster_predictions(count: int = 15) -> List[Dict[str, Any]]:
    """Generate mock disaster prediction data"""
    disaster_predictions = []
    disaster_types = ["cyclone", "tsunami", "underwater_earthquake", "marine_heatwave"]
    
    for i in range(count):
        disaster_type = random.choice(disaster_types)
        
        # Different location patterns based on disaster type
        location = {"lat": 0, "lng": 0}
        if disaster_type == "cyclone":
            # Cyclones in tropical regions
            location = {
                "lat": random.uniform(5, 30) * random.choice([-1, 1]),
                "lng": random.uniform(0, 180) * random.choice([-1, 1])
            }
        elif disaster_type == "tsunami":
            # Tsunamis often near fault lines (e.g. Pacific Ring of Fire)
            location = {
                "lat": random.uniform(-50, 50),
                "lng": random.choice([random.uniform(120, 180), random.uniform(-180, -80)])
            }
        else:
            # Other disasters random
            location = {
                "lat": random.uniform(-60, 60),
                "lng": random.uniform(-180, 180)
            }
        
        # Random future prediction date
        days_in_future = random.randint(1, 30)
        predicted_time = (datetime.now() + timedelta(days=days_in_future)).isoformat()
        
        # Probability and severity
        probability = round(random.uniform(0.1, 0.95), 2)
        severity = random.randint(1, 5)
        
        # Advisory text
        advisory_templates = {
            "cyclone": "Potential cyclone formation detected. Marine vessels advised to avoid the area.",
            "tsunami": "Tsunami risk due to seismic activity. Coastal communities should prepare for possible evacuation.",
            "underwater_earthquake": "Submarine seismic activity detected. Monitoring for potential tsunami generation.",
            "marine_heatwave": "Elevated ocean temperatures may impact marine ecosystems. Monitor coral health."
        }
        
        advisory = advisory_templates.get(disaster_type, "Monitor situation for developments.")
        
        disaster_predictions.append({
            "id": f"disaster-{i}",
            "disaster_type": disaster_type,
            "probability": probability,
            "location": location,
            "predicted_time": predicted_time,
            "severity": severity,
            "advisory": advisory
        })
    
    return disaster_predictions

def generate_mock_map_features(count: int = 40) -> List[Dict[str, Any]]:
    """Generate mock map features (tectonic plates, deep-sea vents, etc.)"""
    map_features = []
    feature_types = ["tectonic_plate", "deep_sea_vent", "ocean_trench", "coral_reef"]
    
    # Names for each feature type
    names = {
        "tectonic_plate": ["Pacific Plate", "North American Plate", "Eurasian Plate", "African Plate", 
                           "Antarctic Plate", "Indo-Australian Plate", "South American Plate"],
        "deep_sea_vent": ["Black Smoker Vent", "White Smoker Vent", "Hydrothermal Field", "Loki's Castle",
                          "Rainbow Vent Field", "Lost City", "TAG Hydrothermal Field"],
        "ocean_trench": ["Mariana Trench", "Puerto Rico Trench", "Java Trench", "Atacama Trench", 
                         "South Sandwich Trench", "Japan Trench", "Kuril–Kamchatka Trench"],
        "coral_reef": ["Great Barrier Reef", "Mesoamerican Reef", "Red Sea Coral Reef", "New Caledonia Barrier Reef",
                       "Andros Barrier Reef", "Raja Ampat Reef", "Maldives Coral Reef"]
    }
    
    # Descriptions for each feature type
    descriptions = {
        "tectonic_plate": "A massive, irregularly shaped slab of solid rock, composed of both continental and oceanic lithosphere.",
        "deep_sea_vent": "A fissure in the Earth's surface from which geothermally heated water issues, often rich in minerals and supporting unique ecosystems.",
        "ocean_trench": "Long, narrow, steep-sided depressions in the ocean floor representing the deepest parts of the ocean.",
        "coral_reef": "Diverse underwater ecosystems held together by calcium carbonate structures secreted by corals."
    }
    
    for i in range(count):
        feature_type = random.choice(feature_types)
        
        # Generate name based on feature type
        name = random.choice(names[feature_type])
        
        # Add a numeric suffix to ensure uniqueness
        unique_name = f"{name} {i}"
        
        # Generate coordinates based on feature type
        coordinates = [random.uniform(-180, 180), random.uniform(-60, 60)]
        
        # Add description
        description = descriptions[feature_type]
        
        # Add type-specific properties
        properties = {}
        
        if feature_type == "tectonic_plate":
            properties["movement_direction"] = random.choice(["northeast", "northwest", "southeast", "southwest"])
            properties["movement_rate_mm_per_year"] = random.randint(5, 100)
        elif feature_type == "deep_sea_vent":
            properties["temperature_celsius"] = random.randint(60, 400)
            properties["depth_meters"] = random.randint(1000, 5000)
        elif feature_type == "ocean_trench":
            properties["depth_meters"] = random.randint(6000, 11000)
            properties["length_km"] = random.randint(200, 2000)
        elif feature_type == "coral_reef":
            properties["area_sq_km"] = random.randint(10, 2000)
            properties["health_index"] = round(random.uniform(3, 10), 1)
        
        map_features.append({
            "id": f"{feature_type}-{i}",
            "feature_type": feature_type,
            "name": unique_name,
            "coordinates": coordinates,
            "description": description,
            "properties": properties
        })
    
    return map_features

def generate_historical_data(years: int = 50, samples_per_year: int = 12) -> List[Dict[str, Any]]:
    """Generate historical ocean data for timeline visualization"""
    historical_data = []
    
    # Start date (50 years ago)
    start_date = datetime.now() - timedelta(days=365 * years)
    
    # Global average sea temperature in 1970 (approximate)
    base_temp = 16.0
    
    # Sea level rise in mm/year (approximately 3.3 mm/year)
    sea_level_rise_rate = 3.3 / 12  # monthly rate
    
    # Generate data
    for year in range(years):
        for month in range(samples_per_year):
            # Calculate date
            current_date = start_date + timedelta(days=((year * 12) + month) * 30)
            
            # Calculate sea level rise (in mm, relative to 1970)
            sea_level_rise = (year * 12 + month) * sea_level_rise_rate
            
            # Calculate temperature (with increasing trend and seasonal variation)
            # Add warming trend (approximately 0.02°C per year)
            temp_trend = year * 0.02
            
            # Add seasonal variation (northern hemisphere pattern)
            seasonal_variation = 1.5 * np.sin(2 * np.pi * (month / 12))
            
            # Add some random noise
            noise = random.uniform(-0.3, 0.3)
            
            temperature = base_temp + temp_trend + seasonal_variation + noise
            
            # Add some random pH variation with decreasing trend (ocean acidification)
            base_ph = 8.2
            ph_trend = -0.002 * year  # pH decreasing over time
            ph_noise = random.uniform(-0.05, 0.05)
            ph = base_ph + ph_trend + ph_noise
            
            # Create data point
            historical_data.append({
                "id": f"hist-{year}-{month}",
                "date": current_date.isoformat(),
                "year": current_date.year,
                "month": current_date.month,
                "average_temperature": round(temperature, 2),
                "sea_level_rise_mm": round(sea_level_rise, 1),
                "ocean_ph": round(ph, 2)
            })
    
    return historical_data

# Generate and save mock data
def initialize_mock_data():
    """Generate and save all mock data"""
    # Define data files
    data_files = {
        "anomalies.json": generate_mock_anomaly_data(100),
        "biodiversity.json": generate_mock_biodiversity_data(50),
        "disaster_predictions.json": generate_mock_disaster_predictions(20),
        "map_features.json": generate_mock_map_features(60),
        "historical_data.json": generate_historical_data(50, 12)
    }
    
    # Save all data files
    for filename, data in data_files.items():
        file_path = os.path.join(DATA_DIR, filename)
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    return "Mock data initialized successfully"

# Initialize data on startup if it doesn't exist
@app.on_event("startup")
async def startup_event():
    # Check if data files exist
    anomalies_file = os.path.join(DATA_DIR, "anomalies.json")
    if not os.path.exists(anomalies_file):
        initialize_mock_data()

# API Routes
@app.get("/")
async def root():
    return {"message": "Welcome to OceanEye API", "status": "active"}

@app.get("/anomalies", response_model=List[AnomalyData])
async def get_anomalies():
    try:
        file_path = os.path.join(DATA_DIR, "anomalies.json")
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        initialize_mock_data()
        with open(file_path, 'r') as f:
            return json.load(f)

@app.get("/biodiversity", response_model=List[BiodiversityData])
async def get_biodiversity():
    try:
        file_path = os.path.join(DATA_DIR, "biodiversity.json")
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        initialize_mock_data()
        with open(file_path, 'r') as f:
            return json.load(f)

@app.get("/disaster-predictions", response_model=List[DisasterPrediction])
async def get_disaster_predictions():
    try:
        file_path = os.path.join(DATA_DIR, "disaster_predictions.json")
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        initialize_mock_data()
        with open(file_path, 'r') as f:
            return json.load(f)

@app.get("/map-features", response_model=List[MapFeature])
async def get_map_features():
    try:
        file_path = os.path.join(DATA_DIR, "map_features.json")
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        initialize_mock_data()
        with open(file_path, 'r') as f:
            return json.load(f)

@app.get("/historical-data")
async def get_historical_data():
    try:
        file_path = os.path.join(DATA_DIR, "historical_data.json")
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        initialize_mock_data()
        with open(file_path, 'r') as f:
            return json.load(f)

  # make sure this is imported





@app.post("/upload-research-data")
async def upload_research_data(
    title: str = Form(...),
    description: str = Form(...),
    data_type: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        research_dir = os.path.join(DATA_DIR, "research")
        os.makedirs(research_dir, exist_ok=True)

        contents = await file.read()
        filename_ext = file.filename.lower().split(".")[-1]

        # Parse based on file extension
        if filename_ext == "json":
            data = json.loads(contents)
        elif filename_ext in ["csv", "xls", "xlsx"]:
            df = pd.read_csv(io.BytesIO(contents)) if filename_ext == "csv" else pd.read_excel(io.BytesIO(contents))
            data = df.to_dict(orient="records")
        elif filename_ext == "geojson":
            data = json.loads(contents)  # GeoJSON is JSON-compatible
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {filename_ext}")

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        save_name = f"{data_type}_{timestamp}.json"
        file_path = os.path.join(research_dir, save_name)

        metadata = {
            "title": title,
            "description": description,
            "data_type": data_type,
            "upload_date": datetime.now().isoformat(),
            "filename": save_name,
            "data": data
        }

        with open(file_path, 'w') as f:
            json.dump(metadata, f, indent=2)

        return {"message": "Research data uploaded successfully", "filename": save_name}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")



@app.get("/research-data")
async def get_research_data():
    research_dir = os.path.join(DATA_DIR, "research")
    os.makedirs(research_dir, exist_ok=True)
    
    research_files = []
    for filename in os.listdir(research_dir):
        if filename.endswith('.json'):
            file_path = os.path.join(research_dir, filename)
            with open(file_path, 'r') as f:
                data = json.load(f)
                # Include metadata but not the full data to keep response size reasonable
                research_files.append({
                    "title": data.get("title", "Unknown"),
                    "description": data.get("description", ""),
                    "data_type": data.get("data_type", "unknown"),
                    "upload_date": data.get("upload_date", ""),
                    "filename": filename
                })
    
    return research_files

@app.get("/research-data/{filename}")
async def get_research_data_by_filename(filename: str):
    research_dir = os.path.join(DATA_DIR, "research")
    file_path = os.path.join(research_dir, filename)
    
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Research data file not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)