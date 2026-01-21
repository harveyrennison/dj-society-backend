# 🎛️ DJ Society Backend

## About

The DJ Society Backend powers the whole DJ Society platform — it’s where all the data lives and where the magic happens behind the scenes. Whether it’s managing users, serving up the latest tutorials, or keeping track of events and music recs, this backend keeps everything running smooth and secure.

Built by Harvey Rennison & Alex McLauchlan, it’s designed for DJs at every level to connect, learn, and grow.

---

## What it Does

- 🔐 **Secure Login & Registration**  
  Keeps your account safe and lets you access exclusive member content.

- 👤 **User Profiles**  
  Stores your info, preferences, and progress so the platform feels personal to you.

- 📚 **Content Management**  
  Adds and updates tutorials, gear tips, and music recommendations so you always have fresh, useful info.

- 📅 **Event Listings**  
  Shows local gigs and DJ events to keep you plugged into the scene.

- 🎧 **Music Recommendations**  
  Curated playlists and tracks specially picked for beginner and intermediate DJs.

- 🔒 **Security**  
  Uses JWT tokens, encryption, and validation to protect your data.

---

## Tech Stack

- Node.js & Express — handling all the API requests
- MySQL (hosted on Aiven) — storing data reliably
- Firebase Storage — cloud storage for images and files
- Firebase Authentication — secure user authentication
- JWT Authentication — keeping logins secure
- Hosted on Vercel — fast and scalable

---

## Setup

1. **Install dependencies:**

    ```bash
    npm install
    ```

2. **Configure Firebase:**
    - Place your Firebase Admin SDK JSON in `secrets/the-dj-society-firebase-adminsdk-fbsvc-806a7080c1.json`
    - Enable Firebase Storage in your Firebase Console
    - (Optional) Create a `.env` file from `.env.example` and set your storage bucket

3. **Start the development server:**

    ```bash
    npm run dev
    ```

4. **For production:**
    ```bash
    npm run build
    npm start
    ```

For detailed Firebase Storage setup, see [FIREBASE_MIGRATION.md](FIREBASE_MIGRATION.md)

---

## Why It Exists

We created this backend to support a community for new DJs who want to dive into DJing but don’t know where to start. It helps make The DJ Society website a friendly, trustworthy place where you can learn, share, and discover new music and events without any hassle.

---

## Current Status

Early days — we’re actively building out features and adding content. Stay tuned for updates!

---

## Made by Harvey Rennison & Alex McLauchlan
