from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):

    email = models.EmailField(unique=True)
    dob = models.DateField(null=True, blank=True)
    is_private = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.username


class Profile(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to="pfp/", null=True, blank=True)
    onboarding_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s profile"
