from django.db import models
from django.conf import settings
from groups.models import Group  # will exist later

User = settings.AUTH_USER_MODEL


class Post(models.Model):

    POST_TYPES = [
        ("text", "Text"),
        ("image", "Image"),
    ]

    CATEGORY = [
        ("meme", "Meme"),
        ("roast", "Roast"),
        ("confession", "Confession"),
        ("joke", "Joke"),
        ("inside_joke", "Inside Joke"),
        ("casual", "Casual"),
        ("news_bite", "News Bite"),
    ]

    VISIBILITY = [
        ("public", "Public"),
        ("private", "Private"),
        ("group", "Group"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    group = models.ForeignKey(Group, on_delete=models.CASCADE, null=True, blank=True)

    post_type = models.CharField(max_length=10, choices=POST_TYPES)
    category = models.CharField(max_length=20, choices=CATEGORY)

    text_content = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to="posts/", null=True, blank=True)
    caption = models.CharField(max_length=255, blank=True)

    headline_generated = models.TextField(blank=True, null=True)

    vanish_mode = models.BooleanField(default=False)

    visibility = models.CharField(max_length=10, choices=VISIBILITY)

    sentiment_score = models.FloatField(null=True, blank=True)

    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["created_at"]),
            models.Index(fields=["user"]),
            models.Index(fields=["group"]),
            models.Index(fields=["visibility"]),
        ]

    def __str__(self):
        return f"{self.user} - {self.category}"
    


class Reaction(models.Model):

    REACTIONS = [
        ("GOAT", "GOAT"),
        ("clown", "Clown"),
        ("red_flag", "Red Flag"),
        ("iconic", "Iconic"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="reactions")
    reaction_type = models.CharField(max_length=20, choices=REACTIONS)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")


class Comment(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")

    text = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)



class SavedPost(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")



class EphemeralEventLog(models.Model):

    """
    Marker that something existed after vanish delete.
    """

    post = models.ForeignKey(Post, on_delete=models.SET_NULL, null=True)
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True)

    message = models.CharField(
        max_length=255,
        default="An event occurred here 👀"
    )

    created_at = models.DateTimeField(auto_now_add=True)
