# CyberAI - Kali Linux & Cybersecurity Expert AI

A beautiful, production-ready AI chatbot specialized in Kali Linux, penetration testing, and cybersecurity. Built with React, TypeScript, and Tailwind CSS.

## 🌐 Live Demo
Visit: [https://cyberai.rf.gd](https://cyberai.rf.gd)

## Features

- 🤖 **Dual AI Modes**: Switch between CyberSecurity Expert and Normal Chat modes
- 🎨 **Modern UI**: Beautiful glassmorphism design with dark/light theme toggle (dark by default)
- 💬 **Advanced Chat**: Markdown rendering, code syntax highlighting, and copy-to-clipboard
- 📱 **Responsive**: Optimized for mobile, tablet, and desktop
- 🔧 **File Upload**: Support for images, audio, and video files
- ⚡ **Real-time**: Typing indicators and smooth animations
- 👤 **User Profiles**: Personalized experience with name and optional email
- 🔒 **Privacy First**: All user data stored locally, never shared
- 📊 **Analytics**: Built-in visitor tracking and session management

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: PHP with cURL for OpenRouter API integration
- **UI Components**: Lucide React icons, React Markdown, Syntax Highlighter
- **Styling**: Glassmorphism effects, smooth transitions, responsive design
- **AI**: OpenRouter API with Mistral-7B-Instruct model

## Getting Started

### Frontend Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Backend Setup

1. Upload the `backend/` folder to your web server
2. Ensure your server has cURL enabled
3. The backend is configured to work with the OpenRouter API
4. Update domain references if deploying to a different domain

## Deployment

### Frontend
Build for production:
```bash
npm run build
```

### Backend
Upload `backend/` folder to your web server (currently configured for https://cyberai.rf.gd)

## API Configuration

The backend uses OpenRouter API with the following configuration:
- **Model**: mistralai/mistral-7b-instruct
- **Endpoint**: https://openrouter.ai/api/v1/chat/completions
- **Features**: CORS enabled, error handling, timeout management

## Features in Detail

### 🎨 Design
- Glassmorphism UI with backdrop blur effects
- Dark theme by default with light theme option
- Responsive design for all screen sizes
- Professional cybersecurity-themed color scheme

### 💬 Chat Experience
- Dual AI modes: CyberSecurity Expert & Normal Chat
- Real-time message streaming
- Markdown and code block rendering
- Syntax highlighting for multiple languages
- Copy-to-clipboard functionality
- Typing indicators and animations

### 👤 User Experience
- Welcome modal for new users
- User profile system with name and optional email
- Feature popup to guide users
- Personalized chat exports
- Local data storage for privacy

### 🔧 Technical Features
- Context-aware conversations
- File upload support (images, audio, video)
- Voice-to-text input
- Error handling and fallback responses
- Visitor tracking and analytics
- Session management
- Optimized performance and loading states

## Privacy & Security

- **Local Storage**: All user data stored locally on device
- **No Data Sharing**: User information never sent to external servers
- **Optional Analytics**: Visitor tracking for site improvement (can be disabled)
- **Secure API**: Proper CORS handling and API key management

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Developer

**Developed by Udit Narayan**
- Instagram: [@https.udit](https://instagram.com/https.udit)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please reach out via Instagram [@https.udit](https://instagram.com/https.udit).

## Changelog

### v2.0.0
- Added user profile system
- Implemented dual AI modes
- Set dark theme as default
- Added feature popup for user guidance
- Removed admin functionality
- Updated domain to cyberai.rf.gd
- Enhanced privacy features
- Improved user onboarding experience