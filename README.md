# AETHER — AI-Powered Cognitive Productivity Companion

AETHER is a state-of-the-art, context-aware productivity companion designed to align your tasks, energy levels, and schedule into a focused daily roadmap. Built with Next.js, TypeScript, and Tailwind CSS, AETHER leverages advanced AI models (xAI Grok-3) to offer proactive suggestions, 3D calendar visualizations, and smart voice interactions.

---

## 🌌 Core Features

### 1. Cinematic Landing Page & Onboarding
- **Premium Dark Mode UI**: A visually stunning landing page featuring mesh-gradient backdrop glows, glassmorphism cards, and fluid hover animations.
- **Contextual Onboarding Flow**: Multi-field registration capturing name, email, designation (Student, Working Professional, Entrepreneur, Freelancer), and conditional fields (College or Company name).
- **Zustand Auth Store**: Lightweight, secure client-side mock authentication persisted via `localStorage`.

### 2. The Oracle (Context-Aware AI)
- **xAI Grok-3 Streaming**: Real-time streaming conversation powered by the `grok-3` model.
- **Dynamic Tone Shifting**: System prompts adapt based on time of day (morning energizing, afternoon focused, evening supportive) and user emotional cues (detects stress, fatigue, or high motivation).
- **Smart Actions Integration**:
  - **Add as Task**: Parses the chatbot's response to instantly create a structured dashboard task.
  - **Weave Day**: Auto-schedules your day around the latest chatbot context.
  - **Start Focus**: Instantly initiates a focus block tailored to the topic discussed.
  - **Break it down**: Instructs Grok to dynamically list subtasks for complex goals.
- **Voice Interactions**: Integrated Speech-to-Text (STT) voice input and Text-to-Speech (TTS) response synthesis.

### 3. ChronoSphere (3D Visual Workspace)
- **Living Time System**: An interactive, lazy-loaded Three.js/React Three Fiber 3D particle sphere visualizing active task priority scales, timeline dependencies, and focus energy fields.

### 4. Timeline Weaver
- **Linear Schedule Block Mapping**: Visualizes tasks chronologically, matching priority weights and user biological stamina parameters dynamically throughout the day.

### 5. Focus Mode
- **Cinematic Workspace**: A distraction-free, full-screen deep work environment featuring countdown timers, escape shortcuts (`Esc`), and dynamic task metrics.

### 6. Insights & Habits Dashboard
- **Habit Tracking**: Tracks streaks for core routines (e.g., Inbox Zero, Deep Work, Rest) with retrospective streak calculations.
- **Stamina Telemetry**: Graphs productivity analytics and energy distribution maps.

### 7. Sentinel Nudges
- **Proactive Flow Optimization**: An ambient cognitive agent that runs in the background to suggest focus blocks matching your morning focus window or prompt high-priority completions before deadlines.

---

## 🛠️ Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Glassmorphism Utilities
- **State Management**: Zustand
- **Animations**: Framer Motion
- **3D Graphics**: Three.js / React Three Fiber / Drei
- **AI Integration**: Vercel AI SDK (Core & UI) & xAI Grok-3 API
- **Icons**: Lucide React

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Shhhreyaaa/AETHER..git
cd aether
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and configure your xAI API Key:
```env
XAI_API_KEY=your_grok_api_key_here
```

### 4. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser to experience AETHER.

---

## 📦 Production Deployment & Building
To build AETHER for production deployment:
```bash
npm run build
npm start
```
The project compiles with **0 warnings or errors**, optimizing static chunks and asset bundles for maximum rendering speed and performance.