import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import { getPublicProducts } from '../../utils/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await getPublicProducts({ limit: 4, sortBy: 'newest' });
        if (response.success) {
          setFeaturedProducts(response.products);
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleToggleFavorite = (productId) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleProductClick = (productId) => {
    // Check if user is logged in
    const buyerToken = localStorage.getItem('buyer_token') || sessionStorage.getItem('buyer_token');
    if (!buyerToken) {
      // Redirect to login
      navigate('/buyer/login', { state: { from: '/', productId } });
      return;
    }
    // For now, just show alert. Later can navigate to product detail page
    alert('Product details page coming soon! Product ID: ' + productId);
  };

  const handleAddToCart = (productId) => {
    // Check if user is logged in
    const buyerToken = localStorage.getItem('buyer_token') || sessionStorage.getItem('buyer_token');
    if (!buyerToken) {
      // Redirect to login
      navigate('/buyer/login', { state: { from: '/' } });
      return;
    }
    alert('Add to cart functionality requires login. Redirecting...');
  };

  useEffect(() => {
    // Initialize reveal animations
    const initializeRevealAnimations = () => {
      const els = Array.from(document.querySelectorAll('.reveal'));
      if (!('IntersectionObserver' in window) || !els.length) {
        els.forEach(e => e.classList.add('in-view'));
        return;
      }

      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      els.forEach(el => io.observe(el));

      // Return the observer so we can use it later
      return io;
    };

    // Initialize FAQ toggles
    const initializeFAQ = () => {
      document.querySelectorAll('.faq-question').forEach(faq => {
        faq.onclick = () => toggleFAQ(faq);
      });
    };

    // FAQ toggle function
    const toggleFAQ = (element) => {
      const answer = element.querySelector('.faq-answer');
      const icon = element.querySelector('svg');

      answer.classList.toggle('open');
      icon.classList.toggle('rotate-180');

      // Close other FAQs
      document.querySelectorAll('.faq-question').forEach(faq => {
        if (faq !== element) {
          faq.querySelector('.faq-answer').classList.remove('open');
          faq.querySelector('svg').classList.remove('rotate-180');
        }
      });
    };

    // Add floating badges
    const addFloatingBadges = () => {
      const hero = document.querySelector('.hero-background');
      if (!hero) return;

      const badges = [
        { text: '24/7 Support', color: 'bg-purple-400', delay: '1.5s', position: 'mobile-badge-mid-left top-80 md:top-60 right-16 md:right-40' },
        { text: 'Free Shipping', color: 'bg-emerald-400', delay: '2s', position: 'mobile-hidden top-72 md:top-[400px] right-60 md:right-24' },
        { text: 'Quality Assured', color: 'bg-orange-400', delay: '2.5s', position: 'mobile-badge-bottom-left bottom-60 md:bottom-[450px] left-4 md:left-8' },
        { text: 'Local Producers', color: 'bg-gray-400', delay: '3s', position: 'mobile-hidden top-64 md:top-72 left-32 md:left-40' },
        { text: 'Worldwide Delivery', color: 'bg-indigo-400', delay: '3.5s', position: 'mobile-hidden bottom-20 md:bottom-[320px] left-20 md:left-32' }
      ];

      badges.forEach((badge, index) => {
        const badgeEl = document.createElement('div');
        badgeEl.className = `hero-badge float-${(index % 3) + 1} px-3 py-2 rounded-full text-white text-xs md:text-sm font-medium absolute ${badge.position} z-20`;
        badgeEl.style.animationDelay = badge.delay;
        badgeEl.innerHTML = `<span class="inline-block w-2 h-2 ${badge.color} rounded-full mr-2"></span>${badge.text}`;
        hero.appendChild(badgeEl);
      });
    };

    // Initialize everything
    const observer = initializeRevealAnimations();
    initializeFAQ();
    addFloatingBadges();

    // Cleanup
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Re-run reveal animations when products load
  useEffect(() => {
    if (!loading && featuredProducts.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const els = Array.from(document.querySelectorAll('.reveal:not(.in-view)'));
        if (!('IntersectionObserver' in window) || !els.length) {
          els.forEach(e => e.classList.add('in-view'));
          return;
        }

        const io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12 });

        els.forEach(el => io.observe(el));
      }, 100);
    }
  }, [loading, featuredProducts]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      {/* Modern Hero Section with Image Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-background">
        {/* Background Overlay */}
        <div className="hero-overlay"></div>
        <div className="hero-pattern"></div>

        {/* Geometric Background Shapes */}
        <div className="geometric-shape shape-1"></div>
        <div className="geometric-shape shape-2"></div>
        <div className="geometric-shape shape-3"></div>

        {/* Floating Achievement Badges - Repositioned to avoid hero text */}
        <div className="hero-badge float-1 px-3 py-2 rounded-full text-white text-xs md:text-sm font-medium absolute top-20 md:top-24 right-6 md:right-12">
          <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
          1,200+ Products
        </div>

        <div className="hero-badge float-2 px-3 py-2 rounded-full text-white text-xs md:text-sm font-medium absolute top-40 md:top-48 left-6 md:left-12" style={{ animationDelay: '0.5s' }}>
          <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
          Trusted Platform
        </div>

        <div className="hero-badge float-3 px-3 py-2 rounded-full text-white text-xs md:text-sm font-medium absolute bottom-80 md:bottom-76 right-8 md:right-16" style={{ animationDelay: '1s' }}>
          <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
          Same-day Delivery
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 hero-badge px-4 py-2 rounded-full text-white text-sm font-medium mb-8 reveal">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Authentic Filipino Marketplace
          </div>

          {/* Main Heading */}
          <h1 className="heading-primary text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 reveal" style={{ transitionDelay: '0.1s' }}>
            Discover
            <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
              Authentic
            </span>
            <span className="block text-4xl md:text-5xl lg:text-6xl font-bold">Pasalubong</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-12 leading-relaxed reveal font-medium" style={{ transitionDelay: '0.2s', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Connect with the finest delicacies and crafts from <strong>Carigara & Barugo</strong>.
            Enterprise-grade platform trusted by thousands worldwide.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 reveal" style={{ transitionDelay: '0.3s' }}>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/products');
              }}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/25 backdrop-blur-sm border border-white/40 rounded-2xl hover:bg-white/35 transition-all duration-300 pulse-glow"
            >
              <span className="mr-2">🛍️</span>
              Start Shopping Now
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/seller/register');
              }}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-rose-600 bg-white/95 backdrop-blur-sm rounded-2xl hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span className="mr-2">🏪</span>
              Become a Partner
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto reveal" style={{ transitionDelay: '0.4s' }}>
            <div className="stats-card rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-rose-600 mb-2">4.9★</div>
              <div className="text-sm font-medium text-gray-700">Average Rating</div>
              <div className="text-xs text-gray-500 mt-1">From 2,000+ reviews</div>
            </div>

            <div className="stats-card rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-amber-600 mb-2">8k+</div>
              <div className="text-sm font-medium text-gray-700">Happy Customers</div>
              <div className="text-xs text-gray-500 mt-1">Worldwide delivery</div>
            </div>

            <div className="stats-card rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-emerald-600 mb-2">100%</div>
              <div className="text-sm font-medium text-gray-700">Authentic</div>
              <div className="text-xs text-gray-500 mt-1">Local & verified</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/80 text-center">
          <div className="text-sm mb-2">Explore More</div>
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 reveal">
            <span className="badge badge-primary">Best Sellers</span>
            <h2 className="heading-primary text-3xl md:text-5xl font-bold mt-4 text-slate-900">Featured Products</h2>
            <p className="text-professional mt-4 max-w-3xl mx-auto text-lg">Discover our most popular authentic delicacies and crafts, handpicked from the finest local producers.</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card rounded-2xl overflow-hidden shadow-professional animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3 mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {!loading && featuredProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <div key={product.id} className="reveal" style={{ transitionDelay: `${index * 0.1}s` }}>
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={() => handleProductClick(product.id)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && featuredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products available at the moment.</p>
              <p className="text-gray-500 mt-2">Check back soon for new arrivals!</p>
            </div>
          )}

          <div className="text-center mt-12 reveal">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/products');
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              View All Products
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-rose-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 reveal">
            <span className="badge badge-gold">Why Choose Us</span>
            <h2 className="heading-primary text-3xl md:text-5xl font-bold mt-4 text-slate-900">What Makes Us Special</h2>
            <p className="text-professional mt-4 max-w-3xl mx-auto text-lg">We're committed to bringing you the most authentic Filipino experience with modern convenience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center reveal">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center text-2xl text-white mb-6 mx-auto">🏆</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Premium Quality</h3>
              <p className="text-professional">Hand-selected products from trusted local producers with strict quality standards.</p>
            </div>

            <div className="text-center reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-2xl text-white mb-6 mx-auto">🚚</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Fast Delivery</h3>
              <p className="text-professional">Same-day local delivery and express nationwide shipping to bring freshness to your door.</p>
            </div>

            <div className="text-center reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl text-white mb-6 mx-auto">🛡️</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Shopping</h3>
              <p className="text-professional">Enterprise-grade security with encrypted payments and buyer protection guarantee.</p>
            </div>

            <div className="text-center reveal" style={{ transitionDelay: '0.3s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl text-white mb-6 mx-auto">💬</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">24/7 Support</h3>
              <p className="text-professional">Dedicated customer service team ready to assist you anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Numbers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="reveal counter">
              <div className="text-4xl md:text-5xl font-black text-rose-600 mb-2">1,200+</div>
              <div className="text-gray-600 font-medium">Products Available</div>
            </div>
            <div className="reveal counter" style={{ transitionDelay: '0.1s' }}>
              <div className="text-4xl md:text-5xl font-black text-amber-600 mb-2">8,000+</div>
              <div className="text-gray-600 font-medium">Happy Customers</div>
            </div>
            <div className="reveal counter" style={{ transitionDelay: '0.2s' }}>
              <div className="text-4xl md:text-5xl font-black text-emerald-600 mb-2">150+</div>
              <div className="text-gray-600 font-medium">Local Partners</div>
            </div>
            <div className="reveal counter" style={{ transitionDelay: '0.3s' }}>
              <div className="text-4xl md:text-5xl font-black text-purple-600 mb-2">50+</div>
              <div className="text-gray-600 font-medium">Cities Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Community */}
      <section id="join" className="py-20 bg-gradient-to-br from-white via-rose-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 reveal">
            <span className="badge badge-primary">Get Started</span>
            <h2 className="heading-primary text-3xl md:text-5xl font-bold mt-4 text-slate-900">Join Our Professional Network</h2>
            <p className="text-professional mt-4 max-w-3xl mx-auto text-lg">Connect with authentic Carigara and Barugo delicacies through our comprehensive platform designed for buyers, sellers, and delivery partners.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Shop Now */}
            <div className="card hover-animate p-8 rounded-2xl border border-slate-200 reveal shadow-professional">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center text-2xl text-white mb-6">🛒</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Premium Shopping</h3>
              <p className="text-professional mb-6">Access our curated selection of authentic Carigara and Barugo delicacies with enterprise-grade quality assurance.</p>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate('/products');
                }}
                className="inline-flex items-center gap-2 text-white py-3 px-6 rounded-lg btn-shine font-medium shadow-professional"
              >
                Browse Catalog
              </button>
            </div>

            {/* Seller */}
            <div className="card hover-animate p-8 rounded-2xl border border-slate-200 reveal shadow-professional" style={{ transitionDelay: '.1s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-2xl text-white mb-6">🏪</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Seller Partnership</h3>
              <p className="text-professional mb-6">Scale your business with our professional tools, analytics, and dedicated support for local entrepreneurs.</p>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate('/seller/register');
                }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 px-6 rounded-lg font-medium shadow-professional transition-all"
              >
                Partner With Us
              </button>
            </div>

            {/* Rider */}
            <div className="card hover-animate p-8 rounded-2xl border border-slate-200 reveal shadow-professional" style={{ transitionDelay: '.2s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center text-2xl text-white mb-6">🚴</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Delivery Network</h3>
              <p className="text-professional mb-6">Join our professional delivery network with competitive rates, flexible schedules, and comprehensive support.</p>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate('/delivery/register');
                }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white py-3 px-6 rounded-lg font-medium shadow-professional transition-all"
              >
                Join Network
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section id="categories" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 reveal">
            <span className="text-rose-600 font-semibold tracking-wide">Explore</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2">Popular Categories</h2>
          </div>

          {/* Responsive grid with hover spotlight */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/products?category=Sweets');
              }}
              className="group relative block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow hover-animate img-zoom cursor-pointer"
            >
              <img src="/assets/images/kakanin.jpg" alt="Rice Cakes & Kakanin" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <p className="text-white font-semibold">Rice Cakes & Kakanin</p>
                <span className="text-white/80 text-xs bg-white/10 border border-white/30 rounded-full px-2 py-0.5">View</span>
              </div>
            </div>

            <div
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/products?category=Snacks');
              }}
              className="group relative block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow hover-animate img-zoom cursor-pointer"
            >
              <img src="/assets/images/pastries.jpg" alt="Pastries & Bread" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <p className="text-white font-semibold">Pastries & Bread</p>
                <span className="text-white/80 text-xs bg-white/10 border border-white/30 rounded-full px-2 py-0.5">View</span>
              </div>
            </div>

            <div
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/products?category=Beverages');
              }}
              className="group relative block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow hover-animate img-zoom cursor-pointer"
            >
              <img src="/assets/images/local wine.jpg" alt="Local Wine" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <p className="text-white font-semibold">Local Wine</p>
                <span className="text-white/80 text-xs bg-white/10 border border-white/30 rounded-full px-2 py-0.5">View</span>
              </div>
            </div>

            <div
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/products?category=Snacks');
              }}
              className="group relative block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow hover-animate img-zoom cursor-pointer"
            >
              <img src="/assets/images/s3.jpg" alt="Preserved Foods" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <p className="text-white font-semibold">Preserved Foods</p>
                <span className="text-white/80 text-xs bg-white/10 border border-white/30 rounded-full px-2 py-0.5">View</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-10 reveal">
            <span className="text-rose-600 font-semibold tracking-wide">Simple & Fast</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2">How It Works</h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">Get your favorite Carigara and Barugo pasalubong delivered to your doorstep in four easy steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <div className="card p-6 rounded-2xl hover-animate reveal">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-rose-500 text-white font-bold rounded-full">1</div>
              <p className="font-semibold">Browse Products</p>
              <p className="text-sm mt-2 text-gray-600">Explore our wide selection of authentic delicacies and crafts.</p>
            </div>
            <div className="card p-6 rounded-2xl hover-animate reveal" style={{ transitionDelay: '.05s' }}>
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-rose-500 text-white font-bold rounded-full">2</div>
              <p className="font-semibold">Add to Cart</p>
              <p className="text-sm mt-2 text-gray-600">Save your favorites and prepare your order.</p>
            </div>
            <div className="card p-6 rounded-2xl hover-animate reveal" style={{ transitionDelay: '.1s' }}>
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-rose-500 text-white font-bold rounded-full">3</div>
              <p className="font-semibold">Checkout</p>
              <p className="text-sm mt-2 text-gray-600">Complete your order with secure payment options.</p>
            </div>
            <div className="card p-6 rounded-2xl hover-animate reveal" style={{ transitionDelay: '.15s' }}>
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-rose-500 text-white font-bold rounded-full">4</div>
              <p className="font-semibold">Receive Delivery</p>
              <p className="text-sm mt-2 text-gray-600">Track your order and receive your items fresh at your doorstep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 reveal">
            <span className="text-rose-600 font-semibold tracking-wide">Social Proof</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow hover-animate reveal">
              <div className="absolute -top-3 -left-3 bg-yellow-400/90 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow">★★★★☆</div>
              <p className="mt-2 text-gray-700">"As an OFW in Dubai, I miss Filipino food so much. This platform allows me to send authentic Carigara and Barugo delicacies to my family back home."</p>
              <div className="flex items-center mt-4 gap-3">
                <img src="/assets/images/megu.jpg" alt="Michael Reyes" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-bold">Michael Reyes</p>
                  <p className="text-sm text-gray-500">OFW in Dubai</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow hover-animate reveal" style={{ transitionDelay: '.05s' }}>
              <div className="absolute -top-3 -left-3 bg-yellow-400/90 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow">★★★★★</div>
              <p className="mt-2 text-gray-700">"I visited Carigara and Barugo last year and fell in love with the local food. Now I can order my favorite bibingka and have it shipped to Manila."</p>
              <div className="flex items-center mt-4 gap-3">
                <img src="/assets/images/noba.jpg" alt="Patricia Mendoza" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-bold">Patricia Mendoza</p>
                  <p className="text-sm text-gray-500">Manila Resident</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow hover-animate reveal" style={{ transitionDelay: '.1s' }}>
              <div className="absolute -top-3 -left-3 bg-yellow-400/90 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow">★★★★☆</div>
              <p className="mt-2 text-gray-700">"The handcrafted items are amazing! I ordered several abaca bags as gifts and they were loved by all. Excellent service too!"</p>
              <div className="flex items-center mt-4 gap-3">
                <img src="/assets/images/itado.jpg" alt="Jonathan Santos" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-bold">Jonathan Santos</p>
                  <p className="text-sm text-gray-500">Balikbayan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 newsletter-bg">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="reveal">
            <h2 className="heading-primary text-3xl md:text-5xl font-bold text-white mb-4">Stay Connected</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">Get the latest updates on new products, special offers, and authentic Filipino delicacies delivered straight to your inbox.</p>

            <form className="max-w-md mx-auto flex gap-3" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address" className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm" />
              <button type="submit" className="px-6 py-3 bg-white text-rose-600 font-semibold rounded-lg hover:bg-white/90 transition-colors shadow-lg">Subscribe</button>
            </form>

            <p className="text-white/70 text-sm mt-4">Join 10,000+ subscribers. No spam, unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12 reveal">
            <span className="badge badge-primary">Support</span>
            <h2 className="heading-primary text-3xl md:text-5xl font-bold mt-4 text-slate-900">Frequently Asked Questions</h2>
            <p className="text-professional mt-4 text-lg">Everything you need to know about our platform and services.</p>
          </div>

          <div className="space-y-4">
            <div className="faq-item reveal">
              <div className="faq-question p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">How do I place an order?</h3>
                  <svg className="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="faq-answer mt-4">
                  <p className="text-gray-600">Simply browse our products, add items to your cart, and proceed to checkout. You can pay securely using various payment methods including credit cards, PayPal, and bank transfers.</p>
                </div>
              </div>
            </div>

            <div className="faq-item reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="faq-question p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">What are your delivery options?</h3>
                  <svg className="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="faq-answer mt-4">
                  <p className="text-gray-600">We offer same-day delivery within Carigara and Barugo, next-day delivery to nearby cities, and nationwide shipping within 3-5 business days. International shipping is also available.</p>
                </div>
              </div>
            </div>

            <div className="faq-item reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="faq-question p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Are your products authentic?</h3>
                  <svg className="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="faq-answer mt-4">
                  <p className="text-gray-600">Yes! All our products are sourced directly from local producers in Carigara and Barugo. We maintain strict quality standards and work only with verified authentic suppliers.</p>
                </div>
              </div>
            </div>

            <div className="faq-item reveal" style={{ transitionDelay: '0.3s' }}>
              <div className="faq-question p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Can I become a seller on your platform?</h3>
                  <svg className="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="faq-answer mt-4">
                  <p className="text-gray-600">Absolutely! We welcome local producers and entrepreneurs. Visit our seller registration page to learn about requirements and start your application process.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Scroll to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 transform group-hover:-translate-y-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default HomePage;
