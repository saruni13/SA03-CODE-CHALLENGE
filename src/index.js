document.addEventListener('DOMContentLoaded', () => {
    // Assigning DOM elements to variables for easy access
    const filmsList = document.getElementById('films');
    const poster = document.getElementById('poster');
    const title = document.getElementById('title');
    const runtime = document.getElementById('runtime');
    const description = document.getElementById('film-info');
    const showtime = document.getElementById('showtime');
    const ticketCount = document.getElementById('ticket-num');
    const buyTicketBtn = document.getElementById('buy-ticket');

    // Fetch film data from the server
    fetch('http://localhost:3000/films')
    .then(response => response.json())
    .then(films => {
        // Clearing the existing film list
        filmsList.innerHTML = '';
        // Looping through each film fetched from the server
        films.forEach((film) => {
            // Creating a list item for each film
            const item = document.createElement('li');
            // Adding CSS classes to the list item
            item.classList.add('film', 'item');
            // Setting the text content of the list item to the film title
            item.textContent = film.title;
            // Setting a unique ID for each film item
            item.id = `film-${film.id}`;
            // Appending the list item to the film list
            filmsList.appendChild(item);
            // Add "sold-out" class if tickets are sold out
            if (film.capacity - film.tickets_sold === 0) {
                item.classList.add('sold-out');
            }

            // Adding an event listener to each list item to display film details when clicked
            item.addEventListener('click', () => displayFilmDetails(film));

            // Add delete button next to each film
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('delete-button');
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent li click event from firing
                removeFilm(film.id);
            });
            item.appendChild(deleteBtn);
        });
        // Displaying details of the first film in the list by default
        if (films.length > 0) {
            displayFilmDetails(films[0]);
        }
    })
    .catch(error => console.error('Error fetching films:', error));

    // Function to display film details
    function displayFilmDetails(film) {
        // Setting the poster source, title, runtime, description, showtime, and ticket number
        poster.src = film.poster;
        title.textContent = film.title;
        runtime.textContent = `${film.runtime} minutes`;
        description.textContent = film.description;
        showtime.textContent = film.showtime;
        ticketCount.textContent = film.capacity - film.tickets_sold;

        // Update buy button based on availability
        if (film.capacity - film.tickets_sold > 0) {
            buyTicketBtn.textContent = 'Buy Ticket';
            buyTicketBtn.disabled = false;
        } else {
            buyTicketBtn.textContent = 'Sold Out';
            buyTicketBtn.disabled = true;
        }

        // Adding an event listener to the buy button to execute purchaseTicket function with the current film
        buyTicketBtn.removeEventListener('click', purchaseTicket); // Remove previous event listener
        buyTicketBtn.addEventListener('click', () => purchaseTicket(film));
    };

    // Function to purchase a ticket
    function purchaseTicket(film) {
        // Parsing the available ticket number from the ticketCount element
        let availableTickets = parseInt(ticketCount.textContent);
        // Checking if there are available tickets
        if (availableTickets > 0) {
            // Sending a PATCH request to update tickets_sold for the current film
            fetch(`http://localhost:3000/films/${film.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tickets_sold: film.tickets_sold + 1
                })
            })
            .then(response => response.json())
            .then(updatedFilm => {
                // Updating the film object with the updated tickets_sold value
                film.tickets_sold = updatedFilm.tickets_sold;
                // Decreasing the available ticket count by one
                availableTickets--;
                // Updating the displayed ticket number
                ticketCount.textContent = availableTickets;
                console.log('Ticket purchased successfully!');

                // Update buy button based on availability
                if (availableTickets === 0) {
                    buyTicketBtn.textContent = 'Sold Out';
                    buyTicketBtn.disabled = true;
                }

            })
            .catch(error => console.error('Error purchasing ticket:', error));
        } else {
            // Alerting the user if there are no available tickets
            alert('There are no available tickets for this film. Please try another film.');
        }
    }

    // Function to remove a film
    function removeFilm(filmId) {
        fetch(`http://localhost:3000/films/${filmId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(() => {
            // Remove the film from the UI
            const filmItem = document.getElementById(`film-${filmId}`);
            if (filmItem) {
                filmItem.remove();
            }
            console.log('Film deleted successfully!');
        })
        .catch(error => console.error('Error deleting film:', error));
    }
});
