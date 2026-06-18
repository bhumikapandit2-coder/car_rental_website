import React, { useState, useEffect } from 'react';
import { 
  Car as CarIcon, 
  Calendar, 
  User as UserIcon, 
  LogOut, 
  Lock, 
  Mail, 
  Phone, 
  CreditCard, 
  Check, 
  X, 
  Search, 
  Info,
  Clock,
  Compass,
  DollarSign
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

function App() {
  // Navigation & View
  const [currentView, setCurrentView] = useState('catalog'); // 'catalog' | 'dashboard'
  
  // Auth States
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [authForm, setAuthForm] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    driver_license: ''
  });

  // Catalog / Filter States
  const [cars, setCars] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchDates, setSearchDates] = useState({
    startDate: '',
    endDate: ''
  });

  // Booking Modal States
  const [selectedCar, setSelectedCar] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    startDate: '',
    endDate: '',
    phone: '',
    driverLicense: ''
  });

  // Dashboard States
  const [bookings, setBookings] = useState([]);

  // Alert State
  const [alert, setAlert] = useState(null);

  // Scroll effect for Navbar
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show alerts helper
  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Fetch Current Profile if logged in
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/auth/profile/`, {
        headers: { 'Authorization': `Token ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => {
        handleLogout();
      });
    } else {
      setUser(null);
    }
  }, [token]);

  // Fetch Cars Catalog
  const fetchCars = () => {
    let url = `${API_BASE}/cars/`;
    const params = [];
    if (categoryFilter) params.push(`category=${categoryFilter}`);
    if (searchDates.startDate) params.push(`start_date=${searchDates.startDate}`);
    if (searchDates.endDate) params.push(`end_date=${searchDates.endDate}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => setCars(data))
      .catch(() => showAlert('Failed to fetch car catalog', 'error'));
  };

  useEffect(() => {
    fetchCars();
  }, [categoryFilter, searchDates]);

  // Fetch Bookings (Dashboard)
  const fetchBookings = () => {
    if (!token) return;
    fetch(`${API_BASE}/bookings/`, {
      headers: { 'Authorization': `Token ${token}` }
    })
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(() => showAlert('Failed to load your reservations', 'error'));
  };

  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchBookings();
    }
  }, [currentView, token]);

  // Auth Handlers
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentView('catalog');
    showAlert('Logged out successfully.');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: authForm.username,
        password: authForm.password
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Invalid login credentials');
        return res.json();
      })
      .then(data => {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setIsLoginOpen(false);
        setAuthForm({ username: '', password: '', email: '', first_name: '', last_name: '', phone: '', driver_license: '' });
        showAlert('Logged in successfully!');
      })
      .catch(err => showAlert(err.message, 'error'));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    // Reconstruct data payload for nested serializer
    const payload = {
      username: authForm.username,
      password: authForm.password,
      email: authForm.email,
      first_name: authForm.first_name,
      last_name: authForm.last_name,
      profile: {
        phone: authForm.phone,
        driver_license: authForm.driver_license
      }
    };

    fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          const firstErr = Object.keys(data).map(key => `${key}: ${data[key]}`)[0];
          throw new Error(firstErr || 'Registration failed');
        }
        return data;
      })
      .then(() => {
        setIsRegisterOpen(false);
        showAlert('Registration complete! You can now log in.');
        setIsLoginOpen(true);
      })
      .catch(err => showAlert(err.message, 'error'));
  };

  // Booking Handler
  const handleOpenBooking = (car) => {
    if (!token) {
      setIsLoginOpen(true);
      showAlert('Please log in to reserve a vehicle', 'error');
      return;
    }
    setSelectedCar(car);
    setBookingForm({
      startDate: searchDates.startDate || new Date().toISOString().split('T')[0],
      endDate: searchDates.endDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      phone: user?.phone || '',
      driverLicense: user?.driver_license || ''
    });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/bookings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({
        car: selectedCar.id,
        start_date: bookingForm.startDate,
        end_date: bookingForm.endDate
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          const errorMsg = data.non_field_errors?.[0] || data[0] || 'Booking failed';
          throw new Error(errorMsg);
        }
        return data;
      })
      .then(() => {
        setSelectedCar(null);
        showAlert('Reservation placed successfully! Review details in Dashboard.');
        setCurrentView('dashboard');
      })
      .catch(err => showAlert(err.message, 'error'));
  };

  const handleCancelBooking = (bookingId) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    
    fetch(`${API_BASE}/bookings/${bookingId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ status: 'Cancelled' })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to cancel booking');
        showAlert('Reservation cancelled successfully.');
        fetchBookings();
      })
      .catch(err => showAlert(err.message, 'error'));
  };

  // Helper to compute number of days
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div>
      {/* Top Banner Alert */}
      {alert && (
        <div style={{
          position: 'fixed',
          top: '90px',
          right: '24px',
          zIndex: 9999
        }} className={`alert ${alert.type === 'error' ? 'alert-error' : 'alert-success'} glass`}>
          {alert.msg}
        </div>
      )}

      {/* Navigation Header */}
      <header className={`navbar ${isScrolled ? 'scrolled' : ''} glass`}>
        <div className="logo" onClick={() => setCurrentView('catalog')}>
          <CarIcon size={28} className="spec-icon" />
          <span>VELOCE</span> RENT
        </div>
        
        <nav className="nav-links">
          <span 
            className={`nav-link ${currentView === 'catalog' ? 'active' : ''}`}
            onClick={() => setCurrentView('catalog')}
          >
            Fleets
          </span>
          {token && (
            <span 
              className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              My Bookings
            </span>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-link" style={{ cursor: 'default' }}>
                Hi, <strong>{user.username}</strong>
              </span>
              <button className="btn btn-secondary" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-text" onClick={() => setIsLoginOpen(true)}>Login</button>
              <button className="btn btn-primary" onClick={() => setIsRegisterOpen(true)}>Sign Up</button>
            </>
          )}
        </div>
      </header>

      {/* Catalog View */}
      {currentView === 'catalog' && (
        <div>
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-background"></div>
            <div className="hero-content container">
              <span className="hero-badge">PREMIUM CAR RENTALS</span>
              <h1 className="hero-title">
                Unleash the Ultimate <span>Driving Experience</span>
              </h1>
              <p className="hero-description">
                Rent world-class electric, sports, and luxury vehicles. Access our premium fleet with transparent SQL tracking and effortless reservation management.
              </p>

              {/* Filter Box */}
              <div className="filter-box glass">
                <div className="filter-grid">
                  <div className="filter-group">
                    <label className="filter-label">Pickup Date</label>
                    <input 
                      type="date" 
                      className="filter-input"
                      value={searchDates.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSearchDates({...searchDates, startDate: e.target.value})}
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Return Date</label>
                    <input 
                      type="date" 
                      className="filter-input"
                      value={searchDates.endDate}
                      min={searchDates.startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSearchDates({...searchDates, endDate: e.target.value})}
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Category</label>
                    <select 
                      className="filter-input"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Sports">Sports</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Fleets Grid */}
          <section className="catalog-section" id="fleets">
            <div className="container">
              <div className="section-header">
                <div className="section-title-group">
                  <span className="section-subtitle">Our Fleet</span>
                  <h2 className="section-title">Explore Premium Wheels</h2>
                </div>

                <div className="category-tabs">
                  {['', 'Sedan', 'SUV', 'Sports', 'Electric'].map(cat => (
                    <button
                      key={cat}
                      className={`tab ${categoryFilter === cat ? 'active' : ''}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat || 'All Fleets'}
                    </button>
                  ))}
                </div>
              </div>

              {cars.length === 0 ? (
                <div className="empty-state">
                  <Info className="empty-state-icon" />
                  <h3 className="empty-state-title">No Vehicles Available</h3>
                  <p>Try modifying your dates or select a different category to check availability.</p>
                </div>
              ) : (
                <div className="cars-grid">
                  {cars.map(car => (
                    <div key={car.id} className="car-card glass">
                      <div className="car-image-container">
                        <img 
                          src={car.image_url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'} 
                          alt={`${car.brand} ${car.model}`}
                          className="car-image"
                        />
                        <span className="car-tag">{car.category}</span>
                      </div>
                      
                      <div className="car-info">
                        <div className="car-header">
                          <h3 className="car-name-brand">
                            {car.model}
                            <span>{car.brand}</span>
                          </h3>
                          <div className="car-price">
                            ${car.daily_rate}
                            <span>/ day</span>
                          </div>
                        </div>

                        <p className="car-desc">{car.description}</p>

                        <div className="car-specs">
                          <div className="spec-item">
                            <Compass className="spec-icon" />
                            <span>{car.transmission}</span>
                          </div>
                          <div className="spec-item">
                            <CarIcon className="spec-icon" />
                            <span>{car.fuel_type}</span>
                          </div>
                          <div className="spec-item">
                            <UserIcon className="spec-icon" />
                            <span>{car.seats} Seats</span>
                          </div>
                          <div className="spec-item">
                            <Calendar className="spec-icon" />
                            <span>{car.bags} Large Bags</span>
                          </div>
                        </div>

                        <button 
                          className="btn btn-primary car-card-action"
                          onClick={() => handleOpenBooking(car)}
                        >
                          Book Vehicle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Dashboard View */}
      {currentView === 'dashboard' && (
        <section className="dashboard-container">
          <div className="container">
            <h2 className="section-title mb-4">My Account Dashboard</h2>
            <div className="dashboard-grid">
              
              {/* Profile Card */}
              <div className="profile-card glass">
                <div className="profile-avatar">
                  {user?.username?.substring(0,2).toUpperCase() || 'U'}
                </div>
                <h3 className="profile-name">{user?.first_name} {user?.last_name}</h3>
                <p className="profile-email">@{user?.username} ({user?.email})</p>
                
                <div className="profile-details">
                  <div className="profile-detail-item">
                    <label>Phone Number</label>
                    <span>{user?.phone || 'Not Provided'}</span>
                  </div>
                  <div className="profile-detail-item">
                    <label>Driver's License</label>
                    <span>{user?.driver_license || 'Not Provided'}</span>
                  </div>
                </div>
              </div>

              {/* Reservations History */}
              <div>
                <h3 className="section-title mb-4" style={{ fontSize: '24px' }}>Reservations Record</h3>
                {bookings.length === 0 ? (
                  <div className="empty-state glass" style={{ padding: '40px' }}>
                    <Calendar className="empty-state-icon" />
                    <h4 className="empty-state-title">No Reservations Placed</h4>
                    <p className="mb-4">You have not booked any luxury fleets yet.</p>
                    <button className="btn btn-primary" onClick={() => setCurrentView('catalog')}>
                      Browse Fleets
                    </button>
                  </div>
                ) : (
                  <div className="bookings-list">
                    {bookings.map(book => (
                      <div key={book.id} className="booking-item glass">
                        <div className="booking-car-info">
                          <img 
                            src={book.car_details?.image_url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'} 
                            alt={book.car_details?.model} 
                            className="booking-car-img"
                          />
                          <div className="booking-details-group">
                            <h4 className="booking-car-title">{book.car_details?.brand} {book.car_details?.model}</h4>
                            <span className="booking-dates">
                              <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                              {book.start_date} to {book.end_date}
                            </span>
                            <span className="booking-dates" style={{ color: 'var(--text-muted)' }}>
                              <Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                              Reserved: {new Date(book.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="booking-price-status">
                          <span className="booking-cost">${book.total_price}</span>
                          <span className={`status-badge ${book.status.toLowerCase()}`}>
                            {book.status}
                          </span>
                          {(book.status === 'Pending' || book.status === 'Confirmed') && (
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                              onClick={() => handleCancelBooking(book.id)}
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* BOOKING MODAL */}
      {selectedCar && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <button className="close-btn" onClick={() => setSelectedCar(null)}>
              <X size={24} />
            </button>
            <h3 className="modal-title">Book {selectedCar.brand} {selectedCar.model}</h3>
            
            <form onSubmit={handleBookingSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Rental Daily Rate</label>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  ${selectedCar.daily_rate} / day
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingForm.startDate}
                  onChange={(e) => setBookingForm({...bookingForm, startDate: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Return Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  required
                  min={bookingForm.startDate || new Date().toISOString().split('T')[0]}
                  value={bookingForm.endDate}
                  onChange={(e) => setBookingForm({...bookingForm, endDate: e.target.value})}
                />
              </div>

              {/* Price Calculation */}
              {bookingForm.startDate && bookingForm.endDate && (
                <div className="price-summary">
                  <div className="summary-row">
                    <span>Daily Rate:</span>
                    <span>${selectedCar.daily_rate}</span>
                  </div>
                  <div className="summary-row">
                    <span>Rental Duration:</span>
                    <span>{calculateDays(bookingForm.startDate, bookingForm.endDate)} Days</span>
                  </div>
                  <div className="summary-row">
                    <span>Estimated Cost:</span>
                    <span>${(selectedCar.daily_rate * calculateDays(bookingForm.startDate, bookingForm.endDate)).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Confirm Reservation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {isLoginOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <button className="close-btn" onClick={() => setIsLoginOpen(false)}>
              <X size={24} />
            </button>
            <h3 className="modal-title">Welcome Back</h3>
            
            <form onSubmit={handleLogin} className="modal-form">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. demo"
                  required
                  value={authForm.username}
                  onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-input"
                  placeholder="••••••••"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Sign In
              </button>
              
              <p className="text-center" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <span 
                  style={{ color: 'var(--accent-purple)', cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }}
                >
                  Create one
                </span>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER MODAL */}
      {isRegisterOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '550px' }}>
            <button className="close-btn" onClick={() => setIsRegisterOpen(false)}>
              <X size={24} />
            </button>
            <h3 className="modal-title">Create Account</h3>
            
            <form onSubmit={handleRegister} className="modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g. John"
                    required
                    value={authForm.first_name}
                    onChange={(e) => setAuthForm({...authForm, first_name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g. Doe"
                    required
                    value={authForm.last_name}
                    onChange={(e) => setAuthForm({...authForm, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input"
                  placeholder="john@example.com"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="johndoe"
                    required
                    value={authForm.username}
                    onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-input"
                    placeholder="••••••••"
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-input"
                    placeholder="123-456-7890"
                    required
                    value={authForm.phone}
                    onChange={(e) => setAuthForm({...authForm, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Driver's License</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="DL-XXXXXXXX"
                    required
                    value={authForm.driver_license}
                    onChange={(e) => setAuthForm({...authForm, driver_license: e.target.value})}
                  />
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Register Account
              </button>
              
              <p className="text-center" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Already registered?{' '}
                <span 
                  style={{ color: 'var(--accent-purple)', cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }}
                >
                  Log in
                </span>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
