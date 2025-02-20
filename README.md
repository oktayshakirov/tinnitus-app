# TinnitusHelp.me

A comprehensive and user-friendly iOS/Android app built with Expo, offering a helpful resource for individuals dealing with tinnitus.

## Demo

![Desktop Demo](/assets/screenshots/Banner.jpg "Desktop Demo")

<p align="center">
  <a href="https://www.TinnitusHelp.me/app"><strong>➥ Live Demo</strong></a>
</p>

## Overview

TinnitusHelp.me is designed to empower individuals managing tinnitus by providing personalized resources and tools. The app offers educational content, calming soundscapes, guided mindfulness practices, lifestyle tips, and fun facts to help you regain control and find moments of peace.

## Key Features

- **Educational Articles:** In-depth articles to help you understand tinnitus and stay updated with the latest insights.
- **Relaxing Soundscapes:** A curated selection of calming sounds to mask and soften tinnitus symptoms.
- **Mindfulness Practices:** Guided meditations and stress-relief techniques for improved mental clarity.
- **Lifestyle Tips:** Practical advice on nutrition, sleep, travel, and daily habits to support overall well-being.
- **Fun Facts and Articles:** Engaging and surprising facts about tinnitus.
- **Push Notifications:** Stay informed with timely updates and reminders, powered by Firebase.

## Technologies

- **Framework:** [Expo](https://expo.dev/) (React Native)
- **Push Notifications:** Firebase Cloud Messaging
- **UI Components:** React Native Elements and other React Native libraries
- **Backend:** Firebase
- **Deployment:** Expo managed workflow for seamless iOS/Android distribution

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 12 or above)
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/) installed globally:
  ```bash
  npm install -g expo-cli
  ```
- A Firebase project configured for push notifications

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/tinnitus-app.git
   cd tinnitus-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file based on the provided example (if available) and add your Firebase configuration and other necessary keys.

### Running the App

Start the Expo development server with:

```bash
expo start
```

Then, use the Expo Go app on your mobile device or an emulator to run the project.

### Building for Production

To create standalone builds for iOS and Android, follow the Expo documentation:

- [Building Standalone Apps with Expo](https://docs.expo.dev/build/introduction/)

## Push Notifications Setup

This app uses Firebase Cloud Messaging for push notifications. Ensure that you:

- Set up a Firebase project and enable Cloud Messaging.
- Update your Firebase configuration in your project.
- Follow Expo's guidelines for configuring push notifications: [Using Push Notifications](https://docs.expo.dev/push-notifications/overview/).

## License

This project is provided for viewing purposes only. All rights are reserved. No part of this project may be copied, modified, or redistributed without explicit written permission from the author.
