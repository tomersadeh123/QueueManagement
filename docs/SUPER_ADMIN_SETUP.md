# Super Admin System Setup Guide

This guide explains how to set up the multi-business super admin system where power users can create and manage multiple businesses and their staff.

## 🎯 System Overview

The system now supports three user roles:

1. **Super Admin** (מנהל על) - Can manage all businesses and create users for any business
2. **Business Admin** (מנהל עסק) - Can manage their own business and its staff
3. **Staff** (עובד) - Regular employee with basic access

## 📋 Setup Steps

### Step 1: Run Database Migration

Go to your **Supabase Dashboard → SQL Editor** and run this migration:

```sql
-- Add role column to staff table
ALTER TABLE staff
ADD COLUMN role TEXT CHECK (role IN ('super_admin', 'business_admin', 'staff')) DEFAULT 'staff';

-- Create index for faster role lookups
CREATE INDEX idx_staff_role ON staff(role);

-- Update RLS policy to allow super admins to manage all businesses
DROP POLICY IF EXISTS "Businesses can be updated by staff members" ON businesses;

CREATE POLICY "Businesses can be updated by authorized staff"
    ON businesses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE (
                staff.role = 'super_admin'
                OR
                (staff.business_id = businesses.id AND staff.role IN ('business_admin', 'super_admin'))
            )
            AND staff.user_id = auth.uid()
        )
    );

-- Allow super admins to insert new businesses
DROP POLICY IF EXISTS "Businesses can be inserted by authenticated users" ON businesses;

CREATE POLICY "Businesses can be inserted by super admins"
    ON businesses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.role = 'super_admin'
            AND staff.user_id = auth.uid()
        )
    );

-- Update staff policies to allow super admins to manage all staff
DROP POLICY IF EXISTS "Staff manageable by business staff" ON staff;

CREATE POLICY "Staff manageable by authorized users"
    ON staff FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM staff s
            WHERE (
                s.role = 'super_admin'
                OR
                (s.business_id = staff.business_id AND s.role IN ('business_admin', 'super_admin'))
            )
            AND s.user_id = auth.uid()
        )
    );
```

### Step 2: Create Your First Super Admin

#### 2a. Create Auth User
1. Go to **Supabase Dashboard → Authentication → Users**
2. Click **Add User**
3. Enter:
   - Email: your email
   - Password: secure password
   - ✅ Check **"Auto Confirm User"**
4. Click **Create User**
5. **Copy the User ID** (UUID)

#### 2b. Create Staff Record with Super Admin Role

Option 1: If you already have a business in the database:
```sql
INSERT INTO staff (business_id, user_id, name, phone, role, is_active)
VALUES (
  (SELECT id FROM businesses LIMIT 1),
  'paste-your-user-id-here',
  'Your Name',
  '050-1234567',
  'super_admin',  -- This makes you a super admin!
  true
);
```

Option 2: Create a business first, then create your super admin:
```sql
-- Create a business
INSERT INTO businesses (name, phone, address)
VALUES ('Main Office', '03-1234567', 'Tel Aviv')
RETURNING id;

-- Then create super admin (use the business ID from above)
INSERT INTO staff (business_id, user_id, name, phone, role, is_active)
VALUES (
  'business-id-from-above',
  'your-user-id',
  'Your Name',
  '050-1234567',
  'super_admin',
  true
);
```

### Step 3: Login and Test

1. Go to `http://localhost:3000/admin/login`
2. Login with your super admin credentials
3. You should now see **two purple menu items**:
   - 🏢 **Businesses** - Manage all businesses
   - 🛡️ **Users** - Manage all users across all businesses

## 🚀 Using the Super Admin Interface

### Creating New Businesses

1. Click **Businesses** in the menu
2. Click **New Business** button
3. Fill in:
   - Business Name
   - Phone
   - Address (optional)
4. Click **Create Business**

### Creating Users for Businesses

1. Click **Users** in the menu
2. Fill in the form:
   - **Full Name**: User's name
   - **Phone**: Optional
   - **Email**: Login email
   - **Password**: Min 6 characters
   - **Business**: Select which business they belong to
   - **Role**: Choose their role:
     - **Staff**: Regular employee (default)
     - **Business Admin**: Can manage their business
     - **Super Admin**: Can manage everything (use carefully!)
3. Click **Create User**

The user can now login at `/admin/login` with their credentials!

### Managing Regular Business Settings

Business admins can still use the regular **Settings** page to create staff for their own business (backward compatible).

## 🔒 Security Notes

- **Super Admin Role**: Very powerful! Only give this to trusted users
- **Business Admin Role**: Can manage their own business but not others
- **Staff Role**: Basic access, cannot create users or modify business settings
- **Service Role Key**: Make sure it's in your `.env.local` and never committed to git

## 📊 Role Comparison

| Feature | Super Admin | Business Admin | Staff |
|---------|-------------|----------------|-------|
| View own business data | ✅ | ✅ | ✅ |
| Manage own business queue/appointments | ✅ | ✅ | ✅ |
| Create staff for own business | ✅ | ✅ | ❌ |
| Modify business settings | ✅ | ✅ | ❌ |
| View all businesses | ✅ | ❌ | ❌ |
| Create new businesses | ✅ | ❌ | ❌ |
| Create users for any business | ✅ | ❌ | ❌ |
| Assign super admin role | ✅ | ❌ | ❌ |

## 🆘 Troubleshooting

**Problem**: Super admin menu items not showing
- Check your role in database: `SELECT role FROM staff WHERE user_id = 'your-user-id'`
- Should be `'super_admin'` not `'staff'`

**Problem**: Can't create businesses
- Make sure you're logged in as super admin
- Check RLS policies are applied correctly

**Problem**: "Business not found" error
- Ensure at least one business exists in the database
- Check `SELECT * FROM businesses;`

## 🎉 You're All Set!

You now have a complete multi-business management system where:
- Super admins can create businesses and assign users
- Business admins can manage their own business
- No need to touch the database manually anymore!
