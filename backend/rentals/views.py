from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Car, Booking
from .serializers import CarSerializer, BookingSerializer, UserSerializer
from datetime import datetime
from .serializers import UserRegistrationSerializer
from rest_framework import generics


# Home page
def home(request):
    return HttpResponse("Car Rental API Working!")

def about(request):
    return HttpResponse("About Page")

def contact(request):
    return HttpResponse("Contact Page")


# User Registration View
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# User Details View
class UserDetailsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# Car ViewSet
class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Car.objects.all()
        category = self.request.query_params.get('category', None)
        start_date_str = self.request.query_params.get('start_date', None)
        end_date_str = self.request.query_params.get('end_date', None)

        if category:
            queryset = queryset.filter(category=category)

        if start_date_str and end_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()

                booked_car_ids = Booking.objects.filter(
                    status__in=['Pending', 'Confirmed'],
                    start_date__lt=end_date,
                    end_date__gt=start_date
                ).values_list('car_id', flat=True)

                queryset = queryset.exclude(id__in=booked_car_ids)
            except ValueError:
                pass

        return queryset


# Booking ViewSet
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Booking.objects.all().order_by('-created_at')
        return Booking.objects.filter(user=user).order_by('-created_at')

def perform_create(self, serializer):
    serializer.save()


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]