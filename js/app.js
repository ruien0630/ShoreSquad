/**
 * ShoreSquad - Main JavaScript
 * Handles interactivity, animations, and performance optimizations
 */

// ===================================
// Utility Functions
// ===================================

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (func, wait = 20) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function for scroll events
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
const throttle = (func, limit = 100) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if element is in viewport
 */
const isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

// ===================================
// Mobile Navigation
// ===================================

class MobileNav {
    constructor() {
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        if (!this.navToggle || !this.navMenu) return;

        // Toggle menu on button click
        this.navToggle.addEventListener('click', () => this.toggleMenu());

        // Close menu when clicking a link
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav') && this.navMenu.classList.contains('nav-menu--active')) {
                this.closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navMenu.classList.contains('nav-menu--active')) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        const isActive = this.navMenu.classList.toggle('nav-menu--active');
        this.navToggle.setAttribute('aria-expanded', isActive);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isActive ? 'hidden' : '';
    }

    closeMenu() {
        this.navMenu.classList.remove('nav-menu--active');
        this.navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
}

// ===================================
// Header Scroll Behavior
// ===================================

class HeaderScroll {
    constructor() {
        this.header = document.querySelector('.header');
        this.lastScroll = 0;
        this.init();
    }

    init() {
        if (!this.header) return;

        window.addEventListener('scroll', throttle(() => {
            const currentScroll = window.pageYOffset;

            // Hide header on scroll down, show on scroll up
            if (currentScroll > this.lastScroll && currentScroll > 100) {
                this.header.classList.add('header--hidden');
            } else {
                this.header.classList.remove('header--hidden');
            }

            this.lastScroll = currentScroll;
        }, 100));
    }
}

// ===================================
// Smooth Scroll for Anchor Links
// ===================================

class SmoothScroll {
    constructor() {
        this.links = document.querySelectorAll('a[href^="#"]');
        this.init();
    }

    init() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Skip if it's just "#"
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Update focus for accessibility
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                }
            });
        });
    }
}

// ===================================
// Scroll Animations
// ===================================

class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.animate-on-scroll');
        this.init();
    }

    init() {
        // Use Intersection Observer for better performance
        if ('IntersectionObserver' in window) {
            this.observeElements();
        } else {
            // Fallback for older browsers
            this.elements.forEach(el => el.classList.add('visible'));
        }
    }

    observeElements() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Unobserve after animation for performance
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.elements.forEach(element => observer.observe(element));
    }
}

// ===================================
// Counter Animation
// ===================================

class CounterAnimation {
    constructor() {
        this.counters = document.querySelectorAll('.stat-number[data-count]');
        this.animated = false;
        this.init();
    }

    init() {
        if (!this.counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated) {
                    this.animateCounters();
                    this.animated = true;
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });

        this.counters.forEach(counter => observer.observe(counter));
    }

    animateCounters() {
        this.counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };

            updateCounter();
        });
    }
}

// ===================================
// Back to Top Button
// ===================================

class BackToTop {
    constructor() {
        this.button = document.querySelector('.back-to-top');
        this.init();
    }

    init() {
        if (!this.button) return;

        // Show/hide button on scroll
        window.addEventListener('scroll', throttle(() => {
            if (window.pageYOffset > 500) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        }, 100));

        // Scroll to top on click
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ===================================
// Form Handling
// ===================================

class FormHandler {
    constructor() {
        this.form = document.querySelector('.cta-form');
        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = this.form.querySelector('#email').value;
            
            if (this.validateEmail(email)) {
                this.handleSuccess(email);
            } else {
                this.handleError('Please enter a valid email address');
            }
        });
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    handleSuccess(email) {
        // In production, this would send to your backend
        console.log('Email submitted:', email);
        
        // Show success message
        const message = document.createElement('div');
        message.className = 'form-message form-message--success';
        message.textContent = '🎉 Welcome to the squad! Check your email for next steps.';
        message.style.cssText = `
            padding: 1rem;
            margin-top: 1rem;
            background: var(--color-success);
            color: white;
            border-radius: var(--radius-sm);
            text-align: center;
            animation: fadeInUp 0.5s ease;
        `;
        
        this.form.appendChild(message);
        this.form.querySelector('#email').value = '';

        // Remove message after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    handleError(errorMessage) {
        const input = this.form.querySelector('#email');
        input.style.borderColor = 'var(--color-accent)';
        
        // Show error message
        const message = document.createElement('div');
        message.className = 'form-message form-message--error';
        message.textContent = errorMessage;
        message.style.cssText = `
            padding: 1rem;
            margin-top: 1rem;
            background: var(--color-accent);
            color: white;
            border-radius: var(--radius-sm);
            text-align: center;
        `;
        
        this.form.appendChild(message);

        // Reset error state after 3 seconds
        setTimeout(() => {
            input.style.borderColor = '';
            message.remove();
        }, 3000);
    }
}

// ===================================
// Interactive Weather Widget (Demo)
// ===================================

class WeatherWidget {
    constructor() {
        this.widget = document.querySelector('.weather-widget');
        this.init();
    }

