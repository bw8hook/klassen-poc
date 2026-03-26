// ─── Data ─────────────────────────────────────────────────────────────────────

const OPERATORS = [
    { name: 'Viação Garcia', logo: 'assets/garcia.png' },
    { name: 'Brasil Sul', logo: 'assets/brasilsul.png' },
    { name: 'Catarinense', logo: 'assets/catarinense.png' }
];

const DESTINATION_OFFERS_1 = [
    { destination: 'Miami | USA', origin: 'Londrina', price: 8888.88, img: 'imagens/miami.jpg', badge: 'Acumule 2GOs em dobro' },
    { destination: 'São Paulo | SP', origin: 'Londrina', price: 88.88, img: 'imagens/sao-paulo.jpg' },
    { destination: 'Belo Horizonte', origin: 'Londrina', price: 128.00, img: 'imagens/belo-horizonte.jpg' }
];

const DESTINATION_OFFERS_2 = [
    { destination: 'Madrid | ESP', origin: 'Londrina', price: 9999.00, img: 'imagens/madrid.jpg' },
    { destination: 'Porto Alegre | RS', origin: 'Londrina', price: 145.00, img: 'imagens/porto-alegre.jpg' },
    { destination: 'Las Vegas | USA', origin: 'Londrina', price: 11200.00, img: 'imagens/las-vegas.jpg' }
];

const TYPES = ['Convencional', 'Semi-Leito', 'Leito', 'Leito Total'];

const TRIP_DATABASE = Array.from({ length: 24 }).map((_, i) => {
    const operator = OPERATORS[i % OPERATORS.length];
    const departureHour = Math.floor(i / 1.5) + 6;
    const departureMin = (i % 2) * 30;
    const h = departureHour.toString().padStart(2, '0');
    const m = departureMin.toString().padStart(2, '0');
    const arrHour = ((departureHour + 4) % 24).toString().padStart(2, '0');
    return {
        id: i + 1,
        operator: operator.name,
        logo: operator.logo,
        type: TYPES[i % TYPES.length],
        departure: `${h}:${m}`,
        arrival: `${arrHour}:${m}`,
        duration: '4h 30min',
        price: 80 + ((i * 17 + 31) % 120),
        seatsLeft: ((i * 7 + 3) % 40) + 1
    };
});

const OCCUPIED_SEATS = [3, 4, 11, 12, 18, 25, 33];

// ─── State ────────────────────────────────────────────────────────────────────

let selectedTrip = null;
let selectedSeats = [];
let currentResults = [];

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const resultsView       = document.getElementById('view-results');
const offersSection1    = document.getElementById('featured-offers-1');
const offersSection2    = document.getElementById('featured-offers-2');
const appSection        = document.getElementById('app-section');
const offersGrid1       = document.getElementById('offers-grid-1');
const offersGrid2       = document.getElementById('offers-grid-2');
const seatsView         = document.getElementById('view-seats');
const tripsContainer    = document.getElementById('trips-container');
const seatGrid          = document.getElementById('seat-grid');
const summaryContainer  = document.getElementById('selection-summary');
const totalPriceEl      = document.getElementById('total-price');
const continueBtn       = document.getElementById('btn-continue-passengers');
const passengersView    = document.getElementById('view-passengers');
const passengerFormsContainer = document.getElementById('passenger-forms-container');
const passengerForm     = document.getElementById('passenger-form');
const finalSummary      = document.getElementById('final-summary');

// ─── Init ─────────────────────────────────────────────────────────────────────

function handleScroll() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 150) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}

function init() {
    const dateField = document.getElementById('travel-date');
    if (dateField && typeof Cleave !== 'undefined') {
        new Cleave(dateField, { date: true, delimiter: '/', datePattern: ['d', 'm', 'Y'] });
        dateField.value = '25/03/2026';
    }
    renderFeaturedOffers();

    const searchBtn = document.getElementById('btn-search');
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (continueBtn) continueBtn.addEventListener('click', showPassengersView);
    if (passengerForm) passengerForm.addEventListener('submit', handleFormSubmit);

    window.addEventListener('scroll', handleScroll);
}

