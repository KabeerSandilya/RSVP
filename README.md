# Welcome to your OnSpace project

## How can I edit this code?

There are several ways of editing your application.

**Use OnSpace**

Simply visit the [OnSpace Project]() and start prompting.

Changes made via OnSpace will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in OnSpace.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [OnSpace]() and click on Share -> Publish.

## Environment & security (important) ⚠️

- This project uses server-side secrets (Mongo connection string, admin password/token). Do NOT commit your real `.env` file to the repository.
- We added a `.env.example` with placeholders — copy this to `.env` locally and fill in your real values when developing.
- For production, set secrets in your host's secret manager (Vercel, Render, Heroku, etc.) and do NOT use client-side `VITE_` envs for sensitive values.
- Important server hardening included:
  - Helmet (security headers)
  - Cookie-based admin session (httpOnly cookie)
  - Rate limiting on API endpoints
  - Input validation for RSVP submissions

If you want, I can help you rotate any exposed secret and finish migrating to httpOnly cookie-based admin authentication on the front-end (no localStorage tokens).
