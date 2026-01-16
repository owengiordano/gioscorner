import { Link } from 'react-router-dom';
import heroImage from '../assets/gios-corner-img.png';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary-900 text-white pt-0 pb-10 md:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 md:gap-12 items-center">
            {/* Left Content */}
            <div className="order-2 lg:order-1 py-0 md:py-0">
              <div className="inline-block mb-4">
                <span className="bg-primary-700/40 px-4 py-2 rounded-full text-sm font-semibold border border-primary-700/50" style={{ color: '#efe5d9' }}>
                  Haddonfield
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Welcome to</span><br />
                <span style={{ color: '#efe5d9', fontFamily: "'Grand Hotel', cursive" }}>
                  Gio's Corner
                </span>
              </h1>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#efe5d9'  }} className="text-xl md:text-2xl mb-8 leading-relaxed">
              From our Italian kitchen to your dinner table & special events. Family Meals and 
              Catering focused on Italian tradition and modern nutrition.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/menu" 
                  className="px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                  style={{ backgroundColor: '#efe5d9', color: '#1a3d2e' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5ede3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#efe5d9';
                  }}
                >
                  View Menu & Order
                </Link>
                <Link 
                  to="/about" 
                  className="border-2 backdrop-blur-sm bg-white/10 px-8 py-4 rounded-lg font-semibold transition-all duration-300"
                  style={{ borderColor: '#efe5d9', color: '#efe5d9' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#efe5d9';
                    e.currentTarget.style.color = '#1a3d2e';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = '#efe5d9';
                  }}
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="order-1 lg:order-2">
              <div className="relative flex justify-center lg:justify-start">
                {/* Image Container */}
                <div className="relative transform mb-4 hover:scale-105 transition-transform duration-500 w-3/5 md:w-3/4 lg:w-full">
                  <img 
                    src={heroImage} 
                    alt="Gio's Corner - Haddonfield Sandwiches & More" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Browse Menu</h3>
              <p className="text-gray-600">
              Check out our Weekly Family Meal or Catering Menu Options and 
              choose what works best for your event.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Submit Request</h3>
              <p className="text-gray-600">
              Fill out our simple Order Form with your event details/Family Meal date and delivery time preference.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Get Confirmed</h3>
              <p className="text-gray-600">
                We'll review your request and send you a payment link once approved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card text-center">
              <span className="text-3xl mb-3 block">🍽️</span>
              <h3 className="font-semibold mb-2">Fresh Ingredients</h3>
              <p className="text-sm text-gray-600">
              We are passionate about providing organic, sustainable, quality meals with consistency.
              </p>
            </div>
            <div className="card text-center">
              <span className="text-3xl mb-3 block">👨‍🍳</span>
              <h3 className="font-semibold mb-2">Quality & Dedication</h3>
              <p className="text-sm text-gray-600">
                Our experienced team brings passion to every dish.
              </p>
            </div>
            <div className="card text-center">
              <span className="text-3xl mb-3 block">⏰</span>
              <h3 className="font-semibold mb-2">On-Time Delivery</h3>
              <p className="text-sm text-gray-600">
                Reliable service that arrives when you need it.
              </p>
            </div>
            <div className="card text-center">
              <span className="text-3xl mb-3 block">💰</span>
              <h3 className="font-semibold mb-2">Great Value</h3>
              <p className="text-sm text-gray-600">
                Quality catering at competitive prices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-xl mb-8" style={{ color: '#efe5d9' }}>
          Browse our menu and submit your Family Meal / Catering order today!
          </p>
          <Link to="/menu" style={{ background: '#efe5d9' }} className=" text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}

