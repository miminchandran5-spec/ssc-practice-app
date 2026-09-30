# PrepMaster — SSC Exam Preparation Platform

A premium, highly personalized web application designed to help aspirants crack SSC exams (CGL, CHSL, MTS, CPO, GD). Built as a thoughtful study gift, it provides an exceptional user experience, comprehensive practice tools, and intelligent analytics.

## 🌟 Vision
*"A thoughtful study gift."*
PrepMaster is not a generic dashboard template. It is a fully functional, highly polished, and premium study platform designed specifically for Kavya. It features a modern design system, micro-animations, and a warm, personalized onboarding experience.

## ✨ Key Features
- **Personalized Onboarding:** A warm welcome and targeted goal setting.
- **Comprehensive Question Bank:** Hundreds of carefully structured questions across Quantitative Aptitude, Reasoning, English, and General Awareness.
- **Intelligent Analytics:** Real-time tracking of accuracy, speed, and topic mastery.
- **Smart Recommendations:** Data-driven suggestions on what to study next based on performance and weak areas.
- **Mistake Vault:** Automatically records incorrect answers for targeted review and practice.
- **Full Mock Tests & Timed Practice:** Simulates the real SSC exam environment with configurable test parameters.
- **Offline Persistence:** All progress, bookmarks, and test history are saved locally in the browser.
- **Premium UI/UX:** A bespoke design system with tailored color palettes, smooth transitions, and responsive layouts.

## 🛠️ Technology Stack
- **Core:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** Custom CSS Design System (no external UI libraries)
- **State/Persistence:** LocalStorage-based robust data store

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository or navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit `http://localhost:3000`.

### Building for Production
To create a production-ready build:
```bash
npm run build
```
The optimized files will be generated in the `dist` directory.

## 📂 Architecture Overview
- `/src/components`: (To be expanded) Reusable UI components.
- `/src/data`: Contains the static question banks, exam configurations, and taxonomy.
- `/src/pages`: Top-level route components (Dashboard, Practice, Test Center, etc.).
- `/src/store`: The data persistence layer managing `localStorage` interactions and business logic (progress calculations, daily plans).
- `/src/types`: TypeScript interfaces defining the core data models.

## 🎨 Design System
The application utilizes a custom design system defined in `src/index.css`. It features:
- **Typography:** Inter (sans-serif) for clean readability.
- **Colors:** A tailored primary palette (indigo/violet) with semantic accent colors.
- **Components:** Custom CSS classes for buttons, cards, badges, inputs, and layout utilities.
- **Responsiveness:** Fully adapted for mobile, tablet, and desktop viewports.
- **Accessibility:** Reduced motion support and proper focus states.

## 📝 Note on Data Provenance
All practice questions included in the initial dataset are either original practice questions or inspired by SSC exam patterns (`isOfficial: false`). They are designed for high-quality practice and cover essential topics comprehensively.
