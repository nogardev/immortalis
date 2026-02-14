# Assets Folder (Protected)

This folder is configured to sync directly with GitHub.

**⚠️ IMPORTANT FOR AI STUDIO USERS:**
The `.gitignore` file has been configured to ignore image files (`.png`, `.jpg`) in this directory locally.

**Why?**
The AI Studio environment is temporary and often doesn't download your binary image files. Without this protection, clicking "Sync" would cause the editor to think you deleted the files locally and delete them from GitHub too.

**How to add images:**
1. Upload them directly to this folder on GitHub (via browser).
2. The game code (`constants.ts`) is configured to read them from the "Raw GitHub" URL automatically.
