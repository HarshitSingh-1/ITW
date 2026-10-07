document.addEventListener('DOMContentLoaded',  async () => {
            const supabase = window.app.supabase;
            let currentUserRole = 'student';
            let currentUserEmail = '';
            let currentEventIdForExport = null;
            let currentAttendeesData = [];

            const notif = document.getElementById('notification-banner');
            
            function showNotif(msg, type = 'success') {
                notif.textContent = msg;
                notif.className = `mb-6 p-4 rounded-lg text-sm font-medium block ${type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'} border`;
                setTimeout(() => notif.classList.add('hidden'), 5000);
            }

            // Auth Check
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            currentUserEmail = session.user.email;
            if(document.getElementById('user-email-display')) document.getElementById('user-email-display').textContent = currentUserEmail;

            // Fetch Role
            const { data: profile } = await supabase.from('profiles').select('role').eq('email', currentUserEmail).single();
            if (profile) currentUserRole = profile.role;

            // Gatekeeping Access
            if (currentUserRole === 'student') {
                document.getElementById('access-denied').classList.remove('hidden');
                return;
            }
            if (currentUserRole === 'gatekeeper') {
                // Gatekeepers should only see scanner
                window.location.href = 'scanner.html';
                return;
            }

            // Allow access (Admin or Organizer)
            document.getElementById('dashboard-content').classList.remove('hidden');
            document.getElementById('nav-scanner').classList.remove('hidden');

            if (currentUserRole === 'super_admin' || currentUserRole === 'organizer') {
                document.getElementById('tab-roles').classList.remove('hidden');
                
                // If they are just an organizer, restrict them from making other organizers
                if (currentUserRole === 'organizer') {
                    const orgOption = document.querySelector('#role-select option[value="organizer"]');
                    if (orgOption) orgOption.remove();
                }
            } else {
                // Physically remove the role management tab for students/gatekeepers
                const tabRoles = document.getElementById('tab-roles');
                const viewRoles = document.getElementById('view-roles');
                if (tabRoles) tabRoles.remove();
                if (viewRoles) viewRoles.remove();
            }

            // --- Tab Switching Logic ---
            const tabs = {
                events: { btn: document.getElementById('tab-events'), view: document.getElementById('view-events') },
                create: { btn: document.getElementById('tab-create'), view: document.getElementById('view-create') },
                roles: { btn: document.getElementById('tab-roles'), view: document.getElementById('view-roles') },
                manage: { view: document.getElementById('view-manage') } 
            };

            function switchTab(activeTabId) {
                // Hide all views, reset all buttons
                Object.keys(tabs).forEach(key => {
                    if(tabs[key].view) tabs[key].view.classList.add('hidden');
                    if(tabs[key].btn) {
                        tabs[key].btn.className = 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium pb-3 px-1 whitespace-nowrap';
                    }
                });
                // Activate target
                if (activeTabId !== 'manage') {
                    tabs[activeTabId].btn.className = 'border-b-2 border-blue-600 text-blue-600 font-semibold pb-3 px-1 whitespace-nowrap';
                }
                tabs[activeTabId].view.classList.remove('hidden');
                
                if (activeTabId === 'events') fetchEvents();
            }

            if (tabs.events.btn) tabs.events.btn.addEventListener('click', () => switchTab('events'));
            if (tabs.create.btn) tabs.create.btn.addEventListener('click', () => switchTab('create'));
            if (tabs.roles.btn) tabs.roles.btn.addEventListener('click', () => switchTab('roles'));
            document.getElementById('btn-back').addEventListener('click', () => switchTab('events'));

            // Chart instances
            let chartGender, chartBranch, chartBatch;

            // --- View: Events ---
            async function fetchEvents() {
                let query = supabase.from('events').select('*').order('created_at', { ascending: false });
                if (currentUserRole !== 'super_admin') {
                    query = query.eq('organizer_email', currentUserEmail);
                }
                
                const { data: events, error } = await query;
                if (error) { console.error(error); return; }

                // Fetch Organizers if Super Admin
                let orgMap = {};
                if (currentUserRole === 'super_admin' && events.length > 0) {
                    const emails = [...new Set(events.map(e => e.organizer_email))];
                    const { data: orgs } = await supabase.from('profiles').select('email, full_name').in('email', emails);
                    if (orgs) {
                        orgs.forEach(o => orgMap[o.email] = o.full_name);
                    }
                }

                document.getElementById('events-count').textContent = `Showing ${events.length} events`;
                const grid = document.getElementById('events-grid');
                grid.innerHTML = '';

                events.forEach(event => {
                    const fill = Math.round((event.tickets_sold / event.total_capacity) * 100) || 0;
                    const orgName = currentUserRole === 'super_admin' ? (orgMap[event.organizer_email] || event.organizer_email) : '';
                    
                    const card = document.createElement('div');
                    card.className = 'bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md cursor-pointer transition-shadow flex flex-col h-full';
                    card.onclick = () => openManageEvent(event);
                    card.innerHTML = `
                        <h3 class="font-bold text-lg text-gray-900 leading-tight mb-1">${event.title}</h3>
                        ${orgName ? `<p class="text-xs text-blue-600 font-semibold mb-2">By: ${orgName}</p>` : ''}
                        <p class="text-sm text-gray-500 mb-4">${new Date(event.event_date).toLocaleDateString()}</p>
                        <div class="mt-auto">
                            <div class="flex justify-between text-xs text-gray-600 mb-1">
                                <span>${event.tickets_sold} Booked</span>
                                <span>${fill}% Full</span>
                            </div>
                            <div class="w-full bg-gray-100 rounded-full h-1.5"><div class="bg-blue-600 h-1.5 rounded-full" style="width: ${fill}%"></div></div>
                            <button class="mt-4 w-full border border-gray-200 rounded-md py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Manage Attendees</button>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            }

            // --- View: Manage Event (Attendees & Analytics) ---
            async function openManageEvent(event) {
                switchTab('manage');
                document.getElementById('manage-title').textContent = event.title;
                document.getElementById('manage-stats').textContent = `${event.tickets_sold} Booked / ${event.total_capacity} Capacity`;
                
                const tbody = document.getElementById('attendees-table');
                const loading = document.getElementById('attendees-loading');
                const analyticsPanel = document.getElementById('analytics-panel');
                
                tbody.innerHTML = '';
                loading.classList.remove('hidden');
                analyticsPanel.classList.add('hidden');

                try {
                    const { data: tickets, error: tErr } = await supabase.from('tickets').select('*').eq('event_id', event.id);
                    if (tErr) throw tErr;

                    if (tickets.length === 0) {
                        loading.textContent = 'No one has booked a ticket yet.';
                        return;
                    }

                    const emails = tickets.map(t => t.student_email);
                    const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').in('email', emails);
                    if (pErr) throw pErr;

                    const profileMap = {};
                    profiles.forEach(p => profileMap[p.email] = p);

                    loading.classList.add('hidden');
                    analyticsPanel.classList.remove('hidden');
                    
                    // Demographic counters
                    const genders = { Male: 0, Female: 0, Other: 0, 'N/A': 0 };
                    const branches = { CSE: 0, ECE: 0, DSAI: 0, 'N/A': 0 };
                    const batches = {};

                    // Store for export
                    currentEventIdForExport = event.title;
                    currentAttendeesData = tickets.map(t => {
                        const p = profileMap[t.student_email] || {};
                        
                        // Count demographics
                        genders[p.gender || 'N/A'] = (genders[p.gender || 'N/A'] || 0) + 1;
                        branches[p.branch || 'N/A'] = (branches[p.branch || 'N/A'] || 0) + 1;
                        batches[p.batch || 'N/A'] = (batches[p.batch || 'N/A'] || 0) + 1;

                        return {
                            name: p.full_name || 'Unknown',
                            email: t.student_email,
                            batch: p.batch || 'N/A',
                            branch: p.branch || 'N/A',
                            gender: p.gender || 'N/A',
                            scanned: t.is_scanned
                        };
                    });

                    // Fetch assigned gatekeepers
                    const gkList = document.getElementById('assigned-gk-list');
                    gkList.innerHTML = '';
                    const { data: gks } = await supabase.from('event_gatekeepers').select('gatekeeper_email').eq('event_id', event.id);
                    if (gks && gks.length > 0) {
                        gks.forEach(g => {
                            const li = document.createElement('li');
                            li.className = "flex justify-between items-center border-b pb-1 break-all";
                            li.innerHTML = `<span>✅ ${g.gatekeeper_email}</span> <button title="Revoke Access" class="text-red-500 hover:text-red-700 font-bold ml-2 text-lg leading-none revoke-btn" data-email="${g.gatekeeper_email}">✕</button>`;
                            gkList.appendChild(li);
                        });

                        // Attach revoke listeners
                        gkList.querySelectorAll('.revoke-btn').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                const targetEmail = e.target.getAttribute('data-email');
                                if (confirm(`Revoke scanner access for ${targetEmail}?`)) {
                                    const { error } = await supabase.from('event_gatekeepers').delete().eq('event_id', event.id).eq('gatekeeper_email', targetEmail);
                                    if (error) alert(`Error revoking access: ${error.message}`);
                                    else openManageEvent(event); // reload
                                }
                            });
                        });
                    } else {
                        gkList.innerHTML = '<li class="text-gray-400 italic text-sm">No gatekeepers assigned.</li>';
                    }
                    // Setup GK Assign Form
                    const gkForm = document.getElementById('assign-gk-form');
                    // clone node to remove old listeners
                    const newGkForm = gkForm.cloneNode(true);
                    gkForm.parentNode.replaceChild(newGkForm, gkForm);
                    
                    newGkForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const email = document.getElementById('gk-email').value.trim();
                        
                        // We use an RPC here so the database can safely upgrade the student to a gatekeeper 
                        // and assign them to the event simultaneously, bypassing RLS restrictions.
                        const { error } = await supabase.rpc('assign_event_gatekeeper', { 
                            p_event_id: event.id, 
                            p_email: email 
                        });
                        
                        if (error) {
                            alert(`Error: ${error.message}`);
                        } else {
                            document.getElementById('gk-email').value = '';
                            openManageEvent(event); // reload the view
                        }
                    });

                    // Render table
                    currentAttendeesData.forEach(row => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${row.name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.email}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.batch} - ${row.branch}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                ${row.scanned 
                                    ? '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Scanned</span>' 
                                    : '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Pending</span>'}
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });

                    // Render Charts
                    renderCharts(genders, branches, batches);

                } catch (err) {
                    console.error(err);
                    loading.textContent = 'Failed to load attendees.';
                }
            }

            function renderCharts(genders, branches, batches) {
                // Destroy old charts if switching events
                if (chartGender) chartGender.destroy();
                if (chartBranch) chartBranch.destroy();
                if (chartBatch) chartBatch.destroy();

                const commonOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } } };

                chartGender = new Chart(document.getElementById('chart-gender'), {
                    type: 'pie',
                    data: {
                        labels: Object.keys(genders),
                        datasets: [{ data: Object.values(genders), backgroundColor: ['#3b82f6', '#ec4899', '#8b5cf6', '#9ca3af'] }]
                    },
                    options: commonOptions
                });

                chartBranch = new Chart(document.getElementById('chart-branch'), {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(branches),
                        datasets: [{ data: Object.values(branches), backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#9ca3af'] }]
                    },
                    options: commonOptions
                });

                chartBatch = new Chart(document.getElementById('chart-batch'), {
                    type: 'bar',
                    data: {
                        labels: Object.keys(batches),
                        datasets: [{ label: 'Students', data: Object.values(batches), backgroundColor: '#6366f1', borderRadius: 4 }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
                });
            }

            // --- CSV Export Logic ---
            document.getElementById('btn-export-csv').addEventListener('click', () => {
                if (currentAttendeesData.length === 0) return alert('No data to export.');
                
                // Headers
                let csvContent = "Name,Email,Batch,Branch,Gender,Status\n";
                
                // Rows
                currentAttendeesData.forEach(row => {
                    const status = row.scanned ? "Scanned (Attended)" : "Pending";
                    csvContent += `"${row.name}","${row.email}","${row.batch}","${row.branch}","${row.gender}","${status}"\n`;
                });

                // Download
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `Attendees_${currentEventIdForExport.replace(/ /g, '_')}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });

            // --- View: Create Event Logic ---
            document.getElementById('create-event-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = document.getElementById('submit-btn');
                btn.disabled = true; btn.textContent = 'Uploading & Publishing...';

                let finalPosterUrl = null;
                const fileInput = document.getElementById('poster_file');
                
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                    
                    const { data: uploadData, error: uploadError } = await supabase.storage.from('posters').upload(fileName, file);
                    
                    if (uploadError) {
                        showNotif('Failed to upload image. Did you create the storage bucket?', 'error');
                        btn.disabled = false; btn.textContent = 'Publish Event';
                        return;
                    }
                    
                    const { data: publicUrlData } = supabase.storage.from('posters').getPublicUrl(fileName);
                    finalPosterUrl = publicUrlData.publicUrl;
                }

                const newEvent = {
                    title: document.getElementById('title').value,
                    description: document.getElementById('description').value,
                    event_date: new Date(document.getElementById('event_date').value).toISOString(),
                    event_end_date: document.getElementById('event_end_date').value ? new Date(document.getElementById('event_end_date').value).toISOString() : null,
                    venue: document.getElementById('venue').value,
                    total_capacity: parseInt(document.getElementById('total_capacity').value),
                    organizer_email: currentUserEmail,
                    poster_url: finalPosterUrl,
                    scan_start_minutes_before: parseInt(document.getElementById('scan_buffer').value) || 120
                };

                const { error } = await supabase.from('events').insert([newEvent]);
                if (error) {
                    showNotif('Failed to create event. Check permissions.', 'error');
                } else {
                    showNotif('Event successfully published!');
                    e.target.reset();
                    switchTab('events'); // go back to events feed
                }
                btn.disabled = false; btn.textContent = 'Publish Event';
            });

            // --- View: Role Management Logic ---
            const roleForm = document.getElementById('role-form');
            if (roleForm) {
                roleForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const targetEmail = document.getElementById('role-email').value;
                    const newRole = document.getElementById('role-select').value;
                    
                    // .select() forces Supabase to return the updated row. If RLS blocks it, data will be empty.
                    const { data, error } = await supabase.from('profiles').update({ role: newRole }).eq('email', targetEmail).select();
                    
                    if (error || !data || data.length === 0) {
                        showNotif('Failed to update role. Make sure you have Admin rights and the user exists.', 'error');
                    } else {
                        showNotif(`Successfully updated ${targetEmail} to ${newRole.toUpperCase()}!`);
                        e.target.reset();
                    }
                });
            }

            // Initial load
            fetchEvents();
        });
    
