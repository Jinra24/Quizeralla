# Firebase Backend Setup Guide

## Overview
Your Quizeralla app now uses Firebase for cloud-based authentication and data storage. This enables accounts to sync across devices and browsers.

## Prerequisites
- A Google account
- Access to Firebase Console

## Step-by-Step Setup

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: `Quizeralla` (or your preferred name)
4. Click **"Create project"** (takes about 1-2 minutes)
5. Click **"Continue"** when ready

### 2. Enable Authentication
1. In the left sidebar, click **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Select **"Email/Password"** provider
4. Toggle **"Enable"** switch
5. Click **"Save"**

### 3. Create Realtime Database
1. In the left sidebar, click **"Build"** → **"Realtime Database"**
2. Click **"Create Database"**
3. Choose **"United States"** (or your region)
4. Start in **"Test mode"** (you can change security rules later)
5. Click **"Enable"**

### 4. Get Firebase Configuration

1. In the left sidebar, click the **⚙️ Settings** icon
2. Select **"Project settings"**
3. Under **"Your apps"** section, click the **`<>`** (Web) icon if you don't see it
4. Register your app with name **"Quizeralla"**
5. Copy the Firebase config object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 5. Update Your Code

1. Open the file `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase credentials
3. Save the file

Example:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p",
  authDomain: "quizeralla-12345.firebaseapp.com",
  databaseURL: "https://quizeralla-12345-default-rtdb.firebaseio.com",
  projectId: "quizeralla-12345",
  storageBucket: "quizeralla-12345.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890abcd"
};
```

### 6. Set Up Realtime Database Security Rules

1. In Firebase Console, go to **"Realtime Database"**
2. Click the **"Rules"** tab
3. Replace the rules with:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth.uid === $uid || root.child('users').child(auth.uid).child('isAdmin').val() === true",
        ".write": "auth.uid === $uid || root.child('users').child(auth.uid).child('isAdmin').val() === true",
        ".validate": "newData.hasChildren(['name', 'email', 'isAdmin', 'createdAt'])"
      }
    }
  }
}
```

4. Click **"Publish"**

## Features Enabled

✅ **Cross-Device Sync** - Accounts now sync across all devices and browsers  
✅ **Cloud Authentication** - Secure Firebase Authentication system  
✅ **Real-time Database** - User data stored in the cloud  
✅ **Admin Management** - Admins can create/delete accounts with cloud persistence  
✅ **Quiz Data** - Quiz results can be saved to the cloud (optional feature)

## Default Admin Credentials

After first login attempt:
- **Email:** `admin@example.com`
- **Password:** `admin123`

The default admin will be automatically created in your Firebase database.

## Testing

1. **Test on one device:**
   - Go to your app URL
   - Login with `admin@example.com` / `admin123`
   - Create a new user account

2. **Test cross-device (the key feature):**
   - Open the app on a different device/browser
   - The new user account should be available
   - Login with the new credentials

3. **Admin Dashboard:**
   - Create/delete accounts
   - Promote users to admin
   - View user statistics

## Troubleshooting

### "Firebase not initialized"
- Check that `firebase-config.js` has valid credentials
- Ensure all script tags are loading in the correct order in your HTML files

### "Authentication error"
- Verify Email/Password provider is enabled in Firebase Console
- Check that the database URL is correct

### "Permission denied"
- Ensure your Realtime Database security rules are published
- Check that `isAdmin` field is properly set for admin users

### "User not found"
- Make sure the user was created in Firebase Authentication AND the database
- The app creates both automatically when an admin creates an account

## Next Steps

1. Deploy your app to GitHub Pages (if not already done)
2. Update the GitHub Pages domain in Firebase Console:
   - Go to **Authentication** → **Settings**
   - Add your GitHub Pages URL to "Authorized domains"
   - Format: `username.github.io` (e.g., `Jinra24.github.io`)

3. (Optional) Set up more restrictive security rules when ready for production

## Firebase Free Tier

Your Firebase project includes:
- **100 simultaneous connections** (plenty for a small to medium app)
- **1 GB of data storage** (enough for thousands of users)
- **100 GB of bandwidth** per month
- All features in this guide are covered by the free tier

For pricing details, visit: https://firebase.google.com/pricing

---

## Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Open browser DevTools (F12) → Console tab for JavaScript errors
3. Verify all config values are copied correctly (no spaces, special characters)
