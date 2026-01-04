# Versus Draft: Project Structure & Logic Overview

Welcome to your Versus Draft application! This document provides a high-level overview of the project structure, key files, and the logic behind how it all works.

## Core Technologies

*   **Next.js (React Framework)**: Used for the overall structure, routing, and both client-side and server-side rendering. We use the **App Router**.
*   **Firebase**: The backend-as-a-service that powers the application.
    *   **Firestore**: A real-time, NoSQL database used to store all room, player, and draft data.
    *   **Firebase Authentication**: Manages user accounts (based on a unique nickname).
*   **TypeScript**: Ensures code quality and provides type safety.
*   **Tailwind CSS & ShadCN UI**: Used for styling and providing a rich set of pre-built UI components.
*   **Genkit**: Powers the AI functionality, such as generating the dramatic reveal text.

---

## 🚀 How to Deploy Your Application (100% Free)

GitHub Pages is not suitable for this project because it's a dynamic Next.js application, not a static site. The best and easiest way to deploy your app for free is using **Firebase App Hosting**.

Your project is already configured for this. Follow these steps:

1.  **Go to your Firebase Console**: Navigate to your project on the [Firebase Console](https://console.firebase.google.com/).
2.  **Find App Hosting**: In the left-hand menu, under "Build", click on **App Hosting**.
3.  **Create a Backend**: Click "Create backend" and follow the on-screen prompts.
4.  **Connect GitHub**:
    *   You will be prompted to connect your GitHub account.
    *   Select the repository for this project.
    *   Choose your `prod` branch (or whichever branch you want to deploy).
5.  **Deploy**: Firebase will automatically detect the `apphosting.yaml` file, build your Next.js application, and deploy it.

Once the process is complete, Firebase will give you a public URL (like `your-app-name.web.app`) where you can access and test your fully functional draft system online. This is the recommended and most reliable method for this project.

---

## Directory & File Breakdown

Here are the most important folders and files you'll interact with:

### `src/app/` - Pages & Routing

This directory uses the Next.js App Router paradigm. Each folder represents a route in the application.

*   **`/page.tsx`**: The **Login Page**. The entry point for the application where users log in.
*   **`/dashboard/page.tsx`**: The **Lobby**. This page fetches and displays the list of all active draft rooms from Firestore.
*   **`/create-room/page.tsx`**: The **Room Creation Form**. This is where a user defines all the settings for a new draft room.
*   **`/profile/page.tsx`**: The **User Profile Page**. Allows a user to update their profile photo URL.
*   **`/room/[id]/page.tsx`**: **This is the most important file for the draft logic.** It's the real-time draft room itself.
    *   It takes the room `id` from the URL.
    *   It uses the `useDoc` and `useCollection` hooks (from `src/firebase/`) to get live data for the room, its players, and the draft picks.
    *   It contains the central "game state machine" logic within `useEffect` hooks, which react to changes in the data (like players joining or picks being made) to advance the draft phase (`PREP` -> `COIN_FLIP` -> `DRAFTING`, etc.).
    *   All user interactions, like picking a character or selecting a Super Art, are handled here and trigger updates to the Firestore database.

### `src/components/` - Reusable UI Components

*   **`/ui/`**: Contains all the standard UI components from the ShadCN library (e.g., `Button`, `Card`, `Dialog`). You can customize their look in `src/app/globals.css`.
*   **`/room/`**: Contains React components specifically designed for the draft room interface (e.g., `TeamDisplay`, `CharacterSquare`, `DraftTimer`).
*   **`page-header.tsx`**: The main navigation header that appears on top of most pages.

### `src/firebase/` - Firebase Integration

This is the central hub for all communication with Firebase.

*   **`config.ts`**: Your project's Firebase configuration credentials.
*   **`provider.tsx`**: A critical file. It creates a React Context (`FirebaseProvider`) that wraps the entire application.
    *   It initializes Firebase services.
    *   It manages the user's authentication state (who is currently logged in).
    *   It provides convenient hooks like `useUser()`, `useAuth()`, and `useFirestore()` so any component can easily access the current user or Firebase services.
*   **`firestore/useDoc.tsx` & `firestore/useCollection.tsx`**: These are custom React hooks that make it incredibly easy to get real-time data. You give them a reference to a Firestore document or collection, and they return the data, automatically updating your component whenever the data changes in the database.
*   **`non-blocking-updates.tsx`**: Contains functions (`setDocumentNonBlocking`, `updateDocumentNonBlocking`) that write data to Firestore. They are "non-blocking" or "fire-and-forget," meaning the app sends the update and immediately continues, which makes the UI feel fast.

### `src/lib/` - Core Data and Types

This folder contains application-wide data, types, and utility functions.

*   **`types.ts`**: Defines the TypeScript interfaces for our main data structures: `Room`, `RoomPlayer`, and `DraftPick`. This is the "schema" for our database objects.
*   **`game-data.ts`**: Contains the static data for all available `CHARACTERS` and `SUPER_ARTS`.
*   **`constants.ts`**: Holds constants for draft timing and the logic for the `getPickOrder` function, which determines the 1-2-2 pick sequence.

---

## How it All Works Together: The Draft Flow

1.  **Login/Signup (`/page.tsx`, `/signup/page.tsx`)**: A user creates an account or logs in using Firebase Authentication. Their user data is stored in the `/users/{userId}` collection in Firestore.
2.  **Create Room (`/create-room/page.tsx`)**: A user fills out the form. When they click "Create Room," a new document is created in the `/rooms` collection in Firestore. The user is also added to the `/rooms/{roomId}/players` sub-collection for that new room.
3.  **Join Room (`/room/[id]/page.tsx`)**: When a user navigates to a room URL, the page loads.
    *   It uses `useDoc` to fetch the main `roomData`.
    *   It uses `useCollection` to fetch all players in the `/rooms/{roomId}/players` sub-collection.
    *   If the current user is not in the `players` list, a dialog appears prompting them to join a team or as a spectator. Their choice adds them to the `players` sub-collection.
4.  **Draft Logic (`/room/[id]/page.tsx`)**:
    *   **State Machine**: A `useEffect` hook, running only for the room's admin, constantly checks the conditions to advance the game state (`phase`). For example, if `phase` is `PREP` and all teams are full, it changes the `phase` in Firestore to `COIN_FLIP`.
    *   **Real-Time Updates**: All clients in the room are subscribed to this `roomData`. When the `phase` field changes, their UIs react instantly—a countdown timer appears, the character grid shows up, etc.
    *   **Making a Pick**: When a player clicks a character, the `handlePickCharacter` function is called. It creates a new document in the `/rooms/{roomId}/picks` sub-collection.
    *   **Live Sync**: Because all players are subscribed to the `picks` sub-collection via `useCollection`, the new pick appears on everyone's screen immediately. The `TeamDisplay` component updates to show the character's image next to the player's name.

This event-driven, real-time architecture with Firestore at its core is what allows the entire experience to be synchronized for all users simultaneously.
