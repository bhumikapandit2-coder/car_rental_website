import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'car_rental_backend.settings')
django.setup()

from django.contrib.auth.models import User
from rentals.models import Car, CustomerProfile

def seed_database():
    print("Seeding database...")

    # Create admin user if not exists
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        CustomerProfile.objects.create(user=admin, phone='1234567890', driver_license='DL-ADMIN-99')
        print("Admin user created (username: admin, password: admin123)")
    else:
        print("Admin user already exists")

    # Create demo user if not exists
    if not User.objects.filter(username='demo').exists():
        demo = User.objects.create_user('demo', 'demo@example.com', 'demo123')
        CustomerProfile.objects.create(user=demo, phone='0987654321', driver_license='DL-DEMO-11')
        print("Demo user created (username: demo, password: demo123)")
    else:
        print("Demo user already exists")

    # Sample cars data
    cars_data = [
        {
            'brand': 'Tesla',
            'model': 'Model S Plaid',
            'category': 'Electric',
            'transmission': 'Automatic',
            'fuel_type': 'Electric',
            'daily_rate': 149.99,
            'image_url': 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
            'description': 'Experience the future of driving with the Tesla Model S Plaid. Tri-motor all-wheel drive, unmatched acceleration, and autopilot capability make this electric luxury sedan an unforgettable ride.',
            'seats': 5,
            'bags': 3,
            'is_available': True
        },
        {
            'brand': 'Porsche',
            'model': '911 GT3 RS',
            'category': 'Sports',
            'transmission': 'Automatic',
            'fuel_type': 'Petrol',
            'daily_rate': 279.99,
            'image_url': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
            'description': 'Pure racing DNA. The Porsche 911 GT3 RS offers top-tier aerodynamics, a 518 hp naturally aspirated flat-six engine, and precise track-ready handling for sports car enthusiasts.',
            'seats': 2,
            'bags': 1,
            'is_available': True
        },
        {
            'brand': 'Land Rover',
            'model': 'Range Rover Sport',
            'category': 'SUV',
            'transmission': 'Automatic',
            'fuel_type': 'Hybrid',
            'daily_rate': 189.99,
            'image_url': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80',
            'description': 'Luxury meets rugged adventure. The Range Rover Sport offers a commanding driving position, premium leather interior, hybrid efficiency, and state-of-the-art off-road capabilities.',
            'seats': 5,
            'bags': 4,
            'is_available': True
        },
        {
            'brand': 'Audi',
            'model': 'A6 Luxury',
            'category': 'Sedan',
            'transmission': 'Automatic',
            'fuel_type': 'Petrol',
            'daily_rate': 99.99,
            'image_url': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80', # fallback, we will find a nice audi photo or generate
            'description': 'The Audi A6 combines exquisite styling, a quiet and advanced cabin, and a smooth, powerful turbocharged drive. Ideal for business trips and luxury travel.',
            'seats': 5,
            'bags': 3,
            'is_available': True
        },
        {
            'brand': 'BMW',
            'model': 'i8 Roadster',
            'category': 'Sports',
            'transmission': 'Automatic',
            'fuel_type': 'Hybrid',
            'daily_rate': 239.99,
            'image_url': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
            'description': 'Turn heads wherever you go. The BMW i8 Roadster features carbon-fiber construction, scissor doors, and a plug-in hybrid drivetrain delivering instant torque and futurist looks.',
            'seats': 2,
            'bags': 1,
            'is_available': True
        },
        {
            'brand': 'Jeep',
            'model': 'Wrangler Rubicon',
            'category': 'SUV',
            'transmission': 'Manual',
            'fuel_type': 'Petrol',
            'daily_rate': 119.99,
            'image_url': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
            'description': 'Conquer the trails with the ultimate open-air 4x4. The Jeep Wrangler Rubicon is built for off-roading, with heavy-duty locks, knobby tires, and a manual gearbox for pure control.',
            'seats': 4,
            'bags': 3,
            'is_available': True
        }
    ]

    for car_info in cars_data:
        car, created = Car.objects.get_or_create(
            brand=car_info['brand'],
            model=car_info['model'],
            defaults=car_info
        )
        if created:
            print(f"Created car: {car.brand} {car.model}")
        else:
            print(f"Car already exists: {car.brand} {car.model}")

    print("Seeding complete!")

if __name__ == '__main__':
    seed_database()
