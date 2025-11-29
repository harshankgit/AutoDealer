# AutoDealer Mobile App

This is the React Native mobile application for the AutoDealer platform. It shares the same backend API with the web application.

## Setup Instructions

1. Install React Native CLI and dependencies:
```bash
npm install -g @react-native-community/cli
```

2. Install project dependencies:
```bash
cd mobile-app
npm install
```

3. For iOS:
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

4. For Android:
```bash
npx react-native run-android
```

## Features

- Same backend API integration as web app
- Native mobile UI/UX
- Push notifications for chat messages
- Image gallery with zoom functionality
- Offline favorites storage
- Biometric authentication (optional)

## API Configuration

The mobile app uses the same API endpoints as the web application:
- Base URL: Configure in `src/config/api.js`
- Authentication: JWT tokens stored securely in device keychain
- Real-time chat: Socket.IO integration

## Folder Structure

```
mobile-app/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/         # App screens/pages
│   ├── navigation/      # Navigation configuration
│   ├── services/        # API services
│   ├── utils/          # Utility functions
│   └── config/         # App configuration
├── ios/                # iOS specific files
├── android/            # Android specific files
└── package.json
```

## Development Notes

- Use the same MongoDB database and API routes
- Implement platform-specific optimizations
- Add mobile-specific features like push notifications
- Ensure responsive design for different screen sizes
- Test on both iOS and Android devices