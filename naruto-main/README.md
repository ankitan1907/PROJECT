# 🍥 Naruto Ultimate Jutsu Engine

A high-fidelity, interactive web application that leverages MediaPipe's AI vision to bring jutsu mastery into the browser. Perform iconic hand gestures to trigger cinematic visual effects and sound.

## ✨ Features

- **Gesture Activation:**
  - **Chidori (Sasuke):** Raise your left hand to manifest the lightning blade.
  - **Rasenshuriken (Naruto):** Raise your right hand to spawn the wind shuriken.
  - **Shadow Clone Jutsu:** Form the secret sign to create multiple interactive clones of yourself.
- **Chakra Synchronization (AI Training):** A custom module to train the engine to recognize your specific hand signs for Shadow Clone Jutsu.
- **Dynamic VFX & Particles:** Real-time canvas rendering with segmentation-based clones, smoke animations, and hand-mapped video overlays.
- **Cinematic Experience:** Immersive SFX and a premium dark-themed UI.

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome/Edge recommended).
- A functional webcam.

### Installation
1. Clone or download this repository.
2. Open `index.html` in your browser.
   - *Note: For the best experience (and to avoid CORS issues with MediaPipe), it is recommended to run this using a local server (e.g., Live Server extension in VS Code).*

## 🛠️ Technology Stack
- **AI/Vision:** MediaPipe (Holistic, Hands, Selfie Segmentation).
- **Frontend:** HTML5, CSS3, Vanilla JavaScript.
- **Graphics:** HTML5 Canvas (2D).
- **Media:** HTML5 Video & Audio.

## 📁 Project Structure
- `index.html`: Main UI and MediaPipe integration.
- `styles.css`: Cinematic styling and animations.
- `engine.js`: Core logic for tracking, training, and rendering.
- `assets/`: Contains all character visuals, video effects, and sounds.

## 📜 License
This project is for educational and fan purposes. Naruto is owned by Masashi Kishimoto/Shueisha.
