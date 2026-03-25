# Receipt Management Dashboard - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Dashboard (page.tsx)                  │
│  - State management (retailer, search, filters)         │
│  - Render Sidebar + Main Content                        │
└────────────┬────────────────────────────┬───────────────┘
             │                            │
       ┌─────▼─────┐              ┌──────▼──────┐
       │  Sidebar  │              │  Main Area  │
       │  - Team   │              │  - Stats    │
       │  - Menu   │              │  - Tabs     │
       │  - User   │              │  - Content  │
       └───────────┘              └─────────────┘
```

## Component Hierarchy

```
SidebarProvider
└── DashboardPage
    ├── DashboardSidebar
    │   ├── Team Selector (Dropdown)
    │   ├── Navigation Menu
    │   └── User Profile & Sign Out
    │
    └── Main Content (flex-1)
        ├── Header (Title + Description)
        ├── StatsCards
        │   ├── Total Receipts Card
        │   ├── Total Revenue Card
        │   ├── Pending Returns Card
        │   └── Approved Returns Card
        │
        └── Tabs (Receipts | Returns Review)
            │
            ├── Receipts Tab Content
            │   ├── SearchFilter Card
            │   │   ├── Search Input
            │   │   ├── Status Select
            │   │   └── Clear Button
            │   │
            │   └── Receipts Display Card
            │       ├── ResponsiveReceipts (wrapper)
            │       │   ├── ReceiptsTable (desktop)
            │       │   │   ├── Table Header
            │       │   │   └── ReceiptTableRows
            │       │   │       └── ReceiptDetailView (expanded)
            │       │   │
            │       │   └── ReceiptCards (mobile)
            │       │       └── ReceiptCard (expandable)
            │       │           ├── Card Header
            │       │           ├── Card Content
            │       │           └── Details (expanded)
            │
            └── Returns Tab Content
                └── ReturnsReviewCard
                    └── ResponsiveReturns (wrapper)
                        ├── ReturnsReview (desktop)
                        │   ├── Pending Returns Table
                        │   │   ├── PendingReturnRow
                        │        └── Action Buttons
                        │   └── History Returns Table
                        │       └── HistoryReturnRow
                        │
                        └── ReturnCards (mobile)
                            ├── PendingReturnCard
                            │   ├── Card Header
                            │   ├── Details
                            │   └── Action Buttons
                            └── HistoryReturnCard
                                ├── Card Header
                                └── Details
```

## Data Flow Diagram

```
Mock Data (lib/mock-data.ts)
├── MOCK_RETAILERS
├── DASHBOARD_MOCK_RECEIPTS
└── DASHBOARD_MOCK_RETURNS
      │
      │ getReceiptsByRetailerId()
      │ getReturnsByRetailerId()
      ▼
DashboardPage State
├── selectedRetailerId
├── searchQuery
└── statusFilter
      │
      ├──────────────────────┬──────────────┐
      ▼                      ▼              ▼
  Receipts Data       Returns Data    Stats Data
      │                   │               │
      ├────────────────────┼───────────────┤
      │                    │               │
      ▼                    ▼               ▼
StatsCards         ResponsiveReturns  SearchFilter
(Display Stats)    (Show Returns)      (Input)
      │                    │               │
      ▼                    ▼               ▼
Updated Search ◄──────────────────────────┘
     Query
      │
      ▼
ResponsiveReceipts
(Filter & Display)
```

## Component Responsibilities

### Page Components
- **page.tsx**: Root dashboard component
  - Manages state (retailer, search, filters)
  - Renders layout with sidebar
  - Handles retailer changes
  - Passes data to child components
  - Mock handlers for return actions

### Layout Components
- **sidebar.tsx**: Navigation and team selector
  - Display current store/team
  - Switch between retailers
  - Navigation menu
  - User profile section
  - Sign out functionality

- **stats-cards.tsx**: Dashboard metrics
  - Total receipts count
  - Total revenue calculation
  - Pending returns count
  - Approved returns count
  - Icons and styling

### Receipt Components
- **receipts-table.tsx**: Desktop receipt view
  - Sortable table
  - Expandable rows
  - Detailed view component
  - Sort state management
  - Expand state management

- **receipt-cards.tsx**: Mobile receipt view
  - Card layout
  - Expandable details
  - Same information as table
  - Touch-friendly interactions

- **responsive-receipts.tsx**: Adaptive wrapper
  - Switches between table/cards based on screen size
  - Applies filtering to both views
  - Consistent data display

- **search-filter.tsx**: Search and filter controls
  - Search input with icon
  - Status dropdown
  - Clear button
  - Real-time filtering
  - State management

### Return Components
- **returns-review.tsx**: Desktop return view
  - Pending returns table with actions
  - Return history table
  - Approval confirmation dialog
  - Rejection reason modal
  - Status updates

- **return-cards.tsx**: Mobile return view
  - Pending return cards
  - History return cards
  - Expandable details
  - Inline action buttons
  - Mobile-optimized modals

- **responsive-returns.tsx**: Adaptive wrapper
  - Switches between table/cards based on screen size
  - Passes action handlers to both views

### Utility Components
- **status-badge.tsx**: Reusable status indicators
  - Receipt status badges (issued, pending_return, returned, exchanged)
  - Return status badges (pending, approved, rejected, completed)
  - Color-coded styling

## State Management Strategy

```
DashboardPage (State Container)
│
├── selectedRetailerId (string)
│   └── Updated by: DashboardSidebar.onRetailerChange()
│   └── Used by: getReceiptsByRetailerId(), getReturnsByRetailerId()
│   └── Effect: Reset filters when changed
│
├── searchQuery (string)
│   └── Updated by: ReceiptSearchFilter.onSearchChange()
│   └── Used by: ResponsiveReceipts, filtering logic
│   └── Effect: Filter receipts in real-time
│
└── statusFilter (string)
    └── Updated by: ReceiptSearchFilter.onStatusChange()
    └── Used by: ResponsiveReceipts, filtering logic
    └── Effect: Filter receipts by status

