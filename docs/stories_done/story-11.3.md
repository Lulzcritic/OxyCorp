# Story 11.3: Directives HUD

**Epic:** Epic 11: Directives (Quest Engine)
**Role:** Player
**Goal:** I want to see my active missions constantly so I know what to focus on.

## Acceptance Criteria

1.  **Directives Widget**:
    - Create a persistent widget on the Dashboard.
    - Display up to 3 active quests.
    - Show progress bar: `current / target`.
2.  **Claim Interaction**:
    - When progress is 100%, show "CLAIM" button.
    - Click calls `POST /api/directives/claim`.
    - Animation: "Mission Complete" effect, then slot clears.
3.  **Daily Refresh**:
    - If slots are empty, show "Generate Daily" or "Refresh" button (calls `POST /api/directives/refresh` or `daily`).

## Technical Notes

- **Components**: `QuestCard`, `QuestProgress`.
- **Design**: "Holographic" overlay feel.
- **Updates**: Listen for global `quest:update` events if using websockets, or poll.

## Dev Agent Record

### Status

- [x] Directives Widget (quest cards on Dashboard)
- [x] Claim Interaction (progress bar, claim button)
- [x] Daily Refresh (generate button when empty)

### Completion Notes

- Created `DirectivesWidget.tsx` with:
  - Quest cards showing type, target, progress bar
  - "CLAIM REWARD" button when progress >= target
  - "GENERATE DAILY DIRECTIVES" button when no active quests
  - Purple/holographic color scheme
- Integrated into `Dashboard.tsx`.
- TypeScript build verified.

### File List

- `apps/web/src/components/DirectivesWidget.tsx`
- `apps/web/src/components/Dashboard.tsx`
