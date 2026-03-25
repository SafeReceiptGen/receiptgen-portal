# Receipt Management Dashboard - Quick Start Guide

## Overview
This is a fully functional Receipt Management Dashboard for retailers. No backend API is needed - it uses mock data to demonstrate all features.

## Key Features at a Glance

### 1. **View Receipts**
- Desktop: Sortable data table with expandable rows
- Mobile: Card-based layout with collapsible details
- See all receipt information: Date, Item, Amount, Customer, Status
- Status color indicators: Green (Issued), Yellow (Pending Return), Blue (Returned), Purple (Exchanged)

### 2. **Search Receipts**
Search by:
- Receipt ID (e.g., "SR-2026-0469")
- Customer Name (e.g., "Jayden Osafo")
- Phone Number (e.g., "0244444444")
- Item Name (e.g., "Nike Airforce")

### 3. **Filter by Status**
- Issued
- Pending Return
- Returned
- Exchanged

### 4. **Manage Returns**
- View all pending return requests
- Approve returns with confirmation dialog
- Reject returns with custom reason
- Track return history

### 5. **Switch Stores**
- Use the dropdown at the top of the sidebar
- Select from multiple retailers
- All data automatically updates to show store-specific information

---

## How to Test

### Test Case 1: View All Receipts
1. Go to `/dashboard`
2. You'll see "Seizer Sneakers" selected by default
3. Scroll down to see all receipts in table format (desktop) or cards (mobile)
4. Notice the status badges on each receipt
5. Click the expand button to see detailed information

### Test Case 2: Expand Receipt Details
1. On any receipt row (desktop) or card (mobile), click the expand/chevron button
2. See all items purchased, payment method, customer contact info
3. Notice the total amount calculation

### Test Case 3: Search Functionality
1. In the "Search & Filter" card, type in the search box
2. Try searching for:
   - Receipt ID: "SR-2026-0469"
   - Customer: "Ama"
   - Phone: "0551234567"
   - Item: "Nike"
3. Results update in real-time
4. Click "Clear" to reset

### Test Case 4: Filter by Status
1. Use the "Filter by Status" dropdown
2. Select "Pending Return" to see only receipts with pending returns
3. Combine with search query for more specific results

### Test Case 5: Review Returns
1. Click the "Returns Review" tab
2. You'll see pending returns at the top
3. For each pending return:
   - Click "Approve" to approve the return
   - Click "Reject" to reject and enter a reason
4. Scroll down to see return history

### Test Case 6: Switch Stores
1. Click the store dropdown in the sidebar header
2. Select "Melcom Ghana" or "Koala Shopping"
3. Notice all receipts and returns update to show data for that store
4. Filters reset automatically

### Test Case 7: Mobile Responsiveness
1. Resize your browser to less than 768px width
2. Notice:
   - Sidebar collapses (or becomes a button)
   - Receipts display as cards instead of table
   - Returns display as cards instead of table
   - All buttons are touch-friendly
3. Expand receipt/return cards by clicking the chevron button

### Test Case 8: View Statistics
1. At the top of the dashboard (below the heading)
2. You'll see 4 stat cards:
   - Total Receipts: Shows count
   - Total Revenue: Shows sum of all receipts
   - Pending Returns: Shows count of pending returns (with "Action needed" badge if any)
   - Approved Returns: Shows count

---

## Sample Data Available

### Retailers
1. **Seizer Sneakers** - Phone: 0244444444
2. **Melcom Ghana** - Phone: 0302661218
3. **Koala Shopping** - Phone: 0551234567

### Sample Receipts
- 10 total across all stores
- Various statuses: Issued, Pending Return, Returned, Exchanged
- Items range from shoes to electronics to food
- Customers with different purchase patterns

### Sample Returns
- 4 returns across stores
- Mix of pending, approved, and rejected returns
- Different return reasons (defective, changed mind, etc.)
- Detailed customer information

---