Additional Component-Level State:
├── ReceiptsTable: sortConfig, expandedRows
├── Receipt Cards: expandedRows
├── ReturnsReview: rejectionReason, selectedReturnId
└── ReturnCards: expandedRows
```

## Data Transformation Flow

```
Raw Receipt Data
├── Filter by retailerId
├── Apply search query filter
│   ├── Receipt ID match
│   ├── Customer name match
│   ├── Phone number match
│   └── Item name match
├── Apply status filter
├── Apply sorting
└── Display in table/cards

Same process for Returns with different display format
```

## Mobile Responsiveness Strategy

```
Breakpoints:
- Mobile: < 768px (md:)
- Desktop: >= 768px

Components:
- Sidebar: Hidden on mobile (collapses)
- Tables: Hidden on mobile (hidden md:block)
- Cards: Visible on mobile (md:hidden)

Responsive Classes:
- flex flex-col md:flex-row (stack vertically on mobile)
- w-full md:w-48 (full width on mobile, fixed on desktop)
- gap-4 (consistent spacing on all sizes)
- text-sm md:text-base (smaller text on mobile)
```

## Type Definitions

```typescript
// Core Types (types/retailers.ts)
interface Retailer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  logo?: string;
  createdAt: string;
}

interface Receipt {
  id: string;
  receiptNumber: string;
  retailerId: string;
  retailerName: string;
  customerName: string;
  customerPhone?: string;
  items: LineItem[];
  subtotal: number;
  total: number;
  currency: string;
  paymentMethod: string;
  purchasedAt: string;
  status: "issued" | "pending_return" | "returned" | "exchanged";
  isReturnable: boolean;
  returnWindow?: string;
}

interface Return {
  id: string;
  returnNumber: string;
  receiptId: string;
  receiptNumber: string;
  retailerId: string;
  retailerName: string;
  customerName: string;
  customerPhone?: string;
  items: LineItem[];
  returnReason: string;
  reasonDescription?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  refundAmount: number;
  currency: string;
  requestedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

interface LineItem {
  id: string;
  name: string;
  detail: string;
  quantity: number;
  price: number;
}
```

## Integration Points (Ready for Backend)

When integrating with a real backend:

1. Replace mock data calls with API endpoints:
   ```typescript
   // Before: getReceiptsByRetailerId(retailerId)
   // After: await fetch(`/api/receipts?retailerId=${retailerId}`)
   ```

2. Update action handlers with API calls:
   ```typescript
   // handleApproveReturn
   await fetch(`/api/returns/${returnId}/approve`, { method: 'POST' })
   
   // handleRejectReturn
   await fetch(`/api/returns/${returnId}/reject`, { 
     method: 'POST',
     body: JSON.stringify({ reason })
   })
   ```

3. Add loading states:
   ```typescript
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState<string | null>(null)
   ```

4. Update UI with loading/error states:
   ```typescript
   {isLoading && <Spinner />}
   {error && <Alert variant="destructive">{error}</Alert>}
   ```

## Performance Considerations

1. **Memoization**: useMemo() used in filtering logic
2. **Debouncing**: Search input uses onChange directly (can add debounce)
3. **Virtualization**: For large lists, consider react-window
4. **Code Splitting**: Dashboard page is already in separate route
5. **Image Optimization**: Store logos can use next/image

## Security Considerations

1. **Input Validation**: Search queries are treated as strings
2. **Authorization**: Implement retailer-specific auth on backend
3. **Data Protection**: Customer phone numbers should be masked
4. **Action Verification**: Confirm sensitive actions (approve/reject)
5. **Audit Logging**: Log all return approvals/rejections

## Accessibility Features

1. Semantic HTML (tables, buttons, links)
2. ARIA labels and roles
3. Keyboard navigation support
4. Color contrast compliance
5. Focus management in modals
6. Screen reader support

## Future Enhancement Paths

1. **Real-time Updates**: WebSocket integration for live data
2. **Advanced Filtering**: Date range picker, multi-select filters
3. **Bulk Actions**: Select multiple receipts/returns
4. **Export/Print**: PDF download, print functionality
5. **Analytics**: Charts and graphs for business insights
6. **Notifications**: Toast notifications for actions
7. **Pagination**: Handle large datasets with server-side pagination
8. **Caching**: Implement client-side caching with SWR
9. **Offline Support**: Service worker for offline access
10. **Multi-language**: i18n implementation
