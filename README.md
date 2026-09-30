# ReachInbox Email Scheduler

A full-stack email scheduling system built using React, TypeScript, Express.js, PostgreSQL, Redis and BullMQ.

## Features

- Schedule emails for a future time
- Multiple recipients through CSV/TXT upload
- PostgreSQL persistence using Prisma
- BullMQ delayed jobs with Redis
- Configurable worker concurrency
- Minimum delay between email sends
- Redis-backed hourly email rate limiting
- Automatic rescheduling when rate limit is reached
- Ethereal SMTP integration for testing emails
- Email preview through Ethereal
- Bull Board queue monitoring dashboard
- Scheduled/Sent email dashboard
- Idempotent email processing
- Persistent jobs across application restarts

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Axios
- Vite

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma
- PostgreSQL
- BullMQ
- Redis
- Nodemailer
- Ethereal SMTP

## Architecture

React Frontend
↓
Express REST API
↓
PostgreSQL + Prisma
↓
BullMQ
↓
Redis
↓
Email Worker
↓
Ethereal SMTP

## Running Locally

### 1. Start PostgreSQL and Redis

```bash
docker compose up -d