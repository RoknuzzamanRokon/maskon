# Design Document

## Overview

The public portfolio pages system extends the existing portfolio functionality to provide dedicated browsing experiences for visitors. The design leverages the existing portfolio API and database structure while creating new frontend pages optimized for project discovery and detailed viewing.

The system builds upon:

- Existing `portfolio` table and `/api/portfolio` endpoint
- Current portfolio display components and styling patterns
- Established Next.js routing and component architecture
- Existing responsive design system with Tailwind CSS

## Architecture

### Frontend Architecture

The frontend follows the existing Next.js 14 pattern with:

- **App Router**: New routes for `/projects` and `/projects/[id]`
- **Server Components**: For SEO optimization and fast initial loads
- **Client Components**: For interactive filtering and navigation
- **Dynamic Routing**: Individual project pages with slug-based URLs
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### URL Structure

```
/projects                    # All projects listing page
/projects/[id]              # Individual project detail page
/projects?filter=technology # Filtered projects (optional enhancement)
```

### Data Flow

```mermaid
graph TD
    A[User visits /projects] --> B[Projects Listing Page]
    B --> C[Fetch all portfolio items via API]
    C --> D[Display projects grid with filters]
    D --> E[User clicks project card]
    E --> F[Navigate to /projects/[id]]
    F --> G[Project Detail Page]
    G --> H[Fetch specific project data]
    H --> I[Display detailed project view]
    I --> J[User clicks Back to Projects]
    J --> B
```

## Components and Interfaces

### 1. Projects Listing Page (`/projects`)

**Location**: `/frontend/app/projects/page.tsx`

**Features**:

- Grid layout displaying all portfolio projects
- Filter/search functionality by technology
- Responsive design (1-4 columns based on screen size)
- Loading states and empty states
- Pagination for large project collections
- SEO optimization with metadata

**Component Structure**:

```tsx
ProjectsPage
├── ProjectsHeader (title, description, filters)
├── ProjectsGrid
│   ├── ProjectCard (repeatable)
│   └── LoadingSkeletons
├── ProjectsFilters (technology tags, search)
└── Pagination (if needed)
```

### 2. Individual Project Detail Page (`/projects/[id]`)

**Location**: `/frontend/app/projects/[id]/page.tsx`

**Features**:

- Hero section with project image
- Detailed project information
- Technology tags display
- External links (project URL, GitHub)
- Navigation back to projects listing
- SEO optimization with dynamic metadata
- Social sharing capabilities

**Component Structure**:

```tsx
ProjectDetailPage
├── ProjectHero (image, title, quick info)
├── ProjectContent
│   ├── ProjectDescription
│   ├── TechnologyTags
│   ├── ProjectLinks (external URLs)
│   └── ProjectMetadata (date, etc.)
├── ProjectNavigation (back button, related projects)
└── ProjectActions (share, contact)
```

### 3. Reusable Components

#### ProjectCard Component

**Location**: `/frontend/app/components/ProjectCard.tsx`

```tsx
interface ProjectCardProps {
  project: PortfolioItem;
  onClick?: () => void;
  showFullDescription?: boolean;
  size?: "small" | "medium" | "large";
}
```

**Features**:

- Hover animations and transitions
- Responsive image handling
- Technology tags preview
- Click handling for navigation
- Accessibility support

#### ProjectFilters Component

**Location**: `/frontend/app/components/ProjectFilters.tsx`

```tsx
interface ProjectFiltersProps {
  projects: PortfolioItem[];
  onFilterChange: (filters: FilterState) => void;
  activeFilters: FilterState;
}
```

**Features**:

- Technology-based filtering
- Search input with debouncing
- Clear filters functionality
- Filter state management

## Data Models

### Enhanced Portfolio Item Interface

```typescript
interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  technologies: string;
  project_url?: string;
  github_url?: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

interface ProjectFilters {
  search?: string;
  technologies?: string[];
  sortBy?: "newest" | "oldest" | "title";
}

interface ProjectPageProps {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}
```

### API Integration

The pages will use existing API endpoints:

- `GET /api/portfolio` - Fetch all projects for listing
- Individual project data extracted from the full list by ID

**Future Enhancement**: Add dedicated endpoint for single project:

- `GET /api/portfolio/{id}` - Fetch individual project details

## User Experience Design

### Projects Listing Page UX

