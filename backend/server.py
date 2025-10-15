from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from database import connect_to_mongo, close_mongo_connection, get_database
from auth import JWTBearer, get_user_from_token
from models import (
    UserProfile, Bookmark, ReadingProgress, AIConversation,
    ChatMessage, VerseQuery
)
from ai_service import ai_service
from quran_service import quran_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("Starting up Al-Quran API...")
    await connect_to_mongo()
    yield
    # Shutdown
    logger.info("Shutting down Al-Quran API...")
    await close_mongo_connection()

app = FastAPI(
    title="Al-Quran AI API",
    description="Advanced Al-Quran Mobile App API with AI Ustaz/Ustazah Assistant",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= HEALTH CHECK =============
@app.get("/")
async def root():
    return {
        "message": "Al-Quran AI API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# ============= USER PROFILE ENDPOINTS =============
@app.get("/api/profile")
async def get_profile(token: str = Depends(JWTBearer())):
    """Get user profile"""
    try:
        user_data = get_user_from_token(token)
        user_id = user_data.get("sub")
        
        db = get_database()
        profile = await db.user_profiles.find_one({"user_id": user_id})
        
        if not profile:
            # Create default profile
            new_profile = {
                "user_id": user_id,
                "email": user_data.get("email", ""),
                "name": user_data.get("user_metadata", {}).get("name", ""),
                "preferred_language": "en",
                "preferred_reciter": "ar.alafasy",
                "theme": "light",
                "reading_progress": {},
                "streak_data": {
                    "current_streak": 0,
                    "longest_streak": 0,
                    "last_read_date": None
                }
            }
            result = await db.user_profiles.insert_one(new_profile)
            new_profile["_id"] = str(result.inserted_id)
            return new_profile
        
        profile["_id"] = str(profile["_id"])
        return profile
        
    except Exception as e:
        logger.error(f"Error fetching profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/profile")
async def update_profile(profile_data: dict, token: str = Depends(JWTBearer())):
    """Update user profile"""
    try:
        user_data = get_user_from_token(token)
        user_id = user_data.get("sub")
        
        db = get_database()
        result = await db.user_profiles.update_one(
            {"user_id": user_id},
            {"$set": profile_data}
        )
        
        return {"success": True, "message": "Profile updated"}
        
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= QURAN ENDPOINTS =============
@app.get("/api/quran/surahs")
async def get_surahs():
    """Get list of all surahs"""
    try:
        result = await quran_service.get_surah_list()
        return result
    except Exception as e:
        logger.error(f"Error fetching surahs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/quran/surah/{surah_number}")
async def get_surah(surah_number: int, edition: str = "quran-uthmani"):
    """Get a complete surah"""
    try:
        if surah_number < 1 or surah_number > 114:
            raise HTTPException(status_code=400, detail="Invalid surah number")
        
        result = await quran_service.get_surah(surah_number, edition)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching surah: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/quran/surah/{surah_number}/translations")
async def get_surah_with_translations(surah_number: int, languages: str = "en,ms"):
    """Get surah with multiple translations"""
    try:
        if surah_number < 1 or surah_number > 114:
            raise HTTPException(status_code=400, detail="Invalid surah number")
        
        # Map language codes to edition identifiers
        edition_map = {
            "en": "en.sahih",
            "ms": "ms.basmeih",
            "ur": "ur.jalandhry",
            "id": "id.indonesian"
        }
        
        lang_list = languages.split(",")
        editions = ["quran-uthmani"] + [edition_map.get(lang, "en.sahih") for lang in lang_list]
        
        result = await quran_service.get_translations(surah_number, editions)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching translations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/quran/ayah/{surah_number}/{ayat_number}")
async def get_ayah(surah_number: int, ayat_number: int, edition: str = "quran-uthmani"):
    """Get a specific ayah"""
    try:
        result = await quran_service.get_ayah(surah_number, ayat_number, edition)
        return result
    except Exception as e:
        logger.error(f"Error fetching ayah: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/quran/juz/{juz_number}")
async def get_juz(juz_number: int, edition: str = "quran-uthmani"):
    """Get a complete juz"""
    try:
        if juz_number < 1 or juz_number > 30:
            raise HTTPException(status_code=400, detail="Invalid juz number")
        
        result = await quran_service.get_juz(juz_number, edition)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching juz: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/quran/search")
async def search_quran(q: str, edition: str = "quran-simple"):
    """Search in Quran"""
    try:
        if not q or len(q) < 2:
            raise HTTPException(status_code=400, detail="Query too short")
        
        result = await quran_service.search_quran(q, edition)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching Quran: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/quran/editions")
async def get_editions():
    """Get available Quran editions"""
    return quran_service.get_available_editions()

@app.get("/api/quran/daily-verse")
async def get_daily_verse():
    """Get daily verse - changes each day"""
    try:
        import random
        from datetime import datetime
        
        # Use date as seed for consistent daily verse
        today = datetime.now().strftime('%Y%m%d')
        random.seed(today)
        
        # Select a random surah and ayah
        surah_number = random.randint(1, 114)
        
        # Get surah info to know number of ayahs
        surah_response = await quran_service.get_surah_list()
        surahs = surah_response.get("data", [])
        
        if surahs:
            selected_surah = next((s for s in surahs if s.get("number") == surah_number), None)
            if selected_surah:
                num_ayahs = selected_surah.get("numberOfAyahs", 1)
                ayah_number = random.randint(1, num_ayahs)
                
                # Fetch the verse
                arabic = await quran_service.get_ayah(surah_number, ayah_number, "quran-uthmani")
                translation = await quran_service.get_ayah(surah_number, ayah_number, "en.sahih")
                
                return {
                    "success": True,
                    "data": {
                        "surah_number": surah_number,
                        "ayah_number": ayah_number,
                        "surah_name": selected_surah.get("englishName"),
                        "surah_name_arabic": selected_surah.get("name"),
                        "arabic_text": arabic.get("data", {}).get("text", ""),
                        "translation": translation.get("data", {}).get("text", ""),
                    }
                }
        
        raise HTTPException(status_code=500, detail="Could not fetch daily verse")
    except Exception as e:
        logger.error(f"Error fetching daily verse: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= AI ASSISTANT ENDPOINTS =============
@app.post("/api/ai/chat")
async def chat_with_ai(message: ChatMessage, token: str = Depends(JWTBearer())):
    """Chat with AI Ustaz/Ustazah"""
    try:
        user_data = get_user_from_token(token)
        user_id = user_data.get("sub")
        
        db = get_database()
        
        # Get conversation history
        conversation = await db.ai_conversations.find_one({"user_id": user_id})
        
        conversation_history = []
        if conversation:
            conversation_history = conversation.get("messages", [])[-10:]  # Last 10 messages
        
        # Get AI response
        response = await ai_service.chat(
            message.message,
            conversation_history=conversation_history,
            context=message.context
        )
        
        if response["success"]:
            # Save conversation
            new_messages = conversation_history + [
                {"role": "user", "content": message.message},
                {"role": "assistant", "content": response["message"]}
            ]
            
            if conversation:
                await db.ai_conversations.update_one(
                    {"user_id": user_id},
                    {"$set": {"messages": new_messages[-20:]}}  # Keep last 20 messages
                )
            else:
                await db.ai_conversations.insert_one({
                    "user_id": user_id,
                    "messages": new_messages,
                    "context": message.context
                })
        
        return response
        
    except Exception as e:
        logger.error(f"Error in AI chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/explain-verse")
async def explain_verse(verse: VerseQuery, token: str = Depends(JWTBearer())):
    """Get AI explanation of a verse"""
    try:
        # Fetch the verse
        arabic_result = await quran_service.get_ayah(verse.surah_number, verse.ayat_number, "quran-uthmani")
        translation_result = await quran_service.get_ayah(verse.surah_number, verse.ayat_number, "en.sahih")
        
        arabic_text = arabic_result.get("data", {}).get("text", "")
        translation = translation_result.get("data", {}).get("text", "")
        surah_name = arabic_result.get("data", {}).get("surah", {}).get("englishName", "")
        
        # Get AI explanation
        response = await ai_service.explain_verse(
            verse.surah_number,
            verse.ayat_number,
            surah_name,
            arabic_text,
            translation
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error explaining verse: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/context-help")
async def get_context_help(data: dict, token: str = Depends(JWTBearer())):
    """Get contextual help"""
    try:
        screen = data.get("screen", "home")
        query = data.get("query")
        
        response = await ai_service.contextual_help(screen, query)
        return response
        
    except Exception as e:
        logger.error(f"Error getting context help: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= BOOKMARKS ENDPOINTS =============
@app.get("/api/bookmarks")
async def get_bookmarks(token: str = Depends(JWTBearer())):
    """Get user's bookmarks"""
    try:
        user_data = get_user_from_token(token)
        user_id = user_data.get("sub")
        
        db = get_database()
        bookmarks = await db.bookmarks.find({"user_id": user_id}).to_list(length=None)
        
        for bookmark in bookmarks:
            bookmark["_id"] = str(bookmark["_id"])
        
        return {"bookmarks": bookmarks}
        
    except Exception as e:
        logger.error(f"Error fetching bookmarks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/bookmarks")
async def create_bookmark(bookmark_data: dict, token: str = Depends(JWTBearer())):
    """Create a bookmark"""
    try:
        user_data = get_user_from_token(token)
        user_id = user_data.get("sub")
        
        db = get_database()
        
        # Check if bookmark already exists
        existing = await db.bookmarks.find_one({
            "user_id": user_id,
            "surah_number": bookmark_data["surah_number"],
            "ayat_number": bookmark_data["ayat_number"]
        })
        
        if existing:
            return {"success": False, "message": "Bookmark already exists"}
        
        bookmark = {
            "user_id": user_id,
            "surah_number": bookmark_data["surah_number"],
            "ayat_number": bookmark_data["ayat_number"],
            "note": bookmark_data.get("note", "")
        }
        
        result = await db.bookmarks.insert_one(bookmark)
        bookmark["_id"] = str(result.inserted_id)
        
        return {"success": True, "bookmark": bookmark}
        
    except Exception as e:
        logger.error(f"Error creating bookmark: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/bookmarks/{bookmark_id}")
async def delete_bookmark(bookmark_id: str, token: str = Depends(JWTBearer())):
    """Delete a bookmark"""
    try:
        from bson import ObjectId
        
        user_data = get_user_from_token(token)
        user_id = user_data.get("sub")
        
        db = get_database()
        result = await db.bookmarks.delete_one({
            "_id": ObjectId(bookmark_id),
            "user_id": user_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Bookmark not found")
        
        return {"success": True, "message": "Bookmark deleted"}
        
    except Exception as e:
        logger.error(f"Error deleting bookmark: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= READING PROGRESS ENDPOINTS =============
@app.post("/api/progress/update")
async def update_progress(progress_data: dict, token: str = Depends(JWTBearer())):
    """Update reading progress"""
    try:
        from datetime import datetime, timedelta
        
        user_data = get_user_from_token(token)
        user_id = user_data.get("sub")
        
        db = get_database()
        
        # Get current profile to check streak
        profile = await db.user_profiles.find_one({"user_id": user_id})
        
        if not profile:
            # Create default profile if doesn't exist
            profile = {
                "user_id": user_id,
                "email": user_data.get("email", ""),
                "streak_data": {
                    "current_streak": 0,
                    "longest_streak": 0,
                    "last_read_date": None
                }
            }
            await db.user_profiles.insert_one(profile)
        
        # Update streak
        streak_data = profile.get("streak_data", {
            "current_streak": 0,
            "longest_streak": 0,
            "last_read_date": None
        })
        
        today = datetime.now().date()
        last_read_date = streak_data.get("last_read_date")
        
        if last_read_date:
            if isinstance(last_read_date, str):
                last_read_date = datetime.fromisoformat(last_read_date).date()
            elif isinstance(last_read_date, datetime):
                last_read_date = last_read_date.date()
        
        current_streak = streak_data.get("current_streak", 0)
        longest_streak = streak_data.get("longest_streak", 0)
        
        if last_read_date:
            days_diff = (today - last_read_date).days
            
            if days_diff == 0:
                # Same day, keep streak
                pass
            elif days_diff == 1:
                # Consecutive day, increment streak
                current_streak += 1
            else:
                # Streak broken, reset
                current_streak = 1
        else:
            # First time reading
            current_streak = 1
        
        # Update longest streak if current is higher
        if current_streak > longest_streak:
            longest_streak = current_streak
        
        # Update user's last read position and streak
        await db.user_profiles.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "reading_progress.last_surah": progress_data.get("surah_number"),
                    "reading_progress.last_ayat": progress_data.get("ayat_number"),
                    "reading_progress.last_updated": progress_data.get("timestamp"),
                    "streak_data": {
                        "current_streak": current_streak,
                        "longest_streak": longest_streak,
                        "last_read_date": today.isoformat()
                    }
                }
            }
        )
        
        # Save detailed progress entry
        progress_entry = {
            "user_id": user_id,
            "surah_number": progress_data.get("surah_number"),
            "ayat_number": progress_data.get("ayat_number"),
            "time_spent": progress_data.get("time_spent", 0),
            "date": datetime.now()
        }
        
        await db.reading_progress.insert_one(progress_entry)
        
        return {
            "success": True, 
            "message": "Progress updated",
            "streak": {
                "current_streak": current_streak,
                "longest_streak": longest_streak
            }
        }
        
    except Exception as e:
        logger.error(f"Error updating progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/progress")
async def get_progress(token: str = Depends(JWTBearer())):
    """Get user's reading progress"""
    try:
        user_data = get_user_from_token(token)
        user_id = user_data.get("sub")
        
        db = get_database()
        
        # Get profile with progress
        profile = await db.user_profiles.find_one({"user_id": user_id})
        
        # Get recent reading history
        history = await db.reading_progress.find(
            {"user_id": user_id}
        ).sort("date", -1).limit(30).to_list(length=30)
        
        for item in history:
            item["_id"] = str(item["_id"])
        
        return {
            "current_progress": profile.get("reading_progress", {}) if profile else {},
            "streak": profile.get("streak_data", {}) if profile else {},
            "history": history
        }
        
    except Exception as e:
        logger.error(f"Error fetching progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
