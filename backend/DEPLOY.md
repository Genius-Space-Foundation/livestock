# Deployment Guide - Render

This project is set up for easy deployment on Render using a Blueprint.

## Steps to Deploy

1.  **Commit and Push**: Ensure all changes (including `render.yaml` and `package.json`) are pushed to your GitHub repository.
2.  **Go to Render**: Log in to your [Render Dashboard](https://dashboard.render.com/).
3.  **New Blueprint**:
    *   Click the **"New +"** button and select **"Blueprint"**.
    *   Connect your GitHub repository.
4.  **Configure**:
    *   Render will detect the `render.yaml` file.
    *   It will show you the resources it's about to create (Web Service + PostgreSQL).
    *   **Environment Variables**: You will be prompted to provide values for:
        *   `PAYSTACK_SECRET_KEY`
        *   `PAYSTACK_PUBLIC_KEY`
        *   (Other variables like `DATABASE_URL` and `JWT_SECRET` are handled automatically).
5.  **Deploy**: Click **"Apply"** and wait for the services to be provisioned.

## Configuration Details

*   **Build Command**: `npm install && npm run build` (This installs dependencies, generates Prisma client, and syncs the database schema).
*   **Start Command**: `npm start` (Runs the production server).
*   **Database**: A managed PostgreSQL instance will be created automatically.

> [!WARNING]
> The **Free Tier** PostgreSQL database on Render expires after 90 days. For a production environment, it is recommended to upgrade to a "Starter" plan for persistent storage.
