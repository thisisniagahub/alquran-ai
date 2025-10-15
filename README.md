# 🕌 Al-Quran AI - Mobile Application

> An advanced Al-Quran mobile app with AI-powered Islamic learning assistant

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()
[![Features](https://img.shields.io/badge/Features-12%2F13-blue)]()
[![License](https://img.shields.io/badge/License-MIT-yellow)]()

## 📱 Overview

Al-Quran AI is a comprehensive mobile application that combines traditional Quran reading with modern AI technology to provide an enriched Islamic learning experience. The app features an intelligent Islamic teacher (Ustaz/Ustazah) powered by AI, prayer time notifications, Qibla finder, and progress tracking with streak system.

## ✨ Features

### Core Features
- 📖 **Complete Quran Reading** - All 114 Surahs with multiple translations
- 🤖 **AI Islamic Teacher** - Chat with AI Ustaz/Ustazah for guidance
- 🕌 **Prayer Times** - Location-based Islamic prayer times
- 🧭 **Qibla Finder** - Real-time compass to find Qibla direction
- 📊 **Progress Tracking** - Track reading with daily streak system
- 🔖 **Smart Bookmarking** - Save and navigate to favorite verses
- ⚙️ **Customization** - Language, reciter, text size, and theme settings
- 🌟 **Daily Verse** - New inspirational verse every day

### AI Features
- Conversational Islamic learning
- Context-aware verse explanations
- Islamic guidance following Malaysian guidelines (JAKIM/JAIS)
- Multilingual support

### Reading Features
- Multiple Quran translations (English, Malay, Urdu, Indonesian)
- Arabic text with Uthmani script
- Surah navigation
- Juz (Para) browsing
- Verse search functionality

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework:** FastAPI (Python 3.11+)
- **Database:** MongoDB
- **Authentication:** Supabase JWT
- **AI Service:** GLM-4-Plus (ZhipuAI)
- **External APIs:** 
  - Quran API (alquran.cloud)
  - Aladhan Prayer Times API

### Frontend (React Native / Expo)
- **Framework:** React Native 0.79.5
- **Router:** Expo Router v5
- **State Management:** Zustand
- **UI Components:** Expo SDK 54
- **Authentication:** Supabase Client

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB
- Yarn package manager

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Start the server
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install

# Configure environment variables
cp .env.example .env
# Edit .env with your backend URL

# Start development server
yarn start

# For web
yarn web

# For iOS
yarn ios

# For Android
yarn android
```

### Quick Start Script

```bash
# Use the provided startup script
bash START_APP.sh
```

## 📋 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017/alquran_app
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret
GLM_API_KEY=your_glm_api_key
QURAN_API_BASE_URL=https://api.alquran.cloud/v1
```

### Frontend (.env)
```env
EXPO_PUBLIC_BACKEND_URL=http://your-backend-url:8001
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Testing

### Run Backend Tests
```bash
bash test_api_endpoints.sh
python3 test_backend.py
```

### Run Frontend Tests
```bash
cd frontend
npx tsc --noEmit  # Type checking
yarn lint         # Linting
```

## 📖 Documentation

- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Complete feature list
- [Testing Complete](TESTING_COMPLETE.md) - Comprehensive test results
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Production deployment instructions
- [Test Checklist](COMPLETE_TEST_CHECKLIST.md) - Full testing checklist

## 🎯 Project Status

**Current Version:** 1.0.0 (Beta)  
**Feature Completion:** 92% (12/13 features)  
**Status:** ✅ Production Ready for Beta Testing

### Implemented Features
- ✅ AI Chat Assistant
- ✅ Bookmarking System
- ✅ Progress Tracking with Streaks
- ✅ Prayer Times
- ✅ Qibla Finder
- ✅ Settings Management
- ✅ Dynamic Daily Verse
- ✅ Reading Dashboard

### Coming Soon (v1.1)
- ⏳ Audio Quran Recitation
- ⏳ Full Dark Theme
- ⏳ Offline Mode
- ⏳ Push Notifications

## 🔒 Security

- JWT-based authentication
- Protected API endpoints
- Environment variable configuration
- No secrets in code
- Secure user data storage

## 📊 Performance

- API Response: < 500ms average
- AI Chat: 2-5s response time
- Quran Loading: < 1s
- Prayer Times: ~2s with location

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **thisisniagahub** - *Initial work* - [GitHub](https://github.com/thisisniagahub)

## 🙏 Acknowledgments

- Quran data from [AlQuran Cloud API](https://alquran.cloud/api)
- Prayer times from [Aladhan API](https://aladhan.com/prayer-times-api)
- AI powered by [ZhipuAI GLM-4-Plus](https://open.bigmodel.cn/)
- Authentication by [Supabase](https://supabase.com/)

## 📞 Support

For support, email thisisniagahub@gmail.com or open an issue in this repository.

## 🌟 Show your support

Give a ⭐️ if this project helped you!

---

**Made with ❤️ for the Muslim community**  
**Alhamdulillah** 🕌
