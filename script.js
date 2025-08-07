
class FlightLogApp {
    constructor() {
        this.flights = JSON.parse(localStorage.getItem('flights')) || [];
        this.currentView = 'add';
        this.currentDate = new Date();
        this.filteredFlights = [...this.flights];
        
        this.initEventListeners();
        this.updateStats();
    }

    initEventListeners() {
        // Navigation
        document.getElementById('addFlightBtn').addEventListener('click', () => this.showSection('add'));
        document.getElementById('listViewBtn').addEventListener('click', () => this.showSection('list'));
        document.getElementById('calendarViewBtn').addEventListener('click', () => this.showSection('calendar'));
        document.getElementById('statsBtn').addEventListener('click', () => this.showSection('stats'));

        // Form submission
        document.getElementById('flightForm').addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Search and filter
        document.getElementById('searchInput').addEventListener('input', () => this.filterFlights());
        document.getElementById('startDate').addEventListener('change', () => this.filterFlights());
        document.getElementById('endDate').addEventListener('change', () => this.filterFlights());
        document.getElementById('filterBtn').addEventListener('click', () => this.filterFlights());
        document.getElementById('clearFilterBtn').addEventListener('click', () => this.clearFilters());

        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.changeMonth(1));

        // Set default date to today
        document.getElementById('flightDate').value = new Date().toISOString().split('T')[0];
    }

    showSection(section) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Show selected section and activate button
        switch(section) {
            case 'add':
                document.getElementById('addFlightSection').classList.remove('hidden');
                document.getElementById('addFlightBtn').classList.add('active');
                break;
            case 'list':
                document.getElementById('listViewSection').classList.remove('hidden');
                document.getElementById('listViewBtn').classList.add('active');
                this.renderFlightList();
                break;
            case 'calendar':
                document.getElementById('calendarViewSection').classList.remove('hidden');
                document.getElementById('calendarViewBtn').classList.add('active');
                this.renderCalendar();
                break;
            case 'stats':
                document.getElementById('statsSection').classList.remove('hidden');
                document.getElementById('statsBtn').classList.add('active');
                this.updateStats();
                break;
        }
        this.currentView = section;
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const flight = {
            id: Date.now(),
            date: document.getElementById('flightDate').value,
            time: parseInt(document.getElementById('flightTime').value),
            aircraft: document.getElementById('aircraft').value,
            departureAirport: document.getElementById('departureAirport').value,
            arrivalAirport: document.getElementById('arrivalAirport').value,
            weather: document.getElementById('weather').value,
            instructor: document.getElementById('instructor').value,
            flightType: document.getElementById('flightType').value,
            notes: document.getElementById('notes').value
        };

        this.flights.push(flight);
        this.saveFlights();
        this.filteredFlights = [...this.flights];
        
        // Reset form
        document.getElementById('flightForm').reset();
        document.getElementById('flightDate').value = new Date().toISOString().split('T')[0];
        
        alert('비행 기록이 저장되었습니다!');
        this.updateStats();
    }

    saveFlights() {
        localStorage.setItem('flights', JSON.stringify(this.flights));
    }

    deleteFlight(id) {
        if (confirm('이 비행 기록을 삭제하시겠습니까?')) {
            this.flights = this.flights.filter(flight => flight.id !== id);
            this.saveFlights();
            this.filteredFlights = [...this.flights];
            this.renderFlightList();
            this.updateStats();
        }
    }

    renderFlightList() {
        const listContainer = document.getElementById('flightList');
        
        if (this.filteredFlights.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">기록된 비행이 없습니다.</p>';
            return;
        }

        // Sort by date (newest first)
        const sortedFlights = [...this.filteredFlights].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        listContainer.innerHTML = sortedFlights.map(flight => `
            <div class="flight-card">
                <div class="flight-header">
                    <span class="flight-date">${this.formatDate(flight.date)}</span>
                    <span class="flight-time">${this.formatFlightTime(flight.time)}</span>
                    <button class="delete-btn" onclick="app.deleteFlight(${flight.id})">삭제</button>
                </div>
                <div class="flight-details">
                    <div class="flight-detail">
                        <strong>기종:</strong>
                        <span>${flight.aircraft}</span>
                    </div>
                    <div class="flight-detail">
                        <strong>출발/도착:</strong>
                        <span>${flight.departureAirport} → ${flight.arrivalAirport}</span>
                    </div>
                    <div class="flight-detail">
                        <strong>날씨:</strong>
                        <span>${flight.weather}</span>
                    </div>
                    <div class="flight-detail">
                        <strong>비행 방식:</strong>
                        <span>${flight.flightType}</span>
                    </div>
                    ${flight.instructor ? `
                    <div class="flight-detail">
                        <strong>교관:</strong>
                        <span>${flight.instructor}</span>
                    </div>
                    ` : ''}
                    ${flight.notes ? `
                    <div class="flight-detail">
                        <strong>비고:</strong>
                        <span>${flight.notes}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    filterFlights() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        this.filteredFlights = this.flights.filter(flight => {
            const matchesSearch = !searchTerm || 
                flight.aircraft.toLowerCase().includes(searchTerm) ||
                flight.departureAirport.toLowerCase().includes(searchTerm) ||
                flight.arrivalAirport.toLowerCase().includes(searchTerm);
            
            const matchesDateRange = (!startDate || flight.date >= startDate) &&
                (!endDate || flight.date <= endDate);
            
            return matchesSearch && matchesDateRange;
        });

        this.renderFlightList();
    }

    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        this.filteredFlights = [...this.flights];
        this.renderFlightList();
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        const currentMonth = document.getElementById('currentMonth');
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        currentMonth.textContent = `${year}년 ${month + 1}월`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        // Group flights by date
        const flightsByDate = {};
        this.flights.forEach(flight => {
            const date = flight.date;
            if (!flightsByDate[date]) {
                flightsByDate[date] = [];
            }
            flightsByDate[date].push(flight);
        });
        
        let calendarHTML = '';
        
        // Add day headers
        const dayHeaders = ['일', '월', '화', '수', '목', '금', '토'];
        dayHeaders.forEach(day => {
            calendarHTML += `<div class="calendar-header">${day}</div>`;
        });
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            const prevDate = new Date(year, month, -(firstDayOfWeek - i - 1));
            calendarHTML += `<div class="calendar-day other-month">
                <div class="calendar-day-number">${prevDate.getDate()}</div>
            </div>`;
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const flights = flightsByDate[dateString] || [];
            const hasFlights = flights.length > 0;
            
            calendarHTML += `<div class="calendar-day ${hasFlights ? 'has-flight' : ''}">
                <div class="calendar-day-number">${day}</div>
                ${hasFlights ? `<div class="calendar-flight-count">${flights.length}회</div>` : ''}
            </div>`;
        }
        
        calendar.innerHTML = calendarHTML;
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    updateStats() {
        const totalFlights = this.flights.length;
        const totalMinutes = this.flights.reduce((sum, flight) => sum + flight.time, 0);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        
        document.getElementById('totalFlights').textContent = totalFlights;
        document.getElementById('totalHours').textContent = `${totalHours}시간 ${remainingMinutes}분`;
        
        // Calculate top aircraft
        const aircraftCount = {};
        this.flights.forEach(flight => {
            aircraftCount[flight.aircraft] = (aircraftCount[flight.aircraft] || 0) + 1;
        });
        
        const topAircraft = Object.entries(aircraftCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);
        
        const topAircraftContainer = document.getElementById('topAircraft');
        if (topAircraft.length === 0) {
            topAircraftContainer.innerHTML = '<p style="color: #666;">데이터 없음</p>';
        } else {
            topAircraftContainer.innerHTML = topAircraft.map(([aircraft, count]) => `
                <div class="top-item">
                    <span>${aircraft}</span>
                    <span>${count}회</span>
                </div>
            `).join('');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    }

    formatFlightTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}시간 ${mins}분`;
        }
        return `${mins}분`;
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FlightLogApp();
});
