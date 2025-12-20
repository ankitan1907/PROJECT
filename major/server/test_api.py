"""
Test the API endpoints - FIXED VERSION
"""
import requests
import json
import os

def test_api():
    # Test health endpoint
    print("🧪 Testing API health...")
    try:
        health_response = requests.get("http://localhost:8000/api/health")
        print(f"✅ Health: {health_response.json()}")
    except:
        print("❌ Cannot connect to API. Is the server running?")
        print("Run: python main.py")
        return
    
    # Find any test image
    test_images = []
    for ext in ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']:
        for file in os.listdir('.'):
            if file.endswith(ext):
                test_images.append(file)
    
    if not test_images:
        print("❌ No test images found in current directory!")
        print("Please place a test X-ray image in this folder.")
        return
    
    # Use the first image found
    test_image = test_images[0]
    print(f"\n📁 Found test image: {test_image}")
    
    # Test upload
    print(f"📤 Uploading {test_image}...")
    try:
        with open(test_image, "rb") as f:
            files = {"file": f}
            response = requests.post("http://localhost:8000/api/analyze", files=files)
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Analysis successful!")
            print(f"📋 ID: {result['id']}")
            print(f"🏥 Diagnosis: {result['analysis']['diagnosis']}")
            print(f"🎯 Confidence: {result['analysis']['confidence']*100:.1f}%")
            print(f"📊 Ensemble Score: {result.get('ensemble_score', 0)*100:.1f}%")
            
            # Check ML scores
            if 'model_scores' in result:
                ml = result['model_scores']
                print(f"🤖 ML Scores:")
                print(f"   SVM: {ml.get('svm', 0)*100:.1f}%")
                print(f"   Random Forest: {ml.get('rf', 0)*100:.1f}%")
                print(f"   Logistic Regression: {ml.get('lr', 0)*100:.1f}%")
            
            # Check heatmap
            if 'heatmap' in result and result['heatmap'].get('heatmap'):
                print(f"🔥 Heatmap: Generated ✓")
            
            # Check segmentation
            if 'segmentation' in result and result['segmentation'].get('mask'):
                print(f"🫁 Segmentation: Generated ✓")
            
            # Save result to file
            with open("api_test_result.json", "w") as f:
                json.dump(result, f, indent=2)
            print("\n💾 Result saved to api_test_result.json")
            
            # Show summary
            print("\n" + "="*50)
            print("SUMMARY:")
            print("="*50)
            print(f"Diagnosis: {result['analysis']['diagnosis']}")
            print(f"Confidence: {result['analysis']['confidence']*100:.1f}%")
            print(f"Severity: {result['analysis']['severity']}")
            print(f"Risk Level: {result['analysis']['risk_level']}")
            print("="*50)
            
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except FileNotFoundError:
        print(f"❌ Image file not found: {test_image}")
    except Exception as e:
        print(f"❌ Upload failed: {str(e)}")

def test_with_sample_data():
    """Test with a simple POST request"""
    print("\n🧪 Testing with sample data...")
    
    # You can also test with a URL to an image
    sample_image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Chest_X-ray_Pneumonia.jpg/320px-Chest_X-ray_Pneumonia.jpg"
    
    try:
        # Download the image first
        import urllib.request
        print(f"📥 Downloading sample image...")
        urllib.request.urlretrieve(sample_image_url, "sample_pneumonia.jpg")
        
        # Test with the downloaded image
        with open("sample_pneumonia.jpg", "rb") as f:
            files = {"file": f}
            response = requests.post("http://localhost:8000/api/analyze", files=files)
        
        if response.status_code == 200:
            print("✅ Sample test successful!")
            result = response.json()
            print(f"Diagnosis: {result['analysis']['diagnosis']}")
        else:
            print(f"❌ Sample test failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Sample test error: {str(e)}")

if __name__ == "__main__":
    print("="*60)
    print("PNEUMONIA AI API TESTER")
    print("="*60)
    
    # First, check if server is running
    test_api()
    
    # Optional: Test with sample data
    # test_with_sample_data()