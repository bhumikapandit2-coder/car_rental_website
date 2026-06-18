from django.contrib import admin
from .models import Car

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = (
        'brand',
        'model',
        'year',
        'color',
        'seats',
        'fuel_type',
        'transmission',
        'price_per_day',
        'available',
    )

    list_filter = (
        'available',
        'fuel_type',
        'transmission',
    )

    search_fields = (
        'brand',
        'model',
        'color',
    )