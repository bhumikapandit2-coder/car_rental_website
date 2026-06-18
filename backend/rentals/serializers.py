from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Car, Booking, CustomerProfile
from datetime import datetime
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(source='profile.phone', required=False)
    driver_license = serializers.CharField(source='profile.driver_license', required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'phone', 'driver_license']

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        CustomerProfile.objects.create(
            user=user,
            phone=profile_data.get('phone', ''),
            driver_license=profile_data.get('driver_license', '')
        )
        return user


class CarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):
    car_details = CarSerializer(source='car', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'user', 'username', 'car', 'car_details', 'start_date', 'end_date', 'total_price', 'status', 'created_at']
        read_only_fields = ['total_price', 'user']

    def validate(self, data):
        start_date = data['start_date']
        end_date = data['end_date']

        if start_date >= end_date:
            raise serializers.ValidationError("End date must be after start date.")

        # Check availability (excluding current booking if updating)
        booking_id = self.instance.id if self.instance else None
        overlapping_bookings = Booking.objects.filter(
            car=data['car'],
            status__in=['Pending', 'Confirmed'],
            start_date__lt=end_date,
            end_date__gt=start_date
        )
        if booking_id:
            overlapping_bookings = overlapping_bookings.exclude(id=booking_id)

        if overlapping_bookings.exists():
            raise serializers.ValidationError("This car is already booked for the selected dates.")

        return data

    def create(self, validated_data):
        car = validated_data['car']
        start_date = validated_data['start_date']
        end_date = validated_data['end_date']

        # Calculate total price
        days = (end_date - start_date).days
        total_price = car.daily_rate * days

        validated_data['total_price'] = total_price
        # Set user from context
        validated_data['user'] = self.context['request'].user

        return super().create(validated_data)

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user