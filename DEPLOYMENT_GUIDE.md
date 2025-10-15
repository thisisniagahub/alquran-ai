# Al-Quran AI App - Deployment Guide

## 🚀 Quick Start

### Backend Deployment

#### Prerequisites
```bash
- Python 3.11+
- MongoDB
- pip or pip3
```

#### Installation
```bash
cd /app/backend

# Install dependencies
pip3 install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run server
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001
```

#### Environment Variables (.env)
```bash
# MongoDB
MONGO_URL=mongodb://localhost:27017/alquran_app

# Supabase (Authentication)
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret

# GLM AI API
GLM_API_KEY=your_glm_api_key

# Quran API
QURAN_API_BASE_URL=https://api.alquran.cloud/v1
```

### Frontend Deployment

#### Prerequisites
```bash
- Node.js 18+
- Yarn
- Expo CLI
```

#### Installation
```bash
cd /app/frontend

# Install dependencies
yarn install

# Configure environment
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

#### Environment Variables (.env)
```bash
EXPO_PUBLIC_BACKEND_URL=http://your-backend-url:8001
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Production Deployment

### Backend (FastAPI)

#### Option 1: Docker
```bash
cd /app/backend

# Create Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]

# Build and run
docker build -t alquran-backend .
docker run -p 8001:8001 --env-file .env alquran-backend
```

#### Option 2: systemd Service
```bash
# Create /etc/systemd/system/alquran-api.service
[Unit]
Description=Al-Quran API Backend
After=network.target mongodb.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/app/backend
Environment="PATH=/usr/local/bin"
ExecStart=/usr/local/bin/python3 -m uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable alquran-api
sudo systemctl start alquran-api
```

#### Option 3: Gunicorn + Nginx
```bash
# Install gunicorn
pip3 install gunicorn

# Run with gunicorn
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001

# Nginx reverse proxy
server {
    listen 80;
    server_name api.alquran.app;
    
    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Frontend (Expo/React Native)

#### Web Build
```bash
cd /app/frontend
yarn web:build

# Serve with nginx
cp -r web-build/* /var/www/html/alquran/
```

#### iOS Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build
eas build --platform ios
```

#### Android Build
```bash
# Build APK
eas build --platform android

# Or use local build
npx expo run:android --variant release
```

## 🔧 Configuration

### MongoDB Setup
```bash
# Install MongoDB
sudo apt-get install mongodb-org

# Start service
sudo systemctl start mongod

# Create database and collections
mongo
> use alquran_app
> db.createCollection("user_profiles")
> db.createCollection("bookmarks")
> db.createCollection("reading_progress")
> db.createCollection("ai_conversations")
```

### Supabase Setup
1. Create project at supabase.com
2. Enable Email/Password authentication
3. Get API keys from Settings > API
4. Get JWT secret from Settings > API > JWT Settings

### GLM API Setup
1. Register at open.bigmodel.cn
2. Create API key
3. Test with available models (glm-4-plus, glm-4, etc.)

## 🧪 Testing

### Backend Tests
```bash
cd /app

# Test API endpoints
bash test_api_endpoints.sh

# Test services
python3 test_backend.py
```

### Frontend Tests
```bash
cd /app/frontend

# Type checking
npx tsc --noEmit

# Linting
yarn lint

# Run on simulator
yarn ios  # or yarn android
```

## 📊 Monitoring

### Backend Monitoring
```bash
# Add logging
import logging
logging.basicConfig(level=logging.INFO)

# Add metrics (optional)
pip install prometheus-fastapi-instrumentator

# In server.py
from prometheus_fastapi_instrumentator import Instrumentator
Instrumentator().instrument(app).expose(app)
```

### Error Tracking
- Use Sentry for production error tracking
- Configure in server.py:
```python
import sentry_sdk
sentry_sdk.init(dsn="your-sentry-dsn")
```

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable MongoDB authentication
- [ ] Use Supabase Row Level Security
- [ ] Validate all user inputs
- [ ] Keep dependencies updated
- [ ] Set up backup strategy

## 🔄 Updates & Maintenance

### Backend Updates
```bash
cd /app/backend
git pull
pip3 install -r requirements.txt --upgrade
sudo systemctl restart alquran-api
```

### Frontend Updates
```bash
cd /app/frontend
git pull
yarn install
yarn web:build
# Deploy new build
```

## 📱 App Store Submission

### iOS
1. Build with EAS: `eas build --platform ios`
2. Download IPA from EAS dashboard
3. Upload to App Store Connect
4. Fill app metadata
5. Submit for review

### Android
1. Build AAB: `eas build --platform android`
2. Download AAB from EAS dashboard
3. Upload to Google Play Console
4. Fill store listing
5. Submit for review

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string
echo $MONGO_URL

# Test connection
mongo $MONGO_URL
```

**API Not Responding**
```bash
# Check if server is running
ps aux | grep uvicorn

# Check logs
tail -f /var/log/alquran-api.log

# Test endpoint
curl http://localhost:8001/api/health
```

**AI Service Errors**
```bash
# Verify API key
echo $GLM_API_KEY

# Test different models
python3 -c "from zhipuai import ZhipuAI; ..."
```

### Frontend Issues

**Metro Bundler Issues**
```bash
# Clear cache
yarn start --reset-cache

# Clean
rm -rf node_modules .expo
yarn install
```

**Build Failures**
```bash
# Check Expo version
npx expo --version

# Update Expo
npx expo install --fix

# Check TypeScript errors
npx tsc --noEmit
```

## 📞 Support

- Backend Issues: Check `/app/backend/server.py` logs
- Frontend Issues: Check Expo developer tools
- API Issues: Check `/app/test_api_endpoints.sh` results
- Integration Issues: Check `/app/FINAL_TEST_SUMMARY.md`

## 📝 Version History

- v1.0.0 - Initial release
  - Complete Quran reading
  - AI assistant
  - Prayer times & Qibla
  - Progress tracking
  - Settings
  
- v1.1.0 (Planned)
  - Audio playback
  - Dark theme
  - Offline mode
  - Push notifications

---

For detailed feature documentation, see `/app/IMPLEMENTATION_SUMMARY.md`
For test results, see `/app/FINAL_TEST_SUMMARY.md`
