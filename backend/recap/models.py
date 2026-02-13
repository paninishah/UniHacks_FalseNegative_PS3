from django.db import models


class SeasonRecap(models.Model):
    group = models.ForeignKey("groups.Group", on_delete=models.CASCADE)

    start_date = models.DateField()
    end_date = models.DateField()

    total_activities = models.IntegerField(default=0)
    total_posts = models.IntegerField(default=0)
    total_messages = models.IntegerField(default=0)

    most_active_user_id = models.IntegerField(null=True, blank=True)
    most_chaotic_day = models.DateField(null=True, blank=True)
    longest_streak = models.IntegerField(default=0)

    # Music DNA
    dominant_vibe = models.CharField(max_length=100, blank=True, null=True)
    anthem_track = models.JSONField(default=dict, blank=True) # Store full track data

    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("group", "start_date", "end_date")
