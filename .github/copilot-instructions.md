# Copilot Instructions for Clipora (Sinply)

## Project Architecture
- **Monorepo Structure:**
  - `Backend/`: FastAPI microservices for video/audio processing (AI music, noise reduction, background removal, etc.)
  - `Frontend/`: Vite + React + Tailwind web client for video editing
  - `react-video-editor-master/`: Main React video editor UI, integrates with Backend via REST endpoints
- **Service Boundaries:**
  - Each backend feature (e.g., AI music, noise reduction) is a separate Python module with its own router and logic
  - Frontend calls backend endpoints (see `toolToEndpoint` in `Sidebar.tsx`) for processing tasks

## Developer Workflows
- **Backend:**
  - Setup: `python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt`
  - Run: `uvicorn main:app --reload` (serves at `http://localhost:8000`)
  - API docs: `http://localhost:8000/docs`
- **Frontend:**
  - Setup: `npm install` in `Frontend/` or `react-video-editor-master/`
  - Run: `npm run dev` (Vite dev server)
- **AI Music Library:**
  - Setup: `python setup_music_library.py --setup`
  - Import: `python setup_music_library.py --import <dir>`
  - Download: `python setup_music_library.py --download`

## Key Patterns & Conventions
- **React UI:**
  - Sidebar and MenuList use absolute positioning and Tailwind for layout
  - Tooltips for buttons: Use a `span` with `group-hover:opacity-100` for hover text (see `Sidebar.tsx`, `menu-list.tsx`)
  - State managed via Zustand (`useStore`, `useLayoutStore`)
- **Backend:**
  - Each feature has its own router (e.g., `ai_music_router.py`, `bg_remover_router.py`)
  - Results and uploads stored in `Backend/results/` and `Backend/uploads/`
- **Integration:**
  - Frontend calls backend endpoints mapped in `toolToEndpoint` (see `Sidebar.tsx`)
  - Video/audio files are sent via `FormData` POST requests

## External Dependencies
- **Frontend:** React, TailwindCSS, Zustand, DesignCombo, ShaCDN
- **Backend:** FastAPI, PyTorch (for AI/ML), various music/video libraries

## Examples
- **Sidebar Button:**
  ```tsx
  <div className="relative group">
    <button>...</button>
    <span className="absolute ... group-hover:opacity-100">Label</span>
  </div>
  ```
- **Backend Endpoint Mapping:**
  ```ts
  const toolToEndpoint = {
    bg_removal: '/process/bg_remover',
    ...
  };
  ```

## Tips
- Always activate the correct Python environment before running backend scripts
- Use the provided REST endpoints for all video/audio processing
- Keep UI tooltips and button labels in sync with backend feature names

---

For more details, see:
- `README.md` in root, `Backend/`, and `react-video-editor-master/`
- Example backend routers in `Backend/sniply_*_router.py`
- Frontend integration in `Sidebar.tsx`, `menu-list.tsx`
