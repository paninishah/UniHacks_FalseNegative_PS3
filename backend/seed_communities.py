from communities.models import Community
from django.contrib.auth import get_user_model
User = get_user_model()
try:
    admin = User.objects.first()
    if admin:
        communities = [
            {"name": "PopVerse", "description": "Global trends and pop culture"},
            {"name": "Gaming", "description": "For the gamers"},
            {"name": "Confessions", "description": "Anonymous confessions"},
            {"name": "Photography", "description": "Share your best shots"}
        ]
        for c in communities:
            obj, created = Community.objects.get_or_create(name=c["name"], defaults={"description": c["description"], "creator": admin})
            if created:
                print(f"Created community: {c['name']}")
            else:
                print(f"Community exists: {c['name']}")
    else:
        print("No admin user found. Create a user first.")
except Exception as e:
    print(f"Error seeding: {e}")
