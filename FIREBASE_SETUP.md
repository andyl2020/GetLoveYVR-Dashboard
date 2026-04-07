# Firebase Setup

This dashboard is set up for:

- Public read access for anyone with the URL
- Google sign-in for editors
- Shared checklist state stored in Firestore
- Write access limited to the email(s) you allow

## 1. Create the Firebase project

1. Open the Firebase console:
   https://console.firebase.google.com/
2. Click `Create a project`
3. Name it something like `GetLoveYVR Dashboard`
4. You can leave Google Analytics off for this project

## 2. Add the web app

1. Inside the Firebase project, click the web icon `</>`
2. App nickname: `GetLoveYVR Dashboard`
3. Click `Register app`
4. Firebase will show a config object
5. Keep that tab open because you will copy those values into `.env`

## 3. Turn on Firestore

1. In the left sidebar, click `Firestore Database`
2. Click `Create database`
3. Choose `Production mode`
4. Pick a region close to you
5. Finish setup

## 4. Turn on Google sign-in

1. In the left sidebar, click `Authentication`
2. Click `Get started` if needed
3. Open the `Sign-in method` tab
4. Enable `Google`
5. Choose a support email
6. Save

## 5. Add allowed domains

In `Authentication` -> `Settings` -> `Authorized domains`, make sure these are present:

- `localhost`
- `127.0.0.1`
- `andyl2020.github.io`

## 6. Create your local `.env`

1. In the project root, copy `.env.example` to `.env`
2. Fill in the values from Firebase
3. If you want GitHub Pages to use the same config, also copy `.env` to `.env.production`

Example:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_EDITOR_EMAILS=aluu.life@gmail.com
VITE_FIREBASE_DASHBOARD_COLLECTION=dashboard
VITE_FIREBASE_DASHBOARD_DOCUMENT=shared-state
```

## 7. Add Firestore rules

Open `Firestore Database` -> `Rules` and replace the default rules with:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /dashboard/{docId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email in ["aluu.life@gmail.com"];
    }
  }
}
```

If you later want more editors, add their emails inside the array.

If you change `VITE_FIREBASE_DASHBOARD_COLLECTION`, update the rules path too.

## 8. Test locally

Run:

```bash
npm run dev
```

Expected behavior:

- Anyone can open the dashboard and see the saved state
- Viewers stay read-only
- Andy signs in with Google to edit
- Changes sync across devices because Firestore stores the shared state

## 9. Deploy

Push to `main`. GitHub Pages will rebuild automatically.

Note:

- This repo keeps `.env.production` checked in so the public GitHub Pages build can access the Firebase web config.
- That Firebase web config is safe to expose in a client app. Security comes from Firebase Auth and Firestore rules, not from hiding these values.

## What Codex can do next

Once your Firebase project is created, send me:

- the values for your `.env`
- whether the editor email should stay `aluu.life@gmail.com`

Then I can finish any remaining setup, test the auth flow, and polish the editor/viewer experience.
