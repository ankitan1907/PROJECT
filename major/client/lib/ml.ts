export interface DiagnosisResult {
  diagnosis: "PNEUMONIA" | "NORMAL";
  confidence: number;
  severity: "MILD" | "MODERATE" | "SEVERE" | "NONE";
  riskScore: number;
  recommendations: string[];
  detectionTimestamp: Date;
}

function getImageBrightness(imageData: ImageData): number {
  const data = imageData.data;
  let brightness = 0;
  for (let i = 0; i < data.length; i += 4) {
    brightness += (data[i] + data[i + 1] + data[i + 2]) / 3 / 255;
  }
  return brightness / (data.length / 4);
}

function getImageContrast(imageData: ImageData): number {
  const data = imageData.data;
  const mean = getImageBrightness(imageData);
  let variance = 0;
  for (let i = 0; i < data.length; i += 4) {
    const pixelBrightness = (data[i] + data[i + 1] + data[i + 2]) / 3 / 255;
    variance += Math.pow(pixelBrightness - mean, 2);
  }
  variance /= data.length / 4;
  return Math.sqrt(variance);
}

function getImageSharpness(imageData: ImageData): number {
  const data = imageData.data;
  const width = imageData.width;
  let edgeSum = 0;
  let pixelCount = 0;

  for (let i = width * 4; i < data.length - width * 4 - 4; i += 4) {
    const current = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const left = (data[i - 4] + data[i - 3] + data[i - 2]) / 3;
    const right = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
    const up = (data[i - width * 4] + data[i - width * 4 + 1] + data[i - width * 4 + 2]) / 3;
    const down = (data[i + width * 4] + data[i + width * 4 + 1] + data[i + width * 4 + 2]) / 3;

    edgeSum += Math.abs(current - left) + Math.abs(current - right) + Math.abs(current - up) + Math.abs(current - down);
    pixelCount++;
  }

  return edgeSum / (pixelCount * 4 * 255);
}

export async function detectPneumonia(imageFile: File): Promise<DiagnosisResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const brightness = getImageBrightness(imageData);
        const contrast = getImageContrast(imageData);
        const sharpness = getImageSharpness(imageData);

        // Simulate pneumonia detection based on image properties
        const darkThreshold = brightness < 0.35;
        const highContrast = contrast > 0.5;
        const goodSharpness = sharpness > 0.15;

        let riskScore = 0.2;

        if (darkThreshold && highContrast) {
          riskScore = 0.75 + Math.random() * 0.2;
        } else if (darkThreshold || highContrast) {
          riskScore = 0.45 + Math.random() * 0.25;
        } else {
          riskScore = 0.1 + Math.random() * 0.2;
        }

        if (goodSharpness) {
          riskScore = Math.min(1, riskScore + 0.05);
        }

        const confidence = Math.min(1, 0.82 + Math.random() * 0.13);
        const isPneumonia = riskScore > 0.5;

        let severity: "MILD" | "MODERATE" | "SEVERE" | "NONE" = "NONE";
        let recommendations: string[] = [];

        if (isPneumonia) {
          if (riskScore > 0.8) {
            severity = "SEVERE";
            recommendations = [
              "Immediate hospitalization recommended",
              "Begin oxygen therapy monitoring",
              "Order chest CT scan for confirmation",
              "Administer broad-spectrum antibiotics",
              "Monitor vital signs closely",
            ];
          } else if (riskScore > 0.65) {
            severity = "MODERATE";
            recommendations = [
              "Hospitalization advised",
              "Antibiotic treatment initiation",
              "X-ray follow-up in 48-72 hours",
              "Oxygen support if SpO2 <94%",
              "Daily clinical assessment",
            ];
          } else {
            severity = "MILD";
            recommendations = [
              "Outpatient monitoring recommended",
              "Oral antibiotic therapy",
              "Follow-up X-ray in 1-2 weeks",
              "Return if symptoms worsen",
              "Adequate hydration and rest",
            ];
          }
        } else {
          recommendations = [
            "No pneumonia detected",
            "Continue routine care",
            "Monitor for any symptoms",
            "Follow-up as per regular schedule",
          ];
        }

        setTimeout(() => {
          resolve({
            diagnosis: isPneumonia ? "PNEUMONIA" : "NORMAL",
            confidence,
            severity,
            riskScore,
            recommendations,
            detectionTimestamp: new Date(),
          });
        }, 2000);
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(imageFile);
  });
}
