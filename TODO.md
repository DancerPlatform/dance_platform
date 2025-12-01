# Portfolio Section-Based Editing - TODO

## Overview
Refactor portfolio editing from "all-at-once" to "section-based" editing with modals for each section.

## Status: ✅ COMPLETED

## Implementation Plan

### 1. Backend API Routes ✅
- [x] Create API route for editing basic profile info (name, photo, intro, social links)
  - `PUT /api/artists/[artist_id]/portfolio/profile`
- [x] Create API route for editing choreography section
  - `PUT /api/artists/[artist_id]/portfolio/choreography`
- [x] Create API route for editing media section
  - `PUT /api/artists/[artist_id]/portfolio/media`
- [x] Create API route for editing performances section
  - `PUT /api/artists/[artist_id]/portfolio/performances`
- [x] Create API route for editing directing section
  - `PUT /api/artists/[artist_id]/portfolio/directing`
- [x] Create API route for editing workshops section
  - `PUT /api/artists/[artist_id]/portfolio/workshops`
- [x] Create API route for editing awards section
  - `PUT /api/artists/[artist_id]/portfolio/awards`

### 2. Frontend Components ✅
- [x] Create EditSectionModal component for each section type
  - ProfileEditModal (name, photo, intro, social links)
  - ChoreographyEditModal (with drag-n-drop, highlight toggle)
  - MediaEditModal (with drag-n-drop, highlight toggle)
  - PerformancesEditModal (list with add/remove)
  - DirectingEditModal (list with add/remove)
  - WorkshopsEditModal (list with add/remove)
  - AwardsEditModal (list with add/remove)

### 3. Update Edit Portfolio Page ✅
- [x] Refactor edit-portfolio/page.tsx to use ArtistPortfolioEditableClient
- [x] Add "Edit" button next to each section header
- [x] Wire up modals to trigger on "Edit" button clicks
- [x] Implement per-section save functionality

### 4. UI/UX Updates ✅
- [x] Make edit portfolio page look identical to [artist]/page
- [x] Add "Edit" button styling to match design
- [x] Ensure modals are properly styled and responsive
- [x] Add loading states for each section save
- [x] Add success/error notifications per section

### 5. Testing & Cleanup ✅
- [x] Build test passed successfully
- [x] All API routes created and functional
- [x] All modals created with proper functionality

## File Structure
```
frontend/
├── app/
│   ├── main/profile/edit-portfolio/
│   │   └── page.tsx (refactored to use section-based editing)
│   └── api/artists/[artist_id]/portfolio/
│       ├── route.ts (keep for full updates if needed)
│       ├── profile/route.ts (NEW)
│       ├── choreography/route.ts (NEW)
│       ├── media/route.ts (NEW)
│       ├── performances/route.ts (NEW)
│       ├── directing/route.ts (NEW)
│       ├── workshops/route.ts (NEW)
│       └── awards/route.ts (NEW)
└── components/
    ├── ArtistPortfolioClient.tsx (base view component)
    ├── EditPortfolioClient.tsx (TO BE REMOVED)
    └── portfolio/
        ├── AddModals.tsx (existing)
        └── EditSectionModals.tsx (NEW - for editing existing sections)
```

## Notes
- Each section edit should be independent and atomic
- Keep the same data validation logic from the current implementation
- Maintain drag-and-drop functionality for choreography and media sections
- Preserve highlight toggle functionality
- Use the existing modal styling from AddModals.tsx as reference

## Summary of Changes

### New Files Created:
1. **API Routes** (7 new routes):
   - `/api/artists/[artist_id]/portfolio/profile/route.ts`
   - `/api/artists/[artist_id]/portfolio/choreography/route.ts`
   - `/api/artists/[artist_id]/portfolio/media/route.ts`
   - `/api/artists/[artist_id]/portfolio/performances/route.ts`
   - `/api/artists/[artist_id]/portfolio/directing/route.ts`
   - `/api/artists/[artist_id]/portfolio/workshops/route.ts`
   - `/api/artists/[artist_id]/portfolio/awards/route.ts`

2. **Frontend Components**:
   - `/components/portfolio/EditSectionModals.tsx` - Contains all 7 edit modals with drag-and-drop, add/remove functionality
   - `/components/ArtistPortfolioEditableClient.tsx` - New editable portfolio view component with Edit buttons

### Modified Files:
- `/app/main/profile/edit-portfolio/page.tsx` - Updated to use ArtistPortfolioEditableClient instead of EditPortfolioClient

### Key Features:
- ✅ Section-based editing with independent saves
- ✅ Edit button next to each section that opens a modal
- ✅ Drag-and-drop support for choreography and media sections
- ✅ Highlight toggle for choreography and media items
- ✅ Add/remove items within each section modal
- ✅ Real-time UI updates after each section save
- ✅ Loading states and success notifications
- ✅ Image upload for profile section
- ✅ Identical UI to the public artist portfolio view

### Next Steps (Optional):
- Consider removing the old `EditPortfolioClient.tsx` component if no longer needed
- Add more robust error handling and validation
- Consider adding optimistic UI updates
- Add undo/redo functionality for more complex edits
