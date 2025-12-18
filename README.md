# Salon Queue Management System

A modern, simple customer queue management system for beauty salons and barber shops.

## Features

- 📅 **Appointment Booking** - Customers can book appointments online
- 🎫 **Walk-in Queue** - Real-time queue management for walk-in customers
- 📱 **Customer Notifications** - SMS/Email notifications when turn is approaching
- 👨‍💼 **Staff Dashboard** - Manage appointments, queue, and services
- ⚡ **Real-time Updates** - Live queue status updates
- 🎨 **Modern UI** - Clean, responsive interface built with Next.js and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **Notifications**: Twilio (optional)
- **Deployment**: Vercel + Supabase

## Getting Started

### 1. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Project Settings** → **API**
3. Copy your `Project URL` and `anon/public` key

### 2. Run the database migration

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy the contents of `supabase/migrations/20231217_initial_schema.sql`
4. Paste and run the SQL
5. Verify tables were created in the **Table Editor**

### 3. Configure environment variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install dependencies and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
salon-queue-app/
├── src/
│   ├── app/
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── customer/       # Customer-facing pages (booking)
│   │   ├── queue-display/  # Public queue display screen
│   │   └── page.tsx        # Landing page
│   ├── components/
│   │   └── ui/             # Shadcn UI components
│   ├── lib/
│   │   └── supabase/       # Supabase client utilities
│   ├── types/              # TypeScript type definitions
│   └── hooks/              # Custom React hooks
└── supabase/
    └── migrations/         # Database schema migrations
```

## Database Schema

- **businesses** - Salon/shop information
- **staff** - Staff members and their availability
- **services** - Services offered (haircut, styling, etc.)
- **appointments** - Scheduled appointments
- **queue_entries** - Walk-in queue entries

## Next Steps

1. Create seed data (sample business, staff, services)
2. Build the customer booking interface
3. Build the admin dashboard
4. Implement real-time queue updates
5. Add SMS notifications with Twilio

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## License

MIT