## Key Interactions

### Approving a Return
1. Go to "Returns Review" tab
2. Find a pending return (yellow badge)
3. Click "Approve" button
4. A confirmation dialog appears
5. Click "Close" to complete
6. In console, you'll see: `Approving return: [return-id]`

### Rejecting a Return
1. Go to "Returns Review" tab
2. Click "Reject" button on a pending return
3. A modal dialog opens with a text area
4. Enter your rejection reason (e.g., "Water damage detected")
5. Click "Reject Request"
6. In console, you'll see: `Rejecting return: [return-id], Reason: [your reason]`

### Sorting Receipts
1. Click on "Date", "Amount", or "Status" column headers (desktop)
2. First click = ascending sort
3. Second click = descending sort
4. Sort indicator (chevron) shows sort direction

---

## UI Elements to Explore

### Sidebar Features
- **Team Selector**: Dropdown at top showing current store
- **Navigation**: Links to Receipts, Returns Review, Settings
- **User Profile**: Shows logged-in user email
- **Sign Out**: Button to sign out (currently logs out in console)

### Table Features (Desktop)
- **Sortable Headers**: Click to sort by that column
- **Expandable Rows**: Click chevron to expand
- **Status Badges**: Color-coded status indicators
- **Detailed View**: Shows all items, payment method, customer info

### Card Features (Mobile)
- **Collapsible Details**: Click "Show Details" to expand
- **Touch-Friendly**: Large buttons for easy interaction
- **All Information**: Same details as desktop, just rearranged

### Search Features
- **Real-time Search**: Type and results update immediately
- **Multi-field**: Searches across ID, name, phone, items
- **Status Filter**: Combine with search for precise results
- **Clear Button**: Reset all filters at once

---

## Console Logs for Debugging

Open the browser console (F12) to see:
- `"Approving return: return-xxx"`
- `"Rejecting return: return-xxx, Reason: [your input]"`

These show that the handlers are working correctly.

---

## Tips for Testing

1. **Try Different Combinations**: Use search + filter together
2. **Mobile Testing**: Use Chrome DevTools (F12 > Toggle Device Toolbar)
3. **Expand Everything**: Click all expand buttons to see detailed views
4. **Switch Stores**: Notice how all data changes when you switch
5. **Check Empty States**: Try searching for something that doesn't exist
6. **Read the Details**: Expand receipts to see all customer info and items

---

## Common Test Scenarios

### Scenario 1: Find a Defective Item
1. Search for "defective" in the Returns Review tab
2. You'll find the Nike Airforce return
3. Click Approve to process the refund

### Scenario 2: Manage Pending Returns for a Store
1. Switch to "Melcom Ghana"
2. Go to Returns Review tab
3. You'll see returns pending for that store
4. Approve or reject each one

### Scenario 3: Track Revenue by Store
1. Check the "Total Revenue" stat
2. Switch stores to see different totals
3. Notice how revenue changes based on selected store

### Scenario 4: Search Complex Query
1. Search for "Size 42" (partial item name)
2. Filter by "Pending Return" status
3. Results show only matching items with that status

---

## What's Not Implemented (Ready for Backend)

These features work in the UI but don't persist:
- Approve/Reject returns - Currently just logs to console
- Sign out - Currently just logs to console
- Switch stores doesn't actually fetch from backend
- All data is from mock files

To integrate with a real backend, you would:
1. Replace mock data calls with API endpoints
2. Update action handlers to make POST requests
3. Add loading states and error handling
4. Implement proper authentication

See `DASHBOARD_ARCHITECTURE.md` for integration points.

---

## Need Help?

Refer to:
- `DASHBOARD_FEATURES.md` - Detailed feature documentation
- `DASHBOARD_ARCHITECTURE.md` - Technical architecture and code structure
- `IMPLEMENTATION_CHECKLIST.md` - What was built and tested

---

**You're all set!** Start exploring the dashboard and try the different features.
