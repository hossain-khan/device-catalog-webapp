# Firebase Integration Documentation

This document describes the Firebase integration in the Android Device Catalog Web App.

## Overview

Firebase has been integrated to provide:
- **Firebase Analytics**: Track user interactions, page views, and custom events
- **Future extensibility**: Ready for additional Firebase services (Auth, Firestore, etc.)

## Setup

### Installation

Firebase SDK has been installed via npm:

```bash
npm install firebase
```

Current version: `firebase@12.6.0`

## Configuration

### Firebase Config File

Location: [`src/lib/firebase.ts`](../src/lib/firebase.ts)

This file:
- Initializes the Firebase app with your project configuration
- Sets up Firebase Analytics (browser-only)
- Exports the Firebase app and analytics instances

### Key Features

1. **Browser-only initialization**: Analytics only initializes in browser environments (not during SSR)
2. **Error handling**: Gracefully handles initialization failures
3. **Console logging**: Provides feedback on successful initialization

## Usage

### Basic Analytics Tracking

Import the analytics utilities:

```typescript
import { trackEvent, trackPageView, trackDeviceAction } from '@/lib/analytics';
```

### Available Tracking Functions

#### 1. Track Custom Events

```typescript
trackEvent('button_click', {
  button_name: 'export_data',
  format: 'csv'
});
```

#### 2. Track Page Views

```typescript
trackPageView('Device Browser', {
  device_count: 22751,
  filters_applied: true
});
```

#### 3. Track Device Actions

```typescript
trackDeviceAction('view_device', {
  device_name: 'Pixel 8 Pro',
  manufacturer: 'Google'
});

trackDeviceAction('search', {
  query: 'Pixel',
  results: 43
});
```

#### 4. Track Search Queries

```typescript
trackSearch('Samsung Galaxy', 127);
```

#### 5. Track Filter Usage

```typescript
trackFilter('manufacturer', 'Google');
trackFilter('year', 2024);
```

#### 6. Set User Properties

```typescript
import { setAnalyticsUserId, setAnalyticsUserProperties } from '@/lib/analytics';

// Set user ID
setAnalyticsUserId('user_12345');

// Set user properties
setAnalyticsUserProperties({
  preferred_theme: 'dark',
  device_count_viewed: 50,
  subscription_tier: 'free'
});
```

## Integration Examples

### Example 1: Track Device Card Clicks

```typescript
// In DeviceCard.tsx
import { trackDeviceAction } from '@/lib/analytics';

const handleDeviceClick = (device: AndroidDevice) => {
  trackDeviceAction('view_device', {
    device_name: device.name,
    manufacturer: device.manufacturer,
    retail_branding: device.retailBranding
  });
  
  // ... rest of your click handler
};
```

### Example 2: Track Search Usage

```typescript
// In DeviceGrid.tsx
import { trackSearch } from '@/lib/analytics';

useEffect(() => {
  if (searchQuery) {
    trackSearch(searchQuery, filteredDevices.length);
  }
}, [searchQuery, filteredDevices.length]);
```

### Example 3: Track Export Actions

```typescript
// In ExportButton component
import { trackEvent } from '@/lib/analytics';

const handleExport = (format: string) => {
  trackEvent('export_data', {
    format,
    device_count: selectedDevices.length,
    has_filters: filtersApplied
  });
  
  // ... rest of export logic
};
```

## Firebase Console

Access your Firebase project at:
- **Project Console**: https://console.firebase.google.com/project/android-device-catalog
- **Analytics Dashboard**: https://console.firebase.google.com/project/android-device-catalog/analytics

## Configuration Details

```javascript
Project ID: android-device-catalog
API Key: AIzaSyBEP72eEkJo1fOiBPax5zQMKnABU-IFGC8
Auth Domain: android-device-catalog.firebaseapp.com
Database URL: https://android-device-catalog.firebaseio.com
Storage Bucket: android-device-catalog.firebasestorage.app
Messaging Sender ID: 141680233797
App ID: 1:141680233797:web:7a9070af5e89357571022c
Measurement ID: G-RYGF5QGYB0
```

## Environment Variables (Optional)

For better security in production, consider using environment variables:

### `.env` file

```env
VITE_FIREBASE_API_KEY=AIzaSyBEP72eEkJo1fOiBPax5zQMKnABU-IFGC8
VITE_FIREBASE_AUTH_DOMAIN=android-device-catalog.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://android-device-catalog.firebaseio.com
VITE_FIREBASE_PROJECT_ID=android-device-catalog
VITE_FIREBASE_STORAGE_BUCKET=android-device-catalog.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=141680233797
VITE_FIREBASE_APP_ID=1:141680233797:web:7a9070af5e89357571022c
VITE_FIREBASE_MEASUREMENT_ID=G-RYGF5QGYB0
```

### Update `firebase.ts`

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```

## Future Enhancements

The Firebase integration is ready for additional services:

### Firebase Authentication

```typescript
import { getAuth } from 'firebase/auth';
const auth = getAuth(app);
```

### Cloud Firestore

```typescript
import { getFirestore } from 'firebase/firestore';
const db = getFirestore(app);
```

### Cloud Storage

```typescript
import { getStorage } from 'firebase/storage';
const storage = getStorage(app);
```

### Firebase Hosting

Already compatible! Deploy with:

```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

## Testing

To verify Firebase is working:

1. **Run the dev server**:
   ```bash
   npm run dev
   ```

2. **Check the browser console** for:
   ```
   📊 Firebase Analytics initialized successfully
   ```

3. **View Analytics in real-time**:
   - Go to Firebase Console → Analytics → DebugView
   - Enable debug mode in your browser:
     ```javascript
     window.gtag('set', 'debug_mode', true);
     ```

## Troubleshooting

### Analytics not initializing

- Verify you're testing in a browser (not during SSR)
- Check browser console for errors
- Ensure ad blockers aren't blocking Firebase scripts
- Verify your Firebase project is active in the console

### Events not appearing in Analytics

- Real-time data may take 1-2 minutes to appear
- Use DebugView for immediate feedback during development
- Verify analytics instance is not null before tracking

## Build Impact

Firebase SDK adds approximately:
- **Gzipped size**: ~50-70 KB (analytics only)
- **Impact on load time**: Minimal (lazy-loaded)
- **Bundle optimization**: Already code-split in Vite build

## Privacy & Compliance

Firebase Analytics respects:
- User privacy settings
- Browser Do Not Track preferences
- GDPR compliance (when configured)

Consider adding a cookie consent banner if required by your jurisdiction.

## Support

For Firebase-specific issues:
- **Documentation**: https://firebase.google.com/docs
- **Community**: https://firebase.google.com/support
- **GitHub Issues**: File in this repository with `[Firebase]` prefix

---

**Last Updated**: December 12, 2025  
**Firebase SDK Version**: 12.6.0  
**Integration Branch**: `feature/firebase-integration`
