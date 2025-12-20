import { AnalysisResponse } from './api';

// Generate a simple synthetic chest X-ray-like image (grayscale gradient)
function generateSynthesisChestXRay(seed: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext('2d')!;

  // Base gradient (darker center to lighter edges - typical X-ray pattern)
  const centerX = 112;
  const centerY = 112;
  
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 150;
      
      let intensity = 200 - (distance / maxDistance) * 100;
      
      // Add some synthetic features based on seed
      const noise = Math.sin(x * 0.05 + seed) * Math.cos(y * 0.05 + seed) * 30;
      intensity = Math.max(50, Math.min(255, intensity + noise));
      
      ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return canvas.toDataURL('image/png');
}

// Generate a heatmap visualization
function generateHeatmap(seed: number, intensity: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext('2d')!;

  // Create a colorful heatmap
  const centerX = 112;
  const centerY = 112;
  
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      let heatValue = Math.max(0, 1 - distance / 150);
      heatValue = Math.pow(heatValue, 1.5) * intensity;
      
      // Map to color: red for high, yellow for medium, blue for low
      let r = Math.floor(heatValue * 255);
      let g = Math.floor(heatValue * 128);
      let b = Math.floor((1 - heatValue) * 255);
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return canvas.toDataURL('image/png');
}

