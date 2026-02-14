from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Community, CommunityMember, CommunityPost, CommunityComment
from .serializers import CommunitySerializer, CommunityPostSerializer, CommunityCommentSerializer

class CommunityListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Community.objects.all().order_by('-created_at')
    serializer_class = CommunitySerializer

    def perform_create(self, serializer):
        community = serializer.save(creator=self.request.user)
        CommunityMember.objects.create(community=community, user=self.request.user, role='admin')

class CommunityDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated] # Or AllowAny for read
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    lookup_field = 'id'

class CommunityJoinView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, community_id):
        community = get_object_or_404(Community, id=community_id)
        if CommunityMember.objects.filter(community=community, user=request.user).exists():
            return Response({"detail": "Already a member"}, status=status.HTTP_400_BAD_REQUEST)
        
        CommunityMember.objects.create(community=community, user=request.user, role='member')
        return Response({"detail": "Joined community"}, status=status.HTTP_201_CREATED)

class CommunityLeaveView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, community_id):
        community = get_object_or_404(Community, id=community_id)
        membership = CommunityMember.objects.filter(community=community, user=request.user).first()
        if not membership:
            return Response({"detail": "Not a member"}, status=status.HTTP_400_BAD_REQUEST)
        
        membership.delete()
        return Response({"detail": "Left community"}, status=status.HTTP_200_OK)

class CommunityPostListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = CommunityPostSerializer

    def get_queryset(self):
        community_id = self.kwargs['community_id']
        return CommunityPost.objects.filter(community_id=community_id).order_by('-created_at')

    def perform_create(self, serializer):
        community = get_object_or_404(Community, id=self.kwargs['community_id'])
        serializer.save(user=self.request.user, community=community)

class CommunityPostDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = CommunityPost.objects.all()
    serializer_class = CommunityPostSerializer
    lookup_field = 'id'
