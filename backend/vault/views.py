from rest_framework import generics, permissions
from .models import *
from .serializers import *


class CreateCapsuleView(generics.CreateAPIView):
    serializer_class = TimeCapsuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        capsule = serializer.save(owner=self.request.user)
        from notifications.utils import create_notification, notify_group_members
        
        # Notify the owner that their capsule is scheduled
        create_notification(
            self.request.user,
            'capsule_unlocked',
            '⏳ Time Capsule Created!',
            f'Your capsule will unlock on {capsule.unlock_date.strftime("%b %d, %Y")}. Hang tight!',
        )
        
        # If it's a group capsule, notify group members
        if capsule.group:
            notify_group_members(
                capsule.group,
                'capsule_unlocked',
                f'💊 New Time Capsule in {capsule.group.name}',
                f'{self.request.user.username} created a time capsule that unlocks on {capsule.unlock_date.strftime("%b %d, %Y")}!',
                exclude_user=self.request.user,
                group_id=capsule.group.id,
            )

class MyCapsulesView(generics.ListAPIView):
    serializer_class = TimeCapsuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TimeCapsule.objects.filter(owner=self.request.user)



class CreateVaultItemView(generics.CreateAPIView):
    serializer_class = PrivateVaultItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class GenerateTokenView(generics.CreateAPIView):
    serializer_class = VaultAccessTokenSerializer
    permission_classes = [permissions.IsAuthenticated]


class GrantPermissionView(generics.CreateAPIView):
    serializer_class = VaultPermissionSerializer
    permission_classes = [permissions.IsAuthenticated]


# =========================
# MUSIC ANALYSIS VIEWS
# =========================

from music.services import MusicIntelligence
from .models import CapsuleMusicAnalysis
from rest_framework.views import APIView
from rest_framework.response import Response

class AnalyzeCapsuleMusicView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, capsule_id):
        try:
            capsule = TimeCapsule.objects.get(id=capsule_id)
        except TimeCapsule.DoesNotExist:
            return Response({"error": "Capsule not found"}, status=404)

        # 1. Fetch group members or use a predefined list of tracks for MVP
        # Ideally, we'd fetch tracks from Capsule text content or Group history
        # For now, let's look at the capsule text to find song names or fallback
        
        # Simple extraction heuristic: Assume text might contain "song: [name]" or usage of predefined list
        track_queries = [
            "Bohemian Rhapsody", 
            "Mr. Brightside", 
            "Blinding Lights",
            "Dreams Fleetwood Mac"
        ] # Default MVP list if no text analysis
        
        if capsule.text_content:
            # Very basic extraction - in production we'd use NLP
            # Here we just check if any known hits are mentioned or just use default
            pass

        # 2. Call Deezer Intelligence
        analysis_result = MusicIntelligence.analyze_group_taste(track_queries)
        
        if not analysis_result:
             return Response({"error": "Could not analyze music taste"}, status=400)

        vibe = analysis_result["vibe"]
        avg_bpm = analysis_result["avg_bpm"]
        anthem = analysis_result["anthem"]

        # 3. Save Analysis
        # Note: avg_valence/energy are Spotify specific, so we map them roughly from Vibe/BPM for compatibility or leave defaults
        
        # Heuristic mapping for compatibility fields
        derived_energy = avg_bpm / 180.0
        derived_valence = 0.8 if "Party" in vibe or "Mainstream" in vibe else 0.4
        
class VaultFolderListCreate(generics.ListCreateAPIView):
    serializer_class = VaultFolderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VaultFolder.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class VaultFolderDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VaultFolderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VaultFolder.objects.filter(owner=self.request.user)


class VaultFolderUnlock(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, folder_id):
        try:
            folder = VaultFolder.objects.get(id=folder_id)
        except VaultFolder.DoesNotExist:
            return Response({"error": "Folder not found"}, status=404)

        # Check access
        access_code = request.data.get("access_code")
        
        # If owner, allow without code (or with, doesn't matter)
        if folder.owner == request.user:
            pass # Allowed
        elif folder.access_code == access_code:
            pass # Allowed
        else:
            return Response({"error": "Invalid access key"}, status=403)

        # Return items
        items = folder.items.all().order_by('-created_at')
        serializer = PrivateVaultItemSerializer(items, many=True)
        return Response({
            "folder": VaultFolderSerializer(folder).data,
            "items": serializer.data
        })


class UserVaultFolders(generics.ListAPIView):
    serializer_class = VaultFolderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        # Return all folders (locked state handles the rest)
        return VaultFolder.objects.filter(owner__id=user_id).order_by('-created_at')


class AddToVaultView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        folder_id = request.data.get("folder_id")
        post_id = request.data.get("post_id")
        
        if not folder_id:
             return Response({"error": "Folder ID required"}, status=400)

        try:
            folder = VaultFolder.objects.get(id=folder_id, owner=request.user)
        except VaultFolder.DoesNotExist:
             return Response({"error": "Folder not found"}, status=404)

        if post_id:
             try:
                 from social.models import Post
                 post = Post.objects.get(id=post_id)
                 
                 # Create item linked to post
                 PrivateVaultItem.objects.create(
                     owner=request.user,
                     folder=folder,
                     post=post
                 )
                 return Response({"message": "Saved to vault!"})
             except Post.DoesNotExist:
                 return Response({"error": "Post not found"}, status=404)
        
        return Response({"error": "Post ID required"}, status=400)
