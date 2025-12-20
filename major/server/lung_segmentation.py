import numpy as np
import cv2
from typing import Tuple
from scipy import ndimage


class LungSegmentation:
    """Lung segmentation using image processing techniques"""
    
    @staticmethod
    def segment_lungs(image: np.ndarray) -> Tuple[np.ndarray, np.ndarray, dict]:
        """
        Segment lungs from chest X-ray
        Returns: segmented mask, contours, metrics
        """
        if image.max() <= 1.0:
            img_uint8 = (image * 255).astype(np.uint8)
        else:
            img_uint8 = image.astype(np.uint8)
        
        if len(img_uint8.shape) == 3:
            img_uint8 = cv2.cvtColor(img_uint8, cv2.COLOR_BGR2GRAY)
        
        blurred = cv2.GaussianBlur(img_uint8, (5, 5), 0)
        
        _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
        binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
        
        # FIX: Handle different OpenCV versions (3.x vs 4.x)
        # OpenCV 3 returns: image, contours, hierarchy
        # OpenCV 4 returns: contours, hierarchy
        result = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if len(result) == 3:
            # OpenCV 3.x
            _, contours, _ = result
        else:
            # OpenCV 4.x
            contours, _ = result
        
        if contours is None or len(contours) == 0:
            return binary.astype(np.float32) / 255.0, None, {}
        
        lung_contours = sorted(contours, key=cv2.contourArea, reverse=True)[:2]
        
        mask = np.zeros_like(binary)
        cv2.drawContours(mask, lung_contours, -1, 255, -1)
        
        metrics = LungSegmentation._compute_segmentation_metrics(mask, img_uint8, lung_contours)
        
        return mask.astype(np.float32) / 255.0, lung_contours, metrics
    
    @staticmethod
    def _compute_segmentation_metrics(mask: np.ndarray, image: np.ndarray, contours) -> dict:
        """Compute segmentation quality metrics"""
        total_pixels = mask.size
        lung_pixels = np.count_nonzero(mask)
        
        coverage = lung_pixels / total_pixels if total_pixels > 0 else 0
        
        lung_intensity = np.mean(image[mask > 0]) if lung_pixels > 0 else 0
        background_intensity = np.mean(image[mask == 0]) if total_pixels - lung_pixels > 0 else 0
        
        contrast = abs(float(lung_intensity) - float(background_intensity)) / 255.0
        
        return {
            "coverage_percentage": float(coverage * 100),
            "lung_pixels": int(lung_pixels),
            "lung_intensity": float(lung_intensity),
            "background_intensity": float(background_intensity),
            "contrast": float(contrast),
            "num_lungs_detected": len(contours),
        }
    
    @staticmethod
    def apply_segmentation_overlay(image: np.ndarray, mask: np.ndarray, alpha: float = 0.3) -> np.ndarray:
        """Apply segmentation mask as overlay"""
        if image.max() <= 1.0:
            image = (image * 255).astype(np.uint8)
        else:
            image = image.astype(np.uint8)
        
        if len(image.shape) == 2:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
        
        if mask.max() <= 1.0:
            mask = (mask * 255).astype(np.uint8)
        else:
            mask = mask.astype(np.uint8)
        
        colored_mask = np.zeros_like(image)
        colored_mask[:, :, 1] = mask
        
        overlay = cv2.addWeighted(image, 1 - alpha, colored_mask, alpha, 0)
        return overlay