# Time Tracker PWA — Implementation Plan

## Context
Personal time tracker app, inspired by Simple Time Tracker (Android).
Single user (me), used daily on phone + laptop. Focus: fast start/stop,
daily list, statistics, and "couple time" tracking via tag.

## Stack
- Vue 3 (Composition API, `<script setup>`) + Vite
- Pinia (state), Vue Router
- Tailwind CSS v4 (via @tailwindcss/vite, no tailwind.config.js)
- Supabase (auth email + Postgres + RLS)
- dayjs for date/time handling
- Later: vite-plugin-pwa, Dexie.js (offline-first), Capacitor (APK)

## Database (already created in Supabase, do NOT change schema without asking)
- activity_types: id, user_id, name, color, icon, archived, created_at
- records: id, user_id, activity_type_id, start_time, end_time, tags text[], note
- running_records: id, user_id, activity_type_id, start_time, tags text[]
  (unique per user + activity_type)
- days_off: id, user_id, date (local calendar day), created_at
  (unique per user + date) — workdays marked as holiday/leave, no work target
- RLS enabled on all tables, policy: user_id = auth.uid()
- user_id has default auth.uid(), do not send it from client

## Core Rules
- Timer is NOT a ticking counter stored anywhere. Duration = now - start_time,
  computed on the client every second for display only.
- Stop = insert into records (start_time, end_time = now) then delete
  from running_records. Handle both in one function with error handling.
- Multiple activities can run at the same time.
- All times stored in UTC (timestamptz), displayed in local time (Asia/Jakarta).
- Mobile-first UI, big tap targets.

## Folder Structure
src/
  lib/supabase.js
  stores/ (auth.js, activities.js, running.js, records.js)
  views/ (LoginView, HomeView, RecordsView, StatsView, ActivitiesView)
  components/
  composables/ (useNow.js for 1-second tick, useDuration.js)
  router/index.js

## Phases (do ONE phase at a time, stop and wait for my review)

### Phase 1 — Auth + Layout
- Email/password login & logout with Supabase
- Route guard: redirect to /login if not authenticated
- Bottom nav: Home, Records, Stats, Activities
- Done when: I can log in, refresh keeps session, nav works

### Phase 2 — CRUD Activity Types
- List, create, edit (name, color, icon/emoji), archive
- Done when: data persists in Supabase and archived ones are hidden

### Phase 3 — Start/Stop Timer
- Home shows grid of activity types as buttons
- Tap = start (insert running_records), tap again = stop (move to records)
- Running ones highlighted with live duration (HH:MM:SS)
- Optional tag input when starting (e.g. "with istri")
- Done when: timer survives page refresh and works across devices

### Phase 4 — Daily Records List
- Records per day, navigate prev/next day
- Show activity, start–end, duration, tags
- Edit record (times, tags, note) and delete
- Manual add record (for forgotten entries)
- Show daily total

### Phase 5 — Statistics
- Range: day / week / month
- Total duration per activity (bar or donut chart, use Chart.js)
- Couple time: sum of all records whose tags contain "with istri",
  across any activity, shown as its own card per day/week
- Work time daily vs target (8h min, 9h max) as indicator

### Phase 6 — PWA
- vite-plugin-pwa, manifest, icons, installable on Android

### Phase 7 (later) — Offline-first
- Dexie.js as local source of truth, sync queue to Supabase

## Working Rules for Claude Code
- Explain your plan briefly before writing code for each phase
- Keep components small, no over-engineering
- Don't install libraries outside the stack without asking
- After each phase: list changed files and suggest a commit message