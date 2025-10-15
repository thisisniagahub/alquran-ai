#!/usr/bin/env python3
"""Test script for Al-Quran API backend"""

import asyncio
import sys
import os

# Change to backend directory and load .env
os.chdir('/app/backend')
sys.path.insert(0, '/app/backend')

from dotenv import load_dotenv
load_dotenv()

from quran_service import quran_service
from ai_service import ai_service

async def test_quran_service():
    """Test Quran API integration"""
    print("\n" + "="*60)
    print("TESTING QURAN SERVICE")
    print("="*60)
    
    try:
        # Test 1: Get Surah List
        print("\n1. Testing get_surah_list()...")
        surahs = await quran_service.get_surah_list()
        if surahs.get('data'):
            print(f"   ✓ Got {len(surahs['data'])} surahs")
            print(f"   ✓ First surah: {surahs['data'][0]['englishName']}")
        else:
            print("   ✗ Failed to get surahs")
            return False
            
        # Test 2: Get a specific Surah
        print("\n2. Testing get_surah(1)...")
        surah = await quran_service.get_surah(1, 'quran-simple')
        if surah.get('data'):
            print(f"   ✓ Got Surah Al-Fatihah")
            print(f"   ✓ Number of ayahs: {len(surah['data']['ayahs'])}")
        else:
            print("   ✗ Failed to get surah")
            return False
            
        # Test 3: Get a specific Ayah
        print("\n3. Testing get_ayah(1, 1)...")
        ayah = await quran_service.get_ayah(1, 1, 'quran-uthmani')
        if ayah.get('data'):
            print(f"   ✓ Got ayah text: {ayah['data']['text'][:50]}...")
        else:
            print("   ✗ Failed to get ayah")
            return False
            
        # Test 4: Get translations
        print("\n4. Testing get_translations(1, ['quran-uthmani', 'en.sahih'])...")
        translations = await quran_service.get_translations(1, ['quran-uthmani', 'en.sahih'])
        if translations.get('data'):
            print(f"   ✓ Got {len(translations['data'])} editions")
        else:
            print("   ✗ Failed to get translations")
            return False
            
        # Test 5: Search
        print("\n5. Testing search_quran('mercy')...")
        results = await quran_service.search_quran('mercy', 'quran-simple')
        if results.get('data'):
            print(f"   ✓ Found {results['data']['count']} matches")
        else:
            print("   ✗ Failed to search")
            return False
            
        # Test 6: Get Juz
        print("\n6. Testing get_juz(1)...")
        juz = await quran_service.get_juz(1, 'quran-simple')
        if juz.get('data'):
            print(f"   ✓ Got Juz 1")
        else:
            print("   ✗ Failed to get juz")
            return False
            
        # Test 7: Get editions
        print("\n7. Testing get_available_editions()...")
        editions = quran_service.get_available_editions()
        if editions:
            print(f"   ✓ Got {len(editions)} edition categories")
            print(f"   ✓ Languages: {list(editions.keys())}")
        else:
            print("   ✗ Failed to get editions")
            return False
            
        print("\n" + "="*60)
        print("✓ ALL QURAN SERVICE TESTS PASSED")
        print("="*60)
        return True
        
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_ai_service():
    """Test AI service integration"""
    print("\n" + "="*60)
    print("TESTING AI SERVICE")
    print("="*60)
    
    try:
        # Test 1: Simple chat
        print("\n1. Testing chat()...")
        response = await ai_service.chat("Assalamu Alaikum, what is Islam?")
        if response.get('success'):
            print(f"   ✓ Chat response received")
            print(f"   ✓ Message preview: {response['message'][:100]}...")
        else:
            print(f"   ✗ Chat failed: {response.get('error')}")
            return False
            
        # Test 2: Context help
        print("\n2. Testing contextual_help()...")
        help_response = await ai_service.contextual_help('home', 'How do I start reading?')
        if help_response.get('success'):
            print(f"   ✓ Context help received")
        else:
            print(f"   ✗ Context help failed: {help_response.get('error')}")
            return False
            
        # Test 3: Explain verse
        print("\n3. Testing explain_verse()...")
        explanation = await ai_service.explain_verse(
            1, 1, "Al-Fatihah",
            "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
            "In the name of Allah, the Most Gracious, the Most Merciful"
        )
        if explanation.get('success'):
            print(f"   ✓ Verse explanation received")
            print(f"   ✓ Explanation preview: {explanation['explanation'][:100]}...")
        else:
            print(f"   ✗ Verse explanation failed: {explanation.get('error')}")
            return False
            
        print("\n" + "="*60)
        print("✓ ALL AI SERVICE TESTS PASSED")
        print("="*60)
        return True
        
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("AL-QURAN API BACKEND TESTING")
    print("="*60)
    
    # Test Quran Service
    quran_success = await test_quran_service()
    
    # Test AI Service
    ai_success = await test_ai_service()
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"Quran Service: {'✓ PASSED' if quran_success else '✗ FAILED'}")
    print(f"AI Service: {'✓ PASSED' if ai_success else '✗ FAILED'}")
    print("="*60 + "\n")
    
    return quran_success and ai_success

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
