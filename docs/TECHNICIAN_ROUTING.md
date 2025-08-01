# Technician Portal URL-Based Routing

## Overview

The technician portal has been refactored to use traditional URL-based routing instead of state-based navigation. This provides better user experience with proper browser navigation, bookmarking, and sharing capabilities.

## URL Structure

### Base Routes
- `/technician` - Default technician portal (redirects to assigned jobs)
- `/technician/assigned-jobs` - View assigned jobs
- `/technician/completed-jobs` - View completed jobs
- `/technician/job/[jobId]` - View specific job details

### Navigation Flow
1. User logs in as technician → redirected to `/technician`
2. `/technician` automatically redirects to `/technician/assigned-jobs`
3. User can navigate between assigned and completed jobs using the navigation bar
4. Clicking on a job redirects to `/technician/job/[jobId]`
5. Completing a job redirects back to `/technician/assigned-jobs`

## Architecture

### Context Provider
- `TechnicianContext` manages shared state across all technician pages
- Provides technician data, job lists, and job completion functionality
- Wraps all technician pages in the layout

### Layout Structure
```
app/technician/
├── layout.tsx              # Main layout with header and navigation
├── page.tsx                # Default page (redirects to assigned jobs)
├── assigned-jobs/
│   └── page.tsx           # Assigned jobs page
├── completed-jobs/
│   └── page.tsx           # Completed jobs page
└── job/
    └── [jobId]/
        └── page.tsx       # Job detail page
```

### Components
- `TechnicianHeader` - Header with logout functionality
- `TechnicianNavigation` - Navigation bar with job counts
- `AssignedJobs` - List of assigned jobs
- `CompletedJobs` - List of completed jobs
- `JobDetail` - Detailed job view with completion form

## Benefits

1. **Browser Navigation** - Users can use back/forward buttons
2. **Bookmarking** - Direct links to specific pages
3. **Sharing** - URLs can be shared and bookmarked
4. **SEO Friendly** - Each page has its own URL
5. **Better UX** - Clear navigation structure
6. **State Management** - Centralized state via context

## Migration from State-Based Routing

The old `TechnicianPortal` component has been updated to redirect to the new URL structure, ensuring backward compatibility during the transition.

## Usage

```typescript
// Navigate to assigned jobs
router.push('/technician/assigned-jobs')

// Navigate to specific job
router.push(`/technician/job/${jobId}`)

// Navigate to completed jobs
router.push('/technician/completed-jobs')
```

## Context Usage

```typescript
import { useTechnician } from '@/contexts/TechnicianContext'

function MyComponent() {
  const { 
    technician, 
    assignedJobs, 
    completedJobs, 
    handleJobComplete 
  } = useTechnician()
  
  // Use the shared state and functions
}
``` 