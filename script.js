// Data definitions
const OPERATORS = [
    { name: 'Viação Garcia', logo: 'assets/garcia.png' },
    { name: 'Brasil Sul', logo: 'assets/brasilsul.png' },
    { name: 'Catarinense', logo: 'assets/catarinense.png' }
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
    const origin = 'Londrina, PR';
    const dest = 'São Paulo, SP';
    const date = new Date().toISOString().split('T')[0];

    document.getElementById('origin').value = origin;
    document.getElementById('destination').value = dest;
    document.getElementById('travel-date').value = date;

    document.getElementById('results-title').innerText = `${origin} para ${dest}`;
    document.getElementById('results-date').innerText = new Date(date).toLocaleDateString('pt-BR');

    // Pick initial 5 random trips
    shuffleAndPickTrips();
    renderTrips();
}
init();

// Event Listeners
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const origin = document.getElementById('origin').value;
    const dest = document.getElementById('destination').value;
    const date = document.getElementById('travel-date').value;

    document.getElementById('results-title').innerText = `${origin} para ${dest}`;
    document.getElementById('results-date').innerText = new Date(date).toLocaleDateString('pt-BR');

    shuffleAndPickTrips();
    showResultsView();
});

function shuffleAndPickTrips() {
    // Shuffle database and take first 5
    currentResults = [...TRIP_DATABASE]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
        .sort((a, b) => a.departure.localeCompare(b.departure)); // Sort by time for better UX
}

continuePassengersBtn.addEventListener('click', showPassengersView);

passengerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    modal.show();
});

function showResultsView() {
    seatsView.style.display = 'none';
    passengersView.style.display = 'none';
    resultsView.style.display = 'block';

    renderTrips();
    window.scrollTo({ top: resultsView.offsetTop - 50, behavior: 'smooth' });
}

function showSeatsView(tripId) {
    selectedTrip = TRIP_DATABASE.find(t => t.id === tripId);
    selectedSeats = [];

    resultsView.style.display = 'none';
    passengersView.style.display = 'none';
    seatsView.style.display = 'block';

    renderSeats();
    updateSummary();
    window.scrollTo({ top: seatsView.offsetTop - 50, behavior: 'smooth' });
}

function showPassengersView() {
    seatsView.style.display = 'none';
    resultsView.style.display = 'none';
    passengersView.style.display = 'block';

    renderPassengerForms();
    updateFinalSummary();
    window.scrollTo({ top: passengersView.offsetTop - 50, behavior: 'smooth' });
}

function renderPassengerForms() {
    passengerFormsContainer.innerHTML = selectedSeats.map((seatId, index) => `
        <div class="wf-box p-3 mb-3">
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

    // Initialize masks for all new inputs
    document.querySelectorAll('.cpf-mask').forEach(input => {
        new Cleave(input, {
            delimiters: ['.', '.', '-'],
            blocks: [3, 3, 3, 2],
            numericOnly: true
        });
    });
}

function updateFinalSummary() {
    const total = selectedSeats.length * selectedTrip.price;
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

function renderTrips() {
    tripsContainer.innerHTML = MOCK_TRIPS.map(trip => `
        <div class="card trip-card p-3 p-md-4">
            <div class="row align-items-center">
                <div class="col-md-3 text-center mb-3 mb-md-0">
                    <div class="wf-box p-3 d-flex align-items-center justify-content-center" style="height: 100px;">
                        <img src="${trip.logo}" alt="${trip.operator}" style="max-height: 100%; max-width: 100%; object-fit: contain; filter: grayscale(100%);">
                    </div>
                </div>
                <div class="col-md-2 border-start-md ps-md-4">
                    <div class="fw-bold fs-4">${trip.departure}</div>
                    <div class="text-muted small">Partida</div>
                    <div class="mt-2 fw-medium text-dark small">${trip.type}</div>
                </div>
                <div class="col-md-3 border-start">
                    <div class="fw-bold fs-4">${trip.arrival}</div>
                    <div class="text-muted small">Chegada</div>
                    <div class="text-muted small mt-2">${trip.duration}</div>
                </div>
                <div class="col-md-2 border-start text-center">
                    <div class="text-muted mb-1 small">A partir de</div>
                    <div class="fw-bold fs-4">R$ ${trip.price.toFixed(2)}</div>
                    <div class="small text-danger">${trip.seatsLeft} poltronas</div>
                </div>
                <div class="col-md-2 text-end">
                    <button class="btn btn-primary w-100 py-2" onclick="showSeatsView(${trip.id})">
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
    const occupiedSeats = [3, 4, 11, 12, 18, 25, 33]; // Sample constant for demo

    for (let i = 1; i <= totalSeats; i++) {
        const isOccupied = occupiedSeats.includes(i);
        const seat = document.createElement('div');
        seat.className = `seat ${isOccupied ? 'occupied' : 'available'}`;
        seat.innerText = i;

        if (!isOccupied) {
            seat.addEventListener('click', () => toggleSeat(i, seat));
        }

        // Add gap for the aisle
        if (i % 4 == 0) {
            // After every 4 seats (2 left, 2 right pattern logic)
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
            <div class="alert alert-secondary p-2 small">
                Reserva temporária ativa.
            </div>
        `;
        totalPriceEl.innerText = `R$ ${total.toFixed(2)}`;
        continuePassengersBtn.classList.remove('d-none');
    }
}

// Final logic handled in passengerForm submit listener
