# 🚀 Deploy ke Vercel - Quick Start

## Cara Cepat Deploy

### 1. Buka Vercel
- Kunjungi: https://vercel.com
- Login dengan GitHub

### 2. Import Project
- Klik "Add New..." → "Project"  
- Pilih: `thisisniagahub/alquran-ai`
- Klik "Import"

### 3. Configure
- Framework: Other
- Root Directory: ./
- Biarkan Build/Output/Install command kosong

### 4. Environment Variables
Tambahkan di Vercel dashboard (PENTING!):
- MONGO_URL (gunakan MongoDB Atlas)
- SUPABASE_URL
- SUPABASE_KEY  
- SUPABASE_JWT_SECRET
- GLM_API_KEY
- QURAN_API_BASE_URL

### 5. Deploy
Klik "Deploy" dan tunggu selesai

## MongoDB Atlas Setup
1. Buat account: https://mongodb.com/cloud/atlas
2. Buat cluster FREE
3. Database: alquran_app
4. Whitelist IP: 0.0.0.0/0

## Setelah Deploy
URL Anda: https://alquran-ai.vercel.app

Test: `curl https://alquran-ai.vercel.app/api/health`

## File Konfigurasi
- ✅ vercel.json
- ✅ backend/vercel_app.py  
- ✅ requirements-vercel.txt
- ✅ .vercelignore

Sudah siap digunakan!
