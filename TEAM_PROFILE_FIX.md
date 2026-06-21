# Team Profile Not Showing Without Login - Fix

## Problem
The "Our Mentors & Software Team" section on the About page shows "Profiles Updating" instead of team member cards when users are not logged in.

## Root Cause
The `/api/users/team` endpoint is correctly set up as a **public endpoint** (no authentication required), but it's returning an empty array because:

1. No employee accounts have the `showOnTeam: true` flag enabled in the database, OR
2. The employee accounts exist but don't meet all criteria (`role: 'employee'`, `status: 'active'`, `showOnTeam: true`)

## Solution

### Step 1: Check Current Team Data in MongoDB

Run this query in your MongoDB database:

```javascript
db.users.find({ 
  role: "employee", 
  showOnTeam: true,
  status: "active"
}).pretty()
```

If this returns no results, that's why the team section is empty.

### Step 2: Enable Team Display for Existing Employees

**Option A: Via Admin Panel (Recommended)**
1. Login as admin
2. Go to Admin > Team (About Us) section
3. Find employee profiles
4. Edit each profile and toggle "Add to Team" / "showOnTeam" ON
5. Save changes

**Option B: Direct MongoDB Update**

If you need to manually enable team display for specific employees:

```javascript
// Update by email
db.users.updateOne(
  { email: "employee@example.com" },
  { 
    $set: { 
      showOnTeam: true,
      status: "active",
      role: "employee",
      isMentor: false, // or true if they should show in mentors section
      updatedAt: new Date()
    }
  }
)

// Or update multiple employees at once
db.users.updateMany(
  { 
    role: "employee",
    email: { $in: ["emp1@email.com", "emp2@email.com"] }
  },
  { 
    $set: { 
      showOnTeam: true,
      status: "active",
      updatedAt: new Date()
    }
  }
)
```

### Step 3: Verify the Fix

**Backend Test:**
```bash
curl http://localhost:5000/api/users/team
```

Expected response:
```json
{
  "success": true,
  "team": [
    {
      "id": "...",
      "displayName": "John Doe",
      "jobTitle": "Full Stack Developer",
      "department": "Engineering",
      "showOnTeam": true,
      ...
    }
  ]
}
```

**Frontend Test:**
1. Open browser in **incognito/private mode** (to test without login)
2. Navigate to `/about` page
3. Scroll to "Our Mentors & Software Team" section
4. Team member cards should now be visible

## Code Reference

The relevant code paths:

1. **Frontend**: `frontend/src/pages/About.jsx` (line ~580+)
   - Uses `fetchPublicTeamProfiles()` from `utils/teamProfiles.js`
   - Calls `/api/users/team` endpoint

2. **Backend Route**: `backend/routes/users.js` (line 14)
   ```javascript
   router.get("/team", getPublicTeam);  // No auth middleware
   ```

3. **Backend Controller**: `backend/controllers/userController.js` (line 62-71)
   ```javascript
   const getPublicTeam = async (req, res) => {
     try {
       const team = await listPublicTeamMembers();
       return res.json({ success: true, team });
     } catch (error) {
       return handleError(res, error, "Unable to load public team profiles.");
     }
   };
   ```

4. **Backend Service**: `backend/services/userService.js` (line ~940-950)
   ```javascript
   const listPublicTeamMembers = async () => {
     const users = await listUsersFromSql({ role: "employee", status: "active" });
     
     return users
       .filter((user) => user.showOnTeam && user.status === "active")
       .map(sanitizePublicTeamMember)
       .sort(...);
   };
   ```

## Prevention

To avoid this issue in the future:

1. **When creating new employee accounts**, ensure the "Add to Team" checkbox is checked if they should appear on the About page
2. **Admin Team page** clearly shows which profiles are visible with the "Showing on About" filter
3. **Profile cards** in admin show the team visibility status

## Additional Notes

- Team profiles are **cached in the frontend** for performance
- **No login is required** to view team profiles (this is by design)
- The `isMentor` flag controls if a profile appears in the special "Mentors" carousel
- Employee ID sorting is used to control the display order (ASH-001, ASH-002, etc.)
