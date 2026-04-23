# Bookstore Sales-Ready Demo

This project is a modern web application designed for B2B SaaS presentations. It includes a hidden mechanism to instantly clear test/junk data and restore a "Golden State" for marketing and sales demos.

##  Tech Stack
- **Backend:** FastAPI (Python), SQLAlchemy, PostgreSQL
- **Frontend:** Next.js (React), Tailwind CSS, Shadcn UI
- **Infrastructure:** Docker & Docker Compose

##  Quick Start (Zero Config)
To run this project flawlessly on any machine:
1. Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running.
2. Run the following command in the project root:
   ```bash
   docker-compose up -d --build
   ```
3. Open your browser and navigate to `http://localhost:3000`

##  Default Credentials
- **Admin Account**: Username: `admin` | Password: `admin123`
- **User Account**: Username: `user` | Password: `user123`

##  Secret Demo Controls
Once logged in to the dashboard, use the following hidden keyboard shortcuts to demonstrate the system:
- **`Ctrl+Shift+J`**: Injects corrupted and anomalous data (State 1).
- **`Ctrl+Shift+R`**: Triggers the Admin Reset API, destroying junk data and instantly seeding the Golden Demo State (State 2).
