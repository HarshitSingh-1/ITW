
        document.addEventListener('DOMContentLoaded', async () => {
            const themeSelector = document.getElementById('theme-selector');
            if (themeSelector) {
                themeSelector.value = localStorage.getItem('app-theme') || 'light';
                themeSelector.addEventListener('change', (e) => {
                    const newTheme = e.target.value;
                    document.documentElement.setAttribute('data-theme', newTheme);
                    localStorage.setItem('app-theme', newTheme);
                });
            }

            const supabase = window.app.supabase;
            const notification = document.getElementById('notification-banner');
            let userEmail = '';
            let currentUserRole = 'student';
            let currentEventId = null;

            // Session
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                userEmail = session.user.email;
                if(document.getElementById('user-email-display')) document.getElementById('user-email-display').textContent = userEmail;
                const { data: profile } = await supabase.from('profiles').select('role').eq('email', userEmail).single();
                if (profile) currentUserRole = profile.role;
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

            let currentCategory = 'All';
            let currentSearchTerm = '';

            function filterGrid() {
                const grid = document.getElementById('events-grid');
                const emptyMsg = document.getElementById('no-events-msg');
                let visibleCount = 0;
                
                const term = currentSearchTerm.toLowerCase().trim();

                document.querySelectorAll('.poster-card').forEach(card => {
                    const eventId = card.getAttribute('data-id');
                    const event = eventsData.find(e => e.id === eventId);
                    if(!event) return;

                    // Category Filter
                    const matchCategory = currentCategory === 'All' || event.category === currentCategory;
                    
                    // Search Filter
                    let matchSearch = true;
                    if (term) {
                        const title = event.title?.toLowerCase() || '';
                        const venue = event.venue?.toLowerCase() || '';
                        // Removed description from search so it feels more predictable
                        matchSearch = title.includes(term) || venue.includes(term);
                    }

                    if (matchCategory && matchSearch) {
                        card.style.display = 'block';
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                });

                if (visibleCount === 0) {
                    grid.classList.add('hidden');
                    emptyMsg.classList.remove('hidden');
                    emptyMsg.textContent = "No events found matching your search.";
                } else {
                    grid.classList.remove('hidden');
                    emptyMsg.classList.add('hidden');
                }
            }

            // Bind Listeners
            document.getElementById('search-input').addEventListener('input', (e) => {
                currentSearchTerm = e.target.value;
                filterGrid();
            });

            document.querySelectorAll('.category-chip').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // Update active styling
                    document.querySelectorAll('.category-chip').forEach(b => {
                        b.classList.remove('active');
                        
                    });
                    
                    e.target.classList.add('active');
                    
                    currentCategory = e.target.getAttribute('data-cat');
                    filterGrid();
                });
            });

            async function fetchEvents() {
                const grid = document.getElementById('events-grid');
                const loader = document.getElementById('events-loading');
                
                // Show Skeletons
                loader.classList.add('hidden');
                grid.classList.remove('hidden');
                grid.innerHTML = '';
                for(let i=0; i<5; i++) {
                    grid.innerHTML += `
                        <div class="theme-card rounded-2xl overflow-hidden theme-bg-surface border theme-border shadow-sm animate-pulse">
                            <div class="aspect-[3/4] bg-gray-200/50 w-full"></div>
                        </div>
                    `;
                }

                try {
                    const { data: events, error } = await supabase
                        .from('events')
                        .select('*')
                        .gte('event_date', new Date().toISOString())
                        .order('event_date', { ascending: true });

                    if (error) throw error;
                    
                    eventsData = events;
                    grid.innerHTML = '';
                    
                    // --- Hero Carousel Logic ---
                    const heroContainer = document.getElementById('hero-carousel-container');
                    const heroTrack = document.getElementById('hero-carousel');
                    
                    if (events.length > 0) {
                        heroContainer.classList.remove('hidden');
                        heroTrack.innerHTML = '';
                        
                        // Get top 3 upcoming events by popularity
                        const trending = [...events].sort((a,b) => b.tickets_sold - a.tickets_sold).slice(0, 3);
                        
                        trending.forEach(event => {
                            const imgUrl = event.poster_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop';
                            const dateObj = new Date(event.event_date);
                            
                            const slide = document.createElement('div');
                            slide.className = 'snap-center shrink-0 w-[85vw] md:w-[60vw] lg:w-[40vw] h-64 md:h-80 rounded-3xl overflow-hidden relative cursor-pointer shadow-lg group';
                            slide.onclick = () => openDetailView(event.id);
                            
                            slide.innerHTML = `
                                <img src="${imgUrl}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                                <div class="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">Ã°Å¸â€Â¥ Trending</div>
                                <div class="absolute bottom-0 left-0 p-5 md:p-6 w-full">
                                    <h3 class="text-white font-black text-2xl md:text-3xl leading-tight mb-2 drop-shadow-md line-clamp-2">${event.title}</h3>
                                    <p class="text-gray-200 text-xs md:text-sm font-medium">Ã°Å¸â€œâ€¦ ${dateObj.toLocaleDateString(undefined, {month:'short', day:'numeric'})} Ã¢â‚¬Â¢ Ã°Å¸â€œÂ ${event.venue}</p>
                                </div>
                            `;
                            heroTrack.appendChild(slide);
                        });
                    } else {
                        heroContainer.classList.add('hidden');
                    }
                    
                    // --- Grid Logic ---
                    events.forEach(event => {
                        const dateObj = new Date(event.event_date);
                        const isSoldOut = event.tickets_sold >= event.total_capacity;
                        const imgUrl = event.poster_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop';
                        
                        const card = document.createElement('div');
                        card.className = 'theme-card poster-card relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 theme-bg-surface border theme-border';
                        card.setAttribute('data-id', event.id);
                        card.onclick = () => openDetailView(event.id);
                        
                        const catPill = event.category && event.category !== 'General' 
                            ? `<div class="absolute top-2 left-2 bg-theme-accent/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">${event.category}</div>` 
                            : '';

                        card.innerHTML = `
                            <div class="aspect-[3/4] relative w-full overflow-hidden bg-gray-200">
                                <img src="${imgUrl}" alt="${event.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                                ${isSoldOut ? '<div class="absolute top-2 right-2 bg-black/90 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded shadow-sm">SOLD OUT</div>' : ''}
                                ${catPill}
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <div class="absolute bottom-0 left-0 p-4 w-full">
                                    <h3 class="text-white font-black text-lg leading-tight line-clamp-2">${event.title}</h3>
                                    <p class="text-gray-300 text-xs font-medium mt-1">${dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} Ã¢â‚¬Â¢ ${event.venue}</p>
                                </div>
                            </div>
                        `;
                        grid.appendChild(card);
                    });
                    
                    filterGrid();

                } catch (err) {
                    console.error('Error fetching events:', err);
                    grid.innerHTML = '';
                    loader.classList.remove('hidden');
                    loader.textContent = 'Failed to load feed.';
                }
            }

            async function openDetailView(id) {
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
                
                // Reset Tabs to Overview
                switchDetailTab('overview');
                loadPublicNotices(event.id);
                loadDiscussion(event.id);
                loadReviews(event.id);
            }

            function switchDetailTab(tabName) {
                document.querySelectorAll('.detail-tab-btn').forEach(btn => {
                    btn.classList.remove('border-blue-600', 'text-blue-600');
                    btn.classList.add('border-transparent', 'text-gray-500');
                });
                document.querySelectorAll('.detail-tab-content').forEach(content => {
                    content.classList.add('hidden');
                    content.classList.remove('block');
                });
                
                if (tabName === 'overview') {
                    document.getElementById('tab-overview').classList.add('border-blue-600', 'text-blue-600');
                    document.getElementById('tab-overview').classList.remove('border-transparent', 'text-gray-500');
                    document.getElementById('content-overview').classList.remove('hidden');
                    document.getElementById('content-overview').classList.add('block');
                } else if (tabName === 'notices') {
                    document.getElementById('tab-notices').classList.add('border-blue-600', 'text-blue-600');
                    document.getElementById('tab-notices').classList.remove('border-transparent', 'text-gray-500');
                    document.getElementById('content-notices').classList.remove('hidden');
                    document.getElementById('content-notices').classList.add('block');
                } else if (tabName === 'discussion') {
                    document.getElementById('tab-discussion').classList.add('border-blue-600', 'text-blue-600');
                    document.getElementById('tab-discussion').classList.remove('border-transparent', 'text-gray-500');
                    document.getElementById('content-discussion').classList.remove('hidden');
                    document.getElementById('content-discussion').classList.add('block');
                } else if (tabName === 'reviews') {
                    document.getElementById('tab-reviews').classList.add('border-blue-600', 'text-blue-600');
                    document.getElementById('tab-reviews').classList.remove('border-transparent', 'text-gray-500');
                    document.getElementById('content-reviews').classList.remove('hidden');
                    document.getElementById('content-reviews').classList.add('block');
                }
            }

            document.getElementById('tab-overview').addEventListener('click', () => switchDetailTab('overview'));
            document.getElementById('tab-notices').addEventListener('click', () => switchDetailTab('notices'));
            document.getElementById('tab-discussion').addEventListener('click', () => switchDetailTab('discussion'));
            document.getElementById('tab-reviews').addEventListener('click', () => switchDetailTab('reviews'));

            // Discussion Logic
            let replyingToId = null;

            async function loadDiscussion(eventId) {
                const list = document.getElementById('comments-list');
                list.innerHTML = '<div class="text-center py-6 text-gray-500 italic text-sm">Loading discussion...</div>';
                
                const event = eventsData.find(e => e.id === eventId);
                
                // Fetch comments, joining profiles for the full name
                const { data: comments, error } = await supabase
                    .from('event_comments')
                    .select('*, profiles(full_name)')
                    .eq('event_id', eventId)
                    .order('created_at', { ascending: true });

                // Fetch ticket holders to determine "Booked" status
                const { data: tickets } = await supabase
                    .from('tickets')
                    .select('student_email')
                    .eq('event_id', eventId);
                    
                const bookedEmails = new Set((tickets || []).map(t => t.student_email));

                if (error) {
                    list.innerHTML = '<div class="text-red-500 text-sm text-center py-6">Error loading discussion.</div>';
                    return;
                }
                
                if (comments.length === 0) {
                    list.innerHTML = `
                        <div class="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                            <span class="text-4xl mb-3 block">Ã°Å¸â€™Â¬</span>
                            <p class="theme-text-muted font-medium text-sm">Be the first to start the discussion!</p>
                        </div>
                    `;
                    return;
                }
                
                list.innerHTML = '';
                
                // Organize into threads (parents and children)
                const threads = comments.filter(c => !c.parent_id);
                const replies = comments.filter(c => c.parent_id);

                threads.forEach(thread => {
                    const threadEl = buildCommentUI(thread, event, bookedEmails);
                    
                    const threadReplies = replies.filter(r => r.parent_id === thread.id);
                    if (threadReplies.length > 0) {
                        const repliesContainer = document.createElement('div');
                        repliesContainer.className = 'ml-4 md:ml-12 mt-4 space-y-4 border-l-2 border-gray-100 pl-4';
                        threadReplies.forEach(reply => {
                            repliesContainer.appendChild(buildCommentUI(reply, event, bookedEmails));
                        });
                        threadEl.appendChild(repliesContainer);
                    }
                    
                    list.appendChild(threadEl);
                });
            }
            
            function buildCommentUI(comment, event, bookedEmails) {
                const el = document.createElement('div');
                el.className = 'bg-white p-4 rounded-xl border border-gray-100 shadow-sm';
                
                const isOrganizer = comment.user_email === event.organizer_email;
                const isBooked = bookedEmails.has(comment.user_email);
                const canDelete = userEmail && (userEmail === comment.user_email || userEmail === event.organizer_email || currentUserRole === 'super_admin');
                
                let badges = '';
                if (isOrganizer) badges += `<span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">Organizer</span>`;
                else if (isBooked) badges += `<span class="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">Booked</span>`;
                
                const name = comment.profiles?.full_name || comment.user_email.split('@')[0];
                const d = new Date(comment.created_at).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});
                
                el.innerHTML = `
                    <div class="flex justify-between items-start mb-1">
                        <div class="flex items-center">
                            <span class="font-bold text-gray-900 text-sm">${name}</span>
                            ${badges}
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-400 font-medium">${d}</span>
                            ${canDelete ? `<button class="text-gray-300 hover:text-red-500 transition-colors delete-btn" data-id="${comment.id}" title="Delete comment">Ã°Å¸â€”â€˜Ã¯Â¸Â</button>` : ''}
                        </div>
                    </div>
                    <p class="text-gray-700 text-sm leading-relaxed mb-2">${comment.content}</p>
                    ${!comment.parent_id ? `<button class="text-xs text-blue-600 font-bold hover:underline reply-btn" data-id="${comment.id}">Reply</button>` : ''}
                `;
                
                if (canDelete) {
                    el.querySelector('.delete-btn').addEventListener('click', async (e) => {
                        if (confirm('Delete this comment?')) {
                            const { error } = await supabase.from('event_comments').delete().eq('id', comment.id);
                            if (error) alert('Error deleting comment: ' + error.message);
                            else loadDiscussion(currentEventId);
                        }
                    });
                }
                
                if (!comment.parent_id) {
                    el.querySelector('.reply-btn').addEventListener('click', (e) => {
                        replyingToId = e.target.getAttribute('data-id');
                        const input = document.getElementById('new-comment-input');
                        input.placeholder = `Replying to ${name}...`;
                        input.focus();
                        
                        document.getElementById('comment-status').innerHTML = `Replying to <b>${name}</b> <button class="text-red-500 hover:underline ml-1" onclick="cancelReply()">Cancel</button>`;
                    });
                }
                
                return el;
            }
            
            window.cancelReply = () => {
                replyingToId = null;
                document.getElementById('new-comment-input').placeholder = 'Ask a question or share your thoughts...';
                document.getElementById('comment-status').innerHTML = '';
            };

            document.getElementById('post-comment-btn').addEventListener('click', async () => {
                if (!userEmail) {
                    alert('You must be logged in to post a comment.');
                    return;
                }
                
                const input = document.getElementById('new-comment-input');
                const content = input.value.trim();
                if (!content) return;
                
                const btn = document.getElementById('post-comment-btn');
                btn.disabled = true;
                btn.textContent = 'Posting...';
                
                const { error } = await supabase.from('event_comments').insert([{
                    event_id: currentEventId,
                    user_email: userEmail,
                    content: content,
                    parent_id: replyingToId
                }]);
                
                btn.disabled = false;
                btn.textContent = 'Post';
                
                if (error) {
                    alert('Error posting comment: ' + error.message);
                } else {
                    input.value = '';
                    cancelReply();
                    loadDiscussion(currentEventId);
                }
            });

            async function loadPublicNotices(eventId) {
                const list = document.getElementById('public-notices-list');
                list.innerHTML = '<li class="text-gray-500 italic text-sm text-center py-6">Loading notices...</li>';
                
                const { data: notices, error } = await supabase.from('event_notices').select('*').eq('event_id', eventId).order('created_at', { ascending: false });
                
                if (error) {
                    list.innerHTML = '<li class="text-red-500 text-sm text-center py-6">Error loading notices.</li>';
                    return;
                }
                if (notices.length === 0) {
                    list.innerHTML = `
                        <div class="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                            <span class="text-4xl mb-3 block">Ã°Å¸â€œÂ­</span>
                            <p class="theme-text-muted font-medium text-sm">No announcements yet.</p>
                        </div>
                    `;
                    return;
                }
                
                list.innerHTML = '';
                notices.forEach(n => {
                    const d = new Date(n.created_at).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});
                    const li = document.createElement('li');
                    li.className = "bg-blue-50 border border-blue-100 p-4 rounded-xl relative shadow-sm";
                    li.innerHTML = `
                        <div class="flex items-center space-x-2 mb-2">
                            <span class="bg-blue-600 text-white text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded">Update</span>
                            <span class="text-gray-500 text-xs font-bold">${d}</span>
                        </div>
                        <p class="text-gray-800 text-sm font-medium leading-relaxed">${n.notice_text}</p>
                    `;
                    list.appendChild(li);
                });
            }

            // Booking Logic (Razorpay Integration)
            document.getElementById('book-btn').addEventListener('click', async () => {
                const event = eventsData.find(e => e.id === currentEventId);
                if (!event || !userEmail) return;

                const btn = document.getElementById('book-btn');
                const price = event.price || 0;
                btn.disabled = true; btn.textContent = 'Processing...';

                const completeBooking = async () => {
                    const randomStr = Math.random().toString(36).substring(2, 10);
                    const qrString = `TKT-${event.id}-${randomStr}`;

                    const { data: success, error: rpcError } = await supabase.rpc('book_ticket_safe', {
                        p_event_id: event.id,
                        p_student_email: userEmail,
                        p_qr_string: qrString
                    });

                    if (rpcError) throw rpcError;

                    showNotification(price > 0 ? `Payment Successful! Ticket Confirmed.` : `Ticket Confirmed!`);
                    btn.textContent = 'Already Booked';
                    btn.className = 'bg-gray-400 text-white font-black py-3 px-10 rounded-full cursor-not-allowed shadow-none';
                    
                    event.tickets_sold++;
                    document.getElementById('detail-capacity-text').textContent = `${event.tickets_sold} / ${event.total_capacity}`;
                    const newFill = Math.min(100, (event.tickets_sold / event.total_capacity) * 100);
                    document.getElementById('detail-capacity-bar').style.width = `${newFill}%`;
                    if(newFill >= 100) document.getElementById('detail-capacity-bar').classList.add('bg-red-500');
                };

                try {
                    if (price > 0) {
                        btn.textContent = 'Initializing Payment...';
                        // 1. Create Order on Backend
                        const orderRes = await fetch('/api/create-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ amount: price, receipt: 'rcpt_' + Date.now() })
                        });
                        
                        const orderData = await orderRes.json();
                        if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

                        // 2. Open Razorpay Modal
                        const options = {
                            "key": "rzp_test_TlHHyvp8triN6e",
                            "amount": price * 100,
                            "currency": "INR",
                            "name": "IIITNR Events",
                            "description": event.title,
                            "order_id": orderData.orderId,
                            "handler": async function (response) {
                                btn.textContent = 'Verifying Payment...';
                                
                                // 3. Verify Signature on Backend
                                const verifyRes = await fetch('/api/verify-payment', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(response)
                                });
                                
                                const verifyData = await verifyRes.json();
                                if (verifyData.success) {
                                    btn.textContent = 'Generating Ticket...';
                                    await completeBooking();
                                } else {
                                    showNotification(`Payment Verification Failed!`, 'error');
                                    btn.disabled = false; btn.textContent = `Book Ticket (â‚¹${price})`;
                                }
                            },
                            "prefill": {
                                "email": userEmail
                            },
                            "theme": {
                                "color": "#2563eb"
                            },
                            "modal": {
                                "ondismiss": function() {
                                    btn.disabled = false; btn.textContent = `Book Ticket (â‚¹${price})`;
                                }
                            }
                        };

                        const rzp = new window.Razorpay(options);
                        rzp.on('payment.failed', function (response) {
                            showNotification(response.error.description, 'error');
                            btn.disabled = false; btn.textContent = `Book Ticket (â‚¹${price})`;
                        });
                        rzp.open();
                    } else {
                        // Free event! Just book the ticket.
                        btn.textContent = 'Booking...';
                        await completeBooking();
                    }

                } catch (error) {
                    console.error('Payment/Booking Error:', error);
                    showNotification(error.message || `An error occurred.`, 'error');
                    btn.disabled = false; btn.textContent = price > 0 ? `Book Ticket (â‚¹${price})` : 'Book Ticket';
                }
            });

            // Reviews Logic
            let currentSelectedRating = 0;

            document.querySelectorAll('.star-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    currentSelectedRating = parseInt(e.target.getAttribute('data-val'));
                    document.querySelectorAll('.star-btn').forEach(b => {
                        if (parseInt(b.getAttribute('data-val')) <= currentSelectedRating) {
                            b.classList.remove('text-gray-300');
                            b.classList.add('text-yellow-400');
                        } else {
                            b.classList.add('text-gray-300');
                            b.classList.remove('text-yellow-400');
                        }
                    });
                    document.getElementById('post-review-btn').disabled = false;
                });
            });

            document.getElementById('post-review-btn').addEventListener('click', async () => {
                if (currentSelectedRating === 0) return;
                
                const btn = document.getElementById('post-review-btn');
                const text = document.getElementById('review-text-input').value.trim();
                
                btn.disabled = true;
                btn.textContent = 'Submitting...';
                
                const { error } = await supabase.from('event_reviews').insert([{
                    event_id: currentEventId,
                    user_email: userEmail,
                    rating: currentSelectedRating,
                    review_text: text || null
                }]);
                
                if (error) {
                    if (error.code === '23505') alert('You have already submitted a review for this event.');
                    else alert('Error submitting review: ' + error.message);
                    btn.disabled = false;
                    btn.textContent = 'Submit';
                } else {
                    document.getElementById('write-review-container').classList.add('hidden');
                    loadReviews(currentEventId);
                }
            });

            async function loadReviews(eventId) {
                const list = document.getElementById('reviews-list');
                const overviewContainer = document.getElementById('overall-rating-container');
                const writeContainer = document.getElementById('write-review-container');
                
                list.innerHTML = '<div class="text-center py-6 text-gray-500 italic text-sm">Loading reviews...</div>';
                overviewContainer.classList.add('hidden');
                writeContainer.classList.add('hidden');
                
                // 1. Fetch reviews
                const { data: reviews, error } = await supabase
                    .from('event_reviews')
                    .select('*, profiles(full_name)')
                    .eq('event_id', eventId)
                    .order('created_at', { ascending: false });
                    
                if (error) {
                    list.innerHTML = '<div class="text-red-500 text-sm text-center py-6">Error loading reviews.</div>';
                    return;
                }
                
                // 2. Check if user can review
                if (userEmail) {
                    const hasReviewed = reviews.some(r => r.user_email === userEmail);
                    if (!hasReviewed) {
                        // Check if they have a SCANNED ticket
                        const { data: tkt } = await supabase.from('tickets')
                            .select('is_scanned')
                            .eq('event_id', eventId)
                            .eq('student_email', userEmail)
                            .single();
                            
                        if (tkt && tkt.is_scanned) {
                            writeContainer.classList.remove('hidden');
                            
                            // Reset star selector state
                            currentSelectedRating = 0;
                            document.getElementById('review-text-input').value = '';
                            document.getElementById('post-review-btn').disabled = true;
                            document.getElementById('post-review-btn').textContent = 'Submit';
                            document.querySelectorAll('.star-btn').forEach(b => {
                                b.classList.add('text-gray-300');
                                b.classList.remove('text-yellow-400');
                            });
                        }
                    }
                }
                
                if (reviews.length === 0) {
                    list.innerHTML = `
                        <div class="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                            <span class="text-4xl mb-3 block">Ã¢Â­Â</span>
                            <p class="theme-text-muted font-medium text-sm">No reviews yet. Be the first to attend and rate!</p>
                        </div>
                    `;
                    return;
                }
                
                // Calculate average rating
                const avg = (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1);
                document.getElementById('overall-rating-score').textContent = avg;
                document.getElementById('overall-rating-count').textContent = `${reviews.length} Review${reviews.length > 1 ? 's' : ''}`;
                
                // Render stars for average
                let avgStars = '';
                for (let i = 1; i <= 5; i++) {
                    if (i <= Math.round(avg)) avgStars += 'Ã¢Ëœâ€¦';
                    else avgStars += 'Ã¢Ëœâ€ ';
                }
                document.getElementById('overall-rating-stars').textContent = avgStars;
                overviewContainer.classList.remove('hidden');
                
                list.innerHTML = '';
                reviews.forEach(r => {
                    const name = r.profiles?.full_name || r.user_email.split('@')[0];
                    const d = new Date(r.created_at).toLocaleString([], {month:'short', day:'numeric', year:'numeric'});
                    const canDelete = userEmail && (userEmail === r.user_email || currentUserRole === 'super_admin');
                    
                    let rStars = '';
                    for (let i=1; i<=5; i++) { rStars += i <= r.rating ? 'Ã¢Ëœâ€¦' : 'Ã¢Ëœâ€ '; }
                    
                    const li = document.createElement('div');
                    li.className = 'bg-white p-5 rounded-xl border border-gray-100 shadow-sm';
                    li.innerHTML = `
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="font-bold text-gray-900 text-sm block">${name} <span class="text-green-600 ml-1 text-xs font-black bg-green-100 px-1.5 py-0.5 rounded">Verified Attendee</span></span>
                                <div class="text-yellow-400 text-sm mt-0.5">${rStars}</div>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-gray-400 font-medium">${d}</span>
                                ${canDelete ? `<button class="text-gray-300 hover:text-red-500 transition-colors delete-rev-btn" data-id="${r.id}" title="Delete review">Ã°Å¸â€”â€˜Ã¯Â¸Â</button>` : ''}
                            </div>
                        </div>
                        ${r.review_text ? `<p class="text-gray-700 text-sm leading-relaxed mt-2">${r.review_text}</p>` : ''}
                    `;
                    list.appendChild(li);
                });

                list.querySelectorAll('.delete-rev-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        if (confirm('Delete this review?')) {
                            const { error } = await supabase.from('event_reviews').delete().eq('id', e.target.getAttribute('data-id'));
                            if (error) alert('Error deleting review.');
                            else loadReviews(eventId);
                        }
                    });
                });
            }

            fetchEvents();
        });
    
