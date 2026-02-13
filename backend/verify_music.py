
import os
import django
import sys

# Setup Django Environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'converse.settings')
django.setup()

from vault.models import TimeCapsule, CapsuleMusicAnalysis
from vault.music_services import SpotifyEngine, EmotionalIntelligence
from users.models import User
from django.utils import timezone

def verify_music_feature():
    print("🎵 Verifying Emotional Time Capsules Feature...")

    # 1. Test Emotional Intelligence Logic
    print("\n1. Testing Emotional Intelligence Logic:")
    cases = [
        (0.8, 0.9, 0.8, "party"),         # Happy + High Energy
        (0.2, 0.2, 0.4, "heartbreak"),    # Sad + Low Energy
        (0.5, 0.8, 0.5, "exam_survival"), # Neutral + High Energy
        (0.9, 0.2, 0.5, "wholesome"),     # Happy + Low Energy
        (0.5, 0.2, 0.6, "late_night"),    # Neutral + Low Energy
    ]

    for val, en, dance, expected in cases:
        result = EmotionalIntelligence.determine_vibe(val, en, dance)
        status = "✅" if result == expected else f"❌ (Expected {expected}, got {result})"
        print(f"   Input(v={val}, e={en}, d={dance}) -> {result} {status}")

    # 2. Test Spotify Engine (Mock Mode)
    print("\n2. Testing Spotify Engine (Mock Mode):")
    engine = SpotifyEngine()
    if not engine.sp:
        print("   ✅ Spotify Client not configured (Expected for dev without keys)")
    else:
        print("   ⚠️ Spotify Client configured (Make sure keys are valid)")

    # 3. Database Model Check
    print("\n3. Testing Database Model Integration:")
    try:
        # Create dummy user
        user, _ = User.objects.get_or_create(username="music_tester", password="password")
        
        # Create dummy capsule
        capsule = TimeCapsule.objects.create(
            owner=user,
            unlock_date=timezone.now(),
            visibility="private"
        )
        print("   ✅ Created Test Capsule")

        # Create analysis
        analysis = CapsuleMusicAnalysis.objects.create(
            capsule=capsule,
            dominant_vibe="chaotic",
            avg_valence=0.1,
            avg_energy=0.9
        )
        print(f"   ✅ Created Analysis: {analysis}")

        # Clean up
        capsule.delete()
        user.delete()
        print("   ✅ Cleaned up test data")

    except Exception as e:
        print(f"   ❌ Database Error: {e}")

if __name__ == "__main__":
    verify_music_feature()
