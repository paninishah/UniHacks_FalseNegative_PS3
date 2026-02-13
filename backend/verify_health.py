
import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "converse.settings")
django.setup()

from system.views import SystemHealthView
from rest_framework.test import APIRequestFactory

try:
    factory = APIRequestFactory()
    request = factory.get('/api/system/health/')
    view = SystemHealthView.as_view()
    response = view(request)
    print("Health Check Response:", response.data)
except Exception as e:
    print(f"Health Check Failed: {e}")