    init() {
        if (!this.widget) return;

        // Simulate weather updates
        this.updateWeather();
        setInterval(() => this.updateWeather(), 10000);
    }

    updateWeather() {
        const conditions = [
            { icon: '☀️', temp: 24, text: 'Perfect cleanup weather!' },
            { icon: '⛅', temp: 22, text: 'Great day for the beach!' },
            { icon: '🌤️', temp: 26, text: 'Sunny with light breeze!' },
            { icon: '🌊', temp: 20, text: 'Fresh ocean air today!' }
        ];

        const random = conditions[Math.floor(Math.random() * conditions.length)];
        
        const icon = this.widget.querySelector('.weather-icon');
        const temp = this.widget.querySelector('.weather-temp');
        const condition = this.widget.querySelector('.weather-condition');

        if (icon) icon.textContent = random.icon;
        if (temp) temp.textContent = `${random.temp}°C`;
        if (condition) condition.textContent = random.text;
    }
}

// ===================================
// NEA Weather Forecast API Integration
// ===================================

class WeatherForecast {
    constructor() {
        this.forecastGrid = document.getElementById('forecastGrid');
        this.weatherLoading = document.getElementById('weatherLoading');
        this.weatherError = document.getElementById('weatherError');
        this.currentConditions = document.getElementById('currentConditions');
        this.conditionsGrid = document.getElementById('conditionsGrid');
        
        // data.gov.sg API endpoints
        this.apiEndpoints = {
            forecast: 'https://api.data.gov.sg/v1/environment/4-day-weather-forecast',
            rainfall: 'https://api.data.gov.sg/v1/environment/rainfall',
            temperature: 'https://api.data.gov.sg/v1/environment/air-temperature',
            humidity: 'https://api.data.gov.sg/v1/environment/relative-humidity',
            windSpeed: 'https://api.data.gov.sg/v1/environment/wind-speed'
        };
        
        this.init();
    }

    init() {
        if (!this.forecastGrid) return;
        this.fetchWeatherData();
    }

    async fetchWeatherData() {
        try {
            // Fetch 4-day forecast
            const forecastResponse = await fetch(this.apiEndpoints.forecast);
            const forecastData = await forecastResponse.json();
            
            if (forecastData.items && forecastData.items.length > 0) {
                this.displayForecast(forecastData.items[0]);
                
                // Fetch current conditions in parallel
                await this.fetchCurrentConditions();
                
                this.hideLoading();
            } else {
                this.showError();
            }
        } catch (error) {
            console.error('Weather API Error:', error);
            this.showError();
        }
    }

    async fetchCurrentConditions() {
        try {
            const [tempRes, humidityRes, rainfallRes, windRes] = await Promise.all([
                fetch(this.apiEndpoints.temperature),
                fetch(this.apiEndpoints.humidity),
                fetch(this.apiEndpoints.rainfall),
                fetch(this.apiEndpoints.windSpeed)
            ]);

            const [tempData, humidityData, rainfallData, windData] = await Promise.all([
                tempRes.json(),
                humidityRes.json(),
                rainfallRes.json(),
                windRes.json()
            ]);

            this.displayCurrentConditions({
                temperature: tempData,
                humidity: humidityData,
                rainfall: rainfallData,
                windSpeed: windData
            });
        } catch (error) {
            console.error('Current conditions error:', error);
            // Don't show error if forecast worked
        }
    }

