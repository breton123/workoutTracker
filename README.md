# Workout Tracker App

A React Native mobile application for tracking your workouts and maintaining your fitness streak.

[![Built with Expo](https://img.shields.io/badge/Built%20with-Expo-4630EB.svg?style=flat-square&logo=EXPO&labelColor=f3f3f3&logoColor=000)](https://expo.dev/)
[![Uses Firebase](https://img.shields.io/badge/Uses-Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)

## Features

- 🏋️‍♂️ Create and manage custom workout routines
- 📅 Schedule workouts for specific days or in rotation
- 🎯 Track sets, reps, and weights for each exercise
- 🔥 Maintain and view your workout streak
- 📹 Add exercise demonstration videos
- ⏱️ Built-in rest timer between sets

![alt text](https://github.com/breton123/workoutTracker/blob/main/IMG_0948.png?raw=true)

## Tech Stack

- React Native with Expo
- Firebase Authentication
- Cloud Firestore
- Firebase Storage (for videos)
- TypeScript
- Expo Router

![alt text](https://github.com/breton123/workoutTracker/blob/main/IMG_0949.png?raw=true)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/breton123/workoutTracker.git
cd workoutTracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and add your config to `firebaseConfig.ts`:
```typescript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};
```

4. Start the development server:
```bash
npx expo start
```

![alt text](https://github.com/breton123/workoutTracker/blob/main/IMG_0950.png?raw=true)

## Features in Detail

### Workout Management
- Create custom workout routines
- Add exercises with sets, reps, and weights
- Schedule workouts for specific days
- Optional video demonstrations for exercises

### Progress Tracking
- Track completed workouts
- View your current streak
- Monitor exercise progression

### Workout Interface
- Clear exercise instructions
- Rest timer between sets
- Progress tracking during workout
- Easy navigation between exercises

[Screenshot Placeholder: Rest Timer]

## Upcoming Features

- 📊 Progress graphs and statistics
- 💪 Exercise history tracking
- 🏆 Achievement system
- 🤝 Social features and sharing
- 📱 Apple Watch / WearOS integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

![alt text](https://github.com/breton123/workoutTracker/blob/main/IMG_0951.png?raw=true)

---

Made with ❤️ by Louis Breton
