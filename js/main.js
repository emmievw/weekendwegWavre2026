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

    // --- Chat Widget (keyword-based, geen API key nodig) ---
    const QA_DATA = [
        {
            keywords: ['adres', 'waar', 'locatie', 'villa', 'templiers', 'wavre', 'verblijf'],
            answer: 'We verblijven in Villa des Templiers, Rue des Templiers 87, 1301 Wavre, België. Ongeveer 20 minuten rijden van Brussel. 🏡'
        },
        {
            keywords: ['vertrek', 'hoe laat', 'wanneer weg', 'kerkwegje', 'vrijdag vertrek'],
            answer: 'We vertrekken vrijdag 30 april om 10:15 vanaf het Kerkwegje. Zorg dat je op tijd klaarstaat! 🚗'
        },
        {
            keywords: ['agenda', 'programma', 'planning', 'schema', 'wat doen'],
            answer: '📋 <strong>Vrijdag:</strong> vertrek 10:15, lunch onderweg, boodschappen in Wavre, diner in Brussel, borrelen & stappen.<br><strong>Zaterdag:</strong> vrij programma overdag, BBQ 17:30, quiz 19:30, muzikale verrassing & cocktails 21:00.<br><strong>Zondag:</strong> ontbijt en terug naar huis.'
        },
        {
            keywords: ['vrijdag', 'dag 1', 'eerste dag'],
            answer: '🗓️ <strong>Vrijdag 30 april:</strong><br>10:15 Vertrekken (Kerkwegje)<br>12:45 Lunch onderweg<br>13:45 Naar supermarkt Wavre<br>14:15 Boodschappen (tot 15:00)<br>18:30 Richting Brussel<br>19:00 Diner (tot 22:00)<br>22:00 Borrelen — Deliriumstraat<br>Late night — Flash Club'
        },
        {
            keywords: ['zaterdag', 'dag 2', 'hoofddag'],
            answer: '🗓️ <strong>Zaterdag 1 mei:</strong><br>Overdag — Vrij programma, relaxen<br>17:30 BBQ (tot 19:30)<br>19:30 Quiz (tot 21:00)<br>21:00 Muzikale verrassing & cocktails 🎵 (tot 23:00)'
        },
        {
            keywords: ['zondag', 'dag 3', 'laatste dag', 'terug', 'naar huis'],
            answer: '🗓️ <strong>Zondag 2 mei:</strong><br>Ochtend — Ontbijt, rustig wakker worden<br>Daarna — Richting huis! Tot de volgende keer 👋'
        },
        {
            keywords: ['bbq', 'barbecue', 'eten zaterdag', 'grillen'],
            answer: 'De BBQ is zaterdag om 17:30. Vlees, vuur en goed gezelschap — tot 19:30! 🔥'
        },
        {
            keywords: ['quiz'],
            answer: 'De quiz is zaterdagavond van 19:30 tot 21:00. Laat zien wat je weet — en wat niet! 🧠'
        },
        {
            keywords: ['muziek', 'verrassing', 'cocktail', 'muzikale'],
            answer: 'Zaterdagavond om 21:00 is er een muzikale verrassing met cocktails. Stay tuned... 🎵🍹'
        },
        {
            keywords: ['diner', 'eten vrijdag', 'restaurant', 'brussel eten'],
            answer: 'Vrijdagavond dineren we in Brussel van 19:00 tot 22:00. Bon appétit! 🍽️'
        },
        {
            keywords: ['stappen', 'flash', 'club', 'uitgaan', 'nacht'],
            answer: 'Vrijdagnacht gaan we stappen in Flash Club in Brussel. De nacht is jong! 🪩'
        },
        {
            keywords: ['delirium', 'borrel', 'drinken', 'café', 'bar'],
            answer: 'Na het diner gaan we borrelen in de Deliriumstraat in Brussel. Proost! 🍻'
        },
        {
            keywords: ['dresscode', 'kleding', 'ibiza', 'chique', 'aantrekken', 'outfit'],
            answer: 'De dresscode voor zaterdagavond is <strong>Ibiza Chique</strong> — stijlvol maar relaxed, alsof je naar een beach club gaat. Linnen, lichte kleuren, zomerse vibes! 🌴'
        },
        {
            keywords: ['meenemen', 'inpakken', 'wat neem', 'paklijst'],
            answer: '🎒 <strong>Meenemen:</strong><br>• Persoonlijke spullen & zwemkleding<br>• Ibiza Chique outfit voor zaterdagavond<br><br><strong>Specifiek:</strong><br>• Emma: frisbee, versiering, zwembadaccessoires<br>• Julia: volleybal en beerpong<br>• Jerusha: Hitster'
        },
        {
            keywords: ['opladen', 'auto', 'elektrisch', 'chauffeur', 'rijden'],
            answer: 'Chauffeurs Hidde, Rutger en Emma: zorg dat de auto opgeladen is voor vertrek! 🔌'
        },
        {
            keywords: ['zwembad', 'zwemmen', 'jacuzzi', 'pool'],
            answer: 'De villa heeft een verwarmd jacuzzi (buiten) en een zwembad. Vergeet je zwemkleding niet! 🏊'
        },
        {
            keywords: ['slaapkamer', 'bedden', 'slapen', 'kamers', 'badkamer'],
            answer: 'De villa heeft 6 slaapkamers met 14 bedden en 4 badkamers. Plek genoeg voor iedereen! 🛏️'
        },
        {
            keywords: ['parkeren', 'parkeer', 'auto stallen'],
            answer: 'Ja, de villa heeft voldoende parkeergelegenheid op het terrein. 🅿️'
        },
        {
            keywords: ['boodschappen', 'supermarkt', 'inkopen'],
            answer: 'Vrijdagmiddag doen we boodschappen bij de supermarkt in Wavre, van 14:15 tot 15:00. 🛒'
        },
        {
            keywords: ['fitness', 'gym', 'sporten'],
            answer: 'De villa heeft een eigen fitnessruimte. Ga je gang! 💪'
        },
        {
            keywords: ['airbnb', 'review', 'beoordeling', 'score'],
            answer: 'De villa scoort een 4,85 uit 5 op Airbnb. Top beoordeeld! ⭐'
        },
        {
            keywords: ['wanneer', 'datum', 'data', 'welke dag', 'weekend'],
            answer: 'Het weekend is van vrijdag 30 april tot en met zondag 3 mei 2026. 📅'
        },
        {
            keywords: ['hoi', 'hallo', 'hey', 'hi', 'yo'],
            answer: 'Hey! 👋 Stel me een vraag over het weekend in Wavre — agenda, locatie, dresscode, noem maar op!'
        },
        {
            keywords: ['emma'],
            answer: 'Emma neemt mee: frisbee, versiering en zwembadaccessoires. En vergeet niet de auto op te laden! 🥏'
        },
        {
            keywords: ['julia'],
            answer: 'Julia neemt mee: volleybal en beerpong! 🏐'
        },
        {
            keywords: ['jerusha'],
            answer: 'Jerusha neemt Hitster mee! 🎵'
        },
        {
            keywords: ['hidde'],
            answer: 'Hidde is chauffeur — auto opladen voor vertrek! 🔌🚗'
        },
        {
            keywords: ['rutger'],
            answer: 'Rutger is chauffeur — auto opladen voor vertrek! En voor overige vragen kun je hem bellen 📞'
        },
        {
            keywords: ['lunch', 'onderweg eten'],
            answer: 'Vrijdag om 12:45 stoppen we onderweg voor een lunch. 🥪'
        },
        {
            keywords: ['navigatie', 'route', 'hoe kom ik', 'google maps', 'maps', 'rijden naar'],
            answer: 'De villa is op Rue des Templiers 87, 1301 Wavre. <a href="https://www.google.com/maps/dir//Rue+des+Templiers+87,+1301+Wavre/" target="_blank" style="color: #c9a96e;">Bekijk de route op Google Maps</a> 📍'
        },
        {
            keywords: ['website', 'site', 'link', 'airbnb link', 'villa site'],
            answer: '🔗 <a href="https://www.villadestempliers.com/" target="_blank" style="color: #c9a96e;">Villa website</a> · <a href="https://www.airbnb.com/h/villadestempliers" target="_blank" style="color: #c9a96e;">Airbnb pagina</a>'
        },
        {
            keywords: ['tuin', 'buiten', 'privacy', 'terrein', 'groen', 'domein'],
            answer: 'De villa heeft een grote tuin met totale privacy en een schitterend groen domein. Perfect om te relaxen! 🌿'
        },
        {
            keywords: ['hoeveel', 'personen', 'plek', 'groep', 'groepsgrootte', 'capaciteit', 'wie', 'mensen'],
            answer: 'De villa biedt plek voor 15 personen. 6 slaapkamers, 14 bedden, 4 badkamers. 👥'
        },
        {
            keywords: ['weer', 'regen', 'zon', 'temperatuur', 'warm', 'koud', 'forecast'],
            answer: 'Scroll naar de sectie "Weer in Wavre" op de site — daar staat een live weerbericht voor ons weekend (30 april – 3 mei). ☀️🌧️'
        },
        {
            keywords: ['ontbijt', 'ochtend zondag'],
            answer: 'Zondagochtend beginnen we rustig met een ontbijt in de villa. ☕🥐'
        },
        {
            keywords: ['help', 'wat kan', 'wat weet', 'onderwerp', 'vraag'],
            answer: 'Ik kan je helpen met: 📋 agenda (per dag), 📍 locatie & adres, 🏡 villa info (kamers, zwembad, jacuzzi, fitness, tuin), 👗 dresscode, 🎒 wat meenemen, 🚗 chauffeurs & parkeren, 🔗 links, ☀️ weer, en info over specifieke personen (Emma, Julia, Jerusha, Hidde, Rutger).'
        },
        {
            keywords: ['bedankt', 'dankje', 'thanks', 'merci', 'top', 'dank'],
            answer: 'Graag gedaan! Als je nog iets wilt weten, vraag maar. 😊'
        },
        {
            keywords: ['brussel', 'brussels'],
            answer: 'Vrijdagavond gaan we naar Brussel: diner om 19:00, borrelen in de Deliriumstraat om 22:00, en stappen in Flash Club. De villa ligt ~20 min van Brussel. 🌃'
        }
    ];

    const FALLBACK = 'Dit is een vraag voor Rutger. Je kan hem hierover bellen. 📞';

    function findAnswer(question) {
        const q = question.toLowerCase()
            .replace(/[?!.,;:'"]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        let bestMatch = null;
        let bestScore = 0;

        for (const item of QA_DATA) {
            let score = 0;
            for (const kw of item.keywords) {
                if (q.includes(kw.toLowerCase())) {
                    score += kw.length; // langere matches wegen zwaarder
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        }

        return bestScore > 0 ? bestMatch.answer : FALLBACK;
    }

    const chatWidget = document.getElementById('chatWidget');
    const chatFab = document.getElementById('chatFab');
    const chatClose = document.getElementById('chatClose');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    chatFab.addEventListener('click', () => {
        chatWidget.classList.add('open');
        chatFab.classList.add('hidden');
        chatInput.focus();
    });

    chatClose.addEventListener('click', () => {
        chatWidget.classList.remove('open');
        chatFab.classList.remove('hidden');
    });

    function addMessage(text, role) {
        const div = document.createElement('div');
        div.className = `chat-message ${role === 'user' ? 'chat-user' : 'chat-bot'}`;
        div.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const question = chatInput.value.trim();
        if (!question) return;

        addMessage(question, 'user');
        chatInput.value = '';

        // Kort delay voor een "echt" gevoel
        setTimeout(() => {
            const answer = findAnswer(question);
            addMessage(answer, 'bot');
        }, 400);
    });

});
