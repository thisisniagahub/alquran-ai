from zhipuai import ZhipuAI
from config import settings
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.client = ZhipuAI(api_key=settings.glm_api_key)
        self.model = "glm-4"
        
        # AI Ustaz/Ustazah persona system prompt
        self.system_prompt = """You are a knowledgeable and patient Islamic teacher (Ustaz/Ustazah) helping Muslims learn and understand the Quran. You follow Malaysian Islamic guidelines (JAKIM/JAIS).

Your responsibilities:
1. Always provide accurate Quranic references in format: Surah [Name] ([Number]):[Ayat number]
2. Be respectful, humble, and encouraging
3. When quoting Quran, always mention the Surah name and number with Ayat
4. For complex religious rulings (fatwa), advise users to consult certified scholars
5. Base all answers on authentic Islamic sources (Quran, Hadith, scholarly consensus)
6. Be supportive and patient with learners of all levels
7. Maintain Islamic ethics (Adab) in all interactions
8. Use respectful Islamic phrases like "InshaAllah", "Alhamdulillah", "SubhanAllah" appropriately
9. Never make up Quranic verses - if unsure, say so
10. Help users understand the context and meaning of verses

Your tone should be:
- Warm and welcoming
- Patient and understanding
- Knowledgeable but not preachy
- Encouraging spiritual growth
- Respectful of different levels of Islamic knowledge
"""

    async def chat(self, message: str, conversation_history: list = None, context: dict = None):
        """Chat with AI Ustaz/Ustazah"""
        try:
            messages = [{"role": "system", "content": self.system_prompt}]
            
            # Add context if provided (e.g., current verse being read)
            if context:
                context_msg = self._format_context(context)
                messages.append({"role": "system", "content": context_msg})
            
            # Add conversation history
            if conversation_history:
                messages.extend(conversation_history[-10:])  # Last 10 messages for context
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            assistant_message = response.choices[0].message.content
            return {
                "success": True,
                "message": assistant_message,
                "role": "assistant"
            }
            
        except Exception as e:
            logger.error(f"AI chat error: {e}")
            return {
                "success": False,
                "message": "SubhanAllah, I'm having trouble responding right now. Please try again.",
                "error": str(e)
            }

    async def explain_verse(self, surah_number: int, ayat_number: int, surah_name: str, arabic_text: str, translation: str):
        """Explain a specific verse with context"""
        try:
            prompt = f"""Please explain this verse from the Holy Quran:

Surah {surah_name} ({surah_number}), Ayat {ayat_number}

Arabic: {arabic_text}
Translation: {translation}

Provide:
1. Context and background of revelation (if known)
2. Key themes and lessons
3. Practical application in daily life
4. Related verses if applicable

Please structure your response clearly and keep it educational yet accessible."""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            return {
                "success": True,
                "explanation": response.choices[0].message.content
            }
            
        except Exception as e:
            logger.error(f"Verse explanation error: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def contextual_help(self, screen: str, user_query: str = None):
        """Provide contextual help based on current screen"""
        try:
            help_prompts = {
                "home": "Guide the user on how to start reading the Quran, explore features, and navigate the app.",
                "reading": "Help the user understand how to read, listen to recitation, and use reading features.",
                "search": "Explain how to search for verses, topics, and themes in the Quran.",
                "bookmarks": "Guide on how to save, organize, and manage favorite verses.",
                "prayer": "Explain prayer times feature and Qibla direction.",
                "progress": "Help user understand their reading progress and streak."
            }
            
            base_prompt = help_prompts.get(screen, "Help the user with their current task in the app.")
            
            if user_query:
                prompt = f"{base_prompt}\n\nUser's specific question: {user_query}"
            else:
                prompt = base_prompt
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt + "\nProvide brief, helpful guidance for using the app feature."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            return {
                "success": True,
                "help": response.choices[0].message.content
            }
            
        except Exception as e:
            logger.error(f"Contextual help error: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def _format_context(self, context: dict) -> str:
        """Format context information for AI"""
        context_parts = []
        
        if "current_surah" in context:
            context_parts.append(f"User is currently reading Surah {context['current_surah']}")
        
        if "current_ayat" in context:
            context_parts.append(f"at Ayat {context['current_ayat']}")
        
        if "screen" in context:
            context_parts.append(f"on the {context['screen']} screen")
        
        return "Context: " + ", ".join(context_parts) if context_parts else ""

ai_service = AIService()