// Generate lung segmentation mask
function generateSegmentationMask(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext('2d')!;

  // Create an overlay showing lung segmentation
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, 224, 224);

  // Draw left and right lungs (ellipses)
  ctx.fillStyle = 'rgba(0, 150, 255, 0.5)';
  
  // Left lung
  ctx.beginPath();
  ctx.ellipse(75, 110, 40, 80, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Right lung
  ctx.beginPath();
  ctx.ellipse(150, 110, 40, 80, 0.2, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL('image/png');
}

export const DEMO_ANALYSES: AnalysisResponse[] = [
  {
    status: 'success',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    filename: 'patient_001_xray.jpg',
    analysis: {
      diagnosis: 'PNEUMONIA',
      confidence: 0.92,
      severity: 'SEVERE',
      risk_factors: [
        'Consolidation in lower right lobe',
        'Bilateral alveolar opacities',
        'Signs of air bronchogram',
        'Elevated white blood cell count indicators'
      ],
      recommendations: [
        'Immediate consultation with pulmonologist',
        'Initiate broad-spectrum antibiotic therapy',
        'Perform blood culture and sputum analysis',
        'Consider chest CT for further evaluation',
        'Monitor oxygen saturation levels closely'
      ]
    },
    model_scores: {
      resnet50: 0.94,
      densenet121: 0.91,
      efficientnet: 0.90
    },
    preprocessing: {
      original: {
        mean: 127.5,
        std: 45.2,
        min: 10,
        max: 245,
        contrast: 235,
        brightness: 127.5,
        entropy: 7.2
      },
      normalized: {
        mean: 0.5,
        std: 0.177,
        min: 0.04,
        max: 0.96,
        contrast: 0.92,
        brightness: 0.5,
        entropy: 7.8
      },
      enhanced: {
        mean: 0.52,
        std: 0.185,
        min: 0.05,
        max: 0.98,
        contrast: 0.93,
        brightness: 0.52,
        entropy: 8.1
      }
    },
    segmentation: {
      mask: generateSegmentationMask(),
      metrics: {
        coverage_percentage: 87.5,
        lung_pixels: 28500,
        lung_intensity: 165.3,
        background_intensity: 85.2,
        contrast: 80.1,
        num_lungs_detected: 2
      }
    },
    heatmap: {
      heatmap: generateHeatmap(1, 0.92),
      overlay: generateHeatmap(1, 0.92),
      intensity: 0.92
    },
    multi_layer_activations: {
      conv2_block3_out: {
        visualization: generateHeatmap(2, 0.75),
        num_features: 64,
        top_channels: [12, 18, 25, 31, 42]
      },
      conv3_block4_out: {
        visualization: generateHeatmap(3, 0.85),
        num_features: 128,
        top_channels: [45, 67, 89, 102, 115]
      },
      conv4_block6_out: {
        visualization: generateHeatmap(4, 0.92),
        num_features: 256,
        top_channels: [156, 178, 192, 213, 241]
      }
    }
  },
  {
    status: 'success',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    filename: 'patient_002_xray.jpg',
    analysis: {
      diagnosis: 'NORMAL',
      confidence: 0.97,
      severity: 'NONE',
      risk_factors: [
        'No significant abnormalities detected',
        'Clear bilateral lung fields',
        'Normal cardiac silhouette',
        'No pleural effusion'
      ],
      recommendations: [
        'Continue routine medical surveillance',
        'Maintain current health practices',
        'Schedule follow-up if symptoms develop',
        'No immediate clinical intervention required'
      ]
    },
    model_scores: {
      resnet50: 0.96,
      densenet121: 0.97,
      efficientnet: 0.98
    },
    preprocessing: {
      original: {
        mean: 120.3,
        std: 38.5,
        min: 15,
        max: 240,
        contrast: 225,
        brightness: 120.3,
        entropy: 6.8
      },
      normalized: {
        mean: 0.47,
        std: 0.151,
        min: 0.06,
        max: 0.94,
        contrast: 0.88,
        brightness: 0.47,
        entropy: 7.3
      },
      enhanced: {
        mean: 0.48,
        std: 0.158,
        min: 0.07,
        max: 0.96,
        contrast: 0.89,
        brightness: 0.48,
        entropy: 7.6
      }
    },
    segmentation: {
      mask: generateSegmentationMask(),
      metrics: {
        coverage_percentage: 91.2,
        lung_pixels: 29800,
        lung_intensity: 155.8,
        background_intensity: 80.5,
        contrast: 75.3,
        num_lungs_detected: 2
      }
    },
    heatmap: {
      heatmap: generateHeatmap(5, 0.15),
      overlay: generateHeatmap(5, 0.15),
      intensity: 0.15
    },
    multi_layer_activations: {
      conv2_block3_out: {
        visualization: generateHeatmap(6, 0.20),
        num_features: 64,
        top_channels: [8, 14, 22, 29, 38]
      },
      conv3_block4_out: {
        visualization: generateHeatmap(7, 0.25),
        num_features: 128,
        top_channels: [42, 61, 75, 88, 105]
      },
      conv4_block6_out: {
        visualization: generateHeatmap(8, 0.30),
        num_features: 256,
        top_channels: [152, 168, 185, 205, 238]
      }
    }
  },
  {
    status: 'success',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    filename: 'patient_003_xray.jpg',
    analysis: {
      diagnosis: 'PNEUMONIA',
      confidence: 0.78,
      severity: 'MODERATE',
      risk_factors: [
        'Right middle lobe infiltrate',
        'Subtle alveolar opacities',
        'Mild elevation of diaphragm',
        'Borderline cardiac silhouette enlargement'
      ],
      recommendations: [
        'Outpatient antibiotic therapy',
        'Follow-up chest X-ray in 2 weeks',
        'Monitor symptoms and vital signs',
        'Consider additional testing if no improvement',
        'Ensure adequate hydration and rest'
      ]
    },
    model_scores: {
      resnet50: 0.81,
      densenet121: 0.76,
      efficientnet: 0.77
    },
    preprocessing: {
      original: {
        mean: 125.8,
        std: 42.1,
        min: 12,
        max: 242,
        contrast: 230,
        brightness: 125.8,
        entropy: 7.0
      },
      normalized: {
        mean: 0.493,
        std: 0.165,
        min: 0.047,
        max: 0.949,
        contrast: 0.902,
        brightness: 0.493,
        entropy: 7.5
      },
      enhanced: {
        mean: 0.505,
        std: 0.172,
        min: 0.05,
        max: 0.97,
        contrast: 0.92,
        brightness: 0.505,
        entropy: 7.8
      }
    },
    segmentation: {
      mask: generateSegmentationMask(),
      metrics: {
        coverage_percentage: 89.3,
        lung_pixels: 29200,
        lung_intensity: 160.5,
        background_intensity: 82.3,
        contrast: 78.2,
        num_lungs_detected: 2
      }
    },
    heatmap: {
      heatmap: generateHeatmap(9, 0.65),
      overlay: generateHeatmap(9, 0.65),
      intensity: 0.65
    },
    multi_layer_activations: {
      conv2_block3_out: {
        visualization: generateHeatmap(10, 0.55),
        num_features: 64,
        top_channels: [10, 17, 24, 33, 40]
      },
      conv3_block4_out: {
        visualization: generateHeatmap(11, 0.62),
        num_features: 128,
        top_channels: [48, 69, 82, 98, 110]
      },
      conv4_block6_out: {
        visualization: generateHeatmap(12, 0.68),
        num_features: 256,
        top_channels: [158, 175, 190, 210, 240]
      }
    }
  },
  {
    status: 'success',
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    filename: 'patient_004_xray.jpg',
    analysis: {
      diagnosis: 'PNEUMONIA',
      confidence: 0.88,
      severity: 'MILD',
      risk_factors: [
        'Left lower lobe consolidation',
        'Minimal pleural involvement',
        'Clear right lung fields',
        'Normal heart size'
      ],
      recommendations: [
        'Oral antibiotic course for 5-7 days',
        'Home observation with daily monitoring',
        'Repeat imaging if symptoms persist',
        'Supportive care with rest and fluids',
        'Return if symptoms worsen'
      ]
    },
    model_scores: {
      resnet50: 0.90,
      densenet121: 0.87,
      efficientnet: 0.87
    },
    preprocessing: {
      original: {
        mean: 118.5,
        std: 40.2,
        min: 14,
        max: 238,
        contrast: 224,
        brightness: 118.5,
        entropy: 6.9
      },
      normalized: {
        mean: 0.464,
        std: 0.158,
        min: 0.055,
        max: 0.933,
        contrast: 0.878,
        brightness: 0.464,
        entropy: 7.4
      },
      enhanced: {
        mean: 0.478,
        std: 0.165,
        min: 0.06,
        max: 0.95,
        contrast: 0.89,
        brightness: 0.478,
        entropy: 7.7
      }
    },
    segmentation: {
      mask: generateSegmentationMask(),
      metrics: {
        coverage_percentage: 88.7,
        lung_pixels: 29000,
        lung_intensity: 158.2,
        background_intensity: 81.5,
        contrast: 76.7,
        num_lungs_detected: 2
      }
    },
    heatmap: {
      heatmap: generateHeatmap(13, 0.55),
      overlay: generateHeatmap(13, 0.55),
      intensity: 0.55
    },
    multi_layer_activations: {
      conv2_block3_out: {
        visualization: generateHeatmap(14, 0.50),
        num_features: 64,
        top_channels: [11, 19, 26, 35, 44]
      },
      conv3_block4_out: {
        visualization: generateHeatmap(15, 0.58),
        num_features: 128,
        top_channels: [50, 71, 84, 100, 112]
      },
      conv4_block6_out: {
        visualization: generateHeatmap(16, 0.62),
        num_features: 256,
        top_channels: [160, 177, 192, 212, 242]
      }
    }
  }
];

export function getDemoChestXRay(index: number): string {
  return generateSynthesisChestXRay(index);
}

export function getRandomDemoAnalysis(): AnalysisResponse {
  return DEMO_ANALYSES[Math.floor(Math.random() * DEMO_ANALYSES.length)];
}
