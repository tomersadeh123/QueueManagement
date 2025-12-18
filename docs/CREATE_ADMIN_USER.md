# Creating Admin Users

## ⚙️ First: Add Service Role Key to .env

To allow admins to create other staff users, add this to your `.env.local` file:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get it from: Supabase Dashboard → **Settings** → **API** → **service_role key** (secret)

⚠️ **Important**: Keep this key secret! Never commit it to git.

---

## Method 1: Create Staff via Settings Page (After Login)

Once you have at least one admin account (see Method 2):

1. Login to `/admin/login`
2. Go to **Settings** page in admin panel
3. Use the "Add Staff Member" form:
   - Enter full name
   - Enter phone (optional)
   - Enter email
   - Enter password (min 6 characters)
   - Click "Create User"
4. This creates:
   - Auth user (for login)
   - Staff record (linked to your business)
5. New staff can now login with those credentials!

## Method 2: Using Supabase Dashboard (For First Admin)

To create your **first admin account**, you need to create BOTH an auth user AND a staff record:

### Step 1: Create Auth User
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User**
4. Enter:
   - Email: `admin@yoursalon.com` (or any email)
   - Password: Create a secure password
   - Check "Auto Confirm User" to skip email verification
5. Click **Create User**
6. **IMPORTANT:** Copy the User ID (UUID) - you'll need it in Step 2

### Step 2: Create Staff Record
1. Go to **SQL Editor** in Supabase Dashboard
2. Run this query (replace values with your info):

```sql
INSERT INTO staff (business_id, user_id, name, phone, is_active)
VALUES (
  (SELECT id FROM businesses LIMIT 1),  -- Links to your business
  'paste-user-id-here',                 -- User ID from Step 1
  'Admin Name',                         -- Your name
  '050-1234567',                        -- Your phone (optional)
  true
);
```

Now you can login to `/admin/login` with these credentials!

## Alternative: Using Supabase CLI (if installed)

Create auth user:
```bash
supabase auth users create admin@yoursalon.com --password your-secure-password
```

Then create staff record using the SQL query from Method 2, Step 2 above.

## Testing Login

After creating a user:
1. Go to `http://localhost:3000/admin/login`
2. Enter the email and password you created
3. You should be redirected to the admin dashboard

## Security Notes

- The admin pages are now protected - only authenticated users can access them
- Customers cannot access `/admin` routes without logging in
- Users are automatically redirected to login if not authenticated
- Sessions are managed by Supabase Auth
