// Data definitions
const OPERATORS = [
    { name: 'Viação Garcia', logo: 'assets/garcia.png' },
    { name: 'Brasil Sul', logo: 'assets/brasilsul.png' },
    { name: 'Catarinense', logo: 'assets/catarinense.png' }
];

const DESTINATION_OFFERS_1 = [
    { destination: 'Miami | USA', origin: 'Londrina', price: 8888.88, img: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=800&q=80', badge: 'Acumule 2GOs em dobro' },
    { destination: 'São Paulo | SP', origin: 'Londrina', price: 888.88, img: 'https://images.unsplash.com/photo-1543059152-42b40fc24fae?auto=format&fit=crop&w=800&q=80' },
    { destination: 'Belo Horizonte', origin: 'Londrina', price: 888.88, img: 'https://images.unsplash.com/photo-1596438459194-f275f4633203?auto=format&fit=crop&w=800&q=80' }
];

const DESTINATION_OFFERS_2 = [
    { destination: 'Madrid | ESP', origin: 'Londrina', price: 8888.88, img: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80' },
    { destination: 'Porto Alegre | RS', origin: 'Londrina', price: 888.88, img: 'https://images.unsplash.com/photo-1628153372217-19d6756289b4?auto=format&fit=crop&w=800&q=80' },
    { destination: 'Las Vegas | USA', origin: 'Londrina', price: 8888.88, img: 'https://images.unsplash.com/photo-1581351123004-757df051db8e?auto=format&fit=crop&w=800&q=80' }
];

const TYPES = ['Convencional', 'Semi-Leito', 'Leito', 'Leito Total'];

// Generate 24 trips (database)
const TRIP_DATABASE = Array.from({ length: 24 }).map((_, i) => {
    const operator = OPERATORS[i % OPERATORS.length];
    const departureHour = Math.floor(i / 1.5) + 6; // Spread across the day
    const departureMin = (i % 2) * 30;
    const hourStr = departureHour.toString().padStart(2, '0');
    const minStr = departureMin.toString().padStart(2, '0');

    return {
        id: i + 1,
        operator: operator.name,
        logo: operator.logo,
        type: TYPES[Math.floor(Math.random() * TYPES.length)],
        departure: `${hourStr}:${minStr}`,
        arrival: `${(departureHour + 4).toString().padStart(2, '0')}:${minStr}`,
        duration: '4h 30m',
        price: 80 + (Math.random() * 120),
        seatsLeft: Math.floor(Math.random() * 40) + 1
    };
});

// State
let selectedTrip = null;
let selectedSeats = [];
let currentResults = [];

// DOM Elements
const searchForm = document.getElementById('search-form');
const resultsView = document.getElementById('view-results');
const offersSection1 = document.getElementById('featured-offers-1');
const offersSection2 = document.getElementById('featured-offers-2');
const offersGrid1 = document.getElementById('offers-grid-1');
const offersGrid2 = document.getElementById('offers-grid-2');
const seatsView = document.getElementById('view-seats');
const tripsContainer = document.getElementById('trips-container');
const seatGrid = document.getElementById('seat-grid');
const summaryContainer = document.getElementById('selection-summary');
const totalPriceEl = document.getElementById('total-price');
const continuePassengersBtn = document.getElementById('btn-continue-passengers');
const passengersView = document.getElementById('view-passengers');
const passengerFormsContainer = document.getElementById('passenger-forms-container');
const passengerForm = document.getElementById('passenger-form');
const finalSummary = document.getElementById('final-summary');

// Initialize
function init() {
    console.log('Initializing application...');
    
    const dateField = document.getElementById('travel-date');
    if (dateField) {
        new Cleave(dateField, {
            date: true,
            delimiter: '/',
            datePattern: ['d', 'm', 'Y']
        });
        dateField.value = '25/03/2026';
    }

    renderFeaturedOffers();
}

function renderFeaturedOffers() {
    if (offersGrid1) {
        offersGrid1.innerHTML = DESTINATION_OFFERS_1.map(offer => createOfferCard(offer)).join('');
    }
    if (offersGrid2) {
        offersGrid2.innerHTML = DESTINATION_OFFERS_2.map(offer => createOfferCard(offer)).join('');
    }
}

function createOfferCard(offer) {
    return `
        <div class="col-md-4">
            <div class="card offer-card h-100 border-0 shadow-sm">
                <div class="offer-img-container" style="height: 180px; position: relative; overflow: hidden; border-radius: 20px 20px 0 0;">
                    <img src="${offer.img}" class="w-100 h-100 object-fit-cover">
                    ${offer.badge ? `<div style="position: absolute; top: 12px; left: 12px; background: var(--primary-green); padding: 4px 12px; border-radius: 50px; font-weight: 700; font-size: 0.7rem; transform: rotate(-5deg);">${offer.badge}</div>` : ''}
                </div>
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between mb-3">
                        <div>
                            <div class="text-muted small mb-1"><i class="bi bi-suitcase-fill me-1"></i> ${offer.origin}</div>
                            <div class="fw-bold fs-5">${offer.destination}</div>
                        </div>
                        <div class="text-end">
                            <div class="text-muted small">a partir de</div>
                            <div class="fw-bold text-success fs-5">R$ ${offer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                    </div>
                    <button class="btn btn-primary w-100 rounded-pill py-2" onclick="alert('Funcionalidade indisponível nesta POC')">RESERVAR AGORA</button>
                </div>
            </div>
        </div>
    `;
}

window.addEventListener('DOMContentLoaded', init);

// Event Listeners
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const origin = document.getElementById('origin').value;
        const dest = document.getElementById('destination').value;
        const resultsTitle = document.getElementById('results-title');
        if (resultsTitle) resultsTitle.innerText = `${origin} para ${dest}`;
        
        shuffleAndPickTrips();
        if (resultsView) {
            resultsView.style.display = 'block';
            renderTrips();
            window.scrollTo({ top: resultsView.offsetTop - 100, behavior: 'smooth' });
        }
    });
}

