# Email Notifications Setup Guide

This guide explains how to set up email notifications for appointment confirmations and reminders.

## 📧 What's Included

1. **Confirmation Emails** - Sent immediately when a customer books an appointment
2. **Reminder Emails** - Sent 24 hours before the appointment
3. **Beautiful HTML Templates** - Bilingual (English/Hebrew) professional design

## 🔧 Setup Steps

### Step 1: Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up (it's free!)
2. Verify your email
3. Go to **API Keys** in the dashboard
4. Click **Create API Key**
5. Copy the key (starts with `re_...`)

**Free Tier**: 100 emails/day, 3,000/month (plenty for most salons!)

### Step 2: Add Environment Variables

Add these to your `.env.local`:

```bash
# Resend Email Configuration
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=Your Salon <noreply@yourdomain.com>
CRON_SECRET=your_random_secret_here
```

**Generate CRON_SECRET**:
```bash
# On Mac/Linux
openssl rand -base64 32

# Or just use any random string like:
# CRON_SECRET=my_super_secret_cron_key_12345
```

### Step 3: Configure Email Domain (Optional but Recommended)

By default, emails come from `onboarding@resend.dev`. To use your own domain:

1. Go to Resend Dashboard → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yoursalon.com`)
4. Add the DNS records shown to your domain provider
5. Wait for verification (usually 5-15 minutes)
6. Update `EMAIL_FROM` in `.env.local`:
   ```bash
   EMAIL_FROM=Bookings <bookings@yoursalon.com>
   ```

**Don't have a domain?** That's fine! You can use the default `onboarding@resend.dev` for testing.

### Step 4: Deploy to Vercel

The cron job only works in production on Vercel.

1. **Add environment variables to Vercel**:
   - Go to your Vercel project → **Settings** → **Environment Variables**
   - Add:
     - `RESEND_API_KEY`
     - `EMAIL_FROM`
     - `CRON_SECRET`
   - Click **Save**

2. **Deploy**:
   ```bash
   git add .
   git commit -m "Add email notifications"
   git push
   ```

3. **Verify Cron is configured**:
   - Go to Vercel project → **Settings** → **Cron Jobs**
   - You should see: `/api/cron/send-reminders` running daily at 9:00 AM

### Step 5: Test the System

#### Test Confirmation Email:

1. Go to your customer booking page
2. Book an appointment
3. Check the email (use a real email in the phone field for testing)

#### Test Reminder Email Manually:

```bash
# Replace with your deployed URL and CRON_SECRET
curl -X GET https://your-app.vercel.app/api/cron/send-reminders \
  -H "Authorization: Bearer your_cron_secret_here"
```

Or visit: `https://your-app.vercel.app/api/cron/send-reminders` with the Authorization header.

## 📊 How It Works

### Confirmation Emails

```
Customer books appointment
    ↓
Appointment saved to database
    ↓
API call to /api/send-appointment-email
    ↓
Email sent via Resend
    ↓
Customer receives confirmation
```

### Reminder Emails

```
Vercel Cron runs daily at 9 AM
    ↓
Calls /api/cron/send-reminders
    ↓
Finds appointments in next 24 hours
    ↓
Sends reminder email for each
    ↓
Customers receive reminders
```

## 🎨 Email Templates

The emails include:
- ✅ Professional design with your business name
- 📅 Appointment date and time
- ✂️ Service name
- 📍 Business address
- 📞 Contact phone
- ⏰ "Arrive early" reminder
- 🇮🇱 Hebrew support

### Preview Templates:

Located in: `src/lib/email-templates.tsx`

## ⚠️ Important Notes

### Customer Email Collection

**IMPORTANT**: The system currently uses `customer_phone` field for emails. You should:

**Option 1: Add email field to appointments table (Recommended)**

```sql
ALTER TABLE appointments
ADD COLUMN customer_email TEXT;
```

Then update booking form to collect email separately.

**Option 2: Use phone field for email temporarily**

The current system checks if `customer_phone` contains `@`. For testing:
- Enter email in phone field: `customer@example.com`
- Or enter phone and it will use placeholder: `050-1234567@temp.com`

### Cron Schedule

The cron runs at **9:00 AM UTC** daily. To change the time, edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 9 * * *"  // "minute hour * * *" in UTC
    }
  ]
}
```

Examples:
- `0 8 * * *` - 8 AM daily
- `0 10,14 * * *` - 10 AM and 2 PM daily
- `0 9 * * 1-5` - 9 AM on weekdays only

### Email Limits

**Resend Free Tier**:
- 100 emails per day
- 3,000 emails per month

If you need more:
- **Pro Plan**: $20/month for 50,000 emails
- Or use SendGrid, AWS SES, etc.

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check Resend API Key**:
   - Is it in `.env.local` and Vercel environment variables?
   - Is it the correct key from Resend dashboard?

2. **Check Email Address**:
   - Is the customer email valid?
   - Check browser console for errors

3. **Check Resend Dashboard**:
   - Go to Resend → **Logs**
   - See if emails are being sent
   - Check for errors

### Reminder Emails Not Working

1. **Check Cron is Running**:
   - Vercel → **Deployments** → Click latest → **Functions**
   - Look for cron job execution logs

2. **Test Manually**:
   ```bash
   curl -X GET https://your-app.vercel.app/api/cron/send-reminders \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

3. **Check Appointments**:
   - Are there appointments 24 hours from now?
   - Are they status `confirmed`?

### Email Goes to Spam

- Use a verified domain instead of `onboarding@resend.dev`
- Add SPF, DKIM, and DMARC records (Resend provides these)
- Ask customers to whitelist your email

## 🚀 Going to Production

Before launching:

1. ✅ Add email field to database
2. ✅ Use a custom domain for emails
3. ✅ Test confirmation emails
4. ✅ Test reminder emails
5. ✅ Set up proper error logging
6. ✅ Monitor Resend dashboard for deliverability

## 📈 Future Enhancements

Consider adding:
- SMS notifications (via Twilio)
- Cancellation emails
- Rescheduling confirmation emails
- Review request emails after appointment
- Multiple reminder times (1 week, 1 day, 1 hour)
- WhatsApp notifications

---

**Questions?** Check the [Resend Documentation](https://resend.com/docs)
