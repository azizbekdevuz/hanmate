# HanMate – Korean Voice-first AI Companion for Elders

> **Hackathon Project**: AngelHack x Coupang "AI for Real-World Impact & Future Ventures"  
> A warm, voice-first AI companion for Korean elders living alone.

---

## Problem

Korea has a rapidly aging population, and many elders live alone and feel emotionally isolated. Traditional digital tools are too complex for them to use effectively. This leads to:

- **Loneliness**: Many elders lack daily social interaction
- **Technology barriers**: Smartphones and apps are too complicated
- **Emotional isolation**: Limited opportunities to share feelings and concerns
- **Accessibility issues**: Small text, complex interfaces, and confusing navigation

---

## Solution

HanMate is a **voice-first web application** that:

- **Listens** to elders speak in Korean through their browser
- **Responds** with warm, caring AI-generated replies (2-3 sentences)
- **Speaks back** the responses aloud using text-to-speech
- **Shows potential** for connecting with other nearby elders (social bridge feature)

The entire interaction is **voice-based** - elders just press a large button and speak. No typing, no complex navigation, no small text to read.

---

## Features

### 🎤 Voice-to-AI-to-Voice Loop
- Press the large mic button → Speak in Korean → Get transcribed
- Message sent to AI → Receive warm Korean reply
- Reply displayed in large text AND spoken aloud automatically

### 💬 Korean Caregiving Tone
- AI responses are 2-3 sentences, warm and empathetic
- Acknowledges feelings first, then offers gentle suggestions
- Never mentions being an AI - sounds like a caring friend

### 👴 Elder-Friendly UI
- **Large text**: Easy to read (text-xl to text-6xl)
- **High contrast**: Clear visibility (gray-900 on gray-50)
- **Simple layout**: One page, minimal actions
- **Large buttons**: 120-140px circular mic button
- **Rounded containers**: Soft, friendly design

### 👥 Mock "Nearby People" List
- Shows 2-3 static profiles of elders who want to chat
- Demonstrates the social connection feature
- "곧 제공" (Coming Soon) buttons indicate future functionality

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Voice Input**: Web Speech API (SpeechRecognition)
- **Voice Output**: Web Speech API (SpeechSynthesis)
- **AI**: OpenAI GPT-4o-mini (optional - works with mock responses if no API key)

---

## Running Locally

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (Optional)

For real AI responses, create a `.env.local` file:

```env
OPENAI_API_KEY=your_api_key_here
```

**Note**: The app works without an API key - it will use warm mock responses for the hackathon demo.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main single-page interface
│   ├── layout.tsx        # Root layout with theme provider
│   ├── api/
│   │   └── talk/
│   │       └── route.ts  # AI endpoint
│   └── globals.css       # Global styles
├── components/
│   └── NearbyPeople.tsx  # Mock social section
└── types/
    └── speech.d.ts       # Web Speech API types
```

---

## How It Works

1. **User clicks mic button** → Browser requests microphone permission
2. **User speaks in Korean** → Web Speech API transcribes speech
3. **Text sent to `/api/talk`** → AI generates warm Korean response
4. **Response displayed** → Large text bubble appears
5. **Response spoken** → Browser TTS reads reply in Korean
6. **Social section shown** → Mock list of nearby people to connect with

---

## Hackathon Context

**Event**: AngelHack x Coupang Hackathon 2025  
**Theme**: "AI for Real-World Impact & Future Ventures"  
**Challenge**: Build an AI-driven product with real startup potential

**HanMate's Impact**:
- Addresses real social problem (elderly loneliness in Korea)
- Uses accessible technology (voice-first, no complex UI)
- Shows clear path to deployment (web app, no app store needed)
- Demonstrates scalability (can integrate with welfare centers, city gov)

---

## Future Enhancements

- Real matching system for connecting elders
- Integration with local welfare centers
- Caregiver dashboard for monitoring
- Scheduled check-in calls
- Multi-language support expansion

---

## License

MIT License - Hackathon Project

---

**Built with ❤️ for Korean elders living alone**
