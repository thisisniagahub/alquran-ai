from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class UserProfile(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    email: str
    name: Optional[str] = None
    preferred_language: str = "en"
    preferred_reciter: str = "ar.alafasy"
    theme: str = "light"
    reading_progress: dict = {}
    streak_data: dict = {"current_streak": 0, "longest_streak": 0, "last_read_date": None}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Bookmark(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    surah_number: int
    ayat_number: int
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ReadingProgress(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    surah_number: int
    ayat_number: int
    time_spent: int  # in seconds
    date: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class AIConversation(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    messages: List[dict] = []
    context: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class PrayerTimes(BaseModel):
    fajr: str
    dhuhr: str
    asr: str
    maghrib: str
    isha: str

class ChatMessage(BaseModel):
    message: str
    context: Optional[dict] = None

class VerseQuery(BaseModel):
    surah_number: int
    ayat_number: int
    language: Optional[str] = "en"