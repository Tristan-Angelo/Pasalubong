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
          className="text-xl md:text-2xl font-extrabold tracking-tight gradient-text"
        >
          Pasalubong
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
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.085l3.71-3.856a.75.75 0 1 1 1.08 1.04l-4.24 4.41a.75.75 0 0 1-1.08 0l-4.24-4.41a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd"/>
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
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.085l3.71-3.856a.75.75 0 1 1 1.08 1.04l-4.24 4.41a.75.75 0 0 1-1.08 0l-4.24-4.41a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd"/>
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
      <div className={`mobile-nav-menu px-6 pb-4 space-y-2 text-sm ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <button onClick={() => handleNavClick('/#categories')} className="block w-full text-left py-2 border-b">Categories</button>
        <button onClick={() => handleNavClick('/#featured')} className="block w-full text-left py-2 border-b">Featured</button>
        <button onClick={() => handleNavClick('/#how-it-works')} className="block w-full text-left py-2 border-b">How it Works</button>
        <button onClick={() => handleNavClick('/#testimonials')} className="block w-full text-left py-2 border-b">Testimonials</button>
        
        <button 
          onClick={() => {
            setIsMobileRegisterOpen(!isMobileRegisterOpen);
            setIsMobileLoginOpen(false);
          }}
          className="w-full text-left py-2 border-b"
        >
          Register
        </button>
        <div className={`pl-4 space-y-1 border-b pb-2 ${isMobileRegisterOpen ? 'block' : 'hidden'}`}>
          <button onClick={() => handleNavClick('/buyer/register')} className="block w-full text-left py-1">Buyer</button>
          <button onClick={() => handleNavClick('/delivery/register')} className="block w-full text-left py-1">Delivery</button>
          <button onClick={() => handleNavClick('/seller/register')} className="block w-full text-left py-1">Seller</button>
        </div>
        
        <button 
          onClick={() => {
            setIsMobileLoginOpen(!isMobileLoginOpen);
            setIsMobileRegisterOpen(false);
          }}
          className="w-full text-left py-2"
        >
          Login
        </button>
        <div className={`pl-4 space-y-1 ${isMobileLoginOpen ? 'block' : 'hidden'}`}>
          <button onClick={() => handleNavClick('/buyer/login')} className="block w-full text-left py-1">Buyer</button>
          <button onClick={() => handleNavClick('/delivery/login')} className="block w-full text-left py-1">Delivery</button>
          <button onClick={() => handleNavClick('/seller/login')} className="block w-full text-left py-1">Seller</button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