window.addEventListener('DOMContentLoaded', init);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val) {
    return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function hideAll() {
    if (resultsView) resultsView.style.display = 'none';
    if (offersSection1) offersSection1.style.display = 'none';
    if (offersSection2) offersSection2.style.display = 'none';
    if (appSection) appSection.style.display = 'none';
    if (seatsView) seatsView.style.display = 'none';
    if (passengersView) passengersView.style.display = 'none';
}

function showHome() {
    if (resultsView) resultsView.style.display = 'none';
    if (seatsView) seatsView.style.display = 'none';
    if (passengersView) passengersView.style.display = 'none';
    if (offersSection1) offersSection1.style.display = 'block';
    if (offersSection2) offersSection2.style.display = 'block';
    if (appSection) appSection.style.display = 'block';
    selectedTrip = null;
    selectedSeats = [];
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.showHome = showHome;

// ─── Search ───────────────────────────────────────────────────────────────────

function handleSearch() {
    const origin = document.getElementById('origin').value;
    const dest   = document.getElementById('destination').value;
    const date   = document.getElementById('travel-date').value;

    currentResults = shuffle(TRIP_DATABASE).slice(0, 6).sort((a, b) => a.departure.localeCompare(b.departure));

    const titleEl = document.getElementById('results-title');
    const dateEl  = document.getElementById('results-date');
    if (titleEl) titleEl.textContent = `${origin} → ${dest}`;
    if (dateEl) dateEl.textContent = `${date} · ${currentResults.length} opções disponíveis`;

    renderTrips();

    if (offersSection1) offersSection1.style.display = 'none';
    if (offersSection2) offersSection2.style.display = 'none';
    if (appSection) appSection.style.display = 'none';
    if (seatsView) seatsView.style.display = 'none';
    if (passengersView) passengersView.style.display = 'none';
    if (resultsView) {
        resultsView.style.display = 'block';
        window.scrollTo({ top: resultsView.offsetTop - 80, behavior: 'smooth' });
    }
}

function backToResults() {
    if (seatsView) seatsView.style.display = 'none';
    if (passengersView) passengersView.style.display = 'none';
    if (resultsView) {
        resultsView.style.display = 'block';
        window.scrollTo({ top: resultsView.offsetTop - 80, behavior: 'smooth' });
    }
}
window.backToResults = backToResults;

function backToSeats() {
    if (passengersView) passengersView.style.display = 'none';
    if (seatsView) {
        seatsView.style.display = 'block';
        window.scrollTo({ top: seatsView.offsetTop - 80, behavior: 'smooth' });
    }
}
window.backToSeats = backToSeats;

// ─── Render Trips ─────────────────────────────────────────────────────────────

function renderTrips() {
    if (!tripsContainer) return;
    tripsContainer.innerHTML = currentResults.map(trip => `
        <div class="card trip-card p-3 p-md-4 border-0 shadow-card">
            <div class="row align-items-center g-3">
                <div class="col-6 col-md-2">
                    <div class="trip-logo-box">
                        <img src="${trip.logo}" alt="${trip.operator}">
                    </div>
                </div>
                <div class="col-6 col-md-2 d-md-none text-end">
                    <div class="trip-time">${trip.departure}</div>
                    <div class="text-muted" style="font-size:0.72rem">Partida</div>
                </div>
                <div class="col-md-5 d-none d-md-flex align-items-center gap-3">
                    <div>
                        <div class="trip-time">${trip.departure}</div>
                        <div class="text-muted" style="font-size:0.72rem">Partida</div>
                    </div>
                    <div class="trip-route-line">
                        <div class="route-dashes"></div>
                        <div style="font-size:0.7rem;color:#aaa;margin-top:2px">${trip.duration}</div>
                    </div>
                    <div>
                        <div class="trip-time">${trip.arrival}</div>
                        <div class="text-muted" style="font-size:0.72rem">Chegada</div>
                    </div>
                </div>
                <div class="col-12 col-md-2 d-flex d-md-block gap-3 align-items-center">
                    <span class="trip-badge">${trip.type}</span>
                    <span class="seats-badge ms-0 ms-md-0 d-block mt-md-1">${trip.seatsLeft} poltronas</span>
                </div>
                <div class="col-6 col-md-1 text-md-center">
                    <div style="font-size:0.7rem;color:#aaa">a partir de</div>
                    <div class="fw-bold" style="font-size:1.2rem">${fmt(trip.price)}</div>
                </div>
                <div class="col-6 col-md-2 text-end">
                    <button class="btn btn-selecionar" onclick="showSeatsView(${trip.id})">
                        SELECIONAR
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ─── Render Offers ────────────────────────────────────────────────────────────

function renderFeaturedOffers() {
    if (offersGrid1) offersGrid1.innerHTML = DESTINATION_OFFERS_1.map(o => createOfferCard(o)).join('');
    if (offersGrid2) offersGrid2.innerHTML = DESTINATION_OFFERS_2.map(o => createOfferCard(o)).join('');
}

function createOfferCard(offer) {
    return `
        <div class="col-md-4">
            <div class="card offer-card h-100">
                <div class="offer-img-container">
                    <img src="${offer.img}" alt="${offer.destination}">
                    ${offer.badge ? `<div class="offer-badge">${offer.badge}</div>` : ''}
                </div>
                <div class="offer-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <div class="offer-origin"><i class="bi bi-suitcase-fill me-1"></i>${offer.origin}</div>
                            <div class="offer-destination">${offer.destination}</div>
                        </div>
                        <div class="text-end">
                            <div class="offer-price-label">a partir de</div>
                            <div class="offer-price">${fmt(offer.price)}</div>
                        </div>
                    </div>
                    <button class="btn btn-reservar" onclick="alert('Funcionalidade indisponível nesta POC')">
                        RESERVAR AGORA
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ─── Seats ────────────────────────────────────────────────────────────────────

function showSeatsView(tripId) {
    selectedTrip = TRIP_DATABASE.find(t => t.id === tripId);
    selectedSeats = [];

    if (resultsView) resultsView.style.display = 'none';
    if (passengersView) passengersView.style.display = 'none';

    const infoEl = document.getElementById('seat-trip-info');
    if (infoEl && selectedTrip) {
        infoEl.textContent = `${selectedTrip.operator} · ${selectedTrip.departure} → ${selectedTrip.arrival} · ${selectedTrip.type}`;
    }

    seatsView.style.display = 'block';
    renderSeats();
    updateSummary();
    window.scrollTo({ top: seatsView.offsetTop - 80, behavior: 'smooth' });
}
window.showSeatsView = showSeatsView;

function renderSeats() {
    seatGrid.innerHTML = '';
    for (let i = 1; i <= 40; i++) {
        const occupied = OCCUPIED_SEATS.includes(i);
        const seat = document.createElement('div');
        seat.className = `seat ${occupied ? 'occupied' : 'available'}`;
        seat.textContent = i;
        if (!occupied) seat.addEventListener('click', () => toggleSeat(i, seat));
        seatGrid.appendChild(seat);
    }
}

function toggleSeat(id, el) {
    if (selectedSeats.includes(id)) {
        selectedSeats = selectedSeats.filter(s => s !== id);
        el.classList.remove('selected');
    } else {
        selectedSeats.push(id);
        el.classList.add('selected');
    }
    updateSummary();
}

function updateSummary() {
    if (selectedSeats.length === 0) {
        summaryContainer.innerHTML = '<p class="text-muted small mb-0">Nenhuma poltrona selecionada</p>';
        totalPriceEl.textContent = 'R$ 0,00';
        continueBtn.classList.add('d-none');
    } else {
        const total = selectedSeats.length * selectedTrip.price;
        summaryContainer.innerHTML = `
            <div class="small">
                <div class="d-flex justify-content-between mb-1"><span class="text-muted">Serviço</span><strong>${selectedTrip.type}</strong></div>
                <div class="d-flex justify-content-between mb-1"><span class="text-muted">Poltronas</span><strong>${selectedSeats.length}</strong></div>
                <div class="d-flex justify-content-between"><span class="text-muted">Assentos</span><strong>${[...selectedSeats].sort((a,b)=>a-b).join(', ')}</strong></div>
            </div>
        `;
        totalPriceEl.textContent = fmt(total);
        continueBtn.classList.remove('d-none');
    }
}

// ─── Passengers ───────────────────────────────────────────────────────────────

function showPassengersView() {
    seatsView.style.display = 'none';
    passengersView.style.display = 'block';
    renderPassengerForms();
    updateFinalSummary();
    window.scrollTo({ top: passengersView.offsetTop - 80, behavior: 'smooth' });
}

function renderPassengerForms() {
    passengerFormsContainer.innerHTML = selectedSeats.map((seatId, index) => `
        <div class="passenger-card">
            <h6 class="fw-bold mb-3" style="font-size:0.9rem">
                Passageiro ${index + 1}
                <span class="passenger-seat-badge">Assento ${seatId}</span>
            </h6>
            <div class="row g-3">
                <div class="col-md-8">
                    <label class="form-label search-label">Nome Completo</label>
                    <input type="text" class="form-control-custom" name="name_${seatId}" required placeholder="Digite o nome completo">
                </div>
                <div class="col-md-4">
                    <label class="form-label search-label">CPF</label>
                    <input type="text" class="form-control-custom cpf-mask" name="doc_${seatId}" placeholder="000.000.000-00" required>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.cpf-mask').forEach(input => {
        if (typeof Cleave !== 'undefined') {
            new Cleave(input, { delimiters: ['.', '.', '-'], blocks: [3, 3, 3, 2], numericOnly: true });
        }
    });
}

function updateFinalSummary() {
    if (!selectedTrip || !finalSummary) return;
    const total = selectedSeats.length * selectedTrip.price;
    finalSummary.innerHTML = `
        <div class="small" style="display:flex;flex-direction:column;gap:6px">
            <div class="d-flex justify-content-between"><span class="text-muted">Trecho</span><strong>${selectedTrip.departure} → ${selectedTrip.arrival}</strong></div>
            <div class="d-flex justify-content-between"><span class="text-muted">Empresa</span><strong>${selectedTrip.operator}</strong></div>
            <div class="d-flex justify-content-between"><span class="text-muted">Assentos</span><strong>${[...selectedSeats].sort((a,b)=>a-b).join(', ')}</strong></div>
            <div class="d-flex justify-content-between"><span class="text-muted">Tipo</span><strong>${selectedTrip.type}</strong></div>
            <hr style="margin:6px 0">
            <div class="d-flex justify-content-between"><span class="fw-bold">Total</span><span class="fw-bold fs-5">${fmt(total)}</span></div>
        </div>
    `;
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

function handleFormSubmit(e) {
    e.preventDefault();
    const total = selectedSeats.length * selectedTrip.price;
    const summaryEl = document.getElementById('modal-summary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:5px">
                <div class="d-flex justify-content-between"><span class="text-muted">Trecho</span><strong>${selectedTrip.departure} → ${selectedTrip.arrival}</strong></div>
                <div class="d-flex justify-content-between"><span class="text-muted">Empresa</span><strong>${selectedTrip.operator}</strong></div>
                <div class="d-flex justify-content-between"><span class="text-muted">Assentos</span><strong>${[...selectedSeats].sort((a,b)=>a-b).join(', ')}</strong></div>
                <div class="d-flex justify-content-between"><span class="text-muted">Total</span><strong>${fmt(total)}</strong></div>
            </div>
        `;
    }
    const modalEl = document.getElementById('checkoutModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
}
