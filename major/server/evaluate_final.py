import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report
from final_predictor import PneumoniaAI

def run_evaluation(test_dir):
    ai = PneumoniaAI()
    y_true = []
    y_pred = []
    
    print("\n🔍 Evaluating Model on Test Set...")
    
    for label, class_name in enumerate(["NORMAL", "PNEUMONIA"]):
        class_path = os.path.join(test_dir, class_name)
        if not os.path.exists(class_path): continue
        
        for img_name in os.listdir(class_path):
            img_path = os.path.join(class_path, img_name)
            result = ai.predict(img_path)
            
            y_true.append(label)
            y_pred.append(1 if result['diagnosis'] == "PNEUMONIA" else 0)

    # 1. Generate Confusion Matrix
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=["NORMAL", "PNEUMONIA"], 
                yticklabels=["NORMAL", "PNEUMONIA"])
    plt.title('Final Project: Confusion Matrix')
    plt.ylabel('Actual Label')
    plt.xlabel('Predicted Label')
    plt.savefig('confusion_matrix.png')
    print("\n✅ Confusion Matrix saved as 'confusion_matrix.png'")

    # 2. Print Detailed Metrics
    print("\n📊 Classification Report:")
    print(classification_report(y_true, y_pred, target_names=["NORMAL", "PNEUMONIA"]))

if __name__ == "__main__":
    # Ensure this points to your test folder
    run_evaluation("dataset/test")