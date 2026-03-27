---
description: How to start the ZeroWaste AI application (frontend + backend together)
---

# Starting ZeroWaste AI

**Always use the root-level command** to start both services together. This prevents the recurring "backend not running" error.

## One-Command Start (Recommended)

// turbo
1. Navigate to the `zerowaste-ai` directory and run both services:
```
cd zerowaste-ai && npm run dev
```
This uses `concurrently` to start the backend (port 3001) and frontend (port 5173) together in one terminal.

## Alternative: Windows Batch File

2. Double-click `zerowaste-ai/start.bat` from File Explorer. This opens separate terminal windows for:
   - Backend Server (port 3001)
   - React Frontend (port 5173)
   - AI Microservice (port 5001)

## Troubleshooting

- If port 3001 is already in use, the server's `predev` script auto-kills it.
- If login shows "could not load your profile", the backend isn't running — use the one-command start above.
- Check backend health: `curl http://localhost:3001/health`
