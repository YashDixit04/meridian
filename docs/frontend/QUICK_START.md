# Authentication System - Quick Start Guide

## 🚀 Getting Started

Your B2B SaaS application now has a complete authentication and authorization system with Role-Based Access Control (RBAC).

## 📋 Quick Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access the application:**
   - Open your browser and navigate to the local development URL (usually `http://localhost:5173`)
   - You'll be automatically redirected to the login page

3. **Login with default credentials:**
   - **Email:** `superadmin@gmail.com` OR **Username:** `superadmin`
   - **Password:** `123456`

## 🔑 Test Accounts

### Superadmin (Full Access)
- Username: `superadmin`
- Email: `superadmin@gmail.com`
- Password: `123456`
- Access: All pages and features

### Admin
- Username: `admin01`
- Email: `admin@company.com`
- Password: `admin123`
- Access: Dashboard, Users, Platform Users, Offers, User Management

### Tenant Admin
- Username: `tenantadmin01`
- Email: `tenantadmin@msc.com`
- Password: `tenant123`
- Access: Dashboard, Vessels, Orders, Catalogue, Documents

### Tenant Sub Users
- **Captain:**
  - Username: `captain01`
  - Password: `captain123`
  - Access: Vessels, Orders

- **Purchaser:**
  - Username: `purchaser01`
  - Password: `purchaser123`
  - Access: Orders, Catalogue

## ✨ Key Features

### 1. Login/Signup
- Toggle between login and signup modes
- Email and username validation
- Secure password requirements
- Error handling with user feedback

### 2. User Management (Superadmin & Admin Only)
- Create new users with custom permissions
- Choose role types and access levels
- Define page and field permissions
- Quick setup templates for common roles

### 3. Role-Based Access Control
- Users only see pages they have access to
- Menu items automatically filtered
- Fields can be hidden based on permissions
- Access denied messages for unauthorized pages

### 4. Session Management
- Persistent sessions across page refreshes
- Secure logout with complete session cleanup
- User info displayed in profile dropdown

## 📁 Key Files

- **`/services/authService.ts`** - Authentication logic
- **`/utils/rbac.ts`** - Permission checking utilities
- **`/public/users.json`** - User credentials and permissions (DO NOT commit to production)
- **`/pages/Auth/LoginSignup.tsx`** - Login/Signup UI
- **`/pages/UserManagement.tsx`** - User management interface
- **`AUTHENTICATION_DOCS.md`** - Complete documentation

## 🧪 Testing the System

### Test Flow 1: Full Access (Superadmin)
1. Login as `superadmin@gmail.com` / `123456`
2. Verify all menu items are visible
3. Navigate to User Management
4. Create a new user
5. Logout and login with new user credentials

### Test Flow 2: Limited Access (Tenant Admin)
1. Login as `tenantadmin01` / `tenant123`
2. Notice limited menu items (no User Management)
3. Try accessing different pages
4. Verify only authorized pages are accessible

### Test Flow 3: Create Custom User
1. Login as superadmin
2. Go to User Management
3. Click "Add New User"
4. Fill in details and select permissions
5. Create user and test login

## 🔧 Customization

### Add a New Role
Edit `/public/users.json`:
```json
{
  "username": "customrole",
  "email": "custom@example.com",
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

### Modify Existing Permissions
1. Edit `/public/users.json`
2. Update the `permissions` object for the user
3. Save the file
4. User must logout and login to see changes

### Protect a New Page
In `App.tsx`:
```typescript
{activeTab === 'newPage' && canAccessPage('newPage') && <NewPage />}
```

## 🚨 Important Notes

### Current Limitations (Client-Side Implementation)
- **Not production-ready for security:** Passwords are stored in plain text
- **No server-side validation:** All authorization happens client-side
- **User creation limitation:** Cannot persist new users to JSON file from browser

### Production Recommendations
- Implement backend API (Express/Node.js + MongoDB)
- Use bcrypt for password hashing
- Implement JWT token authentication
- Add rate limiting and CSRF protection
- Move users.json to secure database
- Use HTTPS for all connections

## 🔄 Migration to Backend

When ready to implement backend APIs:

1. **Only update `/services/authService.ts`**
2. Replace `fetchUsers()` with API call
3. Replace `saveUsers()` with API call
4. Update `login()` to use backend endpoint
5. **Everything else stays the same!**

The system is architected so RBAC logic, UI components, and permission checks work identically whether data comes from JSON or API.

## 🐛 Troubleshooting

### Login Not Working
- Check browser console for errors
- Verify credentials match exactly (case-sensitive)
- Clear browser localStorage and try again
- Ensure `/public/users.json` exists and is accessible

### Pages Not Showing
- Verify user has pages in `permissions.pages` array
- Check user role is correctly set
- Login as superadmin to verify system works

### User Management Not Visible
- Only `superadmin` and `admin` roles can access
- Check roleType is exactly "superadmin" or "admin"
- Verify user is logged in correctly

## 📚 Next Steps

1. **Explore the system:**
   - Test different user roles
   - Create custom users
   - Modify permissions

2. **Read the documentation:**
   - Open `AUTHENTICATION_DOCS.md` for complete details
   - Understand the architecture
   - Review migration guide

3. **Plan backend integration:**
   - Choose technology stack (Node.js, Python, etc.)
   - Design API endpoints
   - Plan database schema

4. **Enhance features:**
   - Add password reset
   - Implement email verification
   - Add session timeout
   - Create audit logs

## 💡 Tips

- Always test with superadmin first to ensure system works
- Use User Management to create test users rather than editing JSON
- Keep backups of users.json when testing
- Review AUTHENTICATION_DOCS.md for detailed architecture
- Session persists in localStorage across page refreshes

## 🎯 Success Criteria

Your authentication system is working correctly if:
- ✅ Login page shows before accessing app
- ✅ Correct credentials allow access
- ✅ Different roles see different menu items
- ✅ Logout clears session and returns to login
- ✅ User Management allows creating new users (superadmin/admin)
- ✅ Permissions are enforced across the application

---

**Need Help?** Check `AUTHENTICATION_DOCS.md` for detailed documentation and troubleshooting.

**Ready for Production?** Plan your backend API integration using the migration guide in the docs.
