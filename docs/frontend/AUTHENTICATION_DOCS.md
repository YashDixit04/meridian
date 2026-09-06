# Authentication & Authorization System Documentation

## Overview

This document describes the complete authentication and authorization system implemented for the B2B SaaS platform. The system uses Role-Based Access Control (RBAC) to manage user permissions and access to different pages and features.

## Architecture

### Core Components

1. **Authentication Service** (`/services/authService.ts`)
   - Centralized authentication logic
   - Session management (localStorage)
   - User login/signup/logout
   - Permission checking utilities
   - Designed for easy migration to backend APIs

2. **RBAC Utilities** (`/utils/rbac.ts`)
   - Permission checking functions
   - Menu filtering based on permissions
   - Field/component access control
   - Role validation helpers

3. **User Data** (`/data/users.json`)
   - User credentials and profiles
   - Role definitions
   - Permission mappings

## User Roles

### 1. Superadmin
- **Description:** Tenant head/CEO with full system access
- **Access:** All pages and all fields in every component
- **Default Credentials:**
  - Email: `superadmin@gmail.com`
  - Username: `superadmin`
  - Password: `123456`

### 2. Admin
- **Description:** User and management controller
- **Access:** Based on permission object
- **Default Pages:** Dashboard, Users, Platform Users, Offers, Tenant Details, User Management
- **Example Credentials:**
  - Username: `admin01`
  - Password: `admin123`

### 3. Admin Users
- **Description:** CEO company personnel with limited access
- **Access:** Based on permission object
- **Default Pages:** Dashboard, Users, Tenant Details
- **Example Credentials:**
  - Username: `adminuser01`
  - Password: `admin123`

### 4. Tenant Admin
- **Description:** Platform purchaser/company owner (e.g., MSC, vendor companies)
- **Access:** Based on permission object
- **Default Pages:** Dashboard, Tenant Sub Users, Vessels, Orders, Catalogue, Documents
- **Example Credentials:**
  - Username: `tenantadmin01`
  - Password: `tenant123`

### 5. Tenant Admin Sub Users
- **Description:** Company personnel under tenant admin (captains, purchasers, vendors)
- **Access:** Restricted based on permission object
- **Default Pages:** Vessels, Orders (or based on role)
- **Example Credentials:**
  - Username: `captain01` / `purchaser01`
  - Password: `captain123` / `purchaser123`

## Features

### 1. Login & Signup
- **Location:** Automatically shown when not authenticated
- **Features:**
  - Toggle between login and signup modes
  - Email and username validation
  - Password strength requirements (min 6 characters)
  - Error handling and user feedback
  - Default superadmin credentials displayed for testing

### 2. User Management
- **Access:** Superadmin and Admin only
- **Location:** Available in sidebar menu (User Management icon)
- **Features:**
  - Create new users with custom permissions
  - Select role type (Admin, Admin User, Tenant Admin, Tenant Sub User)
  - Choose accessible pages
  - Define component field permissions
  - Quick setup templates for each role type
  - Real-time validation

### 3. Permission System
- **Page Access:** Users only see and can access pages listed in their permissions
- **Field Access:** Components can filter fields based on user permissions
- **Menu Filtering:** Sidebar automatically hides inaccessible menu items
- **Route Guards:** Pages check permissions before rendering content

### 4. Session Management
- **Storage:** localStorage (browser-based)
- **Persistence:** Session survives page refreshes
- **Logout:** Complete session cleanup on logout
- **Security:** Session validation on app load

## Implementation Details

### Authentication Flow

1. **App Initialization:**
   ```typescript
   - Check if user is authenticated (session exists)
   - If not authenticated → Show LoginSignup page
   - If authenticated → Load main application
   ```

2. **Login Process:**
   ```typescript
   - User enters username/email and password
   - AuthService validates credentials against users.json
   - On success: Create session and store in localStorage
   - On failure: Show error message
   ```

3. **Permission Check:**
   ```typescript
   - Load user permissions from session
   - Filter accessible pages
   - Redirect to first accessible page
   - Hide unauthorized menu items
   ```

4. **Logout Process:**
   ```typescript
   - Clear session from localStorage
   - Reset app state
   - Redirect to login page
   ```

### RBAC Implementation

#### Page-Level Protection
```typescript
// In App.tsx
{activeTab === 'dashboard' && canAccessPage('dashboard') && <Dashboard />}
```

#### Menu Filtering
```typescript
// In Sidebar.tsx
const accessibleMenuItems = filterMenuByPermissions(menuItems);
```

#### Field-Level Protection
```typescript
// Example usage in components
const visibleFields = filterFieldsByPermissions('tenantTable', allFields);
```

### Permission Object Structure

```json
{
  "pages": ["dashboard", "users", "offers"],
  "fields": {
    "tenantTable": ["name", "email", "status"],
    "orderTable": ["orderId", "date", "status"]
  }
}
```

## Migration to Backend APIs

The system is designed for easy migration to MongoDB + backend APIs:

### What Needs to Change:

1. **AuthService (`/services/authService.ts`):**
   ```typescript
   // Replace fetchUsers() with API call
   private async fetchUsers(): Promise<User[]> {
     const response = await fetch('/api/users');
     return response.json();
   }

   // Replace saveUsers() with API call
   private async saveUsers(users: User[]): Promise<void> {
     await fetch('/api/users', {
       method: 'POST',
       body: JSON.stringify(users)
     });
   }

   // Update login to use backend
   async login(username: string, password: string) {
     const response = await fetch('/api/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ username, password })
     });
     const data = await response.json();
     this.setSession(data.session);
     return data.session;
   }
   ```

