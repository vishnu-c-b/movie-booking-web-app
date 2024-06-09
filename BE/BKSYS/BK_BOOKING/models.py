from django.db import models
from django.contrib.auth.models import User

class Movie(models.Model):
    title = models.CharField(max_length=100)
    release_date = models.DateField()
    ticket_rates = models.DecimalField(max_digits=6, decimal_places=2)
    availability = models.BooleanField(default=True)
    description = models.TextField()
    poster = models.URLField()
    show_timings = models.CharField(max_length=100)


class Booking(models.Model):
    booking_id = models.CharField(max_length=8, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField()
    seats_booked = models.CharField(max_length=200)
    show_time = models.CharField(max_length=10)
    show_date = models.DateField()
    total_price = models.DecimalField(max_digits=6, decimal_places=2, default=180.00)