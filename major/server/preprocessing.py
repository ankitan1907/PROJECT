# preprocessing.py - ULTRA FIXED VERSION
import numpy as np
import cv2
from PIL import Image
import io
from typing import Tuple

class ImagePreprocessor:
    TARGET_SIZE = (224, 224)

    @staticmethod
    def load_image(image_bytes: bytes) -> np.ndarray:
        """Load image from bytes - keep as uint8"""
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return np.array(img)  # Keep as uint8 0-255

    @staticmethod
    def resize(image: np.ndarray) -> np.ndarray:
        """Resize image to target size"""
        return cv2.resize(image, ImagePreprocessor.TARGET_SIZE)

    @staticmethod
    def apply_clahe(image: np.ndarray) -> np.ndarray:
        """Apply CLAHE for better contrast"""
        if len(image.shape) == 3:
            # Convert to grayscale, apply CLAHE, convert back
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            gray = clahe.apply(gray)
            # Convert back to RGB
            return cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
        return image

    @classmethod
    def preprocess_for_model(cls, image_bytes: bytes) -> np.ndarray:
        """
        SIMPLE and CORRECT preprocessing for API inference
        """
        # 1. Load as uint8 (0-255)
        image = cls.load_image(image_bytes)
        
        # 2. Resize
        image = cls.resize(image)
        
        # 3. Optional: Apply CLAHE
        image = cls.apply_clahe(image) # <--- THIS LINE IS NOW ACTIVE!
        
        # 4. Apply DenseNet preprocessing (handles scaling/normalization)
        from tensorflow.keras.applications.densenet import preprocess_input
        image = preprocess_input(image) # Expects 0-255 input from CLAHE step
        
        return image

    @classmethod
    def preprocess_for_training(cls, image_path: str) -> np.ndarray:
        """
        Identical preprocessing for training features
        """
        # Load as uint8
        img = Image.open(image_path).convert("RGB")
        image = np.array(img)
        
        # Resize
        image = cls.resize(image)
        
        # 3. Apply CLAHE
        image = cls.apply_clahe(image) # <--- THIS LINE IS NOW ACTIVE!
        
        # Apply DenseNet preprocessing
        from tensorflow.keras.applications.densenet import preprocess_input
        image = preprocess_input(image)
        
        return image


# Test function
def test_preprocessing_fixed():
    """Test the fixed preprocessing"""
    print("🧪 Testing FIXED preprocessing")
    print("="*60)
    
    # Test with a sample image
    test_path = "dataset/test/NORMAL/IM-0013-0001.jpg"
    
    # Method 1: From file
    from_file = ImagePreprocessor.preprocess_for_training(test_path)
    print(f"From file:")
    print(f"  Shape: {from_file.shape}")
    print(f"  Range: [{from_file.min():.3f}, {from_file.max():.3f}]")
    print(f"  Mean: {from_file.mean():.3f}")
    
    # Method 2: From bytes
    with open(test_path, 'rb') as f:
        image_bytes = f.read()
    from_bytes = ImagePreprocessor.preprocess_for_model(image_bytes)
    print(f"\nFrom bytes:")
    print(f"  Shape: {from_bytes.shape}")
    print(f"  Range: [{from_bytes.min():.3f}, {from_bytes.max():.3f}]")
    print(f"  Mean: {from_bytes.mean():.3f}")
    
    # Check if they're similar
    diff = np.abs(from_file - from_bytes).mean()
    print(f"\nMean difference: {diff:.6f}")
    
    if diff < 0.01:
        print("✅ Preprocessing is consistent!")
    else:
        print("⚠️  Preprocessing inconsistency!")
    
    # Test DenseNet feature extraction
    from tensorflow.keras.applications import DenseNet121
    densenet = DenseNet121(
        weights='imagenet',
        include_top=False,
        input_shape=(224, 224, 3),
        pooling='avg'
    )
    densenet.trainable = False
    
    features = densenet.predict(np.expand_dims(from_bytes, axis=0), verbose=0)
    print(f"\nDenseNet features:")
    print(f"  Shape: {features.shape}")
    print(f"  Min: {features.min():.6f}, Max: {features.max():.6f}, Mean: {features.mean():.6f}")
    
    if np.all(features == 0):
        print("❌ CRITICAL: Features are all zeros!")
    else:
        print("✅ Features look good!")


if __name__ == "__main__":
    test_preprocessing_fixed()