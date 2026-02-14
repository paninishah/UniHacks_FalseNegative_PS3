from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include


urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/engagement/', include('engagement.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/recap/', include('recap.urls')),
    path('api/games/', include('games.urls')),
    path('api/chatbot/', include('chatbot.urls')),
    path("api/groups/", include("groups.urls")),
    path("api/communities/", include("communities.urls")),

    path("api/users/", include("users.urls")),
    path("api/social/", include("social.urls")),
    path("api/communities/", include("communities.urls")),
    path("api/vault/", include("vault.urls")),
    path("api/music/", include("music.urls")),
    path("api/system/", include("system.urls")),
    path("api/notifications/", include("notifications.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