function shuffleAndPickTrips() {
    currentResults = [...TRIP_DATABASE]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
        .sort((a, b) => a.departure.localeCompare(b.departure));
}

if (continuePassengersBtn) continuePassengersBtn.addEventListener('click', showPassengersView);

if (passengerForm) {
    passengerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const modalEl = document.getElementById('checkoutModal');
        if (modalEl) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    });
}

function showSeatsView(tripId) {
    selectedTrip = TRIP_DATABASE.find(t => t.id === tripId);
    selectedSeats = [];

    if (resultsView) resultsView.style.display = 'none';
    if (offersSection1) offersSection1.style.display = 'none';
    if (offersSection2) offersSection2.style.display = 'none';
    if (passengersView) passengersView.style.display = 'none';
    seatsView.style.display = 'block';

    renderSeats();
    updateSummary();
    window.scrollTo({ top: seatsView.offsetTop - 50, behavior: 'smooth' });
}

function showPassengersView() {
    seatsView.style.display = 'none';
    if (resultsView) resultsView.style.display = 'none';
    if (offersSection1) offersSection1.style.display = 'none';
    if (offersSection2) offersSection2.style.display = 'none';
    passengersView.style.display = 'block';

    renderPassengerForms();
    updateFinalSummary();
    window.scrollTo({ top: passengersView.offsetTop - 50, behavior: 'smooth' });
}

