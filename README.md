# CareCircle - Better Care, Together

CareCircle is a family healthcare coordination platform. It helps family members, even in different cities, organise the care of an elderly relative in one shared place.

## The problem
Medical appointments, caregiving duties and updates are scattered across calls and chats. Families lose track of who is doing what.

## Features
1. **Shared Care Dashboard**: upcoming appointments, add appointments, care timeline.
2. **Task Assignment and Reminders**: create tasks, assign them to family members, set due dates, see pending, completed and overdue tasks.
3. **Family Activity Tracker**: who completed what, full activity history, admin and member roles.

## Tech stack
React (Vite), Tailwind CSS, Supabase (PostgreSQL + Auth), GitHub, Vercel.

## Setup
1. Clone the repo and run `npm install`
2. Copy `.env.example` to `.env` and fill in your Supabase URL and publishable key
3. In the Supabase SQL Editor, run `supabase/schema.sql`, then `supabase/policies.sql`
4. In Supabase, Authentication, Sign In / Providers, Email: turn off "Confirm email"
5. Run `npm run dev`

## Demo accounts
- Admin: (add email and password here)
- Member: (add email and password here)