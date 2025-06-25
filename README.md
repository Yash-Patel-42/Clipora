# Sniply_vsCode - Setup & Run Instructions

This guide will help you set up and run.

---

## 1. Clone the Repository

```bash
# Using HTTPS
git clone <repo-url>
# Or download the ZIP and unzip it
```

---

## 2. Backend Setup (FastAPI)

1. **Open a terminal and navigate to the Backend folder:**
   ```bash
   cd Backend
   ```
2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   # Activate it:
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Start the backend server:**
   ```bash
   uvicorn main:app --reload
   ```
   - The backend will run at [http://localhost:8000](http://localhost:8000)
   - API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 3. Frontend Setup (Vite + React + Tailwind)

1. **Open a new terminal and navigate to the Frontend folder:**
   ```bash
   cd Frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set the backend URL (optional):**
   - Create a `.env` file in the `Frontend` folder with:
     ```env
     VITE_BACKEND_URL=http://localhost:8000
     ```
4. **Start the frontend dev server:**
   ```bash
   npm run dev
   ```
   - The frontend will run at [http://localhost:5173](http://localhost:5173) (default Vite port)

---

## 4. Usage

- Open [http://localhost:5173](http://localhost:5173) in your browser.
- Upload a video, select a processing option (background removal or noise reduction), and download the result.

---

## 5. Notes
- Make sure you have Python 3.8+ and Node.js 16+ installed.
- FFmpeg must be installed and available in your system PATH for video processing.
- For GPU acceleration with `rembg`, additional setup may be required (see rembg docs).

---
