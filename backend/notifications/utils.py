"""
Helper to create notifications from anywhere in the backend.
Import and call: create_notification(user, type, title, message, **kwargs)
Or use bulk: notify_group_members(group, type, title, message, exclude_user=None)
"""
from .models import Notification


def create_notification(user, notification_type, title, message, **kwargs):
    """Create a single notification for one user."""
    return Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        group_id=kwargs.get('group_id'),
        community_id=kwargs.get('community_id'),
        post_id=kwargs.get('post_id'),
    )


def notify_group_members(group, notification_type, title, message, exclude_user=None, **kwargs):
    """Notify all members of a group (except optionally the actor)."""
    from groups.models import GroupMembership
    memberships = GroupMembership.objects.filter(group=group).select_related('user')
    
    notifications = []
    for m in memberships:
        if exclude_user and m.user == exclude_user:
            continue
        notifications.append(Notification(
            user=m.user,
            notification_type=notification_type,
            title=title,
            message=message,
            group_id=kwargs.get('group_id', group.id),
            post_id=kwargs.get('post_id'),
        ))
    
    Notification.objects.bulk_create(notifications)


def notify_community_members(community, notification_type, title, message, exclude_user=None, **kwargs):
    """Notify all members of a community (except optionally the actor)."""
    from communities.models import CommunityMember
    members = CommunityMember.objects.filter(community=community).select_related('user')
    
    notifications = []
    for m in members:
        if exclude_user and m.user == exclude_user:
            continue
        notifications.append(Notification(
            user=m.user,
            notification_type=notification_type,
            title=title,
            message=message,
            community_id=kwargs.get('community_id', community.id),
            post_id=kwargs.get('post_id'),
        ))
    
    Notification.objects.bulk_create(notifications)


def notify_all_users(notification_type, title, message, exclude_user=None, **kwargs):
    """Notify ALL users (used for public events like new community created)."""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    users = User.objects.all()
    
    notifications = []
    for u in users:
        if exclude_user and u == exclude_user:
            continue
        notifications.append(Notification(
            user=u,
            notification_type=notification_type,
            title=title,
            message=message,
            group_id=kwargs.get('group_id'),
            community_id=kwargs.get('community_id'),
        ))
    
    Notification.objects.bulk_create(notifications)
