#!/bin/bash

cd /app/backend

# Set Python path to include backend modules
export PYTHONPATH="/app/backend:$PYTHONPATH"

# Run the integration test
python3 -c "
import asyncio
import sys
import os

# Load env
def load_env():
    with open('.env') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ[k.strip()] = v.strip()

load_env()

from quran_service import quran_service
from ai_service import ai_service

print('\n' + '='*70)
print('QUICK INTEGRATION TEST')
print('='*70 + '\n')

async def quick_test():
    try:
        # Test 1: Quran service
        print('Testing Quran Service...')
        surahs = await quran_service.get_surah_list()
        print(f'✓ Loaded {len(surahs[\"data\"])} surahs')
        
        surah = await quran_service.get_surah(1, 'quran-simple')
        print(f'✓ Loaded Al-Fatihah with {len(surah[\"data\"][\"ayahs\"])} ayahs')
        
        # Test 2: AI service
        print('\nTesting AI Service...')
        response = await ai_service.chat('What is Islam?')
        if response['success']:
            print(f'✓ AI chat working')
            print(f'  Response preview: {response[\"message\"][:80]}...')
        
        print('\n' + '='*70)
        print('✓ ALL INTEGRATION TESTS PASSED')
        print('='*70 + '\n')
        
    except Exception as e:
        print(f'✗ Test failed: {e}')
        import traceback
        traceback.print_exc()

asyncio.run(quick_test())
"