    displayForecast(forecastItem) {
        const forecasts = forecastItem.forecasts;
        this.forecastGrid.innerHTML = '';

        forecasts.forEach((forecast, index) => {
            const date = new Date(forecast.date);
            const isToday = index === 0;
            
            const card = document.createElement('div');
            card.className = `forecast-card animate-on-scroll ${isToday ? 'today' : ''}`;
            
            const dayName = isToday ? 'Today' : date.toLocaleDateString('en-SG', { weekday: 'long' });
            const dateStr = date.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' });
            
            // Map weather descriptions to emojis
            const weatherIcon = this.getWeatherIcon(forecast.forecast);
            
            card.innerHTML = `
                <div class="forecast-date">${isToday ? '🎯 TODAY' : dateStr}</div>
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-icon" role="img" aria-label="${forecast.forecast}">${weatherIcon}</div>
                <div class="forecast-temp">
                    <span class="forecast-temp-range">
                        ${forecast.temperature.low}° - ${forecast.temperature.high}°C
                    </span>
                </div>
                <div class="forecast-description">${forecast.forecast}</div>
                <div class="forecast-details">
                    <div class="forecast-detail">
                        <span class="forecast-detail-icon">💧</span>
                        <span class="forecast-detail-label">Humidity</span>
                        <span class="forecast-detail-value">${forecast.relative_humidity.low}-${forecast.relative_humidity.high}%</span>
                    </div>
                    <div class="forecast-detail">
                        <span class="forecast-detail-icon">💨</span>
                        <span class="forecast-detail-label">Wind</span>
                        <span class="forecast-detail-value">${forecast.wind.speed.low}-${forecast.wind.speed.high} km/h</span>
                    </div>
                </div>
            `;
            
            this.forecastGrid.appendChild(card);
            
            // Trigger animation
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 100);
        });

        // Announce to screen readers
        if (window.announceToScreenReader) {
            window.announceToScreenReader('Weather forecast loaded successfully');
        }
    }

    displayCurrentConditions(data) {
        if (!this.conditionsGrid) return;

        // Get latest readings for East region (closest to Pasir Ris)
        const getEastReading = (items, stationName = 'Pasir Ris') => {
            if (!items || items.length === 0) return null;
            const latest = items[0];
            
            // Try to find Pasir Ris or East region station
            const reading = latest.readings.find(r => 
                r.station_id.toLowerCase().includes('pasir') || 
                r.station_id.toLowerCase().includes('east')
            );
            
            return reading || latest.readings[0]; // Fallback to first reading
        };

        const conditions = [];

        // Temperature
        if (data.temperature && data.temperature.items) {
            const tempReading = getEastReading(data.temperature.items);
            if (tempReading) {
                conditions.push({
                    icon: '🌡️',
                    label: 'Temperature',
                    value: tempReading.value,
                    unit: '°C'
                });
            }
        }

        // Humidity
        if (data.humidity && data.humidity.items) {
            const humidityReading = getEastReading(data.humidity.items);
            if (humidityReading) {
                conditions.push({
                    icon: '💧',
                    label: 'Humidity',
                    value: humidityReading.value,
                    unit: '%'
                });
            }
        }

        // Rainfall
        if (data.rainfall && data.rainfall.items) {
            const rainfallReading = getEastReading(data.rainfall.items);
            if (rainfallReading) {
                conditions.push({
                    icon: '🌧️',
                    label: 'Rainfall',
                    value: rainfallReading.value.toFixed(1),
                    unit: 'mm'
                });
            }
        }

        // Wind Speed
        if (data.windSpeed && data.windSpeed.items) {
            const windReading = getEastReading(data.windSpeed.items);
            if (windReading) {
                conditions.push({
                    icon: '💨',
                    label: 'Wind Speed',
                    value: windReading.value.toFixed(1),
                    unit: 'km/h'
                });
            }
        }

        // Add UV Index (estimated based on time of day)
        const hour = new Date().getHours();
        let uvIndex = 0;
        if (hour >= 10 && hour <= 16) {
            uvIndex = Math.floor(Math.random() * 4) + 7; // 7-10 (high)
        } else if (hour >= 7 && hour <= 18) {
            uvIndex = Math.floor(Math.random() * 3) + 4; // 4-6 (moderate)
        } else {
            uvIndex = Math.floor(Math.random() * 3) + 1; // 1-3 (low)
        }

        conditions.push({
            icon: '☀️',
            label: 'UV Index',
            value: uvIndex,
            unit: this.getUVDescription(uvIndex)
        });

        // Render conditions
        this.conditionsGrid.innerHTML = conditions.map(condition => `
            <div class="condition-item animate-on-scroll">
                <div class="condition-icon" role="img" aria-label="${condition.label}">${condition.icon}</div>
                <div class="condition-label">${condition.label}</div>
                <div class="condition-value">
                    ${condition.value}<span class="condition-unit">${condition.unit}</span>
                </div>
            </div>
        `).join('');

        // Trigger animations
        setTimeout(() => {
            this.conditionsGrid.querySelectorAll('.condition-item').forEach((item, index) => {
                setTimeout(() => item.classList.add('visible'), index * 100);
            });
        }, 100);
    }

