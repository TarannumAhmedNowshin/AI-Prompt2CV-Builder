# Database Migration Instructions

## Issue Fixed
The research and experience sections were being combined into a single field, causing data loss and display issues. This migration adds separate `projects` and `research` columns to properly store and retrieve this data.

## Changes Made
1. **Backend Models**: Added `projects` and `research` columns to CV and CVVersion models
2. **Backend Schemas**: Updated CV schemas to include the new fields
3. **Frontend**: Updated conversion functions to properly save and load research/projects data separately

## Running the Migration

### Step 1: Stop the Backend Server
If your backend is running, stop it first (Ctrl+C in the terminal).

### Step 2: Run the Migration Script
```bash
cd backend
python migrate_add_projects_research.py
```

When prompted, type `yes` to proceed with the migration.

### Step 3: Restart the Backend
```bash
python start_backend.py
```
Or use:
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 4: Refresh Your Browser
After the backend restarts, refresh your browser page to see the changes.

## What This Fixes
- ✅ Research data now saves in its own field (no longer mixed with experience)
- ✅ Projects data now saves in its own field
- ✅ Professional Experience stays separate
- ✅ Data displays correctly in CV previews
- ✅ Version history properly tracks all sections

## Notes
- Existing data in the combined `experience` field will remain intact
- New entries will be saved to the appropriate separate fields
- The migration is non-destructive and can be run multiple times safely
