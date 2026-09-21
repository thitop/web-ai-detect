# AI Image Detector 🔍✨

**Live Demo:** [https://web-aidetect.web.app/](https://web-aidetect.web.app/) *(Please wait up to 1 minute for the server to spin up if it hasn't been used recently.)*

## Overview
AI Image Detector is a web application designed to classify images and determine whether they are **Real Photographs** or **AI-Generated**. It utilizes a Deep Learning model to process images, combining a robust Python FastAPI backend with a modern, glassmorphism-inspired React (Vite) frontend.

---

## 🛠️ Prerequisites
Before running this project, ensure you have the following installed on your machine:
- **Python** (Version 3.12 or newer)
- **Node.js** (Version 16 or newer)
- **Git** (optional, for cloning)

---

## 🚀 Getting Started
The system is divided into two main parts: the **Backend** and the **Frontend**. Both must be running simultaneously for the application to work.

### Part 1: Running the Backend (Server)
The backend handles the AI model processing using FastAPI and TensorFlow.

1. Open your terminal or command prompt.
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Create a Virtual Environment (Recommended):
   ```bash
   python -m venv venv
   ```
4. Activate the Virtual Environment:
   - **Windows:** `venv\Scripts\activate`
   - **macOS / Linux:** `source venv/bin/activate`
5. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *(Note: Ensure that the model file `fine_tuned_ai_model.h5` is placed inside the `backend/` directory).*
6. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   *You should see "Application startup complete". The backend is now running at `http://localhost:8000`.*

### Part 2: Running the Frontend (UI)
The frontend is built with React, Vite, and features a sleek modern UI.

1. Open a **new** terminal window (do not close the backend terminal).
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install the required Node dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 📖 User Guide
1. **Upload an Image:** Click on the central image frame or drag and drop your image (Supports `.jpg`, `.png`, `.webp`).
2. **Analyze:** Click the **"Analyze Image"** button. The app will show a scanning animation while the AI processes the image.
3. **View Results:** The result panel on the right will display:
   - **Label:** Whether the image is "Real" or "Fake (AI)".
   - **Confidence Score:** A progress bar showing how confident the AI is in its prediction.
   - **Raw Data:** JSON output of the exact API response.
4. **Reset:** Click the "Reset" button to clear the current image and test a new one.

---

## ⚠️ Troubleshooting

- **`npm install` throws an error:**
  Try deleting the `node_modules` folder and the `package-lock.json` file inside the `frontend` directory, then run `npm install` again.
- **"Failed to fetch" Error on the web page:**
  Ensure that the Backend server is running in your first terminal window and is actively listening on port 8000.
- **Model file not found error:**
  Double-check that `fine_tuned_ai_model.h5` is located directly inside the `backend/` directory (at the same level as the `app/` folder).
- **TensorFlow installation issues (Windows):**
  Ensure you are using a supported version of Python (e.g., Python 3.12). TensorFlow currently does not support Python 3.13+ on Windows without specific workarounds.

---
*Built with ❤️ using FastAPI, React, and TensorFlow.*
