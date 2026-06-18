from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rentals.views import CarViewSet, BookingViewSet , UserRegistrationView,UserDetailsView

router = DefaultRouter()
router.register(r'cars', CarViewSet, basename='cars')
router.register(r'bookings', BookingViewSet, basename='bookings')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('profile/', UserDetailsView.as_view(), name='profile'),
     
]