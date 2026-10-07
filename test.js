
        document.addEventListener('DOMContentLoaded', async () => {
            const supabase = window.app.supabase;
            const notification = document.getElementById('notification-banner');
            let userEmail = '';
            let currentEventId = null;

            // Session
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                userEmail = session.user.email;
                if(document.getElementById('user-email-display')) document.getElementById('user-email-display').textContent = userEmail;
            }

            function showNotification(msg, type = 'success') {
                notification.textContent = msg;
                notification.className = `max-w-7xl mx-auto mt-4 px-4 p-4 rounded-lg text-sm font-medium block ${type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`;
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => notification.classList.add('hidden'), 5000);
            }

            // Expose for back button
            window.closeDetailView = () => {
                document.getElementById('view-detail').classList.add('hidden');
                document.getElementById('view-feed').classList.remove('hidden');
                window.scrollTo(0, 0);
            };

            // Global variable to hold loaded events for quick access
            let eventsData = [];

            async function fetchEvents() {
                try {
                    const { data: events, error } = await supabase
                        .from('events')
                        .select('*')
                        .gte('event_date', new Date().toISOString())
                        .order('event_date', { ascending: true });

                    if (error) throw error;
                    
                    eventsData = events;
                    document.getElementById('events-loading').classList.add('hidden');
                    const grid = document.getElementById('events-grid');

                    if (events.length === 0) {
                        document.getElementById('no-events-msg').classList.remove('hidden');
                        return;
                    }

                    grid.classList.remove('hidden');
                    grid.innerHTML = ''; 

                    events.forEach(event => {
                        const dateObj = new Date(event.event_date);
                        const isSoldOut = event.tickets_sold >= event.total_capacity;
                        
                        // Default placeholder if no poster_url
                        const imgUrl = event.poster_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop';

                        const card = document.createElement('div');
                        card.className = 'poster-card relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border border-gray-100';
                        card.onclick = () => openDetailView(event.id);
                        
                        card.innerHTML = `
                            <div class="aspect-[3/4] relative w-full overflow-hidden bg-gray-200">
                                <img src="${imgUrl}" alt="${event.title}" class="w-full h-full object-cover">
                                ${isSoldOut ? '<div class="absolute top-2 right-2 bg-black text-white text-xs font-black px-2 py-1 rounded">SOLD OUT</div>' : ''}
                                <!-- Dark gradient overlay for text readability -->
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <div class="absolute bottom-0 left-0 p-4 w-full">
                                    <h3 class="text-white font-black text-lg leading-tight line-clamp-2">${event.title}</h3>
                                    <p class="text-gray-300 text-xs font-medium mt-1">${dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • ${event.venue}</p>
                                </div>
                            </div>
                        `;
                        grid.appendChild(card);
                    });
                } catch (err) {
                    console.error('Error fetching events:', err);
                    document.getElementById('events-loading').textContent = 'Failed to load feed.';
                }
            }

            function openDetailView(id) {
                const event = eventsData.find(e => e.id === id);
                if (!event) return;
                
                currentEventId = event.id;
                
                // Toggle Views
                document.getElementById('view-feed').classList.add('hidden');
                document.getElementById('view-detail').classList.remove('hidden');
                window.scrollTo(0, 0);

                // Populate Data
                const imgUrl = event.poster_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop';
                document.getElementById('detail-hero-img').src = imgUrl;
                document.getElementById('detail-title').textContent = event.title;
                document.getElementById('sticky-title').textContent = event.title;
                
                const d = new Date(event.event_date);
                
                let timeStr = `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                if (event.event_end_date) {
                    const eD = new Date(event.event_end_date);
                    if (d.toDateString() === eD.toDateString()) {
                        timeStr += ` - ${eD.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                    } else {
                        timeStr += ` to ${eD.toLocaleDateString()} ${eD.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                    }
                }
                
                document.getElementById('detail-date').textContent = timeStr;
                document.getElementById('detail-venue').textContent = event.venue;
                document.getElementById('detail-description').innerText = event.description || 'No additional details provided.';
                
                // Capacity counter
                document.getElementById('detail-capacity-text').textContent = `${event.tickets_sold} / ${event.total_capacity}`;
                const fillPercent = Math.min(100, (event.tickets_sold / event.total_capacity) * 100);
                document.getElementById('detail-capacity-bar').style.width = `${fillPercent}%`;
                if(fillPercent >= 100) document.getElementById('detail-capacity-bar').classList.add('bg-red-500');
                else document.getElementById('detail-capacity-bar').classList.remove('bg-red-500');

                // Button State
                const btn = document.getElementById('book-btn');
                btn.disabled = true;
                btn.textContent = 'Checking...';
                btn.className = 'bg-gray-400 text-white font-black py-3 px-10 rounded-full cursor-not-allowed shadow-none';

                if (userEmail) {
                    const { data: existingTicket } = await supabase
                        .from('tickets')
                        .select('id')
                        .eq('event_id', event.id)
                        .eq('student_email', userEmail)
                        .single();

                    if (existingTicket) {
                        btn.textContent = 'Already Booked';
                    } else if (fillPercent >= 100) {
                        btn.textContent = 'Sold Out';
                    } else {
                        btn.disabled = false;
                        btn.textContent = 'Book Ticket';
                        btn.className = 'bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-10 rounded-full focus:outline-none transition-transform active:scale-95 shadow-lg';
                    }
                }
            }

            // Booking Logic
            document.getElementById('book-btn').addEventListener('click', async () => {
                const event = eventsData.find(e => e.id === currentEventId);
                if (!event || !userEmail) return;

                const btn = document.getElementById('book-btn');
                btn.disabled = true; btn.textContent = 'Booking...';

                const randomStr = Math.random().toString(36).substring(2, 10);
                const qrString = `TKT-${event.id}-${randomStr}`;

                try {
                    const { data: success, error } = await supabase.rpc('book_ticket_safe', {
                        p_event_id: event.id,
                        p_student_email: userEmail,
                        p_qr_string: qrString
                    });

                    if (error) throw error;

                    if (success) {
                        showNotification(`Ticket Confirmed! Go to My Wallet to view it.`);
                        // Update button locally
                        btn.textContent = 'Already Booked';
                        btn.className = 'bg-gray-400 text-white font-black py-3 px-10 rounded-full cursor-not-allowed shadow-none';
                        
                        // Update Capacity Locally
                        event.tickets_sold++;
                        document.getElementById('detail-capacity-text').textContent = `${event.tickets_sold} / ${event.total_capacity}`;
                        const newFill = Math.min(100, (event.tickets_sold / event.total_capacity) * 100);
                        document.getElementById('detail-capacity-bar').style.width = `${newFill}%`;
                        if(newFill >= 100) document.getElementById('detail-capacity-bar').classList.add('bg-red-500');
                    } else {
                        showNotification(`Failed to book. Event is sold out.`, 'error');
                        btn.textContent = 'Sold Out';
                    }
                } catch (err) {
                    if (err.code === '23505') {
                        showNotification(`You already have a ticket for this event!`, 'error');
                        btn.textContent = 'Already Booked';
                    }
                    else {
                        showNotification(`An error occurred.`, 'error');
                        btn.disabled = false; btn.textContent = 'Book Ticket';
                    }
                }
            });

            fetchEvents();
        });
    
