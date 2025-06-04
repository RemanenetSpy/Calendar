document.addEventListener('DOMContentLoaded', () => {
    const eventAudio = document.getElementById('event-audio');
    const dynamicVisual = document.getElementById('dynamic-visual');

    let currentDate = new Date();
    const calendar = document.getElementById('calendar');
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');

    let events = [];

    async function loadEvents(month) {
        try {
            // Add timestamp to prevent caching issues
            const response = await fetch(`events/${month}.json?t=${Date.now()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(`Loaded ${data.length} events for ${month}`);
            events = data;
            return true;
        } catch (error) {
            console.error('Error loading events:', error);
            console.warn(`Could not load events for ${month}, using empty list`);
            events = [];
            return false;
        }
    }

    async function updateCalendar(date) {
        dynamicVisual.innerHTML = ''; // Clear previous visual

        const monthName = date.toLocaleString('default', { month: 'long' }).toLowerCase();
        const loaded = await loadEvents(monthName);

        // Clear existing calendar
        calendar.innerHTML = '';

        const year = date.getFullYear();
        const month = date.getMonth();

        // Update month display
        currentMonthElement.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        let dayCounter = 1;

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDayOfMonth) {
                    calendar.innerHTML += `<div class="day"></div>`;
                } else if (dayCounter <= daysInMonth) {
                    const currentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
                    const eventForDay = events.find(event => {
                        const eventDate = event.date.replace('*', year); // Replace wildcard with current year
                        if (eventDate === currentDate) {
                            // Load visual and audio for the event
                            dynamicVisual.innerHTML = `<img src="path/to/visuals/${event.icon}.jpg" alt="Cosmic Visual">`;
                            eventAudio.src = `path/to/audio/${event.icon}.mp3`;
                            eventAudio.play();
                        }
                        return eventDate === currentDate;
                    });

                    const eventHTML = eventForDay ? 
                        `<div class="event"><span class="event-icon">${eventForDay.icon}</span> ${eventForDay.event}</div>` : '';
                    const dayClass = eventForDay ? 'day has-event' : 'day';
                    calendar.innerHTML += `<div class="${dayClass}">
                        <div class="day-number">${dayCounter}</div>
                        ${eventHTML}
                    </div>`;

                    dayCounter++;
                } else {
                    dynamicVisual.innerHTML = ''; // Clear visual if no event
                    calendar.innerHTML += `<div class="day"></div>`;
                }
            }
        }
    }

    // Initialize calendar
    updateCalendar(currentDate).catch(error => {
        console.error('Error initializing calendar:', error);
    });

    // Add event listeners for month navigation
    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar(currentDate).catch(error => {
            console.error('Error updating calendar:', error);
        });
    });

    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar(currentDate).catch(error => {
            console.error('Error updating calendar:', error);
        });
    });
});
