from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Car(models.Model):
    CATEGORY_CHOICES = [
        ('Sedan', 'Sedan'),
        ('SUV', 'SUV'),
        ('Sports', 'Sports'),
        ('Electric', 'Electric'),
    ]
    TRANSMISSION_CHOICES = [
        ('Automatic', 'Automatic'),
        ('Manual', 'Manual'),
    ]
    FUEL_CHOICES = [
        ('Petrol', 'Petrol'),
        ('Diesel', 'Diesel'),
        ('Electric', 'Electric'),
        ('Hybrid', 'Hybrid'),
    ]

    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='Sedan')
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES, default='Automatic')
    fuel_type = models.CharField(max_length=20, choices=FUEL_CHOICES, default='Petrol')
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    description = models.TextField(blank=True, null=True)
    seats = models.IntegerField(default=5)
    bags = models.IntegerField(default=2)

    def __str__(self):
        return f"{self.brand} {self.model} ({self.category})"


class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True, null=True)
    driver_license = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"Profile for {self.user.username}"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled'),
        ('Completed', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='bookings')
    start_date = models.DateField()
    end_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking {self.id} - {self.user.username} - {self.car.brand} {self.car.model}"

