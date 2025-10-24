# Branch Management Feature

This feature provides comprehensive branch management functionality using Redux for state management.

## Components

- **Branches.tsx** - Main branch management page with table view, search, and CRUD operations
- **BranchModal.tsx** - Modal component for creating and editing branches

## Redux Store

- **branchSlice.ts** - Redux slice containing all branch-related state and async thunks
- **store/index.ts** - Redux store configuration
- **store/hooks.ts** - Typed Redux hooks

## Features

- ✅ Create new branches
- ✅ Edit existing branches
- ✅ Delete branches
- ✅ Update branch status (active/inactive/suspended)
- ✅ Search and filter branches
- ✅ Pagination support
- ✅ Statistics dashboard
- ✅ Form validation
- ✅ Error handling

## API Integration

The feature integrates with the backend API endpoints:
- `GET /api/branches` - Fetch branches with pagination and filtering
- `POST /api/branches` - Create new branch
- `PUT /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch
- `PATCH /api/branches/:id/status` - Update branch status
- `GET /api/branches/stats` - Get branch statistics

## Usage

The branch management page is accessible through the navigation menu under "المخزون" > "المستودعات" (Inventory > Branches).

## State Management

The Redux store manages:
- Branch list with pagination
- Current branch details
- Loading states
- Error handling
- Statistics data

## Form Fields

The branch form includes:
- Basic information (name, project, code, status, business type)
- Address information (street, city, state, postal code, country)
- Contact information (phone, email, manager)
- Additional details (description, opening date, closing date)