2. **What Stays the Same:**
   - All RBAC utilities (`/utils/rbac.ts`)
   - UI components (Login, Signup, UserManagement)
   - Permission checking logic
   - Session management structure
   - Component implementations

### Why This Architecture?

- **Separation of Concerns:** Data fetching is isolated in AuthService
- **Single Responsibility:** RBAC utilities only check permissions, don't fetch data
- **Easy Testing:** Can mock AuthService for testing components
- **Future-Proof:** Switching from JSON to API requires changes in ONE file only

## Testing the System

### Test Scenario 1: Superadmin Access
1. Login with `superadmin@gmail.com` / `123456`
2. Verify all menu items are visible
3. Access all pages successfully
4. Access User Management page

### Test Scenario 2: Admin Access
1. Login with `admin01` / `admin123`
2. Verify limited menu items (Dashboard, Users, Platform Users, Offers, User Management)
3. Try accessing restricted pages (should show "Access Denied")

### Test Scenario 3: Tenant Admin Access
1. Login with `tenantadmin01` / `tenant123`
2. Verify tenant-specific menu items (Vessels, Orders, Catalogue, etc.)
3. Dashboard should be accessible
4. User Management should NOT be visible

### Test Scenario 4: Create New User
1. Login as superadmin or admin01
2. Click User Management in sidebar
3. Click "Add New User"
4. Fill in user details and select role
5. Choose page and field permissions
6. Create user
7. Logout and login with new credentials
8. Verify permissions are applied correctly

## File Structure

```
/services
  /authService.ts           # Authentication service

/utils
  /rbac.ts                  # RBAC utilities

/data
  /users.json               # User credentials and permissions

/pages
  /Auth
    /LoginSignup.tsx        # Login/Signup page
  /UserManagement.tsx       # User management interface

/components
  /layout
    /Navbar.tsx             # Updated with logout
    /Sidebar.tsx            # Updated with RBAC filtering
  /common
    /ProfileDropdown.tsx    # Updated with user info and logout

/App.tsx                    # Main app with authentication flow
```

## Common Use Cases

### 1. Adding a New Role
```json
// In users.json
{
  "username": "newrole01",
  "email": "newrole@example.com",
  "password": "password123",
  "roleType": "tenantadmin",
  "permissions": {
    "pages": ["dashboard", "customPage"],
    "fields": {
      "customTable": ["field1", "field2"]
    }
  }
}
```

### 2. Granting Page Access to Existing User
1. Update user's permission object in users.json
2. Add page ID to "pages" array
3. User must logout and login again to see changes

### 3. Protecting a New Component's Fields
```typescript
// In your component
import { canAccessField } from '../utils/rbac';

// Conditionally render field
{canAccessField('myComponent', 'sensitiveField') && (
  <div>Sensitive Data</div>
)}
```

### 4. Adding a New Page to the System
1. Add page component to App.tsx
2. Add page ID to knownTabs array
3. Add conditional rendering with canAccessPage()
4. Update users.json to grant access to specific roles
5. Add menu item to Sidebar if needed

## Security Considerations

### Current Implementation (Client-Side)
- ⚠️ Credentials stored in plain text in JSON file
- ⚠️ Authentication happens client-side
- ⚠️ No encryption for passwords
- ⚠️ Session stored in localStorage (accessible by JavaScript)

### Recommended Backend Implementation
- ✅ Hash passwords using bcrypt before storage
- ✅ Use JWT tokens for session management
- ✅ Implement refresh tokens for security
- ✅ Add rate limiting on login attempts
- ✅ Use HTTPS for all API calls
- ✅ Implement CSRF protection
- ✅ Add request validation and sanitization

## Troubleshooting

### Issue: Login not working
- Check browser console for errors
- Verify users.json is accessible at `/data/users.json`
- Check username/email and password match exactly
- Clear localStorage and try again

### Issue: Pages not showing after login
- Verify user has pages in permissions.pages array
- Check browser console for permission errors
- Try logging in as superadmin to confirm system works

### Issue: User Management page not visible
- Only superadmin and admin roles can access
- Check if roleType is exactly "superadmin" or "admin"
- Verify isAdmin() function in rbac.ts

### Issue: New users can't login
- Browser cannot write to users.json directly
- New users are stored in localStorage temporarily
- For testing: manually add users to users.json
- For production: implement backend API

## Next Steps

1. **Implement Backend API:**
   - Create Express/Node.js server
   - Connect to MongoDB
   - Implement authentication endpoints
   - Add password hashing

2. **Enhance Security:**
   - Add JWT token authentication
   - Implement refresh tokens
   - Add rate limiting
   - Enable HTTPS

3. **Add Features:**
   - Password reset functionality
   - Email verification
   - Two-factor authentication
   - User activity logging
   - Permission inheritance

4. **Improve UX:**
   - Remember me functionality
   - Session timeout warnings
   - Better error messages
   - Loading states

## Contact & Support

For issues or questions about this authentication system:
- Review this documentation
- Check the code comments in implementation files
- Test with provided example credentials
- Refer to the architecture diagrams above

---

**Last Updated:** March 2026
**Version:** 1.0.0
**Status:** Production Ready (Client-Side) / Backend Migration Pending