**Layout**:

- Header with page title and description
- Filter/search bar prominently displayed
- Responsive grid (1 col mobile, 2 col tablet, 3-4 col desktop)
- Each project card shows: image, title, tech tags, brief description
- Hover effects reveal additional information
- "Load More" or pagination for performance

**Interactions**:

- Click anywhere on card to view details
- Filter by clicking technology tags
- Search updates results in real-time
- Smooth animations between states

### Project Detail Page UX

**Layout**:

- Hero section with large project image (if available)
- Project title and technology tags prominently displayed
- Full description with proper typography
- Action buttons for external links
- Navigation breadcrumbs
- Related projects suggestions (future enhancement)

**Interactions**:

- Back button returns to projects listing
- External links open in new tabs
- Image gallery for multiple project images (future)
- Share buttons for social media

## Responsive Design Strategy

### Mobile (320px - 768px)

- Single column project grid
- Stacked filter controls
- Touch-optimized buttons and cards
- Simplified project detail layout
- Collapsible sections for long content

### Tablet (768px - 1024px)

- Two-column project grid
- Horizontal filter bar
- Larger project cards with more information
- Side-by-side content on detail pages

### Desktop (1024px+)

- Three to four-column project grid
- Full filter and search interface
- Rich hover interactions
- Detailed project cards
- Multi-column detail page layout

## Performance Considerations

### Image Optimization

- Next.js Image component for automatic optimization
- Lazy loading for project images
- WebP format with fallbacks
- Responsive image sizes

### Loading Performance

- Server-side rendering for initial page load
- Skeleton loaders during client-side navigation
- Prefetching for project detail pages
- Optimized bundle splitting

### SEO Optimization

- Dynamic metadata for each project page
- Structured data markup for projects
- Open Graph tags for social sharing
- Semantic HTML structure

## Error Handling

### Projects Listing Page

```tsx
// Loading state
if (isLoading) return <ProjectsLoadingSkeleton />;

// Error state
if (error) return <ProjectsErrorState onRetry={refetch} />;

// Empty state
if (projects.length === 0) return <EmptyProjectsState />;

// Success state
return <ProjectsGrid projects={projects} />;
```

### Project Detail Page

```tsx
// Loading state
if (isLoading) return <ProjectDetailSkeleton />;

// Not found
if (!project) return <ProjectNotFound />;

// Error state
if (error) return <ProjectErrorState onRetry={refetch} />;

// Success state
return <ProjectDetailView project={project} />;
```

## Accessibility Features

### Keyboard Navigation

- Tab order through project cards
- Enter/Space to activate project links
- Escape to close modals or return to previous page
- Arrow keys for grid navigation (enhancement)

### Screen Reader Support

- Semantic HTML structure (main, section, article)
- ARIA labels for interactive elements
- Alt text for all project images
- Skip links for main content

### Visual Accessibility

- High contrast color schemes
- Focus indicators for all interactive elements
- Scalable text and UI elements
- Color-blind friendly design choices

## Integration Points

### Existing Portfolio Page

- Update "View All Projects" button to link to `/projects`
- Maintain consistent styling and branding
- Share components where possible

### Admin Management

- Projects created/updated in admin automatically appear
- No additional backend changes required
- Consistent data structure

### Navigation

- Add projects link to main navigation
- Breadcrumb navigation on detail pages
- Related project suggestions

## Future Enhancements

### Phase 2 Features

- Project categories/tags system
- Advanced filtering (date range, complexity)
- Project search with full-text search
- User favorites/bookmarking
- Project comparison feature

### Phase 3 Features

- Project comments/feedback system
- Social sharing analytics
- Related projects algorithm
- Project showcase animations
- Multi-language support

## Technical Implementation Notes

### Routing Strategy

```
app/
├── projects/
│   ├── page.tsx              # Projects listing
│   ├── [id]/
│   │   └── page.tsx          # Project detail
│   ├── loading.tsx           # Loading UI
│   ├── error.tsx             # Error UI
│   └── not-found.tsx         # 404 UI
```

### State Management

- URL-based filter state for sharing/bookmarking
- Local state for UI interactions
- Server state via existing API calls
- No additional state management library needed

### Performance Metrics

- Target: < 2s initial page load
- Target: < 500ms navigation between projects
- Target: 95+ Lighthouse performance score
- Target: 100% accessibility score
