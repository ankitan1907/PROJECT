# Pneumonia Detection ML Backend

Real ML-powered pneumonia detection system using deep learning ensemble models.

## Features

- **Ensemble Models**: ResNet50, DenseNet121, EfficientNetB3 (weighted voting)
- **Real Image Processing**: CLAHE, denoising, normalization
- **Grad-CAM Heatmaps**: Explainable AI visualization
- **Lung Segmentation**: Automated lung boundary detection
- **Multi-Layer Activation Maps**: Neural network feature visualization
- **Preprocessing Statistics**: Detailed image quality metrics

## Setup

### Prerequisites

- Python 3.9+
- pip or conda

### Installation

1. **Create virtual environment** (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

This will install:
- FastAPI: Web framework
- TensorFlow: Deep learning models
- OpenCV: Image processing
- NumPy, Pillow, SciPy: Scientific computing

## Running the Server

```bash
python main.py
```

The server will start on `http://localhost:8000`

### Check API Health

```bash
curl http://localhost:8000/api/health
```

## API Endpoints

### POST /api/analyze
Analyze a single X-ray image

**Request**:
- Multipart form data with `file` field
- Supported formats: JPG, PNG, DICOM

**Response**:
```json
{
  "status": "success",
  "filename": "xray.jpg",
  "analysis": {
    "diagnosis": "PNEUMONIA|NORMAL",
    "confidence": 0.92,
    "severity": "NONE|MILD|MODERATE|SEVERE",
    "risk_factors": [...],
    "recommendations": [...]
  },
  "model_scores": {
    "resnet50": 0.95,
    "densenet121": 0.90,
    "efficientnet": 0.88
  },
  "preprocessing": {...},
  "segmentation": {...},
  "heatmap": {...},
  "multi_layer_activations": {...}
}
```

### GET /api/health
Health check endpoint

### GET /api/model-info
Get information about loaded models

### POST /api/preprocess-info
Get preprocessing statistics for an image

### POST /api/batch-analyze
Analyze multiple images in batch

## Image Processing Pipeline

1. **Load**: Convert to grayscale
2. **Normalize**: Pixel intensity normalization [0, 1]
3. **Enhance**: CLAHE (Contrast Limited Adaptive Histogram Equalization)
4. **Denoise**: Bilateral filtering
5. **Resize**: 224×224 pixels
6. **Convert**: RGB for model input

## Model Architecture

### Ensemble Strategy
```
Input → ResNet50 (35%) ──┐
                        ├→ Weighted Average → Final Prediction
       → DenseNet121 (35%) ──→
                        │
       → EfficientNetB3 (30%) ┘
```

### Grad-CAM Visualization
- Generates attention maps from ResNet50's final convolutional layer
- Shows which regions influenced the diagnosis
- Color-coded: Red (high attention) → Blue (low attention)

### Lung Segmentation
- Automatic lung boundary detection
- Computes: coverage, contrast, intensity metrics
- Uses morphological operations and contour detection

### Multi-Layer Activations
- Visualizes features from 3 network layers
- Shows early (edges), middle (textures), late (patterns) features
- Helps understand feature hierarchy

## Performance Considerations

- **Model Loading Time**: ~30-60 seconds (first run)
- **Image Analysis Time**: ~2-5 seconds per image
- **Memory Usage**: ~2-3 GB for all models
- **GPU Support**: Automatically uses GPU if available

## Troubleshooting

**Models not loading**:
- Check internet connection (downloads pre-trained weights)
- Verify TensorFlow installation: `python -c "import tensorflow; print(tensorflow.__version__)"`

**Out of memory**:
- Close other applications
- Use smaller batch sizes if batch processing
- Consider GPU usage for faster processing

**Port already in use**:
```bash
# Change port in main.py or use:
python -c "import uvicorn; uvicorn.run('main:app', host='0.0.0.0', port=8001)"
```

## Model Information

- **ResNet50**: 25.5M parameters, trained on ImageNet
- **DenseNet121**: 7.98M parameters, efficient feature reuse
- **EfficientNetB3**: 10.8M parameters, optimal accuracy/efficiency trade-off

All models are pre-trained on ImageNet and can be fine-tuned for pneumonia detection with labeled datasets.

## Security Notes

- This system is for research/demo purposes
- Not approved for clinical use without proper validation
- Always consult qualified medical professionals
- Patient data should be encrypted and secured
- Consider HIPAA compliance for production use

## Future Enhancements

- Fine-tuning on pneumonia-specific datasets
- Quantization for edge deployment
- Real-time WebSocket updates
- Advanced heatmap techniques (Integrated Gradients, SHAP)
- 3D chest CT analysis
- Patient demographics integration