function renderPassengerForms() {
    passengerFormsContainer.innerHTML = selectedSeats.map((seatId, index) => `
        <div class="card p-3 mb-3 border-0 shadow-sm" style="border-radius: 15px;">
            <h6 class="fw-bold mb-3">Passageiro ${index + 1} (Assento ${seatId})</h6>
            <div class="row g-3">
                <div class="col-md-8">
                    <label class="form-label small">Nome Completo</label>
                    <input type="text" class="form-control" name="name_${seatId}" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label small">CPF</label>
                    <input type="text" class="form-control cpf-mask" name="doc_${seatId}" placeholder="000.000.000-00" required>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.cpf-mask').forEach(input => {
        new Cleave(input, {
            delimiters: ['.', '.', '-'],
            blocks: [3, 3, 3, 2],
            numericOnly: true
        });
    });
}

function updateFinalSummary() {
    if (!selectedTrip) return;
    const total = selectedSeats.length * selectedTrip.price;
    if (finalSummary) {
        finalSummary.innerHTML = `
            <div class="small">
                <p class="mb-1"><strong>Trecho:</strong> ${selectedTrip.departure} → ${selectedTrip.arrival}</p>
                <p class="mb-1"><strong>Empresa:</strong> ${selectedTrip.operator}</p>
                <p class="mb-1"><strong>Assentos:</strong> ${selectedSeats.join(', ')}</p>
                <hr>
                <p class="fs-5 fw-bold text-end">Total: R$ ${total.toFixed(2)}</p>
            </div>
        `;
    }
}

function renderTrips() {
    if (!tripsContainer) return;
    tripsContainer.innerHTML = currentResults.map(trip => `
        <div class="card trip-card p-3 p-md-4 mb-3 border-0 shadow-sm" style="border-radius: 20px;">
            <div class="row align-items-center">
                <div class="col-md-3 text-center mb-3 mb-md-0">
                    <div class="p-2 d-flex align-items-center justify-content-center" style="height: 80px; background: #f8f9fa; border-radius: 12px;">
                        <img src="${trip.logo}" alt="${trip.operator}" style="max-height: 100%; max-width: 100%; object-fit: contain; filter: grayscale(100%); opacity: 0.7;">
                    </div>
                </div>
                <div class="col-md-2 ps-md-4">
                    <div class="fw-bold fs-4">${trip.departure}</div>
                    <div class="text-muted small">Partida</div>
                    <div class="mt-2 fw-medium text-dark small">${trip.type}</div>
                </div>
                <div class="col-md-3">
                    <div class="fw-bold fs-4">${trip.arrival}</div>
                    <div class="text-muted small">Chegada</div>
                    <div class="text-muted small mt-2">${trip.duration}</div>
                </div>
                <div class="col-md-2 text-center">
                    <div class="text-muted mb-1 small">A partir de</div>
                    <div class="fw-bold fs-4">R$ ${trip.price.toFixed(2)}</div>
                    <div class="small text-danger">${trip.seatsLeft} poltronas</div>
                </div>
                <div class="col-md-2 text-end">
                    <button class="btn btn-primary w-100 py-2 rounded-pill" onclick="showSeatsView(${trip.id})">
                        SELECIONAR
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderSeats() {
    seatGrid.innerHTML = '';
    const totalSeats = 40;
    const occupiedSeats = [3, 4, 11, 12, 18, 25, 33];

    for (let i = 1; i <= totalSeats; i++) {
        const isOccupied = occupiedSeats.includes(i);
        const seat = document.createElement('div');
        seat.className = `seat ${isOccupied ? 'occupied' : 'available'}`;
        seat.innerText = i;

        if (!isOccupied) {
            seat.addEventListener('click', () => toggleSeat(i, seat));
        }

        seatGrid.appendChild(seat);
    }
}

function toggleSeat(id, element) {
    if (selectedSeats.includes(id)) {
        selectedSeats = selectedSeats.filter(s => s !== id);
        element.classList.remove('selected');
    } else {
        selectedSeats.push(id);
        element.classList.add('selected');
    }
    updateSummary();
}

function updateSummary() {
    if (selectedSeats.length === 0) {
        summaryContainer.innerHTML = '<p class="text-muted small">Nenhuma poltrona selecionada</p>';
        totalPriceEl.innerText = 'R$ 0,00';
        continuePassengersBtn.classList.add('d-none');
    } else {
        const total = selectedSeats.length * selectedTrip.price;
        summaryContainer.innerHTML = `
            <div class="mb-2">
                <strong>Serviço:</strong> ${selectedTrip.type}<br>
                <strong>Assentos:</strong> ${selectedSeats.sort((a, b) => a - b).join(', ')}
            </div>
        `;
        totalPriceEl.innerText = `R$ ${total.toFixed(2)}`;
        continuePassengersBtn.classList.remove('d-none');
    }
}
