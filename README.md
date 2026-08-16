# Sipy

**Discover better coffee, share every sip.**

Sipy is a social coffee-discovery app that brings cafe exploration, drink reviews, and community recommendations into one mobile experience. It helps coffee lovers remember what they enjoyed, find places worth visiting, and see what people they trust are drinking.

This repository contains the Sipy mobile client. The Django REST API and server-side application are maintained separately in the [CS412 backend repository](https://github.com/NSENT01/cs412).

## The Sipy experience

Sipy turns trying coffee into a shared, useful record. With the app, users can:

- Discover cafes and view location, contact, rating, and community information.
- Rate drinks, add tasting notes, and share photos.
- Follow other coffee lovers and browse a feed of their latest reviews.
- Like and comment on posts.
- Save cafes to a personal want-to-try list.
- Compare personal, friend, and community ratings for a cafe.
- Build a taste profile that summarizes coffee activity across cities and countries.
- Explore community leaderboards and discover active reviewers.

## Product architecture

Sipy is split into two independently maintained applications:

| Layer | Technology | Repository |
| --- | --- | --- |
| Mobile client | React Native, Expo, Expo Router, TypeScript | This repository |
| API and data layer | Django, Django REST Framework | [NSENT01/cs412](https://github.com/NSENT01/cs412) |

The mobile client communicates with the backend through authenticated HTTP requests. Access and refresh tokens are stored with Expo SecureStore, and Google Places data supports cafe search and location details.

## Technology

- [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/) for cross-platform development
- [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- TypeScript with strict type checking
- Expo SecureStore for local credential storage
- Google Places and Maps APIs for cafe discovery and location context
- Django REST API provided by the separate backend repository

## Project structure

```text
SipSocial/
├── app/             # Routes, tabs, and modal screens
├── assets/          # Images, fonts, and shared styles
├── components/      # Reusable interface components
├── constants/       # Theme and application constants
├── context/         # Authentication and shared state
├── app.json         # Expo application configuration
├── package.json     # Scripts and dependencies
└── tsconfig.json    # TypeScript configuration
```

## Local development

### Prerequisites

- Node.js and npm
- A supported iOS simulator, Android emulator, physical device with Expo Go, or modern web browser
- A running instance of the [Sipy backend](https://github.com/NSENT01/cs412)
- A Google API key configured for the location services used by the app

This project targets Expo SDK 54. Use the [Expo SDK 54 documentation](https://docs.expo.dev/versions/v54.0.0/) when troubleshooting version-specific behavior.

### Installation

1. Clone the repository and enter the app directory:

   ```bash
   git clone https://github.com/NSENT01/Sipy.git
   cd Sipy
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:

   ```dotenv
   EXPO_PUBLIC_API_URL=https://your-api.example.com
   EXPO_PUBLIC_TOKEN_API_URL=https://your-api.example.com
   EXPO_PUBLIC_ACCESS_TOKEN_KEY=sipy_access_token
   EXPO_PUBLIC_REFRESH_TOKEN_KEY=sipy_refresh_token
   EXPO_PUBLIC_GOOGLE_API_KEY=your_google_api_key
   ```

   Do not commit real credentials or production secrets. Values prefixed with `EXPO_PUBLIC_` are available to the client bundle and must be treated as public configuration.

4. Start the Expo development server:

   ```bash
   npm start
   ```

5. Launch a platform from the Expo terminal, or use a platform-specific script:

   ```bash
   npm run ios
   npm run android
   npm run web
   ```

## Backend development

API endpoints, data models, authentication services, database configuration, and backend deployment instructions live in the [CS412 repository](https://github.com/NSENT01/cs412). Run and configure that project before testing workflows that require accounts, profiles, cafe data, rankings, likes, comments, or follows.

When using a locally hosted backend, set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_TOKEN_API_URL` to an address reachable from the target device or emulator. `localhost` on a physical phone refers to the phone itself, not the development computer.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Expo development server |
| `npm run ios` | Start Expo and open the iOS target |
| `npm run android` | Start Expo and open the Android target |
| `npm run web` | Start the web version of the app |

## Contributing

Before opening a pull request:

1. Keep changes focused and consistent with the existing file-based routing structure.
2. Verify the app on every platform affected by the change.
3. Confirm that authentication and API-dependent flows work with the CS412 backend.
4. Never include `.env` files, access tokens, or private API credentials in a commit.

Please include a clear description of the product or developer impact and the validation performed with each contribution.

## Project status

Sipy is under active development. Interfaces, API contracts, and setup requirements may change as the product evolves.
