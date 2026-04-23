/* ============================================
   WEEKENDWEG — JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar scroll effect ---
    const nav = document.getElementById('nav');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // --- Mobile menu toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // --- FAQ accordion ---
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.parentElement;
            const isActive = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-item').forEach(faq => {
                faq.classList.remove('active');
            });

            // Open clicked (if it wasn't already open)
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- Scroll reveal animation ---
    const revealElements = document.querySelectorAll(
        '.day-block, .villa-grid, .villa-cta, .map-container, .prep-card, .faq-item, .section-label, .section-title, .section-intro, .weather-grid, .weather-source'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = nav.offsetHeight;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // --- Weather forecast (Open-Meteo API) ---
    const weatherGrid = document.getElementById('weatherGrid');
    const weatherUpdate = document.getElementById('weatherUpdate');

    const WMO_CODES = {
        0: { desc: 'Onbewolkt', icon: '☀️' },
        1: { desc: 'Overwegend helder', icon: '🌤️' },
        2: { desc: 'Half bewolkt', icon: '⛅' },
        3: { desc: 'Bewolkt', icon: '☁️' },
        45: { desc: 'Mistig', icon: '🌫️' },
        48: { desc: 'Rijpmist', icon: '🌫️' },
        51: { desc: 'Lichte motregen', icon: '🌦️' },
        53: { desc: 'Motregen', icon: '🌦️' },
        55: { desc: 'Zware motregen', icon: '🌧️' },
        61: { desc: 'Lichte regen', icon: '🌦️' },
        63: { desc: 'Regen', icon: '🌧️' },
        65: { desc: 'Zware regen', icon: '🌧️' },
        71: { desc: 'Lichte sneeuw', icon: '🌨️' },
        73: { desc: 'Sneeuw', icon: '🌨️' },
        75: { desc: 'Zware sneeuw', icon: '❄️' },
        77: { desc: 'Korrelsneeuw', icon: '❄️' },
        80: { desc: 'Lichte buien', icon: '🌦️' },
        81: { desc: 'Buien', icon: '🌧️' },
        82: { desc: 'Zware buien', icon: '⛈️' },
        85: { desc: 'Sneeuwbuien', icon: '🌨️' },
        86: { desc: 'Zware sneeuwbuien', icon: '❄️' },
        95: { desc: 'Onweer', icon: '⛈️' },
        96: { desc: 'Onweer met hagel', icon: '⛈️' },
        99: { desc: 'Zwaar onweer met hagel', icon: '⛈️' },
    };

    const DAY_NAMES = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

    function getWeatherInfo(code) {
        return WMO_CODES[code] || { desc: 'Onbekend', icon: '🌡️' };
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr + 'T12:00:00');
        return d.getDate() + ' ' + d.toLocaleString('nl-NL', { month: 'short' });
    }

    function getDayName(dateStr) {
        const d = new Date(dateStr + 'T12:00:00');
        return DAY_NAMES[d.getDay()];
    }

    async function fetchWeather() {
        const url = 'https://api.open-meteo.com/v1/forecast'
            + '?latitude=50.7167&longitude=4.6167'
            + '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max'
            + '&timezone=Europe/Brussels'
            + '&start_date=2026-04-30&end_date=2026-05-03';

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('API fout');
            const data = await res.json();
            renderWeather(data.daily);
        } catch (err) {
            weatherGrid.innerHTML = '<div class="weather-error"><p>Weerbericht kon niet geladen worden. Probeer het later opnieuw.</p></div>';
        }
    }

    function renderWeather(daily) {
        const cards = daily.time.map((date, i) => {
            const weather = getWeatherInfo(daily.weathercode[i]);
            const maxTemp = Math.round(daily.temperature_2m_max[i]);
            const minTemp = Math.round(daily.temperature_2m_min[i]);
            const precip = daily.precipitation_sum[i];
            const wind = Math.round(daily.windspeed_10m_max[i]);

            return `
                <div class="weather-card">
                    <div class="weather-card-day">${getDayName(date)}</div>
                    <div class="weather-card-date">${formatDate(date)}</div>
                    <div class="weather-card-icon">${weather.icon}</div>
                    <div class="weather-card-desc">${weather.desc}</div>
                    <div class="weather-card-temps">
                        <span class="weather-temp-high">${maxTemp}°</span>
                        <span class="weather-temp-low">${minTemp}°</span>
                    </div>
                    <div class="weather-card-details">
                        <span>💧 ${precip} mm</span>
                        <span>💨 ${wind} km/h</span>
                    </div>
                </div>
            `;
        }).join('');

        weatherGrid.innerHTML = cards;
        weatherUpdate.textContent = 'Laatst bijgewerkt: ' + new Date().toLocaleString('nl-NL', {
            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
        });
    }

    fetchWeather();

});
