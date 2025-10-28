import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const [isRegisterMenuOpen, setIsRegisterMenuOpen] = useState(false);
  const [isMobileLoginOpen, setIsMobileLoginOpen] = useState(false);
  const [isMobileRegisterOpen, setIsMobileRegisterOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991) {
        setIsMobileMenuOpen(false);
        setIsMobileLoginOpen(false);
        setIsMobileRegisterOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (path) => {
    if (path.startsWith('#')) {
      // Handle anchor links
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-white/60">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-2"
        >
          <img
            src="/PasalubongLogo.svg"
            alt="Pasalubong Logo"
            className="h-6 w-6 md:h-8 md:w-8"
          />
          <span className="text-xl md:text-2xl font-extrabold tracking-tight gradient-text">
            Pasalubong
          </span>
        </button>

        {/* Desktop Navigation - Hidden at 991px and below */}
        <div className="desktop-nav hidden items-center gap-6 text-sm">
          <button
            onClick={() => handleNavClick('/#categories')}
            className="nav-link relative group font-medium text-slate-700 hover:text-rose-700"
          >
            <span className="pb-1">Categories</span>
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-rose-500 to-amber-500 transition-all group-hover:w-full"></span>
          </button>
          <button
            onClick={() => handleNavClick('/#featured')}
            className="nav-link relative group font-medium text-slate-700 hover:text-rose-700"
          >
            <span className="pb-1">Featured</span>
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-rose-500 to-amber-500 transition-all group-hover:w-full"></span>
          </button>
          <button
            onClick={() => handleNavClick('/#how-it-works')}
            className="nav-link relative group font-medium text-slate-700 hover:text-rose-700"
          >
            <span className="pb-1">How it Works</span>
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-rose-500 to-amber-500 transition-all group-hover:w-full"></span>
          </button>
          <button
            onClick={() => handleNavClick('/#testimonials')}
            className="nav-link relative group font-medium text-slate-700 hover:text-rose-700"
          >
            <span className="pb-1">Testimonials</span>
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-rose-500 to-amber-500 transition-all group-hover:w-full"></span>
          </button>

          {/* Login dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLoginMenuOpen(!isLoginMenuOpen);
                setIsRegisterMenuOpen(false);
              }}
              className="inline-flex items-center gap-2 text-white py-2.5 px-5 rounded-lg shadow-professional hover-glow btn-shine font-medium"
            >
              Login
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.085l3.71-3.856a.75.75 0 1 1 1.08 1.04l-4.24 4.41a.75.75 0 0 1-1.08 0l-4.24-4.41a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
            <div className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-professional-lg border border-gray-100 py-2 ${isLoginMenuOpen ? 'block' : 'hidden'}`}>
              <button
                onClick={() => handleNavClick('/buyer/login')}
                className="block w-full text-left px-4 py-2.5 text-sm hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                👤 Buyer
              </button>
              <button
                onClick={() => handleNavClick('/delivery/login')}
                className="block w-full text-left px-4 py-2.5 text-sm hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                🚴 Rider
              </button>
              <button
                onClick={() => handleNavClick('/seller/login')}
                className="block w-full text-left px-4 py-2.5 text-sm hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                🏪 Seller
              </button>
            </div>
          </div>

          {/* Register dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsRegisterMenuOpen(!isRegisterMenuOpen);
                setIsLoginMenuOpen(false);
              }}
              className="inline-flex items-center gap-2 bg-white text-rose-700 border-2 border-rose-200 hover:bg-rose-50 hover:border-rose-300 py-2.5 px-5 rounded-lg shadow-sm font-medium transition-all"
            >
              Register
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.085l3.71-3.856a.75.75 0 1 1 1.08 1.04l-4.24 4.41a.75.75 0 0 1-1.08 0l-4.24-4.41a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
            <div className={`absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-professional-lg border border-gray-100 py-2 ${isRegisterMenuOpen ? 'block' : 'hidden'}`}>
              <button
                onClick={() => handleNavClick('/buyer/register')}
                className="block w-full text-left px-4 py-2.5 text-sm hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                👤 Buyer Account
              </button>
              <button
                onClick={() => handleNavClick('/delivery/register')}
                className="block w-full text-left px-4 py-2.5 text-sm hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                🚴 Rider Account
              </button>
              <button
                onClick={() => handleNavClick('/seller/register')}
                className="block w-full text-left px-4 py-2.5 text-sm hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                🏪 Seller Account
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Toggle Button - Shown at 991px and below */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="mobile-nav-toggle hidden p-2 rounded hover:bg-gray-100"
          aria-label="Toggle navigation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu - Shown at 991px and below when toggled */}
      <div className={`mobile-nav-menu px-6 pb-4 space-y-3 text-sm ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <button onClick={() => handleNavClick('/#categories')} className="block w-full text-left py-2.5 text-gray-700 hover:text-rose-600 transition-colors border-b border-gray-200">Categories</button>
        <button onClick={() => handleNavClick('/#featured')} className="block w-full text-left py-2.5 text-gray-700 hover:text-rose-600 transition-colors border-b border-gray-200">Featured</button>
        <button onClick={() => handleNavClick('/#how-it-works')} className="block w-full text-left py-2.5 text-gray-700 hover:text-rose-600 transition-colors border-b border-gray-200">How it Works</button>
        <button onClick={() => handleNavClick('/#testimonials')} className="block w-full text-left py-2.5 text-gray-700 hover:text-rose-600 transition-colors border-b border-gray-200">Testimonials</button>

        {/* Register Section */}
        <div className="pt-2">
          <button
            onClick={() => {
              setIsMobileRegisterOpen(!isMobileRegisterOpen);
              setIsMobileLoginOpen(false);
            }}
            className="w-full flex items-center justify-between py-3 px-4 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 rounded-lg text-rose-700 font-semibold transition-all"
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Register
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-transform ${isMobileRegisterOpen ? 'rotate-180' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.085l3.71-3.856a.75.75 0 1 1 1.08 1.04l-4.24 4.41a.75.75 0 0 1-1.08 0l-4.24-4.41a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
          <div className={`mt-2 space-y-2 ${isMobileRegisterOpen ? 'block' : 'hidden'}`}>
            <button 
              onClick={() => handleNavClick('/buyer/register')} 
              className="block w-full text-left py-2.5 px-4 bg-white hover:bg-rose-50 rounded-lg text-gray-700 hover:text-rose-700 transition-colors border border-gray-200 hover:border-rose-300"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <span className="font-medium">Buyer Account</span>
              </span>
            </button>
            <button 
              onClick={() => handleNavClick('/delivery/register')} 
              className="block w-full text-left py-2.5 px-4 bg-white hover:bg-rose-50 rounded-lg text-gray-700 hover:text-rose-700 transition-colors border border-gray-200 hover:border-rose-300"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">🚴</span>
                <span className="font-medium">Rider Account</span>
              </span>
            </button>
            <button 
              onClick={() => handleNavClick('/seller/register')} 
              className="block w-full text-left py-2.5 px-4 bg-white hover:bg-rose-50 rounded-lg text-gray-700 hover:text-rose-700 transition-colors border border-gray-200 hover:border-rose-300"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">🏪</span>
                <span className="font-medium">Seller Account</span>
              </span>
            </button>
          </div>
        </div>

        {/* Login Section */}
        <div className="pt-2">
          <button
            onClick={() => {
              setIsMobileLoginOpen(!isMobileLoginOpen);
              setIsMobileRegisterOpen(false);
            }}
            className="w-full flex items-center justify-between py-3 px-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 rounded-lg text-white font-semibold transition-all shadow-md"
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Login
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-transform ${isMobileLoginOpen ? 'rotate-180' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.085l3.71-3.856a.75.75 0 1 1 1.08 1.04l-4.24 4.41a.75.75 0 0 1-1.08 0l-4.24-4.41a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
          <div className={`mt-2 space-y-2 ${isMobileLoginOpen ? 'block' : 'hidden'}`}>
            <button 
              onClick={() => handleNavClick('/buyer/login')} 
              className="block w-full text-left py-2.5 px-4 bg-white hover:bg-rose-50 rounded-lg text-gray-700 hover:text-rose-700 transition-colors border border-gray-200 hover:border-rose-300"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <span className="font-medium">Buyer</span>
              </span>
            </button>
            <button 
              onClick={() => handleNavClick('/delivery/login')} 
              className="block w-full text-left py-2.5 px-4 bg-white hover:bg-rose-50 rounded-lg text-gray-700 hover:text-rose-700 transition-colors border border-gray-200 hover:border-rose-300"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">🚴</span>
                <span className="font-medium">Rider</span>
              </span>
            </button>
            <button 
              onClick={() => handleNavClick('/seller/login')} 
              className="block w-full text-left py-2.5 px-4 bg-white hover:bg-rose-50 rounded-lg text-gray-700 hover:text-rose-700 transition-colors border border-gray-200 hover:border-rose-300"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">🏪</span>
                <span className="font-medium">Seller</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
