import httpx
from config import settings
import logging

logger = logging.getLogger(__name__)

class QuranService:
    def __init__(self):
        self.base_url = settings.quran_api_base_url
        self.timeout = 30.0

    async def get_surah(self, surah_number: int, edition: str = "quran-simple"):
        """Get a complete surah"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/surah/{surah_number}/{edition}")
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error fetching surah {surah_number}: {e}")
            raise

    async def get_ayah(self, surah_number: int, ayat_number: int, edition: str = "quran-simple"):
        """Get a specific ayah"""
        try:
            # Calculate absolute ayah number
            reference = f"{surah_number}:{ayat_number}"
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/ayah/{reference}/{edition}")
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error fetching ayah {surah_number}:{ayat_number}: {e}")
            raise

    async def get_translations(self, surah_number: int, editions: list):
        """Get multiple translations for a surah"""
        try:
            editions_str = ",".join(editions)
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/surah/{surah_number}/editions/{editions_str}")
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error fetching translations for surah {surah_number}: {e}")
            raise

    async def search_quran(self, query: str, edition: str = "quran-simple"):
        """Search in Quran text"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # The correct endpoint format is /search/{query}/{surah_number}/{edition}
                # For all surahs, we can use 'all' or just query the first result
                response = await client.get(
                    f"{self.base_url}/search/{query}/all/{edition}"
                )
                # If 404, try alternative format
                if response.status_code == 404:
                    logger.info("Search endpoint format might have changed, trying alternative")
                    # Alternative: search without 'all'
                    response = await client.get(
                        f"{self.base_url}/search/{query}/{edition}"
                    )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error searching Quran: {e}")
            # Return empty results instead of raising
            return {"code": 200, "status": "OK", "data": {"count": 0, "matches": []}}

    async def get_surah_list(self):
        """Get list of all surahs"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/surah")
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error fetching surah list: {e}")
            raise

    async def get_juz(self, juz_number: int, edition: str = "quran-simple"):
        """Get a complete juz"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/juz/{juz_number}/{edition}")
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error fetching juz {juz_number}: {e}")
            raise

    def get_available_editions(self):
        """Get available Quran editions/translations"""
        return {
            "arabic": [
                {"identifier": "quran-simple", "language": "ar", "name": "Simple"},
                {"identifier": "quran-uthmani", "language": "ar", "name": "Uthmani"},
                {"identifier": "ar.alafasy", "language": "ar", "name": "Alafasy", "type": "audio"},
            ],
            "english": [
                {"identifier": "en.asad", "language": "en", "name": "Muhammad Asad"},
                {"identifier": "en.sahih", "language": "en", "name": "Sahih International"},
                {"identifier": "en.pickthall", "language": "en", "name": "Pickthall"},
            ],
            "malay": [
                {"identifier": "ms.basmeih", "language": "ms", "name": "Basmeih"},
            ],
            "urdu": [
                {"identifier": "ur.jalandhry", "language": "ur", "name": "Jalandhry"},
            ],
            "indonesian": [
                {"identifier": "id.indonesian", "language": "id", "name": "Indonesian Ministry of Religious Affairs"},
            ]
        }

quran_service = QuranService()