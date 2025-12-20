import os
import numpy as np
import tensorflow as tf
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Tuple, Dict

# Scikit-learn Tools
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.calibration import CalibratedClassifierCV

# TensorFlow / Keras
from tensorflow.keras.applications import DenseNet121
from tensorflow.keras.applications.densenet import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# ⚠️ Make sure your 'preprocessing.py' is in the same folder
from preprocessing import ImagePreprocessor

# -----------------------------
# CONFIG
# -----------------------------
DATASET_DIR = "dataset"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)
CLASS_NAMES = ["NORMAL", "PNEUMONIA"]

# -----------------------------
# DATA GENERATOR LOGIC
# -----------------------------
def get_data_generators(data_dir: str, batch_size: int, target_size: Tuple[int, int]):
    """Creates generators with CLAHE + DenseNet preprocessing."""
    
    # Training Data with Augmentation
    train_datagen = ImageDataGenerator(
        rotation_range=15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        shear_range=0.1,
        zoom_range=0.1,
        horizontal_flip=True,
        fill_mode='nearest',
        preprocessing_function=lambda x: preprocess_input(ImagePreprocessor.apply_clahe(x.astype('uint8')))
    )
    
    # Test/Val Data (No Augmentation)
    test_val_datagen = ImageDataGenerator(
        preprocessing_function=lambda x: preprocess_input(ImagePreprocessor.apply_clahe(x.astype('uint8')))
    )

    train_gen = train_datagen.flow_from_directory(
        os.path.join(data_dir, 'train'), target_size=target_size,
        batch_size=batch_size, class_mode='categorical', color_mode='rgb', shuffle=True
    )
    
    test_gen = test_val_datagen.flow_from_directory(
        os.path.join(data_dir, 'test'), target_size=target_size,
        batch_size=batch_size, class_mode='categorical', color_mode='rgb', shuffle=False
    )
    
    return train_gen, test_gen

def extract_features(generator, feature_extractor):
    """Extracts features (avg pooling) from DenseNet."""
    generator.reset()
    features = feature_extractor.predict(generator, verbose=1)
    labels = generator.classes
    return features, labels

# -----------------------------
# MAIN TRAINING PIPELINE
# -----------------------------
def main():
    print("\n" + "="*60)
    print("🚀 STARTING REAL FIX TRAINING PIPELINE")
    print("="*60)
    
    # 1. Prepare Data
    train_gen, test_gen = get_data_generators(DATASET_DIR, BATCH_SIZE, IMG_SIZE)
    
    # 2. Load Feature Extractor
    print("\n🏗️ Loading DenseNet121...")
    densenet = DenseNet121(weights='imagenet', include_top=False, 
                          input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3), pooling='avg')
    densenet.trainable = False
    
    # 3. Extract Features
    print("\n2️⃣ Extracting features (This may take a few minutes)...")
    X_train, y_train = extract_features(train_gen, densenet)
    X_test, y_test = extract_features(test_gen, densenet)

    # 4. Train Models with Calibration
    print("\n3️⃣ Training ML Models with Pipelines & Calibration...")
    
    # --- MODEL A: CALIBRATED SVM ---
    print("🔹 Training Calibrated SVM...")
    svm_pipe = Pipeline([
        ('scaler', StandardScaler()), 
        ('svm', SVC(kernel="rbf", probability=True, class_weight='balanced', random_state=42))
    ])
    # Sigmoid calibration "stretches" the confidence scores
    calibrated_svm = CalibratedClassifierCV(svm_pipe, method='sigmoid', cv=3)
    calibrated_svm.fit(X_train, y_train)

    # --- MODEL B: CALIBRATED RANDOM FOREST ---
    print("🔹 Training Calibrated Random Forest...")
    rf_base = RandomForestClassifier(n_estimators=200, class_weight='balanced', random_state=42)
    calibrated_rf = CalibratedClassifierCV(rf_base, method='sigmoid', cv=3)
    calibrated_rf.fit(X_train, y_train)

    # --- MODEL C: CALIBRATED LOGISTIC REGRESSION ---
    print("🔹 Training Calibrated Logistic Regression...")
    lr_pipe = Pipeline([
        ('scaler', StandardScaler()),
        ('lr', LogisticRegression(max_iter=2000, class_weight='balanced', random_state=42))
    ])
    calibrated_lr = CalibratedClassifierCV(lr_pipe, method='sigmoid', cv=3)
    calibrated_lr.fit(X_train, y_train)

    # 5. Save & Evaluate
    all_models = {
        "svm.pkl": calibrated_svm,
        "random_forest.pkl": calibrated_rf,
        "logistic_regression.pkl": calibrated_lr
    }

    print("\n" + "="*60)
    print("📊 FINAL TEST EVALUATION")
    print("="*60)

    for filename, model in all_models.items():
        preds = model.predict(X_test)
        acc = accuracy_score(y_test, preds)
        print(f"✅ {filename}: Accuracy = {acc:.4f}")
        joblib.dump(model, os.path.join(MODEL_DIR, filename))

    print("\n✅ ALL MODELS SAVED TO /models")
    print("🚀 RUN debug_features.py TO TEST THE NEW BRAINS!")

if __name__ == "__main__":
    main()