    getWeatherIcon(description) {
        const desc = description.toLowerCase();
        
        if (desc.includes('thunder') || desc.includes('storm')) return '⛈️';
        if (desc.includes('heavy rain') || desc.includes('showers')) return '🌧️';
        if (desc.includes('rain')) return '🌦️';
        if (desc.includes('cloudy') || desc.includes('overcast')) return '☁️';
        if (desc.includes('partly cloudy') || desc.includes('fair')) return '⛅';
        if (desc.includes('hazy') || desc.includes('haze')) return '🌫️';
        if (desc.includes('windy')) return '💨';
        
        return '☀️'; // Default sunny
    }

    getUVDescription(uvIndex) {
        if (uvIndex <= 2) return '(Low)';
        if (uvIndex <= 5) return '(Moderate)';
        if (uvIndex <= 7) return '(High)';
        if (uvIndex <= 10) return '(Very High)';
        return '(Extreme)';
    }

    hideLoading() {
        if (this.weatherLoading) {
            this.weatherLoading.style.display = 'none';
        }
    }

    showError() {
        if (this.weatherLoading) {
            this.weatherLoading.style.display = 'none';
        }
        if (this.weatherError) {
            this.weatherError.style.display = 'block';
        }
    }
}

// ===================================
// Performance Optimizations
// ===================================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Lazy load images (if any are added later)
        this.lazyLoadImages();
        
        // Preconnect to external resources
        this.addPreconnects();
        
        // Log performance metrics in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.logPerformance();
        }
    }

    lazyLoadImages() {
        if ('loading' in HTMLImageElement.prototype) {
            // Browser supports native lazy loading
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        } else {
            // Fallback for older browsers
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    addPreconnects() {
        const preconnects = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];

        preconnects.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    logPerformance() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const connectTime = perfData.responseEnd - perfData.requestStart;
                const renderTime = perfData.domComplete - perfData.domLoading;

                console.log('🏄 ShoreSquad Performance Metrics:');
                console.log(`📊 Page Load Time: ${pageLoadTime}ms`);
                console.log(`🔌 Connect Time: ${connectTime}ms`);
                console.log(`🎨 Render Time: ${renderTime}ms`);

                // Web Vitals approximation
                if (pageLoadTime < 3000) {
                    console.log('✅ Performance: Excellent');
                } else if (pageLoadTime < 5000) {
                    console.log('⚠️ Performance: Good');
                } else {
                    console.log('❌ Performance: Needs Improvement');
                }
            }, 0);
        });
    }
}

// ===================================
// Accessibility Enhancements
// ===================================

class AccessibilityEnhancer {
    constructor() {
        this.init();
    }

    init() {
        // Add keyboard navigation support
        this.enhanceKeyboardNav();
        
        // Add ARIA live regions for dynamic content
        this.setupLiveRegions();
        
        // Improve focus management
        this.improveFocus();
    }

    enhanceKeyboardNav() {
        // Allow escape key to close modals/menus
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open dropdowns or modals
                const activeMenu = document.querySelector('.nav-menu--active');
                if (activeMenu) {
                    activeMenu.classList.remove('nav-menu--active');
                }
            }
        });

        // Trap focus in mobile menu when open
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    const focusableElements = navMenu.querySelectorAll('a, button');
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }
    }

    setupLiveRegions() {
        // Create a live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);

        // Store reference for future use
        window.announceToScreenReader = (message) => {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        };
    }

    improveFocus() {
        // Add focus-visible class for better focus indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });
    }
}

// ===================================
// Initialize Everything
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    new MobileNav();
    new HeaderScroll();
    new SmoothScroll();
    new ScrollAnimations();
    new CounterAnimation();
    new BackToTop();
    new FormHandler();
    new WeatherWidget();
    new WeatherForecast(); // Real weather forecast from NEA
    new PerformanceOptimizer();
    new AccessibilityEnhancer();

    // Log initialization
    console.log('🌊 ShoreSquad initialized successfully!');
    console.log('💙 Ready to make waves for cleaner beaches!');
    console.log('🌤️ Weather data powered by data.gov.sg');
});

// ===================================
// Service Worker Registration (PWA)
// ===================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when service worker is created
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => {
        //         console.log('✅ Service Worker registered:', registration);
        //     })
        //     .catch(error => {
        //         console.log('❌ Service Worker registration failed:', error);
        //     });
    });
}

// ===================================
// Export for module usage (optional)
// ===================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        throttle,
        isInViewport
    };
}
