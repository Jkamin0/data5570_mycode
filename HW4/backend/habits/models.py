from django.db import models
from django.contrib.auth.models import User


class Habit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3B82F6')
    icon = models.CharField(max_length=50, default='star')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'name']

    def __str__(self):
        return f"{self.user.username} - {self.name}"

    def get_current_streak(self):
        from datetime import date, timedelta
        today = date.today()
        streak = 0
        check_date = today

        while True:
            log = self.logs.filter(date=check_date, completed=True).first()
            if log:
                streak += 1
                check_date -= timedelta(days=1)
            else:
                break

        return streak

    def get_longest_streak(self):
        from datetime import timedelta
        logs = self.logs.filter(completed=True).order_by('date')

        if not logs.exists():
            return 0

        max_streak = 0
        current_streak = 1
        prev_date = None

        for log in logs:
            if prev_date:
                if (log.date - prev_date).days == 1:
                    current_streak += 1
                else:
                    max_streak = max(max_streak, current_streak)
                    current_streak = 1
            prev_date = log.date

        return max(max_streak, current_streak)


class HabitLog(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField()
    completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        unique_together = ['habit', 'date']

    def __str__(self):
        return f"{self.habit.name} - {self.date} - {'✓' if self.completed else '✗'}"
