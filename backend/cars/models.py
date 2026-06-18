
from django.db import models

class Car(models.Model):
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    car = models.ForeignKey('Car', on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.customer_name
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    color = models.CharField(max_length=50)
    seats = models.IntegerField()
    fuel_type = models.CharField(max_length=50)
    transmission = models.CharField(max_length=50)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.brand} {self.model}"