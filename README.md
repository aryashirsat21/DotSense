# 🔵 DotSense — Braille Teacher Assistant

React Native (Expo SDK 54) mobile app for teachers of visually impaired students.
Scan physical Braille homework with your phone camera, get AI translation via Grok, and privately grade student work.

---

## 🚀 Quick Start

### Requirements
- Node.js 18+
- Expo Go app on phone (SDK 54)

### Run
```bash
npm install --legacy-peer-deps
npx expo start --tunnel
```
Scan QR code with Expo Go on your phone.

---

## 🔑 Add Your Grok API Key

Open `src/utils/api.js` and replace:
```js
const GROK_API_KEY = 'xai-YOUR_KEY_HERE';
```
With your real key from console.x.ai

---

## 📱 Screens
- **Home** — Dashboard, stats, recent scans
- **Scanner** — Camera + Grok Vision AI + text-to-speech
- **Grade Mode** — Tap words to mark errors, live score
- **Students** — Class roster with progress tracking
- **Reports** — Anonymous aggregate admin reports

---

## 🏗️ Tech Stack
| Layer | Tech |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Camera | expo-camera |
| AI Vision | Grok Vision API (xAI) |
| TTS | expo-speech |
| Navigation | @react-navigation/stack |

Built for BrailleVision Hackathon 2026 🏆
