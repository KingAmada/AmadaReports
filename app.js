    // --- MARKETING UI LOGIC ---
    
    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('mainHeader');
        if (window.scrollY > 50) header.classList.add('header-scrolled');
        else header.classList.remove('header-scrolled');
    });

    let currentLoginMode = 'host';
    function toggleLoginType(type) {
        currentLoginMode = type;
        document.getElementById('tabLoginHost').classList.toggle('active', type === 'host');
        document.getElementById('tabLoginStaff').classList.toggle('active', type === 'staff');
        document.getElementById('tabLoginHost').style.color = type === 'host' ? 'var(--dark)' : 'var(--gray)';
        document.getElementById('tabLoginStaff').style.color = type === 'staff' ? 'var(--dark)' : 'var(--gray)';
        
        document.getElementById('hostLoginFields').style.display = type === 'host' ? 'block' : 'none';
        document.getElementById('staffLoginFields').style.display = type === 'staff' ? 'block' : 'none';
        
        document.getElementById('loginEmail').required = type === 'host';
        document.getElementById('loginPass').required = type === 'host';
        document.getElementById('loginStaffId').required = type === 'staff';
        document.getElementById('loginPin').required = type === 'staff';
    }

    function openLoginModal() {
        document.getElementById('loginModal').style.display = 'flex';
        setTimeout(() => document.getElementById('loginModal').classList.add('show'), 10);
    }

    function submitLogin() {
        closeModals();
        if(!window.appInitialized) {
            window.app = new AmadaApp();
            window.appInitialized = true;
        }
        
        if (currentLoginMode === 'host') {
            const email = document.getElementById('loginEmail').value;
            const pass = document.getElementById('loginPass').value;
            window.app.loginHost(email, pass);
        } else {
            const staffId = document.getElementById('loginStaffId').value;
            const pin = document.getElementById('loginPin').value;
            window.app.loginStaff(staffId, pin);
        }
        
        document.getElementById('hostLoginForm').reset();
    }

    // View Switcher (SPA Navigation)
    function switchView(view) {
        document.getElementById('homeView').style.display = view === 'home' ? 'block' : 'none';
        document.getElementById('topBanner').style.display = view === 'home' ? 'flex' : 'none';
        document.getElementById('mainHeader').style.display = (view === 'home' || view === 'guest') ? 'block' : 'none';
        document.getElementById('guestView').style.display = view === 'guest' ? 'block' : 'none';
        
        const portal = document.getElementById('portalView');
        if(view === 'portal' || view === 'guest') {
            portal.style.display = view === 'portal' ? 'block' : 'none';
            if(!window.appInitialized) {
                window.app = new AmadaApp();
                window.appInitialized = true;
            } else {
                window.app.render();
            }
            if(view === 'guest' && window.app) window.app.renderGuestGrid();
        } else {
            portal.style.display = 'none';
        }
        window.scrollTo(0, 0);
    }

    // Revenue Calculator Logic
    function updateCalc() {
        const rate = parseInt(document.getElementById('calcLoc').value);
        const occ = parseInt(document.getElementById('calcOcc').value);
        document.getElementById('occValue').innerText = `${occ} nights/mo`;
        const total = rate * occ;
        document.getElementById('calcResult').innerText = "₦" + total.toLocaleString();
    }

    function openHostModal() {
        document.getElementById('hostModal').style.display = 'flex';
        setTimeout(() => document.getElementById('hostModal').classList.add('show'), 10);
    }

    function closeModals() {
        document.querySelectorAll('.modal').forEach(m => { 
            m.classList.remove('show'); 
            setTimeout(() => m.style.display = 'none', 300); 
        });
    }

    function refreshFloatingLabels(root = document) {
        root.querySelectorAll('.input-floating').forEach(wrapper => {
            const field = wrapper.querySelector('input, select, textarea');
            if (!field) return;
            const hasValue = field.value != null && String(field.value).trim() !== '';
            wrapper.classList.toggle('is-filled', hasValue);
        });
    }

    function openLegalModal(type) {
        const modal = document.getElementById('legalModal');
        const title = document.getElementById('legalModalTitle');
        const body = document.getElementById('legalModalBody');
        if (!modal || !title || !body) return;

        const content = {
            terms: {
                title: 'Terms and Conditions',
                body: `
                    <p>By creating an account, listing a property, or using Amada Stays to book accommodation, you agree to provide accurate information, keep your login credentials secure, and comply with all applicable laws and house rules.</p>
                    <p>Hosts are responsible for listing accuracy, lawful occupancy, and maintaining safe, habitable spaces. Guests are responsible for timely payment, lawful use of the property, and any damages outside normal wear and tear.</p>
                    <p>Amada Stays may suspend access, remove listings, or restrict bookings where there is fraud, misuse, policy breach, non-payment, or legal risk. Refunds, caution fees, and access credentials may be reviewed against recorded booking data and internal approval workflows.</p>
                `
            },
            privacy: {
                title: 'Privacy Statement',
                body: `
                    <p>Amada Stays collects only the information needed to run bookings, host onboarding, operations, finance workflows, and team access control. This may include names, email addresses, phone numbers, booking dates, payment records, staff IDs, and property details.</p>
                    <p>Your information is used to manage reservations, generate receipts, record financial activity, support role-based access, and improve service delivery. We do not request unnecessary data and we aim to store operational records securely.</p>
                    <p>By using the platform, you acknowledge that booking, receipt, refund, and dashboard data may be processed for accounting, security, reporting, and service management purposes. If your organization needs a formal privacy addendum, that should be issued separately by the operator.</p>
                `
            }
        };

        const selected = content[type] || content.terms;
        title.innerText = selected.title;
        body.innerHTML = selected.body;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    document.addEventListener('input', () => refreshFloatingLabels());
    document.addEventListener('change', () => refreshFloatingLabels());

    function registerHost() {
        const form = document.getElementById('hostForm');
        
        // Final robustness check
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const btn = document.getElementById('hostSubmitBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Setting up profile...';
        btn.disabled = true;

        // Simulate network delay for realistic UX
        setTimeout(() => {
            closeModals();
            if(!window.appInitialized) {
                window.app = new AmadaApp();
                window.appInitialized = true;
            }
            
            const name = document.getElementById('hostFullName').value;
            const email = document.getElementById('hostEmail').value;
            const phone = document.getElementById('hostPhone').value;
            const pass = document.getElementById('hostPassword').value;
            
            window.app.registerNewHost(name, email, phone, pass);
            
            // Reset form and button state for next time
            form.reset();
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 1200);
    }


    // --- THE ENGINE LOGIC (Refactored AmadaApp) ---
    class AmadaApp {
        constructor() {
            this.googleScriptUrl = "https://script.google.com/macros/s/AKfycbwlmH-7bS0plCQ3hh_1ktGWOz0W1munajRrlMO5yBCD_cB-zffSYi9-02siM1rjejxONA/exec";
            
            this.role = 'staff';
            this.pendingRole = null;
            this.activeMgmtTab = 'pl'; 
            this.activeStaffTab = 'ops'; 
            
            this.LOCK_MAPPING = {
                'h_4bed_1': 'REPLACE_WITH_TUYA_DEVICE_ID',
                'h_1bed_1': 'REPLACE_WITH_TUYA_DEVICE_ID',
                'j_3bed_1': 'REPLACE_WITH_TUYA_DEVICE_ID'
            };

            this.rolePins = { 'management': '4444', 'chairman': '8888' };
            this.filters = { location: 'all', status: 'all' };
            this.managementFilter = 'all'; 
            this.sortBy = 'default';
            this.searchQuery = '';

            const today = new Date();
            this.dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            this.dateTo = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]; 

            this.targets = {}; 
            this.inventory = this.getInitialInventory();
            this.transactions = []; 
            this.expenditures = []; 
            this.refunds = [];
            this.raffleWinners = [];
            this.salaryRegistry = [];
            this.rentRegistry = [];
            this.otherIncome = [];
            
            this.hosts = [];
            this.teamMembers = this.getDefaultTeamMembers();
            this.currentHostEmail = null;
            this.currentUser = null;
            this.guestSearchQuery = '';
            this.guestViewMode = 'grid';
            this.staffViewMode = 'grid';
            this.hostViewMode = 'grid';
            this.hostDashboardRole = 'host';
            this.currentSalaryEditId = null;
            this.currentRentEditLocation = null;
            this.managementDateFrom = this.dateFrom;
            this.managementDateTo = this.dateTo;
            this.managementLocation = 'all';
            this.chairmanDateFrom = this.dateFrom;
            this.chairmanDateTo = this.dateTo;
            this.chairmanLocation = 'all';
            this.managementReportType = 'expenditure';
            this.chairmanReportType = 'income';

            this.init();
        }

        async init() {
            this.loadLocalData();
            this.setupCurrencyFormatting();
            this.render();
            refreshFloatingLabels();
            this.setupPinEnter();
            this.startAutoSlide();
            this.startSocialProofEngine();
            await this.syncFromCloud();
        }

        startSocialProofEngine() {
            const actions = [
                { icon: 'fa-calendar-check', color: 'var(--success)', template: (n, l) => `<strong>${n}</strong> just booked a stay in <strong>${l}</strong>` },
                { icon: 'fa-clock-rotate-left', color: 'var(--blue)', template: (n, l) => `<strong>${n}</strong> extended their stay in <strong>${l}</strong>` },
                { icon: 'fa-house-circle-check', color: 'var(--primary)', template: (n, l) => `A Host just listed a new Premium Apartment in <strong>${l}</strong>` },
                { icon: 'fa-ticket', color: 'var(--warning)', template: (n, l) => `<strong>${n}</strong> just won a 100% Refund Draw!` },
                { icon: 'fa-fire', color: 'var(--danger)', template: (n, l) => `<strong>${n}</strong> just booked the last available unit in <strong>${l}</strong>` }
            ];
            
            const names = ['Michael O.', 'Aisha K.', 'Emeka B.', 'Sarah T.', 'Chinedu A.', 'Fatima R.', 'David W.', 'Adeola O.'];
            const locations = ['Katampe', 'Jahi', 'Gwarinpa', 'Asokoro', 'Maitama', 'Wuse'];
            const times = ['Just now', '2 mins ago', '5 mins ago', '12 mins ago', '1 hr ago'];

            const triggerRandomProof = () => {
                const action = actions[Math.floor(Math.random() * actions.length)];
                const name = names[Math.floor(Math.random() * names.length)];
                const loc = locations[Math.floor(Math.random() * locations.length)];
                const time = times[Math.floor(Math.random() * times.length)];

                this.displaySocialProof(action.icon, action.color, action.template(name, loc), time);

                // Schedule next proof randomly between 8s and 25s
                setTimeout(triggerRandomProof, Math.floor(Math.random() * 17000) + 8000);
            };

            // Start first proof after 3 seconds
            setTimeout(triggerRandomProof, 3000);
        }

        displaySocialProof(icon, color, textHtml, timeText) {
            const container = document.getElementById('social-proof-container');
            if (!container) return;

            const div = document.createElement('div');
            div.className = 'social-proof-card';
            div.innerHTML = `
                <div style="background: ${color}15; color: ${color}; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div style="flex-grow: 1;">
                    <div style="font-size: 0.85rem; color: var(--dark); line-height: 1.4; margin-bottom: 4px;">${textHtml}</div>
                    <div style="font-size: 0.75rem; color: var(--gray); font-weight: 500;">${timeText}</div>
                </div>
            `;

            container.appendChild(div);

            // Display for 6 seconds, then animate out
            setTimeout(() => {
                div.style.animation = 'slideDownProof 0.5s ease-in forwards';
                setTimeout(() => div.remove(), 500);
            }, 6000); 
        }

        startAutoSlide() {
            setInterval(() => {
                document.querySelectorAll('.carousel-track').forEach(track => {
                    const wrapper = track.closest('.carousel-wrapper');
                    // Pause sliding if the user is hovering over the carousel
                    if (wrapper && wrapper.matches(':hover')) return;
                    
                    // Don't slide if there's only 1 image
                    if (track.children.length <= 1) return;
                    
                    const maxScroll = track.scrollWidth - track.clientWidth;
                    if (maxScroll <= 0) return;
                    
                    // Rewind to start if at the end, otherwise slide to next image
                    if (track.scrollLeft >= maxScroll - 10) {
                        track.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
                    }
                });
            }, 3000); // Trigger slide every 3 seconds
        }

        showNotification(message, type = 'info') {
            const container = document.getElementById('notification-container');
            if (!container) return;

            const duplicate = Array.from(container.children).find(node =>
                node.dataset.message === message && node.dataset.type === type
            );
            if (duplicate) duplicate.remove();

            while (container.children.length >= 4) {
                container.firstElementChild.remove();
            }

            const div = document.createElement('div');
            div.className = `notification ${type}`;
            div.dataset.message = message;
            div.dataset.type = type;
            
            let icon = '<i class="fa-solid fa-circle-info"></i>';
            if(type === 'success') icon = '<i class="fa-solid fa-circle-check"></i>';
            if(type === 'error') icon = '<i class="fa-solid fa-circle-exclamation"></i>';

            div.innerHTML = `${icon} <span>${message}</span>`;
            container.appendChild(div);

            setTimeout(() => {
                div.style.animation = 'slideInRight 0.4s ease reverse forwards';
                setTimeout(() => div.remove(), 400);
            }, 4000);
        }

        getTileLayer() {
            return {
                url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                options: {
                    subdomains: 'abcd',
                    maxZoom: 20,
                    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
                }
            };
        }

        addBaseTileLayer(map) {
            const tile = this.getTileLayer();
            return L.tileLayer(tile.url, tile.options).addTo(map);
        }

        parseCurrencyValue(value) {
            const normalized = String(value ?? '').replace(/,/g, '').replace(/[^\d.]/g, '');
            const parts = normalized.split('.');
            const safe = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : parts[0];
            return parseFloat(safe);
        }

        formatCurrencyInputValue(value) {
            const stringValue = String(value ?? '').replace(/,/g, '').replace(/[^\d.]/g, '');
            if (!stringValue) return '';

            const parts = stringValue.split('.');
            const integerPart = parts[0] ? Number(parts[0]).toLocaleString() : '0';
            if (parts.length === 1) return integerPart;
            return `${integerPart}.${parts.slice(1).join('').slice(0, 2)}`;
        }

        setCurrencyInputValue(id, value) {
            const input = document.getElementById(id);
            if (input) input.value = this.formatCurrencyInputValue(value);
        }

        setupCurrencyFormatting() {
            if (this.currencyFormattingSetup) return;
            this.currencyFormattingSetup = true;

            document.addEventListener('input', (event) => {
                const target = event.target;
                if (!(target instanceof HTMLInputElement) || !target.matches('[data-currency]')) return;
                target.value = this.formatCurrencyInputValue(target.value);
            });

            document.addEventListener('blur', (event) => {
                const target = event.target;
                if (!(target instanceof HTMLInputElement) || !target.matches('[data-currency]')) return;
                target.value = this.formatCurrencyInputValue(target.value);
            }, true);
        }

        normalizeAmenities(amenities) {
            if (Array.isArray(amenities)) return amenities;
            if (!amenities) return [];
            if (typeof amenities === 'string') {
                return amenities.split(',').map(item => item.trim()).filter(Boolean).map(text => ({
                    icon: 'fa-check',
                    text
                }));
            }
            if (typeof amenities === 'object') {
                return Object.values(amenities).filter(Boolean).map(item => {
                    if (typeof item === 'string') return { icon: 'fa-check', text: item };
                    return {
                        icon: item.icon || 'fa-check',
                        text: item.text || ''
                    };
                }).filter(item => item.text);
            }
            return [];
        }

        setupPinEnter() {
            const pinInput = document.getElementById('rolePinInput');
            if (pinInput) {
                pinInput.addEventListener("keypress", (event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        this.verifyPin();
                    }
                });
            }
        }

        getInitialInventory() {
            let inv = [];
            
            // Reusable mock image sets for slider
            const imgsPremium = [
                'https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ];
            const imgsStandard = [
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ];
            
            const commonAmenities = [
                { icon: 'fa-wifi', text: 'High-Speed WiFi' },
                { icon: 'fa-snowflake', text: 'Air Conditioning' },
                { icon: 'fa-tv', text: 'Smart TV & Netflix' },
                { icon: 'fa-shield-halved', text: '24/7 Security' },
                { icon: 'fa-bolt', text: '24/7 Power' }
            ];
            const premiumAmenities = [...commonAmenities, { icon: 'fa-water-ladder', text: 'Private Pool' }, { icon: 'fa-dumbbell', text: 'Gym Access' }];

            // Coordinates for map markers
            const coords = {
                'Katampe': { lat: 9.129424, lng: 7.429680 },
                'Jahi': { lat: 9.103536, lng: 7.425503 },
                'Gwarinpa': { lat: 9.106198, lng: 7.377890 }
            };

            for(let i=1; i<=3; i++) inv.push({ id: `h_4bed_${i}`, loc: 'Katampe', name: `Premium 4 Bed Duplex ${i}`, price: 250000, type: '4-Bed Duplex', status: 'available', hostEmail: 'admin@amada.com', images: imgsPremium, amenities: premiumAmenities, coords: coords['Katampe'] });
            for(let i=1; i<=3; i++) inv.push({ id: `h_1bed_${i}`, loc: 'Katampe', name: `Luxury 1 Bed Apt ${i}`, price: 80000, type: '1 Bed', status: 'available', hostEmail: 'admin@amada.com', images: imgsPremium, amenities: commonAmenities, coords: coords['Katampe'] });
            for(let i=1; i<=2; i++) inv.push({ id: `j_3bed_${i}`, loc: 'Jahi', name: `Executive 3 Bed Apt ${i}`, price: 150000, type: '3 Bed', status: 'available', hostEmail: 'admin@amada.com', images: imgsStandard, amenities: premiumAmenities, coords: coords['Jahi'] });
            for(let i=1; i<=4; i++) inv.push({ id: `j_2bed_${i}`, loc: 'Jahi', name: `Standard 2 Bed Apt ${i}`, price: 120000, type: '2 Bed', status: 'available', hostEmail: 'admin@amada.com', images: imgsStandard, amenities: commonAmenities, coords: coords['Jahi'] });
            for(let i=1; i<=2; i++) inv.push({ id: `j_1bed_${i}`, loc: 'Jahi', name: `Standard 1 Bed Apt ${i}`, price: 70000, type: '1 Bed', status: 'available', hostEmail: 'admin@amada.com', images: imgsStandard, amenities: commonAmenities, coords: coords['Jahi'] });
            for(let i=1; i<=3; i++) inv.push({ id: `w_studio_${i}`, loc: 'Gwarinpa', name: `Classic Studio ${i}`, price: 40000, type: 'Studio', status: 'available', hostEmail: 'admin@amada.com', images: imgsStandard, amenities: commonAmenities, coords: coords['Gwarinpa'] });
            for(let i=1; i<=3; i++) inv.push({ id: `w_1bed_${i}`, loc: 'Gwarinpa', name: `Classic 1 Bed Apt ${i}`, price: 50000, type: '1 Bed', status: 'available', hostEmail: 'admin@amada.com', images: imgsStandard, amenities: commonAmenities, coords: coords['Gwarinpa'] });
            
            // Randomly occupy some units for visual realism on demo
            inv[0].status = 'occupied'; inv[0].guestName = 'Aliko D.';
            inv[2].status = 'occupied'; inv[2].guestName = 'Femi O.';
            inv[5].status = 'occupied'; inv[5].guestName = 'Tony E.';

            return inv;
        }

        getDefaultTeamMembers() {
            return [
                { id: 'team_staff_demo', name: 'Operations Demo', role: 'staff', staffId: 'ops-001', email: 'ops@amada.com', pin: '1234', createdBy: 'system' },
                { id: 'team_mgmt_demo', name: 'Management Demo', role: 'management', staffId: 'mgmt-001', email: 'management@amada.com', pin: '4444', createdBy: 'system' },
                { id: 'team_chair_demo', name: 'Chairman Demo', role: 'chairman', staffId: 'chair-001', email: 'chairman@amada.com', pin: '8888', createdBy: 'system' }
            ];
        }

        loadLocalData() {
            const keys = ['amadaInventory', 'amadaTransactions', 'amadaExpenditures', 'amadaTargets', 'amadaRefunds', 'amadaRaffleWinners', 'amadaHosts', 'amadaTeamMembers', 'amadaSalaryRegistry', 'amadaRentRegistry', 'amadaOtherIncome'];
            keys.forEach(k => {
                const val = localStorage.getItem(k);
                if(val) this[k.replace('amada', '').toLowerCase()] = JSON.parse(val);
            });
            if (!Array.isArray(this.teamMembers) || this.teamMembers.length === 0) {
                this.teamMembers = this.getDefaultTeamMembers();
            }
        }

        saveLocalData() {
            localStorage.setItem('amadaInventory', JSON.stringify(this.inventory));
            localStorage.setItem('amadaTransactions', JSON.stringify(this.transactions));
            localStorage.setItem('amadaExpenditures', JSON.stringify(this.expenditures));
            localStorage.setItem('amadaTargets', JSON.stringify(this.targets));
            localStorage.setItem('amadaRefunds', JSON.stringify(this.refunds));
            localStorage.setItem('amadaRaffleWinners', JSON.stringify(this.raffleWinners));
            localStorage.setItem('amadaHosts', JSON.stringify(this.hosts));
            localStorage.setItem('amadaTeamMembers', JSON.stringify(this.teamMembers));
            localStorage.setItem('amadaSalaryRegistry', JSON.stringify(this.salaryRegistry));
            localStorage.setItem('amadaRentRegistry', JSON.stringify(this.rentRegistry));
            localStorage.setItem('amadaOtherIncome', JSON.stringify(this.otherIncome));
            this.render();
            if(document.getElementById('guestView').style.display === 'block') this.renderGuestGrid();
            this.syncToCloud(); 
        }

        async syncFromCloud() {
            this.updateSyncUI('syncing');
            try {
                const res = await fetch(this.googleScriptUrl);
                if (!res.ok) throw new Error(`Server Error (${res.status})`);
                const data = await res.json();
                if (data.status === 'error') throw new Error(data.message);

                if (data.inventory?.length > 0) this.inventory = data.inventory;
                if (data.transactions) this.transactions = data.transactions;
                if (data.expenditures) this.expenditures = data.expenditures;
                if (data.targets) this.targets = data.targets;
                if (data.refunds) this.refunds = data.refunds;
                if (data.raffleWinners) this.raffleWinners = data.raffleWinners;
                if (data.salaryRegistry) this.salaryRegistry = data.salaryRegistry;
                if (data.rentRegistry) this.rentRegistry = data.rentRegistry;
                if (data.otherIncome) this.otherIncome = data.otherIncome;
                
                this.updateSyncUI('online');
            } catch (e) { 
                this.updateSyncUI('offline');
                console.warn("Using local cache. Cloud Sync Failed:", e);
            }
        }

        async syncToCloud() {
            this.updateSyncUI('syncing');
            const payload = { 
                inventory: this.inventory, transactions: this.transactions, 
                expenditures: this.expenditures, targets: this.targets, refunds: this.refunds,
                raffleWinners: this.raffleWinners, salaryRegistry: this.salaryRegistry,
                rentRegistry: this.rentRegistry, otherIncome: this.otherIncome
            };
            try {
                const res = await fetch(this.googleScriptUrl, { method: 'POST', body: JSON.stringify(payload) });
                if (!res.ok) throw new Error(`Server Error (${res.status})`);
                const json = await res.json();
                if (json.status === 'success') this.updateSyncUI('online');
                else throw new Error(json.message || "Unknown error");
            } catch (e) { 
                this.updateSyncUI('offline');
                console.warn(`Data Save Sync Failed: ${e.message}`);
            }
        }

        render() {
            const container = document.getElementById('appContainer');
            container.innerHTML = '';

            const roleToggle = document.getElementById('staffRoleToggle');
            const hostBtn = document.getElementById('btnHost');
            if (roleToggle) roleToggle.style.display = 'flex';
            if (hostBtn) hostBtn.style.display = this.role === 'host' ? 'inline-flex' : 'none';

            // Buttons UI state
            document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
            const effectiveRole = this.role === 'host' ? this.hostDashboardRole : this.role;
            if(effectiveRole === 'host' && hostBtn) hostBtn.classList.add('active');
            if(effectiveRole === 'staff') document.getElementById('btnStaff').classList.add('active');
            if(effectiveRole === 'management') document.getElementById('btnMgmt').classList.add('active');
            if(effectiveRole === 'chairman') document.getElementById('btnChair').classList.add('active');

            if (effectiveRole === 'host') this.renderHostDashboard(container);
            else if (effectiveRole === 'chairman') this.renderChairmanDashboard(container);
            else if (effectiveRole === 'management') this.renderManagementView(container);
            else this.renderStaffView(container);
            
            refreshFloatingLabels(container);
            this.setupPinEnter();
        }

        // --- NEW HOST & GUEST LOGIC ---
        
        loginHost(identifier, pass) {
            const normalized = (identifier || '').trim().toLowerCase();
            const host = this.hosts.find(h =>
                (((h.email || '').toLowerCase() === normalized) || ((h.phone || '') === identifier.trim())) &&
                h.password === pass
            );
            if(host) {
                this.role = 'host';
                this.hostDashboardRole = 'host';
                this.currentHostEmail = host.email;
                this.currentUser = { name: host.name, role: 'host', id: host.email, email: host.email };
                this.showNotification(`Welcome back, ${host.name}`, "success");
                switchView('portal');
            } else {
                this.showNotification("Invalid host credentials", "error");
            }
        }
        
        loginStaff(identifier, pin) {
            const normalizedId = (identifier || '').trim().toLowerCase();
            const member = this.teamMembers.find(teamMember =>
                (teamMember.staffId || '').toLowerCase() === normalizedId ||
                (teamMember.email || '').toLowerCase() === normalizedId
            );

            if (!member || member.pin !== pin) {
                this.showNotification("Invalid team access credentials", "error");
                return;
            }

            this.role = member.role;
            this.currentHostEmail = null;
            this.currentUser = { name: member.name, role: member.role, id: member.staffId, email: member.email || '' };
            this.showNotification(`${member.name} signed in as ${member.role}`, "success");
            switchView('portal');
        }

        registerNewHost(name, email, phone, pass) {
            if(this.hosts.find(h => h.email === email)) {
                this.showNotification("Email already registered.", "error"); return;
            }
            this.hosts.push({ name, email, phone, password: pass });
            
            this.role = 'host';
            this.hostDashboardRole = 'host';
            this.currentHostEmail = email;
            this.currentUser = { name, role: 'host', id: email, email };
            this.saveLocalData();
            this.showNotification(`Profile created successfully! Welcome to Amada Engine.`, "success");
            switchView('portal');
        }

        renderHostDashboard(container) {
            const myProps = this.inventory.filter(i => i.hostEmail === this.currentHostEmail);
            const occCount = myProps.filter(i => i.status === 'occupied').length;
            const myTeamMembers = this.teamMembers.filter(member => member.createdBy === this.currentHostEmail);
            
            // Estimate earnings from transactions linked to my properties
            const myPropIds = myProps.map(p => p.id);
            const earnings = this.transactions
                .filter(t => myPropIds.includes(t.propId))
                .reduce((sum, t) => sum + t.amount, 0);

            container.innerHTML = `
                <div style="animation: fadeIn 0.5s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; flex-wrap:wrap; gap:15px;">
                        <h2 style="font-family:var(--font-heading); margin:0;">My Property Portfolio</h2>
                        <div style="display:flex; gap:15px; align-items:center;">
                            <div style="display: flex; gap: 5px; background: white; padding: 5px; border-radius: 30px; box-shadow: var(--shadow-sm);">
                                <button class="${this.hostViewMode === 'grid' ? 'btn-primary' : 'btn-outline'}" onclick="app.setHostViewMode('grid')" style="padding: 8px 15px; border-radius: 25px; border: none; font-size:0.85rem;"><i class="fa-solid fa-border-all"></i></button>
                                <button class="${this.hostViewMode === 'list' ? 'btn-primary' : 'btn-outline'}" onclick="app.setHostViewMode('list')" style="padding: 8px 15px; border-radius: 25px; border: none; font-size:0.85rem;"><i class="fa-solid fa-list"></i></button>
                            </div>
                            <button class="btn-primary" onclick="if(window.app) window.app.openAddPropertyModal()">
                                <i class="fa-solid fa-plus"></i> Add New Property
                            </button>
                        </div>
                    </div>
                    
                    <div class="kpi-grid">
                        <div class="kpi-card highlight">
                            <div class="kpi-value">${myProps.length}</div>
                            <div style="color:var(--gray); font-weight:600; font-size:0.9rem;">Total Listed Properties</div>
                        </div>
                        <div class="kpi-card warning">
                            <div class="kpi-value">${occCount} / ${myProps.length}</div>
                            <div style="color:var(--gray); font-weight:600; font-size:0.9rem;">Currently Occupied</div>
                        </div>
                        <div class="kpi-card success">
                            <div class="kpi-value">${this.formatCurrency(earnings)}</div>
                            <div style="color:var(--gray); font-weight:600; font-size:0.9rem;">Total Revenue Generated</div>
                        </div>
                    </div>
                    
                    <div class="cards-grid ${this.hostViewMode === 'list' ? 'list-view' : ''}" id="hostPropsGrid"></div>

                    <div class="panel" style="margin-top:30px;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap; margin-bottom:20px;">
                            <div>
                                <h3 style="margin:0 0 6px 0;"><i class="fa-solid fa-users-gear" style="color:var(--primary)"></i> Team Access Control</h3>
                                <p style="margin:0; color:var(--gray);">Create staff, management, and chairman accounts, then switch into those dashboards from the top role selector.</p>
                            </div>
                        </div>
                        <form id="teamMemberForm" onsubmit="event.preventDefault(); app.addTeamMember();" style="margin-bottom:24px;">
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                                <div class="input-floating"><input type="text" id="teamMemberName" required><label>Full Name</label></div>
                                <div class="input-floating">
                                    <select id="teamMemberRole" onchange="app.refreshTeamMemberStaffId()" required>
                                        <option value="staff">Staff</option>
                                        <option value="management">Management</option>
                                        <option value="chairman">Chairman</option>
                                    </select>
                                    <label style="top:5px; font-size:0.7rem;">Position</label>
                                </div>
                                <div class="input-floating"><input type="text" id="teamMemberStaffId" readonly required><label>Staff ID</label></div>
                                <div class="input-floating"><input type="email" id="teamMemberEmail"><label>Email (Optional)</label></div>
                                <div class="input-floating"><input type="password" id="teamMemberPin" required><label>Access PIN</label></div>
                            </div>
                            <button class="btn-primary" style="margin-top:10px; justify-content:center;">
                                <i class="fa-solid fa-user-plus"></i> Add Team Access
                            </button>
                        </form>
                        <div style="background:#fff; border:1px solid #eee; border-radius:16px; overflow:hidden;">
                            ${myTeamMembers.length === 0 ? `<div style="padding:24px; color:var(--gray);">No team members added yet.</div>` : myTeamMembers.map(member => `
                                <div style="display:flex; justify-content:space-between; gap:16px; align-items:center; padding:18px 20px; border-bottom:1px solid #eee;">
                                    <div>
                                        <div style="font-weight:700;">${member.name}</div>
                                        <div style="font-size:0.84rem; color:var(--gray);">${member.role.toUpperCase()} • ${member.staffId}${member.email ? ` • ${member.email}` : ''}</div>
                                    </div>
                                    <button class="btn-outline" onclick="app.removeTeamMember('${member.id}')" style="border-color:var(--danger); color:var(--danger);">
                                        <i class="fa-solid fa-trash"></i> Remove
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            this.refreshTeamMemberStaffId();
            
            const grid = document.getElementById('hostPropsGrid');
            if(myProps.length === 0) {
                grid.innerHTML = "<div style='grid-column: 1/-1; text-align:center; padding:40px; color:var(--gray);'>You haven't listed any properties yet.</div>";
            } else {
                myProps.forEach(p => grid.appendChild(this.createCard(p, false, true))); // true = isHostMode
            }
        }
        
        openAddPropertyModal() {
            document.getElementById('addPropertyModal').style.display = 'flex';
            setTimeout(() => {
                document.getElementById('addPropertyModal').classList.add('show');
                this.initAddPropMap();
            }, 10);
        }

        addTeamMember() {
            const name = document.getElementById('teamMemberName').value.trim();
            const role = document.getElementById('teamMemberRole').value;
            const staffId = document.getElementById('teamMemberStaffId').value.trim();
            const email = document.getElementById('teamMemberEmail').value.trim();
            const pin = document.getElementById('teamMemberPin').value.trim();

            if (!name || !role || !staffId || !pin) {
                this.showNotification("Complete the team access form before saving.", "error");
                return;
            }

            const duplicate = this.teamMembers.find(member =>
                member.staffId.toLowerCase() === staffId.toLowerCase() ||
                (email && member.email && member.email.toLowerCase() === email.toLowerCase())
            );
            if (duplicate) {
                this.showNotification("That staff ID or email already has access.", "error");
                return;
            }

            this.teamMembers.push({
                id: `team_${Date.now()}`,
                name,
                role,
                staffId,
                email,
                pin,
                createdBy: this.currentHostEmail
            });

            this.saveLocalData();
            document.getElementById('teamMemberForm').reset();
            this.refreshTeamMemberStaffId();
            this.showNotification(`${name} added as ${role}.`, "success");
        }

        removeTeamMember(id) {
            this.teamMembers = this.teamMembers.filter(member => member.id !== id);
            this.saveLocalData();
            this.showNotification("Team access removed.", "info");
        }

        refreshTeamMemberStaffId() {
            const role = document.getElementById('teamMemberRole')?.value || 'staff';
            const input = document.getElementById('teamMemberStaffId');
            if (!input) return;

            const prefixMap = {
                staff: 'ops',
                management: 'mgmt',
                chairman: 'chair'
            };
            const prefix = prefixMap[role] || 'team';
            const existingNumbers = this.teamMembers
                .map(member => member.staffId || '')
                .filter(id => id.startsWith(`${prefix}-`))
                .map(id => parseInt(id.split('-')[1], 10))
                .filter(num => !isNaN(num));
            const nextNumber = (existingNumbers.length ? Math.max(...existingNumbers) : 0) + 1;
            input.value = `${prefix}-${String(nextNumber).padStart(3, '0')}`;
            refreshFloatingLabels();
        }

        initAddPropMap() {
            if (!document.getElementById('addPropMapArea')) return;
            
            // Default center of Abuja
            let startLat = 9.0765;
            let startLng = 7.3986;

            if (!this.addPropMapInstance) {
                this.addPropMapInstance = L.map('addPropMapArea').setView([startLat, startLng], 12);
                this.addBaseTileLayer(this.addPropMapInstance);

                const pinIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41]
                });

                this.addPropMarker = L.marker([startLat, startLng], { icon: pinIcon, draggable: true }).addTo(this.addPropMapInstance);
                
                // Update hidden fields on drag
                this.addPropMarker.on('dragend', (e) => {
                    const pos = e.target.getLatLng();
                    document.getElementById('newPropLat').value = pos.lat;
                    document.getElementById('newPropLng').value = pos.lng;
                });

                // Move marker on map click
                this.addPropMapInstance.on('click', (e) => {
                    this.addPropMarker.setLatLng(e.latlng);
                    document.getElementById('newPropLat').value = e.latlng.lat;
                    document.getElementById('newPropLng').value = e.latlng.lng;
                });
            }
            
            // Set defaults in hidden inputs
            document.getElementById('newPropLat').value = startLat;
            document.getElementById('newPropLng').value = startLng;

            // Invalidate size to fix rendering bug inside modals
            setTimeout(() => this.addPropMapInstance.invalidateSize(), 300);
        }
        
        initEditPropMap(lat, lng) {
            if (!document.getElementById('editPropMapArea')) return;

            if (!this.editPropMapInstance) {
                this.editPropMapInstance = L.map('editPropMapArea').setView([lat, lng], 14);
                this.addBaseTileLayer(this.editPropMapInstance);

                const pinIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41]
                });

                this.editPropMarker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(this.editPropMapInstance);
                
                this.editPropMarker.on('dragend', (e) => {
                    const pos = e.target.getLatLng();
                    document.getElementById('editPropLat').value = pos.lat;
                    document.getElementById('editPropLng').value = pos.lng;
                });

                this.editPropMapInstance.on('click', (e) => {
                    this.editPropMarker.setLatLng(e.latlng);
                    document.getElementById('editPropLat').value = e.latlng.lat;
                    document.getElementById('editPropLng').value = e.latlng.lng;
                });
            } else {
                this.editPropMapInstance.setView([lat, lng], 14);
                this.editPropMarker.setLatLng([lat, lng]);
            }
            
            document.getElementById('editPropLat').value = lat;
            document.getElementById('editPropLng').value = lng;
            setTimeout(() => this.editPropMapInstance.invalidateSize(), 300);
        }

        updatePropMapArea(locName, mapInstStr, markerStr, latId, lngId) {
            const mapInstance = this[mapInstStr];
            const marker = this[markerStr];
            if(!mapInstance || !marker) return;
            
            const areaCoords = {
                'Katampe': { lat: 9.1294, lng: 7.4296 },
                'Jahi': { lat: 9.1035, lng: 7.4255 },
                'Gwarinpa': { lat: 9.1061, lng: 7.3778 },
                'Asokoro': { lat: 9.0395, lng: 7.5133 },
                'Maitama': { lat: 9.0833, lng: 7.4950 },
                'Wuse': { lat: 9.0765, lng: 7.4667 },
                'Wuse Zone 1-8': { lat: 9.0667, lng: 7.4600 },
                'Area 1-11': { lat: 9.0400, lng: 7.4700 },
                'CBD': { lat: 9.0550, lng: 7.4900 },
                'Apo': { lat: 8.9833, lng: 7.4950 },
                'Gudu': { lat: 9.0000, lng: 7.4833 }
            };

            if (areaCoords[locName]) {
                const c = areaCoords[locName];
                mapInstance.setView([c.lat, c.lng], 14);
                marker.setLatLng([c.lat, c.lng]);
                document.getElementById(latId).value = c.lat;
                document.getElementById(lngId).value = c.lng;
            }
        }

        useCurrentLocation(mapInstStr, markerStr, latId, lngId) {
            if ("geolocation" in navigator) {
                // Determine which button to animate based on context
                const modalId = latId === 'newPropLat' ? '#addPropertyModal' : '#editPropertyModal';
                const btn = document.querySelector(`${modalId} .btn-outline`);
                const origHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Locating...';
                
                navigator.geolocation.getCurrentPosition((position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    const mapInstance = this[mapInstStr];
                    const marker = this[markerStr];
                    
                    if (mapInstance && marker) {
                        mapInstance.setView([lat, lng], 16);
                        marker.setLatLng([lat, lng]);
                    }
                    
                    document.getElementById(latId).value = lat;
                    document.getElementById(lngId).value = lng;
                    
                    this.showNotification("Location acquired!", "success");
                    btn.innerHTML = '<i class="fa-solid fa-check" style="color:var(--success)"></i> Acquired';
                    setTimeout(() => btn.innerHTML = origHtml, 2000);
                }, (error) => {
                    console.warn(error);
                    this.showNotification("Could not access GPS. Please check browser permissions.", "error");
                    btn.innerHTML = origHtml;
                }, { timeout: 10000 });
            } else {
                this.showNotification("Geolocation is not supported by your browser.", "error");
            }
        }

        // Helper to resize images to prevent breaking localStorage
        resizeImage(file) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (e) => {
                    const img = new Image();
                    img.src = e.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const MAX_WIDTH = 800; // Constrain width for performance
                        const scaleSize = MAX_WIDTH / img.width;
                        canvas.width = MAX_WIDTH;
                        canvas.height = img.height * scaleSize;
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        resolve(canvas.toDataURL('image/jpeg', 0.6)); // Compress to 60% jpeg
                    }
                }
            });
        }

        async addNewProperty() {
            const name = document.getElementById('newPropName').value;
            const loc = document.getElementById('newPropLoc').value;
            const type = document.getElementById('newPropType').value;
            const price = this.parseCurrencyValue(document.getElementById('newPropPrice').value);
            const lat = parseFloat(document.getElementById('newPropLat').value);
            const lng = parseFloat(document.getElementById('newPropLng').value);
            
            const btn = document.getElementById('btnListPropSubmit');
            const origHtml = btn.innerHTML;

            if(!name || !loc || !type || isNaN(price) || isNaN(lat) || isNaN(lng)) {
                this.showNotification("Please fill all required fields and select a map location.", "error");
                return;
            }

            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing Listing...';
            btn.disabled = true;

            // 1. Gather Amenities
            const checkedBoxes = document.querySelectorAll('#newPropAmenities input:checked');
            let selectedAmenities = Array.from(checkedBoxes).map(cb => {
                const parts = cb.value.split('|');
                return { icon: parts[0], text: parts[1] };
            });

            // 2. Process Images (Resize & Base64)
            const fileInput = document.getElementById('newPropImages');
            let processedImages = [];
            
            if (fileInput.files && fileInput.files.length > 0) {
                const filesToProcess = Array.from(fileInput.files).slice(0, 5); // Limit to 5
                for (let file of filesToProcess) {
                    try {
                        const base64 = await this.resizeImage(file);
                        processedImages.push(base64);
                    } catch (err) {
                        console.error("Image processing error:", err);
                    }
                }
            }

            // Fallback content if empty
            if (processedImages.length === 0) {
                processedImages = ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];
            }
            if (selectedAmenities.length === 0) {
                selectedAmenities = [{ icon: 'fa-wifi', text: 'High-Speed WiFi' }];
            }

            // 3. Save to System
            this.inventory.push({
                id: `host_${Date.now()}`, loc: loc, name: name, price: price, type: type, status: 'available', hostEmail: this.currentHostEmail,
                images: processedImages, amenities: selectedAmenities, coords: { lat, lng }
            });
            
            this.saveLocalData();
            closeModals();
            this.showNotification(`${name} published successfully!`, "success");
            
            document.getElementById('addPropForm').reset();
            btn.innerHTML = origHtml;
            btn.disabled = false;
        }
        
        // --- HOST PROPERTY EDIT & DELETE LOGIC ---
        openEditProperty(id) {
            const prop = this.inventory.find(i => i.id === id);
            if(!prop) return;

            document.getElementById('editPropForm').reset();
            document.getElementById('editPropId').value = prop.id;
            document.getElementById('editPropName').value = prop.name;
            document.getElementById('editPropLoc').value = prop.loc;
            document.getElementById('editPropType').value = prop.type;
            this.setCurrencyInputValue('editPropPrice', prop.price);
            document.getElementById('editPropImages').value = '';
            
            // Check amenities
            const normalizedAmenities = this.normalizeAmenities(prop.amenities);
            const propAmenityTexts = normalizedAmenities.map(a => a.text);
            document.querySelectorAll('#editPropAmenities input[type="checkbox"]').forEach(cb => {
                const text = cb.value.split('|')[1];
                cb.checked = propAmenityTexts.includes(text);
            });
            
            document.getElementById('editPropertyModal').style.display = 'flex';
            setTimeout(() => {
                document.getElementById('editPropertyModal').classList.add('show');
                const coords = prop.coords || { lat: 9.0765, lng: 7.3986 };
                let validLat = parseFloat(coords.lat);
                let validLng = parseFloat(coords.lng);
                if (isNaN(validLat) || isNaN(validLng)) {
                    validLat = 9.0765;
                    validLng = 7.3986;
                }
                this.initEditPropMap(validLat, validLng);
            }, 10);
        }
        
        async updateProperty() {
            const id = document.getElementById('editPropId').value;
            const propIndex = this.inventory.findIndex(i => i.id === id);
            if(propIndex === -1) return;
            
            const btn = document.getElementById('btnUpdatePropSubmit');
            const origHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Updating...';
            btn.disabled = true;
            
            // Gather Amenities
            const checkedBoxes = document.querySelectorAll('#editPropAmenities input:checked');
            const selectedAmenities = Array.from(checkedBoxes).map(cb => {
                const parts = cb.value.split('|');
                return { icon: parts[0], text: parts[1] };
            });

            this.inventory[propIndex].name = document.getElementById('editPropName').value;
            this.inventory[propIndex].loc = document.getElementById('editPropLoc').value;
            this.inventory[propIndex].type = document.getElementById('editPropType').value;
            this.inventory[propIndex].price = this.parseCurrencyValue(document.getElementById('editPropPrice').value);
            this.inventory[propIndex].coords = {
                lat: parseFloat(document.getElementById('editPropLat').value),
                lng: parseFloat(document.getElementById('editPropLng').value)
            };
            this.inventory[propIndex].amenities = selectedAmenities;

            const fileInput = document.getElementById('editPropImages');
            if (fileInput.files && fileInput.files.length > 0) {
                const processedImages = [];
                const filesToProcess = Array.from(fileInput.files).slice(0, 5);
                for (let file of filesToProcess) {
                    try {
                        const base64 = await this.resizeImage(file);
                        processedImages.push(base64);
                    } catch (err) {
                        console.error("Image processing error:", err);
                    }
                }
                if (processedImages.length > 0) {
                    this.inventory[propIndex].images = processedImages;
                }
            }
            
            this.saveLocalData();
            closeModals();
            this.showNotification("Property updated successfully!", "success");
            
            btn.innerHTML = origHtml;
            btn.disabled = false;
        }

        deleteProperty(id) {
            if(confirm("Are you sure you want to completely delete this listing? This action cannot be undone.")) {
                this.inventory = this.inventory.filter(i => i.id !== id);
                this.saveLocalData();
                this.showNotification("Property deleted.", "info");
            }
        }

        // --- GUEST SEARCH & DISPLAY ---
        updateGuestSearch(v) {
            this.guestSearchQuery = v;
            this.renderGuestGrid();
            if (this.guestViewMode === 'map') {
                this.initGuestMap();
            }
        }

        toggleGuestView(mode) {
            this.guestViewMode = mode;
            
            const btnGrid = document.getElementById('btnGuestGrid');
            const btnList = document.getElementById('btnGuestList');
            const btnMap = document.getElementById('btnGuestMap');
            
            if(btnGrid) btnGrid.className = mode === 'grid' ? 'btn-primary' : 'btn-outline';
            if(btnList) btnList.className = mode === 'list' ? 'btn-primary' : 'btn-outline';
            if(btnMap) btnMap.className = mode === 'map' ? 'btn-primary' : 'btn-outline';
            
            if(mode === 'grid' || mode === 'list') {
                document.getElementById('guestGridArea').style.display = 'block';
                document.getElementById('guestMapArea').style.display = 'none';
                this.renderGuestGrid(); // re-render to apply classes
            } else {
                document.getElementById('guestGridArea').style.display = 'none';
                document.getElementById('guestMapArea').style.display = 'block';
                setTimeout(() => this.initGuestMap(), 100);
            }
        }

        initGuestMap() {
            if (!document.getElementById('guestMapArea')) return;
            
            if (!this.guestMapInstance) {
                this.guestMapInstance = L.map('guestMapArea', { zoomControl: true }).setView([9.11648, 7.4037915], 13);
                this.addBaseTileLayer(this.guestMapInstance);
            }
            
            // Clear existing markers
            if (this.guestMarkers) {
                this.guestMarkers.forEach(m => m.remove());
            }
            this.guestMarkers = [];

            const redIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
            });

            // Filter available properties
            let data = this.inventory.filter(i => i.status === 'available');
            if(this.guestSearchQuery) {
                const q = this.guestSearchQuery.toLowerCase();
                data = data.filter(i => i.name.toLowerCase().includes(q) || i.loc.toLowerCase().includes(q));
            }

            // Group by coordinates with a slight offset to prevent overlapping markers
            data.forEach(p => {
                if(p.coords && !isNaN(parseFloat(p.coords.lat)) && !isNaN(parseFloat(p.coords.lng))) {
                    const jitterLat = parseFloat(p.coords.lat) + (Math.random() - 0.5) * 0.001;
                    const jitterLng = parseFloat(p.coords.lng) + (Math.random() - 0.5) * 0.001;

                    const marker = L.marker([jitterLat, jitterLng], {icon: redIcon}).addTo(this.guestMapInstance);
                    marker.bindPopup(`
                        <div style="text-align:center; min-width: 150px;">
                            <strong style="display:block; margin-bottom: 5px; color: var(--dark); font-size:1.05rem;">${p.name}</strong>
                            <div style="color: var(--primary); font-weight: bold; margin-bottom: 10px;">${this.formatCurrency(p.price)}<span style="font-size:0.8rem; color:var(--gray); font-weight:normal;">/night</span></div>
                            <button class="btn-primary" style="width: 100%; padding: 8px; justify-content: center; font-size: 0.85rem;" onclick="app.openPropertyDetails('${p.id}', true)">View & Book</button>
                        </div>
                    `);
                    this.guestMarkers.push(marker);
                }
            });

            this.guestMapInstance.invalidateSize();
        }

        renderGuestGrid() {
            const targetDiv = document.getElementById('guestGridArea');
            if(!targetDiv) return;
            
            // Only show available properties to guests
            let data = this.inventory.filter(i => i.status === 'available');
            
            if(this.guestSearchQuery) {
                const q = this.guestSearchQuery.toLowerCase();
                data = data.filter(i => i.name.toLowerCase().includes(q) || i.loc.toLowerCase().includes(q));
            }
            
            targetDiv.innerHTML = '';
            if(data.length === 0) {
                targetDiv.innerHTML = "<div style='padding:60px; text-align:center; color:#999;'><i class='fa-solid fa-house-circle-xmark' style='font-size:4rem; margin-bottom:15px; opacity:0.5;'></i><br><h2>No available stays found.</h2><p>Try adjusting your search criteria.</p></div>";
                return;
            }

            const grid = document.createElement('div');
            grid.className = this.guestViewMode === 'list' ? 'cards-grid list-view' : 'cards-grid';
            
            data.forEach(p => {
                const card = this.createCard(p, true); // true = guest mode
                grid.appendChild(card);
            });
            targetDiv.appendChild(grid);
        }

        // ... [The rest of the rendering logic remains functionally identical, optimized to use the new CSS variables] ...
        renderStaffView(container) {
            container.innerHTML = `
                <div style="animation: fadeIn 0.5s ease;">
                    <div class="mgmt-tabs">
                        <div class="mgmt-tab ${this.activeStaffTab === 'ops' ? 'active' : ''}" onclick="app.setStaffTab('ops')"><i class="fa-solid fa-calendar-check"></i> Booking Grid</div>
                        <div class="mgmt-tab ${this.activeStaffTab === 'expense' ? 'active' : ''}" onclick="app.setStaffTab('expense')"><i class="fa-solid fa-file-circle-plus"></i> Submit Expenditure</div>
                        <div class="mgmt-tab ${this.activeStaffTab === 'income' ? 'active' : ''}" onclick="app.setStaffTab('income')"><i class="fa-solid fa-cash-register"></i> Other Income</div>
                        <div class="mgmt-tab ${this.activeStaffTab === 'map' ? 'active' : ''}" onclick="app.setStaffTab('map')"><i class="fa-solid fa-map"></i> Property Map</div>
                    </div>
                    
                    ${this.activeStaffTab === 'ops' ? `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:15px;">
                            <div class="input-floating" style="max-width: 400px; width:100%; margin:0;">
                                <input type="text" placeholder=" " onkeyup="app.updateSearch(this.value)" id="searchInput">
                                <label><i class="fa-solid fa-magnifying-glass"></i> Search guests or units...</label>
                            </div>
                            <div style="display: flex; gap: 5px; background: white; padding: 5px; border-radius: 30px; box-shadow: var(--shadow-sm);">
                                <button class="${this.staffViewMode === 'grid' ? 'btn-primary' : 'btn-outline'}" onclick="app.setStaffViewMode('grid')" style="padding: 8px 20px; border-radius: 25px; border: none;"><i class="fa-solid fa-border-all"></i> Grid</button>
                                <button class="${this.staffViewMode === 'list' ? 'btn-primary' : 'btn-outline'}" onclick="app.setStaffViewMode('list')" style="padding: 8px 20px; border-radius: 25px; border: none;"><i class="fa-solid fa-list"></i> List</button>
                            </div>
                        </div>
                        <div id="gridArea"></div>` 
                    : this.activeStaffTab === 'expense' ? this.renderStaffExpenseTab()
                    : this.activeStaffTab === 'income' ? this.renderStaffIncomeTab()
                    : this.activeStaffTab === 'map' ? this.renderMapTab()
                    : this.renderMapTab()}
                </div>`;
            if(this.activeStaffTab === 'ops') this.renderFilteredGrid(document.getElementById('gridArea'));
        }

        renderFilteredGrid(targetDiv) {
            let data = this.inventory;
            if(this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                data = data.filter(i => i.name.toLowerCase().includes(q) || i.loc.toLowerCase().includes(q) || (i.guestName && i.guestName.toLowerCase().includes(q)));
            }
            const locations = [...new Set(data.map(i => i.loc))];
            targetDiv.innerHTML = '';
            
            if(locations.length === 0) {
                targetDiv.innerHTML = "<div style='padding:40px; text-align:center; color:#999;'><i class='fa-solid fa-ghost' style='font-size:3rem; margin-bottom:15px;'></i><br>No units found.</div>";
                return;
            }

            locations.forEach(loc => {
                const section = document.createElement('div');
                section.style.marginBottom = "50px";
                section.innerHTML = `<h2 style="font-family:var(--font-heading); margin-bottom:20px; border-bottom:2px solid #ddd; padding-bottom:10px;"><i class="fa-solid fa-location-dot" style="color:var(--primary)"></i> ${loc}</h2><div class="cards-grid"></div>`;
                const grid = section.querySelector('.cards-grid');
                
                if (this.staffViewMode === 'list') grid.classList.add('list-view');

                data.filter(i => i.loc === loc).forEach(p => grid.appendChild(this.createCard(p)));
                targetDiv.appendChild(section);
            });
        }
        
        // --- VIEW MODE TOGGLES ---
        setStaffViewMode(mode) {
            this.staffViewMode = mode;
            this.render();
        }
        
        setHostViewMode(mode) {
            this.hostViewMode = mode;
            this.render();
        }

        // --- IMAGE CAROUSEL LOGIC ---
        slideCarousel(e, direction) {
            e.stopPropagation(); // Prevent opening modal when clicking slider arrows
            const track = e.target.closest('.carousel-wrapper').querySelector('.carousel-track');
            const scrollAmount = track.offsetWidth;
            track.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
        }

        createCard(prop, isGuestMode = false, isHostMode = false) {
            const isOcc = prop.status === 'occupied';
            const div = document.createElement('div');
            div.className = 'property-card';
            div.onclick = () => this.openPropertyDetails(prop.id, isGuestMode);
            
            // Build Carousel robustly
            let images = prop.images || [];
            if (!Array.isArray(images)) images = [images];
            if (images.length === 0) images = ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];
            
            const slidesHtml = images.map(img => `<div class="carousel-slide" style="background-image:url('${img}')"></div>`).join('');
            
            const carouselHtml = `
                <div class="carousel-wrapper">
                    ${images.length > 1 ? `<button class="carousel-btn prev" onclick="app.slideCarousel(event, -1)"><i class="fa-solid fa-chevron-left"></i></button>` : ''}
                    <div class="carousel-track">${slidesHtml}</div>
                    ${images.length > 1 ? `<button class="carousel-btn next" onclick="app.slideCarousel(event, 1)"><i class="fa-solid fa-chevron-right"></i></button>` : ''}
                </div>
            `;

            let btnHtml = '';
            if(isHostMode) {
                btnHtml = `
                    <div style="display:flex; gap:10px; margin-top:15px;">
                        <button class="btn-outline" style="flex:1; padding:12px; font-size:0.9rem;" onclick="event.stopPropagation(); app.openEditProperty('${prop.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="btn-outline" style="flex:1; padding:12px; font-size:0.9rem; border-color:var(--danger); color:var(--danger);" onclick="event.stopPropagation(); app.deleteProperty('${prop.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
                    </div>`;
            } else if(isGuestMode) {
                // FIXED: Passing only prop.id to prevent quote injection from breaking JS
                btnHtml = `<button class="btn-primary" style="width:100%; justify-content:center;" onclick="event.stopPropagation(); app.openBookingModal('guest', '${prop.id}')"><i class="fa-solid fa-calendar-check"></i> Book Now</button>`;
            } else {
                // FIXED: Passing only prop.id to prevent quote injection from breaking JS
                btnHtml = isOcc 
                    ? `<button class="btn-outline" style="width:100%;" onclick="event.stopPropagation(); app.checkout('${prop.id}')"><i class="fa-solid fa-right-from-bracket"></i> Check Out</button>` 
                    : `<button class="btn-primary" style="width:100%; justify-content:center;" onclick="event.stopPropagation(); app.openBookingModal('staff', '${prop.id}')"><i class="fa-solid fa-key"></i> Book & Gen Code</button>`;
            }
            
            div.innerHTML = `
                <div class="status-badge ${isOcc ? 'status-booked' : 'status-avail'}">${isOcc ? 'Occupied' : 'Available'}</div>
                ${carouselHtml}
                <div class="card-content">
                    <div class="prop-name">${prop.name}</div>
                    <div class="prop-loc"><i class="fa-solid fa-map-pin"></i> ${prop.loc}</div>
                    <div class="prop-price">${this.formatCurrency(prop.price)}<span style="font-size:0.9rem; color:var(--gray); font-weight:400;">/night</span></div>
                    ${(isOcc && !isGuestMode && !isHostMode) ? `
                    <div style="margin-bottom:20px; background:var(--light-gray); padding:15px; border-radius:12px; font-size:0.9rem;" onclick="event.stopPropagation()">
                        <i class="fa-solid fa-user" style="color:var(--primary)"></i> <strong>${prop.guestName}</strong><br>
                        ${prop.accessCode ? `<div style="margin-top:10px; font-family:monospace; font-size:1.2rem; font-weight:700; color:var(--dark);"><i class="fa-solid fa-lock"></i> ${prop.accessCode}</div>` : ''}
                    </div>` : '<div style="flex-grow:1;"></div>'} 
                    ${btnHtml}
                </div>`;
            return div;
        }

        // --- PROPERTY DETAILS MODAL ---
        openPropertyDetails(id, isGuestMode) {
            const prop = this.inventory.find(i => i.id === id);
            if(!prop) return;

            // Populate Modal Text
            document.getElementById('pdName').innerText = prop.name;
            document.getElementById('pdLoc').innerText = prop.loc;
            document.getElementById('pdType').innerText = prop.type || 'Luxury Apartment';
            document.getElementById('pdPrice').innerText = this.formatCurrency(prop.price);
            
            // Build Carousel Robustly
            let images = prop.images || [];
            if (!Array.isArray(images)) images = [images];
            if (images.length === 0) images = ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];

            const slidesHtml = images.map(img => `<div class="carousel-slide" style="background-image:url('${img}')"></div>`).join('');
            document.getElementById('pdCarousel').innerHTML = `
                ${images.length > 1 ? `<button class="carousel-btn prev" style="left:20px; width:40px; height:40px;" onclick="app.slideCarousel(event, -1)"><i class="fa-solid fa-chevron-left"></i></button>` : ''}
                <div class="carousel-track">${slidesHtml}</div>
                ${images.length > 1 ? `<button class="carousel-btn next" style="right:20px; width:40px; height:40px;" onclick="app.slideCarousel(event, 1)"><i class="fa-solid fa-chevron-right"></i></button>` : ''}
            `;

            // Build Amenities Robustly
            let amenities = this.normalizeAmenities(prop.amenities);
            
            document.getElementById('pdAmenities').innerHTML = amenities.map(a => 
                `<div class="amenity-tag"><i class="fa-solid ${a.icon || 'fa-check'}" style="color:var(--primary)"></i> ${a.text || ''}</div>`
            ).join('');

            // Setup Action Button
            const bookBtn = document.getElementById('pdBookBtn');
            if (prop.status === 'occupied' && !isGuestMode) {
                bookBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Currently Occupied';
                bookBtn.style.background = 'var(--gray)';
                bookBtn.onclick = null;
                bookBtn.disabled = true;
            } else {
                bookBtn.disabled = false;
                bookBtn.style.background = 'var(--primary)';
                bookBtn.innerHTML = isGuestMode ? '<i class="fa-solid fa-calendar-check"></i> Book This Stay' : '<i class="fa-solid fa-key"></i> Book & Gen Code';
                bookBtn.onclick = () => {
                    this.closeModal();
                    this.openBookingModal(isGuestMode ? 'guest' : 'staff', prop.id);
                };
            }

            // Show Modal
            document.getElementById('propDetailsModal').style.display = 'flex';
            setTimeout(() => {
                document.getElementById('propDetailsModal').classList.add('show');
                // Initialize map after modal is fully visible to prevent Leaflet sizing bugs
                const coords = prop.coords || { lat: 9.0765, lng: 7.3986 };
                this.initDetailsMap(coords, prop.name);
            }, 300); // Wait for transition
        }

        initDetailsMap(coords, title) {
            let validLat = parseFloat(coords.lat);
            let validLng = parseFloat(coords.lng);
            if (isNaN(validLat) || isNaN(validLng)) {
                validLat = 9.0765;
                validLng = 7.3986;
            }

            if (this.detailsMapInstance) {
                this.detailsMapInstance.remove();
            }
            
            this.detailsMapInstance = L.map('detailsMap', { zoomControl: false }).setView([validLat, validLng], 15);
            this.addBaseTileLayer(this.detailsMapInstance);

            const pinIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41]
            });

            L.marker([validLat, validLng], {icon: pinIcon}).addTo(this.detailsMapInstance)
                .bindPopup(`<b>${title}</b>`)
                .openPopup();
                
            // Force leaflet to recalculate size inside the modal
            setTimeout(() => this.detailsMapInstance.invalidateSize(), 100);
        }

        renderMapTab() {
            return `<div class="panel"><h3><i class="fa-solid fa-map" style="color:var(--primary)"></i> Live Unit Map</h3><div id="staffMap" style="height:500px; border-radius:var(--radius-md); margin-top:20px; z-index:1;"></div></div>`;
        }
        
        renderRefundTab() {
            const transactions = this.getFilteredTransactions(this.managementDateFrom, this.managementDateTo, this.managementLocation)
                .slice()
                .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
            const eligibleTransactions = transactions
                .map((tx, index) => {
                    const txId = this.getTransactionId(tx, index);
                    const refunded = this.getRefundedAmountForTransaction(txId);
                    const remaining = Math.max(0, (tx.amount || 0) - refunded);
                    const prop = this.inventory.find(item => item.id === tx.propId);
                    return { ...tx, txId, refunded, remaining, prop };
                })
                .filter(tx => tx.remaining > 0);
            const refundLedger = this.getFilteredRefunds(this.managementDateFrom, this.managementDateTo, this.managementLocation)
                .slice()
                .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

            return `
                <div style="display:grid; grid-template-columns:minmax(320px, 0.95fr) minmax(320px, 1.05fr); gap:24px;">
                    <div>
                        <h3 style="margin-top:0;"><i class="fa-solid fa-rotate-left" style="color:var(--primary)"></i> Process Refund</h3>
                        <p style="color:var(--gray); font-size:0.92rem; margin:6px 0 18px 0;">Select a recorded past booking and refund up to the unpaid balance remaining on that booking.</p>
                        <form id="refundForm" onsubmit="event.preventDefault(); app.processRefund();">
                            <div class="input-floating">
                                <select id="refundTransaction" required onchange="app.syncRefundAmountHint()">
                                    <option value="" disabled selected></option>
                                    ${eligibleTransactions.map(tx => `
                                        <option value="${tx.txId}">
                                            ${tx.guest} • ${tx.prop?.name || tx.propId} • ${tx.date} • Balance ${this.formatCurrency(tx.remaining)}
                                        </option>
                                    `).join('')}
                                </select>
                                <label>Past Booking</label>
                            </div>
                            <div class="input-floating">
                                <input type="text" id="refundAmount" data-currency inputmode="numeric" autocomplete="off" required>
                                <label>Refund Amount (₦)</label>
                            </div>
                            <div id="refundBalanceHint" style="font-size:0.82rem; color:var(--gray); margin:-8px 0 16px 0;">Choose a booking to see the maximum refundable amount.</div>
                            <div class="input-floating">
                                <input type="text" id="refundReason" required>
                                <label>Refund Reason</label>
                            </div>
                            <div style="font-size:0.84rem; color:var(--gray); margin:4px 0 16px 0;">
                                Refund will be processed automatically as
                                <strong>${this.currentUser?.name || 'current management user'}</strong>
                                ${this.currentUser?.id ? `(${this.currentUser.id})` : ''}.
                            </div>
                            <button class="btn-primary" style="width:100%; justify-content:center; margin-top:8px;">
                                <i class="fa-solid fa-money-bill-wave"></i> Record Refund
                            </button>
                        </form>
                    </div>
                    <div>
                        <h3 style="margin-top:0;">Refund Ledger</h3>
                        <p style="color:var(--gray); font-size:0.92rem; margin:6px 0 18px 0;">Every refund is tied back to a booking record for audit and reporting.</p>
                        <div style="background:#fff; border:1px solid #eee; border-radius:16px; max-height:420px; overflow:auto;">
                            ${refundLedger.length === 0 ? `<div style="padding:32px; text-align:center; color:var(--gray);">No refunds recorded for this filter yet.</div>` : refundLedger.map(refund => `
                                <div style="padding:18px 20px; border-bottom:1px solid #eee;">
                                    <div style="display:flex; justify-content:space-between; gap:16px;">
                                        <div>
                                            <div style="font-weight:700;">${refund.guest || 'Guest refund'}</div>
                                            <div style="font-size:0.84rem; color:var(--gray);">${refund.propertyName || refund.propId} • ${refund.date}</div>
                                            <div style="font-size:0.82rem; color:var(--gray); margin-top:6px;">${refund.reason}</div>
                                            <div style="font-size:0.8rem; color:var(--gray); margin-top:6px;">Processed by ${refund.processedBy}</div>
                                        </div>
                                        <strong style="color:var(--danger);">${this.formatCurrency(refund.amount)}</strong>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        renderRaffleTab() {
            const eligible = [...new Set(this.transactions.map(t => t.guest))];
            const occCount = this.inventory.filter(i => i.status === 'occupied').length;
            const totalUnits = this.inventory.length;
            const isFullHouse = occCount === totalUnits && totalUnits > 0;
            const isFriday = new Date().getDay() === 5; // 5 is Friday

            return `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px;">
                <div>
                    <h3 style="color:var(--dark); margin-top:0;"><i class="fa-solid fa-ticket" style="color:var(--warning)"></i> Live Raffle Engine</h3>
                    <p style="color:var(--gray); font-size:0.9rem;">Randomly select a winner from <strong>${eligible.length}</strong> eligible recent guests.</p>
                    
                    <div style="margin: 20px 0; padding: 20px; background: var(--light-gray); border-radius: 12px; border: 1px solid #eee;">
                        <div style="margin-bottom: 15px; font-weight: 700; font-size: 0.95rem; text-transform: uppercase; color: var(--gray);">System Triggers</div>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #ddd; padding-bottom: 10px;">
                                <span><i class="fa-solid fa-calendar-day" style="color:var(--primary); margin-right:8px;"></i> Friday Weekly Draw (100%):</span>
                                <span style="font-weight:700; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; ${isFriday ? 'background: var(--success); color: white;' : 'background: #e0e0e0; color: var(--gray);'}">${isFriday ? 'ACTIVE TODAY' : 'INACTIVE'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span><i class="fa-solid fa-house-circle-check" style="color:var(--warning); margin-right:8px;"></i> Full House Draw (25%):</span>
                                <span style="font-weight:700; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; ${isFullHouse ? 'background: var(--success); color: white;' : 'background: #e0e0e0; color: var(--gray);'}">${occCount}/${totalUnits} OCCUPIED</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background:var(--light-gray); padding:30px 20px; border-radius:var(--radius-lg); text-align:center; margin:30px 0; border:2px dashed #ddd; position:relative; overflow:hidden;">
                        <div id="raffleDisplay" class="winner-display" style="color:var(--gray); opacity:0.5;">Awaiting Spin...</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <button class="btn-primary" style="justify-content:center; padding:15px; font-size:0.95rem; background:var(--dark); opacity: ${isFriday ? '1' : '0.6'};" onclick="app.runRaffle('friday')" id="btnDrawFriday">
                            <i class="fa-solid fa-calendar-check"></i> Friday Draw (100%)
                        </button>
                        <button class="btn-outline" style="justify-content:center; padding:15px; font-size:0.95rem; opacity: ${isFullHouse ? '1' : '0.6'};" onclick="app.runRaffle('fullhouse')" id="btnDrawFull">
                            <i class="fa-solid fa-house-fire"></i> Full House (25%)
                        </button>
                    </div>
                </div>
                <div>
                    <h3 style="margin-top:0;">Hall of Fame</h3>
                    <div style="background:#fff; border:1px solid #eee; border-radius:var(--radius-md); height:300px; overflow-y:auto; padding:10px;">
                        ${this.raffleWinners.length === 0 ? '<div style="padding:40px; text-align:center; color:#aaa;"><i class="fa-solid fa-award" style="font-size:3rem; margin-bottom:10px; color:#eee;"></i><br>No winners drawn yet.</div>' : ''}
                        ${this.raffleWinners.slice().reverse().map(w => `
                            <div style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; animation: fadeIn 0.4s ease;">
                                <div>
                                    <strong style="font-size:1.1rem; color:var(--dark);">${w.guest}</strong><br>
                                    <span style="font-size:0.8rem; color:var(--gray);"><i class="fa-regular fa-calendar"></i> Drawn on ${w.date}</span>
                                </div>
                                <span style="background:rgba(255,180,0,0.1); color:var(--warning); padding:6px 12px; border-radius:20px; font-size:0.8rem; font-weight:700;">
                                    <i class="fa-solid fa-crown"></i> ${w.prize}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
        }
        
        runRaffle(type) {
            if(this.transactions.length === 0) return this.showNotification("No eligible guests found in logs. Secure bookings first.", "error");

            const occCount = this.inventory.filter(i => i.status === 'occupied').length;
            const totalUnits = this.inventory.length;
            const isFullHouse = occCount === totalUnits && totalUnits > 0;
            const isFriday = new Date().getDay() === 5;

            // Allow bypass for testing, but warn the staff if conditions aren't met
            if (type === 'friday' && !isFriday && !confirm("Today is not Friday. Run the weekly draw anyway?")) return;
            if (type === 'fullhouse' && !isFullHouse && !confirm(`Occupancy is only ${occCount}/${totalUnits}. Run the Full House draw anyway?`)) return;

            const btnFriday = document.getElementById('btnDrawFriday');
            const btnFull = document.getElementById('btnDrawFull');
            const display = document.getElementById('raffleDisplay');
            
            btnFriday.disabled = true;
            btnFull.disabled = true;
            btnFriday.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Spinning...';
            btnFull.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Spinning...';
            display.style.opacity = '1';

            const eligibleGuests = [...new Set(this.transactions.map(t => t.guest))];
            let ticks = 0;
            
            // Visual spinning effect
            const interval = setInterval(() => {
                display.innerText = eligibleGuests[Math.floor(Math.random() * eligibleGuests.length)];
                display.style.color = 'var(--dark)';
                ticks++;
                if(ticks > 20) {
                    clearInterval(interval);
                    // Pick a random transaction for the actual win to get the refund amount
                    const winningTx = this.transactions[Math.floor(Math.random() * this.transactions.length)];
                    const winner = winningTx.guest;
                    
                    let prizeText = '';
                    if (type === 'friday') {
                        prizeText = `100% Refund (${this.formatCurrency(winningTx.amount)})`;
                    } else {
                        prizeText = `25% Off (${this.formatCurrency(winningTx.amount * 0.25)})`;
                    }
                    
                    display.innerHTML = `<span style="color:var(--primary); font-size:2.5rem; animation: pulse 1s infinite;">🎉 ${winner} 🎉</span>`;
                    
                    // Save the winner
                    this.raffleWinners.push({ date: new Date().toISOString().split('T')[0], guest: winner, prize: prizeText });
                    this.saveLocalData();
                    
                    this.showNotification(`${winner} has won the ${type === 'friday' ? 'Friday 100%' : 'Full House 25%'} Draw!`, "success");
                    
                    setTimeout(() => {
                        this.render(); // Re-render to update the Hall of Fame list & buttons
                    }, 3500);
                }
            }, 100);
        }

        syncRefundAmountHint() {
            const select = document.getElementById('refundTransaction');
            const hint = document.getElementById('refundBalanceHint');
            const amountInput = document.getElementById('refundAmount');
            if (!select || !hint || !amountInput) return;

            const transactions = this.getFilteredTransactions(this.managementDateFrom, this.managementDateTo, this.managementLocation);
            const selected = transactions
                .map((tx, index) => {
                    const txId = this.getTransactionId(tx, index);
                    return {
                        ...tx,
                        txId,
                        remaining: Math.max(0, (tx.amount || 0) - this.getRefundedAmountForTransaction(txId))
                    };
                })
                .find(tx => tx.txId === select.value);

            if (!selected) {
                hint.innerText = 'Choose a booking to see the maximum refundable amount.';
                return;
            }

            hint.innerText = `Maximum refundable balance: ${this.formatCurrency(selected.remaining)}`;
            this.setCurrencyInputValue('refundAmount', selected.remaining);
        }

        processRefund() {
            const transactionId = document.getElementById('refundTransaction')?.value;
            const amount = this.parseCurrencyValue(document.getElementById('refundAmount')?.value);
            const reason = document.getElementById('refundReason')?.value.trim();
            const actor = this.getActiveSessionSecurityContext();
            const processedBy = actor?.name?.trim();
            const processedById = actor?.id?.trim();
            const pin = actor?.pin?.trim();

            const transactions = this.getFilteredTransactions(this.managementDateFrom, this.managementDateTo, this.managementLocation);
            const selected = transactions
                .map((tx, index) => {
                    const txId = this.getTransactionId(tx, index);
                    return {
                        ...tx,
                        txId,
                        remaining: Math.max(0, (tx.amount || 0) - this.getRefundedAmountForTransaction(txId))
                    };
                })
                .find(tx => tx.txId === transactionId);

            if (!selected || isNaN(amount) || amount <= 0 || !reason || !processedBy || !pin) {
                this.showNotification("Complete the refund form using a valid past booking.", "error");
                return;
            }

            if (this.role !== 'management' && !(this.role === 'host' && this.hostDashboardRole === 'management')) {
                this.showNotification("Only management can process refunds.", "error");
                return;
            }

            if (amount > selected.remaining) {
                this.showNotification(`Refund cannot exceed ${this.formatCurrency(selected.remaining)} for this booking.`, "error");
                return;
            }

            const prop = this.inventory.find(item => item.id === selected.propId);
            this.refunds.push({
                id: `refund_${Date.now()}`,
                transactionId,
                propId: selected.propId,
                propertyName: prop?.name || selected.propId,
                guest: selected.guest,
                amount,
                reason,
                processedBy,
                processedById,
                pin,
                date: new Date().toISOString().split('T')[0]
            });

            this.saveLocalData();
            document.getElementById('refundForm')?.reset();
            const hint = document.getElementById('refundBalanceHint');
            if (hint) hint.innerText = 'Choose a booking to see the maximum refundable amount.';
            this.showNotification("Refund recorded successfully.", "success");
            this.render();
        }

        getTransactionReceiptData(tx) {
            const prop = this.inventory.find(item => item.id === tx.propId);
            return {
                receiptNumber: tx.id || this.getTransactionId(tx),
                guest: tx.guest,
                property: prop?.name || tx.propId,
                location: prop?.loc || '',
                checkIn: tx.checkIn || '',
                checkOut: tx.checkOut || '',
                total: tx.amount || 0,
                code: tx.accessCode || '',
                phone: tx.phone || '',
                email: tx.email || '',
                date: tx.date || ''
            };
        }

        buildReceiptHtml(data) {
            return `
                <html>
                <head>
                    <title>Amada Receipt</title>
                    <style>
                        body { font-family: 'Poppins', Arial, sans-serif; background:#f5f5f5; padding:24px; color:#1a1a1a; }
                        .sheet { max-width:760px; margin:0 auto; background:#fff; border-radius:24px; padding:32px; box-shadow:0 20px 50px rgba(0,0,0,0.08); }
                        .brand { color:#ff385c; font-size:30px; font-weight:700; }
                        .sub { color:#666; margin-top:4px; }
                        .hero { display:flex; justify-content:space-between; gap:20px; margin-bottom:24px; }
                        .pill { background:#fff0f3; color:#ff385c; border-radius:999px; padding:8px 14px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; }
                        .box { background:#fafafa; border:1px solid #eee; border-radius:18px; padding:18px; margin-bottom:18px; }
                        .row { display:flex; justify-content:space-between; gap:16px; margin-bottom:14px; }
                        .label { font-size:12px; color:#777; text-transform:uppercase; font-weight:700; }
                        .value { font-size:18px; font-weight:700; margin-top:4px; }
                        .code { background:#1a1a1a; color:#ffd700; padding:20px; border-radius:18px; text-align:center; font-family:monospace; font-size:32px; font-weight:700; letter-spacing:8px; }
                        @media print { body { background:#fff; padding:0; } .sheet { box-shadow:none; border-radius:0; } }
                    </style>
                </head>
                <body>
                    <div class="sheet">
                        <div class="hero">
                            <div>
                                <div class="brand">Amada Stays</div>
                                <div class="sub">Booking Receipt</div>
                            </div>
                            <div style="text-align:right;">
                                <div class="pill">Confirmed</div>
                                <div class="sub" style="margin-top:10px;">Receipt: ${data.receiptNumber}</div>
                                <div class="sub">${data.date}</div>
                            </div>
                        </div>
                        <div class="box">
                            <div class="row">
                                <div><div class="label">Guest</div><div class="value">${data.guest}</div></div>
                                <div style="text-align:right;"><div class="label">Phone</div><div class="value">${data.phone}</div></div>
                            </div>
                            <div class="row" style="margin-bottom:0;">
                                <div><div class="label">Property</div><div class="value">${data.property}</div></div>
                                <div style="text-align:right;"><div class="label">Location</div><div class="value">${data.location}</div></div>
                            </div>
                        </div>
                        <div class="box">
                            <div class="row">
                                <div><div class="label">Check-In</div><div class="value">${data.checkIn}</div></div>
                                <div style="text-align:right;"><div class="label">Check-Out</div><div class="value">${data.checkOut}</div></div>
                            </div>
                            <div class="row" style="margin-bottom:0;">
                                <div><div class="label">Total Paid</div><div class="value">${this.formatCurrency(data.total)}</div></div>
                                <div style="text-align:right;"><div class="label">Email</div><div class="value" style="font-size:15px;">${data.email || 'N/A'}</div></div>
                            </div>
                        </div>
                        <div class="code">${data.code}</div>
                    </div>
                </body>
                </html>
            `;
        }

        openReceiptWindow(data) {
            const receiptWindow = window.open('', '_blank', 'width=900,height=800');
            if (!receiptWindow) {
                this.showNotification("Popup blocked. Allow popups to download receipt.", "error");
                return;
            }
            receiptWindow.document.write(this.buildReceiptHtml(data));
            receiptWindow.document.close();
            receiptWindow.focus();
            setTimeout(() => receiptWindow.print(), 250);
        }

        downloadCurrentReceipt() {
            if (!this.currentReceiptData) {
                this.showNotification("No receipt available to download.", "error");
                return;
            }
            this.openReceiptWindow(this.currentReceiptData);
        }

        downloadGuestReceipt(transactionId) {
            const tx = this.transactions.find(item => (item.id || this.getTransactionId(item)) === transactionId);
            if (!tx) {
                this.showNotification("Reservation receipt not found.", "error");
                return;
            }
            this.openReceiptWindow(this.getTransactionReceiptData(tx));
        }

        lookupGuestReservations() {
            const phone = document.getElementById('guestLookupPhone')?.value.trim();
            const pin = document.getElementById('guestLookupPin')?.value.trim();
            const target = document.getElementById('guestReservationsArea');
            if (!target) return;

            if (!phone || !pin) {
                target.innerHTML = `<div style="padding:18px 0; color:var(--gray);">Enter your phone number and booking PIN to continue.</div>`;
                return;
            }

            const matches = this.transactions.filter(tx => tx.phone === phone && tx.accessCode === pin);
            if (matches.length === 0) {
                target.innerHTML = `<div style="padding:18px 0; color:var(--gray);">No reservations matched that phone number and PIN.</div>`;
                return;
            }

            target.innerHTML = matches.slice().reverse().map(tx => {
                const receipt = this.getTransactionReceiptData(tx);
                return `
                    <div style="background:#fff; border:1px solid #eee; border-radius:18px; padding:20px; margin-bottom:16px;">
                        <div style="display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap;">
                            <div>
                                <div style="font-weight:700; font-size:1.1rem;">${receipt.property}</div>
                                <div style="font-size:0.9rem; color:var(--gray);">${receipt.location}</div>
                                <div style="font-size:0.84rem; color:var(--gray); margin-top:8px;">${receipt.checkIn} to ${receipt.checkOut}</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-weight:700; font-size:1.2rem; color:var(--primary);">${this.formatCurrency(receipt.total)}</div>
                                <div style="font-size:0.82rem; color:var(--gray); margin-top:6px;">PIN: ${receipt.code}</div>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; margin-top:16px; flex-wrap:wrap;">
                            <div style="font-size:0.84rem; color:var(--gray);">Guest: ${receipt.guest} • Receipt: ${receipt.receiptNumber}</div>
                            <button class="btn-outline" onclick="app.downloadGuestReceipt('${tx.id || this.getTransactionId(tx)}')">
                                <i class="fa-solid fa-download"></i> Download Receipt
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        renderExpenditureTab() {
            return `<div class="panel"><h3>Expense Tracker loaded. (Reused from core logic).</h3></div>`;
        }

        renderManagementPropertyTab() {
            const locations = this.getAvailableLocations();
            const properties = this.managementLocation === 'all'
                ? this.inventory
                : this.inventory.filter(item => item.loc === this.managementLocation);

            return `
                <div class="panel" style="display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap;">
                    <div>
                        <h3 style="margin:0 0 6px 0;">Property Control</h3>
                        <p style="margin:0; color:var(--gray);">Managers can edit listing information, swap pictures, or delete properties.</p>
                    </div>
                    <div class="input-floating" style="margin:0; min-width:220px;">
                        <select onchange="app.updateManagementFilters('managementLocation', this.value)">
                            <option value="all" ${this.managementLocation === 'all' ? 'selected' : ''}>All Locations</option>
                            ${locations.map(loc => `<option value="${loc}" ${this.managementLocation === loc ? 'selected' : ''}>${loc}</option>`).join('')}
                        </select>
                        <label style="top:5px; font-size:0.7rem;">Filter Properties</label>
                    </div>
                </div>
                <div class="cards-grid">
                    ${properties.length === 0 ? `<div style="grid-column:1/-1; padding:30px; text-align:center; color:var(--gray);">No properties found for this location.</div>` : ''}
                </div>
            `;
        }

        createManagementPropertyCard(prop) {
            const div = document.createElement('div');
            div.className = 'property-card';

            let images = prop.images || [];
            if (!Array.isArray(images)) images = [images];
            if (images.length === 0) {
                images = ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];
            }

            const slidesHtml = images.map(img => `<div class="carousel-slide" style="background-image:url('${img}')"></div>`).join('');

            div.innerHTML = `
                <div class="status-badge ${prop.status === 'occupied' ? 'status-booked' : 'status-avail'}">${prop.status === 'occupied' ? 'Occupied' : 'Available'}</div>
                <div class="carousel-wrapper">
                    ${images.length > 1 ? `<button class="carousel-btn prev" onclick="app.slideCarousel(event, -1)"><i class="fa-solid fa-chevron-left"></i></button>` : ''}
                    <div class="carousel-track">${slidesHtml}</div>
                    ${images.length > 1 ? `<button class="carousel-btn next" onclick="app.slideCarousel(event, 1)"><i class="fa-solid fa-chevron-right"></i></button>` : ''}
                </div>
                <div class="card-content">
                    <div class="prop-name">${prop.name}</div>
                    <div class="prop-loc"><i class="fa-solid fa-map-pin"></i> ${prop.loc}</div>
                    <div style="font-size:0.9rem; color:var(--gray); margin-bottom:8px;">${prop.type || 'Luxury Apartment'}</div>
                    <div class="prop-price">${this.formatCurrency(prop.price)}<span style="font-size:0.9rem; color:var(--gray); font-weight:400;">/night</span></div>
                    <div style="font-size:0.85rem; color:var(--gray); margin-bottom:18px;">${images.length} image${images.length === 1 ? '' : 's'} • ${this.normalizeAmenities(prop.amenities).length} amenities</div>
                    <div style="display:flex; gap:10px; margin-top:auto;">
                        <button class="btn-outline" style="flex:1; padding:12px; font-size:0.9rem;" onclick="app.openEditProperty('${prop.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="btn-outline" style="flex:1; padding:12px; font-size:0.9rem; border-color:var(--danger); color:var(--danger);" onclick="app.deleteProperty('${prop.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
                    </div>
                </div>
            `;

            return div;
        }

        renderStaffExpenseTab() {
            const myRecentRequests = this.expenditures.slice().sort((a, b) => (b.createdAt || b.date || '').localeCompare(a.createdAt || a.date || '')).slice(0, 5);
            const locations = this.getAvailableLocations();
            const actorName = this.currentUser?.name || 'Current Staff';
            const actorId = this.currentUser?.id || '';

            return `
                <div class="panel">
                    <h3 style="margin-top:0; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-money-bill-wave" style="color:var(--primary)"></i> Submit Expenditure Request</h3>
                    <p style="color:var(--gray); margin:6px 0 22px 0;">A second staff member must approve each request before it reaches the chairman table.</p>
                    <form id="staffExpenseForm" onsubmit="event.preventDefault(); app.submitStaffExpenditure();">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div class="input-floating"><input type="text" id="staffExpenseTitle" required><label>Expense Title</label></div>
                            <div class="input-floating"><input type="text" id="staffExpenseAmount" data-currency inputmode="numeric" autocomplete="off" required><label>Amount (₦)</label></div>
                            <div class="input-floating">
                                <select id="staffExpenseCategory" onchange="app.toggleExpenseCategoryOther(this.value)" required>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Repairs">Repairs</option>
                                    <option value="Cleaning">Cleaning</option>
                                    <option value="Security">Security</option>
                                    <option value="Kitchen">Kitchen</option>
                                    <option value="Other">Other</option>
                                </select>
                                <label style="top:5px; font-size:0.7rem;">Category</label>
                            </div>
                            <div class="input-floating" id="staffExpenseCategoryOtherWrap" style="display:none;">
                                <input type="text" id="staffExpenseCategoryOther">
                                <label>Other Category</label>
                            </div>
                            <div class="input-floating">
                                <select id="staffExpenseScope" required>
                                    <option value="Global Ops">Global Ops</option>
                                    ${locations.map(loc => `<option value="${loc}">${loc}</option>`).join('')}
                                </select>
                                <label style="top:5px; font-size:0.7rem;">Scope</label>
                            </div>
                            <div class="input-floating"><input type="date" id="staffExpenseDate" value="${new Date().toISOString().split('T')[0]}" required><label style="top:5px; font-size:0.7rem;">Date</label></div>
                            <div class="input-floating"><input type="text" id="staffExpenseRequester" value="${actorName}" readonly required><label>Submitted By</label></div>
                        </div>
                        <div class="input-floating"><input type="text" id="staffExpenseDetails" required><label>Details</label></div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div class="input-floating"><input type="text" id="staffExpenseStaffId" value="${actorId}" readonly required><label>Staff ID</label></div>
                            <div class="input-floating"><input type="password" id="staffExpensePin" required><label>Staff PIN</label></div>
                        </div>
                        <button class="btn-primary" style="width:100%; justify-content:center; padding:16px; margin-top:8px;">
                            <i class="fa-solid fa-paper-plane"></i> Submit For Approval
                        </button>
                    </form>
                </div>
                <div class="panel">
                    <h3 style="margin-top:0;">Recent Expenditure Requests</h3>
                    ${myRecentRequests.length === 0 ? `<div style="padding:24px 0; color:var(--gray);">No expenditure requests submitted yet.</div>` : myRecentRequests.map(exp => `
                        <div style="display:flex; justify-content:space-between; gap:20px; padding:16px 0; border-bottom:1px solid #eee;">
                            <div>
                                <div style="font-weight:600;">${exp.title || exp.details}</div>
                                <div style="font-size:0.85rem; color:var(--gray);">${exp.scope} • ${exp.category} • ${exp.date}</div>
                                <div style="font-size:0.8rem; color:var(--gray);">Submitted by ${exp.requestedBy || exp.staffId}</div>
                            </div>
                            <div style="text-align:right;">
                                <strong>${this.formatCurrency(exp.amount)}</strong>
                                <div style="font-size:0.8rem; color:${exp.status === 'Approved for chairman' ? 'var(--success)' : 'var(--warning)'}; margin-top:6px;">${exp.status || 'Pending approval'}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        renderStaffIncomeTab() {
            const locations = this.getAvailableLocations();
            const recentIncome = this.otherIncome.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 6);
            const actorName = this.currentUser?.name || 'Current Staff';

            return `
                <div class="panel">
                    <h3 style="margin-top:0; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-money-bill-trend-up" style="color:var(--success)"></i> Register Other Income</h3>
                    <p style="color:var(--gray); margin:6px 0 20px 0;">Log income that came from sources other than bookings, such as laundry, restaurant, errands, transport, or service fees.</p>
                    <form id="staffIncomeForm" onsubmit="event.preventDefault(); app.submitOtherIncome();">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div class="input-floating">
                                <select id="otherIncomeCategory" required>
                                    <option value="Laundry">Laundry</option>
                                    <option value="Restaurant">Restaurant</option>
                                    <option value="Errand">Errand</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Service Fee">Service Fee</option>
                                    <option value="Other">Other</option>
                                </select>
                                <label style="top:5px; font-size:0.7rem;">Income Source</label>
                            </div>
                            <div class="input-floating"><input type="text" id="otherIncomeAmount" data-currency inputmode="numeric" autocomplete="off" required><label>Amount (₦)</label></div>
                            <div class="input-floating">
                                <select id="otherIncomeLocation" required>
                                    ${locations.map(loc => `<option value="${loc}">${loc}</option>`).join('')}
                                </select>
                                <label style="top:5px; font-size:0.7rem;">Location</label>
                            </div>
                            <div class="input-floating"><input type="date" id="otherIncomeDate" value="${new Date().toISOString().split('T')[0]}" required><label style="top:5px; font-size:0.7rem;">Date</label></div>
                        </div>
                        <div class="input-floating"><input type="text" id="otherIncomeDetails" required><label>Details / Reference</label></div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div class="input-floating"><input type="text" id="otherIncomeRecordedBy" value="${actorName}" readonly required><label>Recorded By</label></div>
                            <div class="input-floating"><input type="text" id="otherIncomeGuest"><label>Guest / Customer (Optional)</label></div>
                        </div>
                        <button class="btn-primary" style="width:100%; justify-content:center; padding:16px; margin-top:8px;">
                            <i class="fa-solid fa-cloud-arrow-up"></i> Add Income Entry
                        </button>
                    </form>
                </div>
                <div class="panel">
                    <h3 style="margin-top:0;">Recent Other Income</h3>
                    ${recentIncome.length === 0 ? `<div style="padding:24px 0; color:var(--gray);">No other income recorded yet.</div>` : recentIncome.map(entry => `
                        <div style="display:flex; justify-content:space-between; gap:18px; padding:16px 0; border-bottom:1px solid #eee;">
                            <div>
                                <div style="font-weight:600;">${entry.category}</div>
                                <div style="font-size:0.84rem; color:var(--gray);">${entry.location} • ${entry.date}</div>
                                <div style="font-size:0.82rem; color:var(--gray); margin-top:6px;">${entry.details}</div>
                            </div>
                            <div style="text-align:right;">
                                <strong style="color:var(--success);">${this.formatCurrency(entry.amount)}</strong>
                                <div style="font-size:0.8rem; color:var(--gray); margin-top:6px;">${entry.recordedBy}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        getAvailableLocations() {
            return [...new Set(this.inventory.map(item => item.loc))].sort();
        }

        isDateInRange(dateValue, from, to) {
            if (!dateValue) return false;
            if (from && dateValue < from) return false;
            if (to && dateValue > to) return false;
            return true;
        }

        getFilteredTransactions(from, to, location) {
            return this.transactions.filter(tx => {
                if (!this.isDateInRange(tx.date, from, to)) return false;
                if (location === 'all') return true;
                const prop = this.inventory.find(item => item.id === tx.propId);
                return prop?.loc === location;
            });
        }

        getTransactionId(tx, index = 0) {
            return tx.id || `${tx.propId || 'prop'}-${tx.date || 'date'}-${tx.guest || 'guest'}-${index}`;
        }

        getFilteredExpenditures(from, to, location) {
            return this.expenditures.filter(exp => {
                if (!this.isDateInRange(exp.date, from, to)) return false;
                if (location === 'all') return true;
                return (exp.scope || '').toLowerCase() === location.toLowerCase();
            });
        }

        getFilteredRefunds(from, to, location) {
            return this.refunds.filter(refund => {
                if (!this.isDateInRange(refund.date, from, to)) return false;
                if (location === 'all') return true;
                const prop = this.inventory.find(item => item.id === refund.propId);
                return prop?.loc === location;
            });
        }

        getRefundedAmountForTransaction(txId) {
            return this.refunds
                .filter(refund => refund.transactionId === txId)
                .reduce((sum, refund) => sum + (refund.amount || 0), 0);
        }

        getActiveSessionSecurityContext() {
            if (!this.currentUser) return null;

            if (this.role === 'host') {
                const host = this.hosts.find(item => item.email === this.currentHostEmail);
                if (!host) return null;
                return {
                    name: host.name,
                    id: host.email,
                    email: host.email,
                    pin: host.password
                };
            }

            const member = this.teamMembers.find(member =>
                member.staffId === this.currentUser.id || member.email === this.currentUser.email
            );
            if (!member) return null;
            return {
                name: member.name,
                id: member.staffId,
                email: member.email || '',
                pin: member.pin
            };
        }

        getFilteredInventory(location) {
            return this.inventory.filter(item => location === 'all' || item.loc === location);
        }

        getLocationForExpense(expense) {
            const scope = expense.scope || '';
            if (this.getAvailableLocations().includes(scope)) return scope;
            return 'Global Ops';
        }

        getBaselineTotals(location, from, to) {
            const salaries = this.salaryRegistry
                .filter(entry => location === 'all' || entry.location === location)
                .reduce((sum, entry) => sum + (entry.amount || 0), 0);
            const rent = this.rentRegistry
                .filter(entry => location === 'all' || entry.location === location)
                .reduce((sum, entry) => sum + (entry.amount || 0), 0);
            const sundry = this.expenditures
                .filter(entry => entry.status === 'Approved for chairman')
                .filter(entry => this.isDateInRange(entry.approvedAt || entry.date, from, to))
                .filter(entry => location === 'all' || entry.scope === location)
                .reduce((sum, entry) => sum + (entry.amount || 0), 0);
            return { salary: salaries, sundry, rent };
        }

        getExecutiveMetrics(from, to, location) {
            const txs = this.getFilteredTransactions(from, to, location);
            const exps = this.getFilteredExpenditures(from, to, location);
            const units = this.getFilteredInventory(location);
            const occupiedUnits = units.filter(item => item.status === 'occupied').length;
            const baselines = this.getBaselineTotals(location, from, to);
            const otherIncome = this.otherIncome
                .filter(entry => this.isDateInRange(entry.date, from, to))
                .filter(entry => location === 'all' || entry.location === location)
                .reduce((sum, entry) => sum + (entry.amount || 0), 0);

            const bookingRevenue = txs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
            const estimatedBookingRevenue = txs.reduce((sum, tx) => sum + (tx.estimatedTotal || tx.amount || 0), 0);
            const cautionTotal = txs.reduce((sum, tx) => sum + (tx.cautionFee || 0), 0);
            const balanceRemaining = txs.reduce((sum, tx) => sum + Math.max(0, (tx.estimatedTotal || tx.amount || 0) - (tx.amount || 0)), 0);
            const totalGuests = new Set(txs.map(tx => `${tx.guest || ''}-${tx.phone || ''}`).filter(Boolean)).size;
            const grossRevenue = bookingRevenue + otherIncome;
            const refunds = this.getFilteredRefunds(from, to, location)
                .reduce((sum, refund) => sum + (refund.amount || 0), 0);
            const netRevenue = grossRevenue - refunds;
            const vat = netRevenue > 0 ? netRevenue * 0.125 : 0;
            const maintenance = netRevenue > 0 ? netRevenue * 0.05 : 0;
            const approvedExpenses = exps
                .filter(exp => exp.status === 'Approved for chairman')
                .reduce((sum, exp) => sum + (exp.amount || 0), 0);
            const operatingProfit = netRevenue - vat - maintenance - baselines.rent - baselines.salary - approvedExpenses;
            const avgDailyRate = txs.length ? bookingRevenue / txs.length : 0;

            return {
                txs,
                exps,
                units,
                occupiedUnits,
                bookingRevenue,
                estimatedBookingRevenue,
                otherIncome,
                grossRevenue,
                refunds,
                netRevenue,
                vat,
                maintenance,
                recordedExpenses: approvedExpenses,
                operatingProfit,
                avgDailyRate,
                baselines,
                totalGuests,
                totalPaid: bookingRevenue,
                balanceRemaining,
                cautionTotal,
                occupancyRate: units.length ? Math.round((occupiedUnits / units.length) * 100) : 0
            };
        }

        updateReportType(field, value) {
            this[field] = value;
            this.render();
        }

        submitStaffExpenditure() {
            const title = document.getElementById('staffExpenseTitle').value.trim();
            const amount = this.parseCurrencyValue(document.getElementById('staffExpenseAmount').value);
            const categorySelection = document.getElementById('staffExpenseCategory').value;
            const categoryOther = document.getElementById('staffExpenseCategoryOther').value.trim();
            const category = categorySelection === 'Other' ? categoryOther : categorySelection;
            const scope = document.getElementById('staffExpenseScope').value;
            const date = document.getElementById('staffExpenseDate').value;
            const details = document.getElementById('staffExpenseDetails').value.trim();
            const requestedBy = document.getElementById('staffExpenseRequester').value.trim();
            const staffId = document.getElementById('staffExpenseStaffId').value.trim();
            const pin = document.getElementById('staffExpensePin').value.trim();

            if (!title || isNaN(amount) || amount <= 0 || !category || !scope || !date || !details || !requestedBy || !staffId || !pin) {
                this.showNotification("Complete the expenditure request before submitting.", "error");
                return;
            }

            this.expenditures.push({
                id: `exp_${Date.now()}`,
                title,
                amount,
                category,
                scope,
                date,
                details,
                requestedBy,
                staffId,
                pin,
                approver: '',
                approverStaffId: '',
                status: 'Pending approval',
                createdAt: new Date().toISOString()
            });

            this.saveLocalData();
            document.getElementById('staffExpenseForm').reset();
            document.getElementById('staffExpenseDate').value = new Date().toISOString().split('T')[0];
            this.toggleExpenseCategoryOther('');
            this.showNotification("Expenditure submitted for staff approval.", "success");
            this.render();
        }

        approveExpenseRequest(id) {
            const expense = this.expenditures.find(item => item.id === id);
            if (!expense) return;

            const actor = this.getActiveSessionSecurityContext();
            const approverName = actor?.name?.trim();
            const approverStaffId = actor?.id?.trim();
            const approverPin = actor?.pin?.trim();

            if (!approverName || !approverStaffId || !approverPin) {
                this.showNotification("A logged-in management account is required to approve this expenditure.", "error");
                return;
            }

            if (this.role !== 'management' && !(this.role === 'host' && this.hostDashboardRole === 'management')) {
                this.showNotification("Only management can approve expenditure requests.", "error");
                return;
            }

            if (expense.staffId === approverStaffId) {
                this.showNotification("A different staff member must approve this expenditure.", "error");
                return;
            }

            expense.approver = approverName;
            expense.approverStaffId = approverStaffId;
            expense.approverPin = approverPin;
            expense.status = 'Approved for chairman';
            expense.approvedAt = new Date().toISOString().split('T')[0];

            this.saveLocalData();
            this.showNotification("Expenditure approved and forwarded to chairman.", "success");
            this.render();
        }

        submitOtherIncome() {
            const category = document.getElementById('otherIncomeCategory').value;
            const amount = this.parseCurrencyValue(document.getElementById('otherIncomeAmount').value);
            const location = document.getElementById('otherIncomeLocation').value;
            const date = document.getElementById('otherIncomeDate').value;
            const details = document.getElementById('otherIncomeDetails').value.trim();
            const recordedBy = document.getElementById('otherIncomeRecordedBy').value.trim();
            const guest = document.getElementById('otherIncomeGuest').value.trim();

            if (!category || isNaN(amount) || amount <= 0 || !location || !date || !details || !recordedBy) {
                this.showNotification("Complete the income register form before saving.", "error");
                return;
            }

            this.otherIncome.push({
                id: `inc_${Date.now()}`,
                category,
                amount,
                location,
                date,
                details,
                recordedBy,
                guest
            });

            this.saveLocalData();
            document.getElementById('staffIncomeForm').reset();
            document.getElementById('otherIncomeDate').value = new Date().toISOString().split('T')[0];
            this.showNotification("Other income added successfully.", "success");
            this.render();
        }

        addSalaryEntry() {
            const editId = document.getElementById('salaryEditId').value;
            const staffName = document.getElementById('salaryStaffName').value.trim();
            const roleSelection = document.getElementById('salaryStaffRole').value;
            const roleOther = document.getElementById('salaryStaffRoleOther').value.trim();
            const role = roleSelection === 'Other' ? roleOther : roleSelection;
            const location = document.getElementById('salaryLocation').value;
            const amount = this.parseCurrencyValue(document.getElementById('salaryAmount').value);
            const phone = document.getElementById('salaryPhone').value.trim();
            const email = document.getElementById('salaryEmail').value.trim();

            if (!staffName || !role || !location || isNaN(amount) || amount <= 0) {
                this.showNotification("Complete the salary form before saving.", "error");
                return;
            }

            if (editId) {
                const existing = this.salaryRegistry.find(entry => entry.id === editId);
                if (!existing) return;
                existing.staffName = staffName;
                existing.role = role;
                existing.location = location;
                existing.amount = amount;
                existing.phone = phone;
                existing.email = email;
            } else {
                this.salaryRegistry.push({
                    id: `sal_${Date.now()}`,
                    staffName,
                    role,
                    location,
                    amount,
                    phone,
                    email
                });
            }

            this.saveLocalData();
            document.getElementById('salaryForm').reset();
            document.getElementById('salaryEditId').value = '';
            this.currentSalaryEditId = null;
            this.toggleSalaryRoleOther('');
            this.showNotification(editId ? "Staff details updated." : "Staff salary added.", "success");
            this.render();
        }

        startEditSalaryEntry(id) {
            this.currentSalaryEditId = id;
            this.render();
        }

        cancelSalaryEdit() {
            this.currentSalaryEditId = null;
            this.render();
        }

        removeSalaryEntry(id) {
            this.salaryRegistry = this.salaryRegistry.filter(entry => entry.id !== id);
            if (this.currentSalaryEditId === id) this.currentSalaryEditId = null;
            this.saveLocalData();
            this.showNotification("Salary entry removed.", "info");
        }

        upsertRentEntry() {
            const editingLocation = document.getElementById('rentEditLocation').value || document.getElementById('rentLocation').value;
            const location = document.getElementById('rentLocation').value;
            const amount = this.parseCurrencyValue(document.getElementById('rentAmount').value);

            if (!location || isNaN(amount) || amount < 0) {
                this.showNotification("Enter a valid rent amount.", "error");
                return;
            }

            const existing = this.rentRegistry.find(entry => entry.location === editingLocation);
            if (existing) {
                existing.location = location;
                existing.amount = amount;
            }
            else this.rentRegistry.push({ id: `rent_${Date.now()}`, location, amount });

            this.saveLocalData();
            document.getElementById('rentForm').reset();
            document.getElementById('rentEditLocation').value = '';
            this.currentRentEditLocation = null;
            this.showNotification("Rent record updated.", "success");
            this.render();
        }

        startEditRentEntry(location) {
            this.currentRentEditLocation = location;
            this.render();
        }

        saveTarget() {
            const location = document.getElementById('targetLoc')?.value;
            const month = document.getElementById('targetMonth')?.value;
            const amount = this.parseCurrencyValue(document.getElementById('targetVal')?.value);

            if (!location || !month || isNaN(amount) || amount <= 0) {
                this.showNotification("Enter a valid target location, month, and amount.", "error");
                return;
            }

            this.targets[`${location}_${month}`] = amount;
            this.saveLocalData();
            this.closeModal();
            this.showNotification("Revenue target saved.", "success");
        }

        toggleSalaryRoleOther(value) {
            const wrapper = document.getElementById('salaryRoleOtherWrap');
            const input = document.getElementById('salaryStaffRoleOther');
            if (!wrapper || !input) return;
            const show = value === 'Other';
            wrapper.style.display = show ? 'block' : 'none';
            input.required = show;
            if (!show) input.value = '';
        }

        toggleExpenseCategoryOther(value) {
            const wrapper = document.getElementById('staffExpenseCategoryOtherWrap');
            const input = document.getElementById('staffExpenseCategoryOther');
            if (!wrapper || !input) return;
            const show = value === 'Other';
            wrapper.style.display = show ? 'block' : 'none';
            input.required = show;
            if (!show) input.value = '';
            refreshFloatingLabels();
        }

        getReportContext(scope) {
            if (scope === 'chairman') {
                return {
                    dateFrom: this.chairmanDateFrom,
                    dateTo: this.chairmanDateTo,
                    location: this.chairmanLocation,
                    reportType: this.chairmanReportType,
                    title: "Chairman's Report"
                };
            }

            return {
                dateFrom: this.managementDateFrom,
                dateTo: this.managementDateTo,
                location: this.managementLocation,
                reportType: this.managementReportType,
                title: 'Management Report'
            };
        }

        getReportRows(scope) {
            const context = this.getReportContext(scope);

            if (context.reportType === 'income') {
                const bookingRows = this.getFilteredTransactions(context.dateFrom, context.dateTo, context.location).map(tx => {
                    const prop = this.inventory.find(item => item.id === tx.propId);
                    return {
                        Date: tx.date || '',
                        Type: 'Booking',
                        Property: prop?.name || tx.propId || '',
                        Location: prop?.loc || '',
                        Guest: tx.guest || '',
                        Reference: tx.accessCode || '',
                        Amount: Math.round(tx.amount || 0)
                    };
                });
                const otherIncomeRows = this.otherIncome
                    .filter(entry => this.isDateInRange(entry.date, context.dateFrom, context.dateTo))
                    .filter(entry => context.location === 'all' || entry.location === context.location)
                    .map(entry => ({
                        Date: entry.date || '',
                        Type: entry.category || 'Other Income',
                        Property: entry.details || '',
                        Location: entry.location || '',
                        Guest: entry.guest || '',
                        Reference: entry.recordedBy || '',
                        Amount: Math.round(entry.amount || 0)
                    }));
                return [...bookingRows, ...otherIncomeRows];
            }

            return this.getFilteredExpenditures(context.dateFrom, context.dateTo, context.location)
                .filter(exp => scope !== 'chairman' || exp.status === 'Approved for chairman')
                .map(exp => ({
                Date: exp.date || '',
                Type: exp.status || 'Expense',
                Title: exp.title || exp.details || 'Expense Request',
                Category: exp.category || '',
                Scope: exp.scope || '',
                RequestedBy: exp.requestedBy || exp.staffId || '',
                Approval: exp.approver || exp.status || '',
                Amount: Math.round(exp.amount || 0)
            }));
        }

        getReportSummary(scope) {
            const context = this.getReportContext(scope);
            const rows = this.getReportRows(scope);
            const total = rows.reduce((sum, row) => sum + (Number(row.Amount) || 0), 0);
            return { context, rows, total };
        }

        escapeCsvValue(value) {
            const stringValue = value == null ? '' : String(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
        }

        triggerDownload(filename, content, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        }

        exportReport(format, scope) {
            const { context, rows, total } = this.getReportSummary(scope);
            if (rows.length === 0) {
                this.showNotification("No records match the current report filter.", "error");
                return;
            }

            const safeTitle = `${context.title} ${context.reportType} ${context.dateFrom} to ${context.dateTo}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
            const headers = Object.keys(rows[0]);

            if (format === 'csv') {
                const csv = [
                    headers.map(header => this.escapeCsvValue(header)).join(','),
                    ...rows.map(row => headers.map(header => this.escapeCsvValue(row[header])).join(',')),
                    headers.map(header => this.escapeCsvValue(header === 'Amount' ? total : '')).join(',')
                ].join('\n');
                this.triggerDownload(`${safeTitle}.csv`, csv, 'text/csv;charset=utf-8;');
                this.showNotification("CSV report downloaded.", "success");
                return;
            }

            if (format === 'excel') {
                const tableRows = rows.map(row => `
                    <tr>${headers.map(header => `<td>${row[header] ?? ''}</td>`).join('')}</tr>
                `).join('');
                const excelHtml = `
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <style>
                            body { font-family: Arial, sans-serif; padding: 24px; }
                            h1 { margin-bottom: 6px; }
                            p { color: #666; margin-top: 0; }
                            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                            th { background: #f4f4f4; }
                            tfoot td { font-weight: 700; }
                        </style>
                    </head>
                    <body>
                        <h1>${context.title}</h1>
                        <p>${context.reportType.toUpperCase()} • ${context.location === 'all' ? 'All Locations' : context.location} • ${context.dateFrom} to ${context.dateTo}</p>
                        <table>
                            <thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead>
                            <tbody>${tableRows}</tbody>
                            <tfoot><tr>${headers.map(header => `<td>${header === 'Amount' ? total : ''}</td>`).join('')}</tr></tfoot>
                        </table>
                    </body>
                    </html>
                `;
                this.triggerDownload(`${safeTitle}.xls`, excelHtml, 'application/vnd.ms-excel;charset=utf-8;');
                this.showNotification("Excel report downloaded.", "success");
                return;
            }

            const printWindow = window.open('', '_blank', 'width=1100,height=800');
            if (!printWindow) {
                this.showNotification("Popup blocked. Allow popups to generate PDF report.", "error");
                return;
            }

            const reportRows = rows.map(row => `
                <tr>${headers.map(header => `<td>${row[header] ?? ''}</td>`).join('')}</tr>
            `).join('');

            printWindow.document.write(`
                <html>
                <head>
                    <title>${context.title}</title>
                    <style>
                        body { font-family: 'Poppins', Arial, sans-serif; padding: 32px; color: #1a1a1a; background: #f7f7f7; }
                        .sheet { background: white; border-radius: 20px; padding: 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.08); }
                        .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 24px; }
                        .brand { color: #ff385c; font-size: 28px; font-weight: 700; }
                        .muted { color: #666; }
                        .pill { display: inline-block; padding: 8px 14px; border-radius: 999px; background: #fff0f3; color: #ff385c; font-weight: 700; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
                        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
                        .card { background: #fafafa; border: 1px solid #eee; border-radius: 16px; padding: 16px; }
                        .card strong { display: block; font-size: 24px; margin-top: 8px; }
                        table { border-collapse: collapse; width: 100%; overflow: hidden; border-radius: 16px; }
                        th, td { padding: 12px 14px; border-bottom: 1px solid #eee; text-align: left; font-size: 13px; }
                        th { background: #1a1a1a; color: white; }
                        tr:nth-child(even) td { background: #fcfcfc; }
                        tfoot td { font-weight: 700; background: #fff4f6; }
                        @media print {
                            body { background: white; padding: 0; }
                            .sheet { box-shadow: none; border-radius: 0; padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="sheet">
                        <div class="header">
                            <div>
                                <div class="brand">Amada Stays</div>
                                <h1 style="margin:10px 0 6px 0;">${context.title}</h1>
                                <div class="muted">${context.dateFrom} to ${context.dateTo}</div>
                            </div>
                            <div style="text-align:right;">
                                <div class="pill">${context.reportType}</div>
                                <div class="muted" style="margin-top:12px;">${context.location === 'all' ? 'All Locations' : context.location}</div>
                            </div>
                        </div>
                        <div class="summary">
                            <div class="card"><div class="muted">Records</div><strong>${rows.length}</strong></div>
                            <div class="card"><div class="muted">Report Type</div><strong style="font-size:20px;">${context.reportType.toUpperCase()}</strong></div>
                            <div class="card"><div class="muted">Total Amount</div><strong>${this.formatCurrency(total)}</strong></div>
                        </div>
                        <table>
                            <thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead>
                            <tbody>${reportRows}</tbody>
                            <tfoot><tr>${headers.map(header => `<td>${header === 'Amount' ? this.formatCurrency(total) : ''}</td>`).join('')}</tr></tfoot>
                        </table>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => printWindow.print(), 300);
            this.showNotification("PDF report prepared. Save from the print dialog.", "success");
        }

        setManagementTab(tab) {
            this.activeMgmtTab = tab;
            this.render();
        }

        updateManagementFilters(field, value) {
            this[field] = value;
            this.render();
        }

        updateChairmanFilters(field, value) {
            this[field] = value;
            this.render();
        }

        requestManagementPayment() {
            const title = document.getElementById('mgmtPaymentTitle').value.trim();
            const amount = this.parseCurrencyValue(document.getElementById('mgmtExpenseAmount').value);
            const category = document.getElementById('mgmtExpenseCategory').value;
            const scope = document.getElementById('mgmtExpenseScope').value;
            const date = document.getElementById('mgmtExpenseDate').value;
            const details = document.getElementById('mgmtExpenseDetails').value.trim();
            const staffId = document.getElementById('mgmtStaffId').value.trim();
            const pin = document.getElementById('mgmtStaffPin').value.trim();
            const requestedBy = document.getElementById('mgmtRequestedBy').value.trim();
            const approver = document.getElementById('mgmtApprover').value.trim();

            if (isNaN(amount) || amount <= 0 || !title || !category || !scope || !date || !details || !staffId || !pin || !requestedBy) {
                this.showNotification("Complete the payment request form before submitting.", "error");
                return;
            }

            this.expenditures.push({
                id: `exp_${Date.now()}`,
                title,
                amount,
                category,
                scope,
                date,
                details,
                staffId,
                pin,
                requestedBy,
                approver: approver || 'Pending approval',
                status: approver ? 'Approved for payment' : 'Payment requested'
            });

            this.saveLocalData();
            document.getElementById('mgmtExpenseForm').reset();
            document.getElementById('mgmtExpenseDate').value = new Date().toISOString().split('T')[0];
            this.showNotification("Payment request logged and expense recorded.", "success");
            this.render();
        }

        renderManagementView(container) {
            const metrics = this.getExecutiveMetrics(this.managementDateFrom, this.managementDateTo, this.managementLocation);
            const locations = this.getAvailableLocations();
            const recentExpenses = metrics.exps
                .filter(exp => exp.status === 'Approved for chairman')
                .slice()
                .sort((a, b) => ((b.approvedAt || b.date || '')).localeCompare(a.approvedAt || a.date || ''))
                .slice(0, 5);
            const pendingExpenses = this.expenditures
                .filter(exp => exp.status !== 'Approved for chairman')
                .sort((a, b) => (b.createdAt || b.date || '').localeCompare(a.createdAt || a.date || ''));
            const unpaidTransactions = metrics.txs
                .map(tx => {
                    const prop = this.inventory.find(item => item.id === tx.propId);
                    const balance = Math.max(0, (tx.estimatedTotal || tx.amount || 0) - (tx.amount || 0));
                    return { ...tx, prop, balance };
                })
                .filter(tx => tx.balance > 0)
                .sort((a, b) => b.balance - a.balance);

            container.innerHTML = `
                <div style="animation: fadeIn 0.5s ease;">
                    <div class="panel" style="display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap;">
                        <div>
                            <h2 style="font-family:var(--font-body); font-size:2.2rem; margin:0 0 4px 0;">Management Hub</h2>
                            <p style="color:var(--gray); margin:0;">Financial Overview & Operations</p>
                        </div>
                        <div style="display:flex; gap:12px; flex-wrap:wrap;">
                            <div class="input-floating" style="margin:0; min-width:155px;">
                                <input type="date" value="${this.managementDateFrom}" onchange="app.updateManagementFilters('managementDateFrom', this.value)">
                                <label style="top:5px; font-size:0.7rem;">From</label>
                            </div>
                            <div class="input-floating" style="margin:0; min-width:155px;">
                                <input type="date" value="${this.managementDateTo}" onchange="app.updateManagementFilters('managementDateTo', this.value)">
                                <label style="top:5px; font-size:0.7rem;">To</label>
                            </div>
                            <div class="input-floating" style="margin:0; min-width:225px;">
                                <select onchange="app.updateManagementFilters('managementLocation', this.value)">
                                    <option value="all" ${this.managementLocation === 'all' ? 'selected' : ''}>All Locations (Consolidated)</option>
                                    ${locations.map(loc => `<option value="${loc}" ${this.managementLocation === loc ? 'selected' : ''}>${loc}</option>`).join('')}
                                </select>
                                <label style="top:5px; font-size:0.7rem;">Location</label>
                            </div>
                        </div>
                    </div>

                    <div class="mgmt-tabs">
                        <div class="mgmt-tab ${this.activeMgmtTab === 'pl' ? 'active' : ''}" onclick="app.setManagementTab('pl')"><i class="fa-solid fa-file-invoice-dollar"></i> P&L Statement</div>
                        <div class="mgmt-tab ${this.activeMgmtTab === 'ops' ? 'active' : ''}" onclick="app.setManagementTab('ops')"><i class="fa-solid fa-receipt"></i> Operations Recording</div>
                        <div class="mgmt-tab ${this.activeMgmtTab === 'payroll' ? 'active' : ''}" onclick="app.setManagementTab('payroll')"><i class="fa-solid fa-users-gear"></i> Salaries & Rent</div>
                        <div class="mgmt-tab ${this.activeMgmtTab === 'refunds' ? 'active' : ''}" onclick="app.setManagementTab('refunds')"><i class="fa-solid fa-rotate-left"></i> Refunds</div>
                        <div class="mgmt-tab ${this.activeMgmtTab === 'properties' ? 'active' : ''}" onclick="app.setManagementTab('properties')"><i class="fa-solid fa-building"></i> Property Control</div>
                    </div>

                    ${this.activeMgmtTab === 'pl' ? `
                        <div class="kpi-grid">
                            <div class="kpi-card"><div style="font-size:0.8rem; color:var(--gray); text-transform:uppercase; font-weight:700;">Total Guests</div><div class="kpi-value">${metrics.totalGuests}</div><div style="color:var(--gray); font-size:0.9rem;">Unique guests for this period</div></div>
                            <div class="kpi-card"><div style="font-size:0.8rem; color:var(--gray); text-transform:uppercase; font-weight:700;">Total Paid</div><div class="kpi-value">${this.formatCurrency(metrics.totalPaid)}</div><div style="color:var(--gray); font-size:0.9rem;">Booking payments received</div></div>
                            <div class="kpi-card"><div style="font-size:0.8rem; color:var(--gray); text-transform:uppercase; font-weight:700;">Balance Remaining</div><div class="kpi-value">${this.formatCurrency(metrics.balanceRemaining)}</div><div style="color:var(--gray); font-size:0.9rem;">Outstanding guest balances</div></div>
                            <div class="kpi-card"><div style="font-size:0.8rem; color:var(--gray); text-transform:uppercase; font-weight:700;">Total Caution Fee</div><div class="kpi-value">${this.formatCurrency(metrics.cautionTotal)}</div><div style="color:var(--gray); font-size:0.9rem;">Refundable caution collected</div></div>
                        </div>
                        <div style="display:grid; grid-template-columns:minmax(320px, 1.2fr) minmax(320px, 0.8fr); gap:24px; align-items:start;">
                            <div class="panel">
                                <h3 style="margin-top:0; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-chart-pie" style="color:var(--primary)"></i> Monthly Baseline Details</h3>
                                <div style="display:flex; flex-direction:column; gap:18px; margin-top:24px;">
                                    <div style="display:flex; justify-content:space-between; gap:15px;"><span style="color:var(--gray);"><i class="fa-solid fa-users" style="margin-right:8px;"></i>Salaries (Allocated)</span><strong>${this.formatCurrency(metrics.baselines.salary)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; gap:15px;"><span style="color:var(--gray);"><i class="fa-solid fa-toolbox" style="margin-right:8px;"></i>Sundry (Approved Expenses)</span><strong>${this.formatCurrency(metrics.recordedExpenses)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; gap:15px;"><span style="color:var(--gray);"><i class="fa-solid fa-building" style="margin-right:8px;"></i>Rent</span><strong>${this.formatCurrency(metrics.baselines.rent)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; gap:15px; padding-top:12px; border-top:1px dashed #ddd;"><span style="color:var(--gray);"><i class="fa-solid fa-calendar-check" style="margin-right:8px;"></i>Booking Revenue</span><strong>${this.formatCurrency(metrics.bookingRevenue)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; gap:15px;"><span style="color:var(--gray);"><i class="fa-solid fa-utensils" style="margin-right:8px;"></i>Other Income</span><strong>${this.formatCurrency(metrics.otherIncome)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; gap:15px;"><span style="color:var(--gray);"><i class="fa-solid fa-bolt" style="margin-right:8px;"></i>Average Booking Ticket</span><strong>${this.formatCurrency(metrics.avgDailyRate)}</strong></div>
                                </div>
                            </div>
                            <div class="panel" style="background:#23201f; color:white;">
                                <h3 style="margin-top:0; color:white;">Profit & Loss Statement</h3>
                                <div style="margin-top:18px; display:flex; flex-direction:column; gap:14px;">
                                    <div style="display:flex; justify-content:space-between; color:#f4dede;"><span>Booking Revenue</span><strong>${this.formatCurrency(metrics.bookingRevenue)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; color:#f4dede;"><span>Other Income</span><strong>${this.formatCurrency(metrics.otherIncome)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.12);"><span style="font-weight:700;">Gross Revenue</span><strong>${this.formatCurrency(metrics.grossRevenue)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Refunds</span><strong>-${this.formatCurrency(metrics.refunds).replace('₦', '₦')}</strong></div>
                                    <div style="display:flex; justify-content:space-between; padding:14px 0; border-top:1px solid rgba(255,255,255,0.12); border-bottom:1px solid rgba(255,255,255,0.12);"><span style="font-weight:700;">Net Revenue</span><strong>${this.formatCurrency(metrics.netRevenue)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: VAT (12.5%)</span><strong>-${this.formatCurrency(metrics.vat)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Maint (5%)</span><strong>-${this.formatCurrency(metrics.maintenance)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Rent</span><strong>-${this.formatCurrency(metrics.baselines.rent)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Total Sundry</span><strong>-${this.formatCurrency(metrics.recordedExpenses)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Salaries</span><strong>-${this.formatCurrency(metrics.baselines.salary)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; margin-top:12px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.15); font-size:1.05rem;"><span style="font-weight:700;">Operating Profit / Loss</span><strong style="color:${metrics.operatingProfit >= 0 ? '#7ED957' : '#FF8B8B'}">${this.formatCurrency(metrics.operatingProfit)}</strong></div>
                                </div>
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:minmax(320px, 0.95fr) minmax(320px, 1.05fr); gap:24px; margin-top:24px;">
                            <div class="panel">
                                <h3 style="margin-top:0;"><i class="fa-solid fa-chart-pie" style="color:var(--primary)"></i> P&L Distribution</h3>
                                <div style="position:relative; height:280px; width:100%;">
                                    <canvas id="managementPlChart" style="display:block; width:100%; height:100%;"></canvas>
                                </div>
                            </div>
                            <div class="panel">
                                <h3 style="margin-top:0;"><i class="fa-solid fa-wallet" style="color:var(--primary)"></i> Unpaid Guest Balances</h3>
                                ${unpaidTransactions.length === 0 ? `<div style="padding:24px 0; color:var(--gray);">No unpaid guest balances for this filter.</div>` : `
                                    <div style="max-height:320px; overflow:auto;">
                                        ${unpaidTransactions.map(tx => `
                                            <div style="display:flex; justify-content:space-between; gap:16px; padding:14px 0; border-bottom:1px solid #eee;">
                                                <div>
                                                    <div style="font-weight:600;">${tx.guest}</div>
                                                    <div style="font-size:0.84rem; color:var(--gray);">${tx.prop?.name || tx.propId} • ${tx.date}</div>
                                                    <div style="font-size:0.8rem; color:var(--gray); margin-top:6px;">Paid ${this.formatCurrency(tx.amount || 0)} of ${this.formatCurrency(tx.estimatedTotal || tx.amount || 0)}</div>
                                                </div>
                                                <strong style="color:var(--danger);">${this.formatCurrency(tx.balance)}</strong>
                                            </div>
                                        `).join('')}
                                    </div>
                                `}
                            </div>
                        </div>
                        <div class="panel">
                            <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap;">
                                <div>
                                    <h3 style="margin:0 0 6px 0;">Download Report</h3>
                                    <p style="margin:0; color:var(--gray);">Export expenditure or income using the current management filters.</p>
                                </div>
                                <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
                                    <div class="input-floating" style="margin:0; min-width:180px;">
                                        <select onchange="app.updateReportType('managementReportType', this.value)">
                                            <option value="expenditure" ${this.managementReportType === 'expenditure' ? 'selected' : ''}>Expenditure Report</option>
                                            <option value="income" ${this.managementReportType === 'income' ? 'selected' : ''}>Income Report</option>
                                        </select>
                                        <label style="top:5px; font-size:0.7rem;">Report Type</label>
                                    </div>
                                    <button class="btn-outline" onclick="app.exportReport('csv', 'management')"><i class="fa-solid fa-file-csv"></i> CSV</button>
                                    <button class="btn-outline" onclick="app.exportReport('excel', 'management')"><i class="fa-solid fa-file-excel"></i> Excel</button>
                                    <button class="btn-primary" onclick="app.exportReport('pdf', 'management')"><i class="fa-solid fa-file-pdf"></i> PDF</button>
                                </div>
                            </div>
                        </div>
                    ` : this.activeMgmtTab === 'ops' ? `
                        <div class="panel">
                            <h3 style="margin-top:0; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-money-check-dollar" style="color:var(--primary)"></i> Expenditure Approval Queue</h3>
                            <p style="color:var(--gray); margin:6px 0 18px 0;">A different staff member must approve each expenditure before it reaches the chairman table.</p>
                            ${pendingExpenses.length === 0 ? `<div style="padding:24px 0; color:var(--gray);">No pending expenditure requests right now.</div>` : pendingExpenses.map(exp => `
                                <div style="border:1px solid #eee; border-radius:16px; padding:18px; margin-bottom:16px; background:#fcfcfc;">
                                    <div style="display:flex; justify-content:space-between; gap:18px; flex-wrap:wrap; margin-bottom:14px;">
                                        <div>
                                            <div style="font-weight:700; font-size:1.05rem;">${exp.title || exp.details}</div>
                                            <div style="font-size:0.85rem; color:var(--gray);">${exp.scope} • ${exp.category} • ${exp.date}</div>
                                            <div style="font-size:0.82rem; color:var(--gray); margin-top:6px;">Requested by ${exp.requestedBy || exp.staffId} (${exp.staffId || 'No ID'})</div>
                                        </div>
                                        <div style="text-align:right;">
                                            <strong style="font-size:1.05rem;">${this.formatCurrency(exp.amount)}</strong>
                                            <div style="font-size:0.82rem; color:var(--warning); margin-top:6px;">${exp.status || 'Pending approval'}</div>
                                        </div>
                                    </div>
                                    <div style="font-size:0.9rem; color:#444; margin-bottom:14px;">${exp.details}</div>
                                    <div style="display:flex; justify-content:space-between; gap:16px; align-items:center; flex-wrap:wrap;">
                                        <div style="font-size:0.84rem; color:var(--gray);">
                                            Approval will be logged automatically as
                                            <strong>${this.currentUser?.name || 'current management user'}</strong>
                                            ${this.currentUser?.id ? `(${this.currentUser.id})` : ''}.
                                        </div>
                                        <button class="btn-primary" onclick="app.approveExpenseRequest('${exp.id}')" style="height:52px; justify-content:center;">
                                            <i class="fa-solid fa-badge-check"></i> Approve
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="panel">
                            <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap;">
                                <div>
                                    <h3 style="margin:0 0 6px 0;">Approved Expenditure Ledger</h3>
                                    <p style="margin:0; color:var(--gray);">Only approved expenditure entries flow onward to the chairman table and exports.</p>
                                </div>
                                <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
                                    <div class="input-floating" style="margin:0; min-width:180px;">
                                        <select onchange="app.updateReportType('managementReportType', this.value)">
                                            <option value="expenditure" ${this.managementReportType === 'expenditure' ? 'selected' : ''}>Expenditure Report</option>
                                            <option value="income" ${this.managementReportType === 'income' ? 'selected' : ''}>Income Report</option>
                                        </select>
                                        <label style="top:5px; font-size:0.7rem;">Report Type</label>
                                    </div>
                                    <button class="btn-outline" onclick="app.exportReport('csv', 'management')"><i class="fa-solid fa-file-csv"></i> CSV</button>
                                    <button class="btn-outline" onclick="app.exportReport('excel', 'management')"><i class="fa-solid fa-file-excel"></i> Excel</button>
                                    <button class="btn-primary" onclick="app.exportReport('pdf', 'management')"><i class="fa-solid fa-file-pdf"></i> PDF</button>
                                </div>
                            </div>
                            ${recentExpenses.length === 0 ? `<div style="padding:24px 0; color:var(--gray);">No expenses recorded for this filter yet.</div>` : recentExpenses.map(exp => `
                                <div style="display:flex; justify-content:space-between; gap:20px; padding:16px 0; border-bottom:1px solid #eee;">
                                    <div>
                                        <div style="font-weight:600;">${exp.title || exp.details}</div>
                                        <div style="font-size:0.85rem; color:var(--gray);">${exp.scope} • ${exp.category} • ${exp.date}</div>
                                        <div style="font-size:0.8rem; color:var(--gray);">Requested by ${exp.requestedBy || exp.staffId} • Approved by ${exp.approver || 'Pending'}</div>
                                    </div>
                                    <div style="text-align:right;">
                                        <strong>${this.formatCurrency(exp.amount)}</strong>
                                        <div style="font-size:0.8rem; color:${exp.status === 'Approved for chairman' ? 'var(--success)' : 'var(--warning)'}; margin-top:6px;">${exp.status || 'Pending approval'}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : this.activeMgmtTab === 'payroll' ? `
                        ${(() => {
                            const editingSalary = this.salaryRegistry.find(entry => entry.id === this.currentSalaryEditId);
                            const editingRent = this.rentRegistry.find(entry => entry.location === this.currentRentEditLocation);
                            const presetRole = editingSalary && ['Housekeeper', 'Manager', 'Supervisor', 'Chef', 'Driver', 'Laundry', 'Security', 'Other'].includes(editingSalary.role) ? editingSalary.role : editingSalary ? 'Other' : 'Housekeeper';
                            const presetOtherRole = editingSalary && !['Housekeeper', 'Manager', 'Supervisor', 'Chef', 'Driver', 'Laundry', 'Security'].includes(editingSalary.role) ? editingSalary.role : '';
                            return `
                        <div style="display:grid; grid-template-columns:minmax(320px, 1fr) minmax(320px, 1fr); gap:24px;">
                            <div class="panel">
                                <h3 style="margin-top:0;"><i class="fa-solid fa-user-tie" style="color:var(--primary)"></i> Staff Salary Registry</h3>
                                <form id="salaryForm" onsubmit="event.preventDefault(); app.addSalaryEntry();" style="margin-top:20px;">
                                    <input type="hidden" id="salaryEditId" value="${editingSalary?.id || ''}">
                                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                                        <div class="input-floating"><input type="text" id="salaryStaffName" value="${editingSalary?.staffName || ''}" required><label>Staff Name</label></div>
                                        <div class="input-floating">
                                            <select id="salaryStaffRole" onchange="app.toggleSalaryRoleOther(this.value)" required>
                                                <option value="Housekeeper" ${presetRole === 'Housekeeper' ? 'selected' : ''}>Housekeeper</option>
                                                <option value="Manager" ${presetRole === 'Manager' ? 'selected' : ''}>Manager</option>
                                                <option value="Supervisor" ${presetRole === 'Supervisor' ? 'selected' : ''}>Supervisor</option>
                                                <option value="Chef" ${presetRole === 'Chef' ? 'selected' : ''}>Chef</option>
                                                <option value="Driver" ${presetRole === 'Driver' ? 'selected' : ''}>Driver</option>
                                                <option value="Laundry" ${presetRole === 'Laundry' ? 'selected' : ''}>Laundry</option>
                                                <option value="Security" ${presetRole === 'Security' ? 'selected' : ''}>Security</option>
                                                <option value="Other" ${presetRole === 'Other' ? 'selected' : ''}>Other</option>
                                            </select>
                                            <label style="top:5px; font-size:0.7rem;">Position</label>
                                        </div>
                                        <div class="input-floating" id="salaryRoleOtherWrap" style="display:${presetRole === 'Other' ? 'block' : 'none'};"><input type="text" id="salaryStaffRoleOther" value="${presetOtherRole}" ${presetRole === 'Other' ? 'required' : ''}><label>Other Position</label></div>
                                        <div class="input-floating">
                                            <select id="salaryLocation" required>
                                                ${locations.map(loc => `<option value="${loc}" ${editingSalary?.location === loc ? 'selected' : ''}>${loc}</option>`).join('')}
                                            </select>
                                            <label style="top:5px; font-size:0.7rem;">Location</label>
                                        </div>
                                        <div class="input-floating"><input type="text" id="salaryAmount" value="${this.formatCurrencyInputValue(editingSalary?.amount || '')}" data-currency inputmode="numeric" autocomplete="off" required><label>Monthly Salary (₦)</label></div>
                                        <div class="input-floating"><input type="tel" id="salaryPhone" value="${editingSalary?.phone || ''}" oninput="this.value = this.value.replace(/[^0-9]/g, '')"><label>Phone Number</label></div>
                                        <div class="input-floating"><input type="email" id="salaryEmail" value="${editingSalary?.email || ''}"><label>Email Address</label></div>
                                    </div>
                                    <div style="display:flex; gap:12px; margin-top:10px; flex-wrap:wrap;">
                                        <button class="btn-primary" style="justify-content:center;">
                                            <i class="fa-solid ${editingSalary ? 'fa-pen-to-square' : 'fa-plus'}"></i> ${editingSalary ? 'Update Staff Detail' : 'Add Salary'}
                                        </button>
                                        ${editingSalary ? `<button type="button" class="btn-outline" onclick="app.cancelSalaryEdit()">Cancel Edit</button>` : ''}
                                    </div>
                                </form>
                                <div style="margin-top:20px; border-top:1px solid #eee; padding-top:16px;">
                                    <div style="font-size:0.9rem; color:var(--gray); margin-bottom:12px;">Current Total Salary</div>
                                    <div style="font-size:2rem; font-weight:700;">${this.formatCurrency(metrics.baselines.salary)}</div>
                                </div>
                            </div>
                            <div class="panel">
                                <h3 style="margin-top:0;"><i class="fa-solid fa-building-circle-check" style="color:var(--primary)"></i> Rent Registry</h3>
                                <form id="rentForm" onsubmit="event.preventDefault(); app.upsertRentEntry();" style="margin-top:20px;">
                                    <input type="hidden" id="rentEditLocation" value="${editingRent?.location || ''}">
                                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                                        <div class="input-floating">
                                            <select id="rentLocation" required>
                                                ${locations.map(loc => `<option value="${loc}" ${editingRent?.location === loc ? 'selected' : ''}>${loc}</option>`).join('')}
                                            </select>
                                            <label style="top:5px; font-size:0.7rem;">Location</label>
                                        </div>
                                        <div class="input-floating"><input type="text" id="rentAmount" value="${this.formatCurrencyInputValue(editingRent?.amount || '')}" data-currency inputmode="numeric" autocomplete="off" required><label>Rent Amount (₦)</label></div>
                                    </div>
                                    <button class="btn-primary" style="margin-top:10px; justify-content:center;">
                                        <i class="fa-solid fa-cloud-arrow-up"></i> ${editingRent ? 'Update Rent' : 'Save Rent'}
                                    </button>
                                </form>
                                <div style="margin-top:20px; border-top:1px solid #eee; padding-top:16px;">
                                    <div style="font-size:0.9rem; color:var(--gray); margin-bottom:12px;">Current Total Rent</div>
                                    <div style="font-size:2rem; font-weight:700;">${this.formatCurrency(metrics.baselines.rent)}</div>
                                </div>
                            </div>
                        </div>
                        <div class="panel">
                            <h3 style="margin-top:0;">Salary Ledger</h3>
                            ${this.salaryRegistry.length === 0 ? `<div style="padding:24px 0; color:var(--gray);">No staff salaries added yet.</div>` : this.salaryRegistry.map(entry => `
                                <div style="display:flex; justify-content:space-between; gap:16px; padding:16px 0; border-bottom:1px solid #eee;">
                                    <div>
                                        <div style="font-weight:600;">${entry.staffName}</div>
                                        <div style="font-size:0.84rem; color:var(--gray);">${entry.role} • ${entry.location}</div>
                                        <div style="font-size:0.8rem; color:var(--gray);">${entry.phone || 'No phone'} • ${entry.email || 'No email'}</div>
                                    </div>
                                    <div style="display:flex; gap:12px; align-items:center;">
                                        <strong>${this.formatCurrency(entry.amount)}</strong>
                                        <button class="btn-outline" onclick="app.startEditSalaryEntry('${entry.id}')"><i class="fa-solid fa-pen"></i></button>
                                        <button class="btn-outline" onclick="app.removeSalaryEntry('${entry.id}')" style="border-color:var(--danger); color:var(--danger);"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="panel">
                            <h3 style="margin-top:0;">Rent Ledger</h3>
                            ${this.rentRegistry.length === 0 ? `<div style="padding:24px 0; color:var(--gray);">No rent entries added yet.</div>` : this.rentRegistry.map(entry => `
                                <div style="display:flex; justify-content:space-between; gap:16px; padding:16px 0; border-bottom:1px solid #eee;">
                                    <div style="font-weight:600;">${entry.location}</div>
                                    <div style="display:flex; gap:12px; align-items:center;">
                                        <strong>${this.formatCurrency(entry.amount)}</strong>
                                        <button class="btn-outline" onclick="app.startEditRentEntry('${entry.location}')"><i class="fa-solid fa-pen"></i></button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        `;
                        })()}
                    ` : this.activeMgmtTab === 'refunds' ? `
                        <div class="panel">
                            <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap;">
                                <div>
                                    <h3 style="margin:0 0 6px 0;">Refund Management</h3>
                                    <p style="margin:0; color:var(--gray);">Track, approve, and export guest refunds from management.</p>
                                </div>
                                <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
                                    <div class="input-floating" style="margin:0; min-width:180px;">
                                        <select onchange="app.updateReportType('managementReportType', this.value)">
                                            <option value="expenditure" selected>Expenditure Report</option>
                                            <option value="income">Income Report</option>
                                        </select>
                                        <label style="top:5px; font-size:0.7rem;">Report Type</label>
                                    </div>
                                    <button class="btn-outline" onclick="app.exportReport('csv', 'management')"><i class="fa-solid fa-file-csv"></i> CSV</button>
                                    <button class="btn-outline" onclick="app.exportReport('excel', 'management')"><i class="fa-solid fa-file-excel"></i> Excel</button>
                                    <button class="btn-primary" onclick="app.exportReport('pdf', 'management')"><i class="fa-solid fa-file-pdf"></i> PDF</button>
                                </div>
                            </div>
                            ${this.renderRefundTab()}
                        </div>
                    ` : `
                        ${this.renderManagementPropertyTab()}
                    `}
                </div>
            `;

            if (this.activeMgmtTab === 'properties') {
                const grid = container.querySelector('.cards-grid');
                const properties = this.managementLocation === 'all'
                    ? this.inventory
                    : this.inventory.filter(item => item.loc === this.managementLocation);
                if (grid) properties.forEach(prop => grid.appendChild(this.createManagementPropertyCard(prop)));
            }
            if (this.activeMgmtTab === 'pl') {
                setTimeout(() => this.renderManagementPlChart(metrics), 50);
            }
        }
        
        renderChairmanDashboard(container) {
            const metrics = this.getExecutiveMetrics(this.chairmanDateFrom, this.chairmanDateTo, this.chairmanLocation);
            const locations = this.getAvailableLocations();
            const chairmanExpenses = this.getFilteredExpenditures(this.chairmanDateFrom, this.chairmanDateTo, this.chairmanLocation)
                .filter(exp => exp.status === 'Approved for chairman')
                .sort((a, b) => (b.approvedAt || b.date || '').localeCompare(a.approvedAt || a.date || ''))
                .slice(0, 8);

            container.innerHTML = `
                <div style="animation: fadeIn 0.5s ease;">
                    <div style="margin-bottom:24px;">
                        <h2 style="font-family:var(--font-body); font-size:2.3rem; margin:0 0 4px 0;">Chairman's Dashboard</h2>
                        <p style="color:var(--gray); margin:0;">Executive Overview</p>
                    </div>

                    <div class="panel" style="display:flex; gap:16px; flex-wrap:wrap; align-items:flex-end;">
                        <div class="input-floating" style="margin:0; min-width:155px;">
                            <input type="date" value="${this.chairmanDateFrom}" onchange="app.updateChairmanFilters('chairmanDateFrom', this.value)">
                            <label style="top:5px; font-size:0.7rem;">From</label>
                        </div>
                        <div class="input-floating" style="margin:0; min-width:155px;">
                            <input type="date" value="${this.chairmanDateTo}" onchange="app.updateChairmanFilters('chairmanDateTo', this.value)">
                            <label style="top:5px; font-size:0.7rem;">To</label>
                        </div>
                        <div class="input-floating" style="margin:0; min-width:220px;">
                            <select onchange="app.updateChairmanFilters('chairmanLocation', this.value)">
                                <option value="all" ${this.chairmanLocation === 'all' ? 'selected' : ''}>All Locations</option>
                                ${locations.map(loc => `<option value="${loc}" ${this.chairmanLocation === loc ? 'selected' : ''}>${loc}</option>`).join('')}
                            </select>
                            <label style="top:5px; font-size:0.7rem;">Location</label>
                        </div>
                    </div>

                    <div class="kpi-grid">
                        <div class="kpi-card" style="border-left:4px solid #ff5a6e;">
                            <div style="font-size:0.8rem; font-weight:700; letter-spacing:0.08em; color:var(--gray); text-transform:uppercase;">Net Revenue</div>
                            <div class="kpi-value">${this.formatCurrency(metrics.netRevenue)}</div>
                            <div style="color:var(--gray); font-size:0.9rem;">Target: ${this.formatCurrency((metrics.baselines.salary + metrics.baselines.sundry + metrics.baselines.rent) * 1.35)}</div>
                        </div>
                        <div class="kpi-card" style="border-left:4px solid #48a23f;">
                            <div style="font-size:0.8rem; font-weight:700; letter-spacing:0.08em; color:var(--gray); text-transform:uppercase;">Active Units</div>
                            <div class="kpi-value">${metrics.units.length}</div>
                            <div style="color:var(--gray); font-size:0.9rem;">Total Portfolio</div>
                        </div>
                        <div class="kpi-card" style="border-left:4px solid #f0a12b;">
                            <div style="font-size:0.8rem; font-weight:700; letter-spacing:0.08em; color:var(--gray); text-transform:uppercase;">Occupancy</div>
                            <div class="kpi-value">${metrics.occupancyRate}%</div>
                            <div style="color:var(--gray); font-size:0.9rem;">${metrics.occupiedUnits} Occupied / ${Math.max(metrics.units.length - metrics.occupiedUnits, 0)} Vacant</div>
                        </div>
                        <div class="kpi-card" style="border-left:4px solid #4b7bec;">
                            <div style="font-size:0.8rem; font-weight:700; letter-spacing:0.08em; color:var(--gray); text-transform:uppercase;">Total Guests</div>
                            <div class="kpi-value">${metrics.totalGuests}</div>
                            <div style="color:var(--gray); font-size:0.9rem;">Unique guests for this period</div>
                        </div>
                        <div class="kpi-card" style="border-left:4px solid #16a085;">
                            <div style="font-size:0.8rem; font-weight:700; letter-spacing:0.08em; color:var(--gray); text-transform:uppercase;">Total Paid</div>
                            <div class="kpi-value">${this.formatCurrency(metrics.totalPaid)}</div>
                            <div style="color:var(--gray); font-size:0.9rem;">Booking payments received</div>
                        </div>
                        <div class="kpi-card" style="border-left:4px solid #e67e22;">
                            <div style="font-size:0.8rem; font-weight:700; letter-spacing:0.08em; color:var(--gray); text-transform:uppercase;">Balance Remaining</div>
                            <div class="kpi-value">${this.formatCurrency(metrics.balanceRemaining)}</div>
                            <div style="color:var(--gray); font-size:0.9rem;">Outstanding guest balances</div>
                        </div>
                    </div>

                    <div class="panel" style="background:#23201f; color:white; margin-bottom:24px;">
                        <h3 style="margin-top:0; color:white;">Profit & Loss Statement</h3>
                        <div style="margin-top:18px; display:flex; flex-direction:column; gap:14px;">
                            <div style="display:flex; justify-content:space-between; color:#f4dede;"><span>Booking Revenue</span><strong>${this.formatCurrency(metrics.bookingRevenue)}</strong></div>
                            <div style="display:flex; justify-content:space-between; color:#f4dede;"><span>Other Income</span><strong>${this.formatCurrency(metrics.otherIncome)}</strong></div>
                            <div style="display:flex; justify-content:space-between; padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.12);"><span style="font-weight:700;">Gross Revenue</span><strong>${this.formatCurrency(metrics.grossRevenue)}</strong></div>
                            <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Refunds</span><strong>-${this.formatCurrency(metrics.refunds).replace('₦', '₦')}</strong></div>
                            <div style="display:flex; justify-content:space-between; padding:14px 0; border-top:1px solid rgba(255,255,255,0.12); border-bottom:1px solid rgba(255,255,255,0.12);"><span style="font-weight:700;">Net Revenue</span><strong>${this.formatCurrency(metrics.netRevenue)}</strong></div>
                            <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: VAT (12.5%)</span><strong>-${this.formatCurrency(metrics.vat)}</strong></div>
                            <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Maint (5%)</span><strong>-${this.formatCurrency(metrics.maintenance)}</strong></div>
                            <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Rent</span><strong>-${this.formatCurrency(metrics.baselines.rent)}</strong></div>
                            <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Total Sundry</span><strong>-${this.formatCurrency(metrics.recordedExpenses)}</strong></div>
                            <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Salaries</span><strong>-${this.formatCurrency(metrics.baselines.salary)}</strong></div>
                            <div style="display:flex; justify-content:space-between; margin-top:12px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.15); font-size:1.05rem;"><span style="font-weight:700;">Operating Profit / Loss</span><strong style="color:${metrics.operatingProfit >= 0 ? '#7ED957' : '#FF8B8B'}">${this.formatCurrency(metrics.operatingProfit)}</strong></div>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:minmax(320px, 1fr) minmax(320px, 1fr); gap:24px; margin-bottom:24px;">
                        <div class="panel">
                            <h3 style="margin-top:0; color:var(--gray); font-size:1.1rem;"><i class="fa-solid fa-chart-column"></i> Revenue Distribution</h3>
                            <div style="position:relative; height:260px; width:100%;">
                                <canvas id="chairRevenueChart" style="display:block; width:100%; height:100%;"></canvas>
                            </div>
                        </div>
                        <div class="panel">
                            <h3 style="margin-top:0; color:var(--gray); font-size:1.1rem;"><i class="fa-solid fa-chart-pie"></i> Occupancy Status</h3>
                            <div style="position:relative; height:260px; width:100%;">
                                <canvas id="chairOccupancyChart" style="display:block; width:100%; height:100%;"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="panel">
                        <h3 style="margin-top:0;"><i class="fa-solid fa-map-location-dot" style="color:var(--primary)"></i> Property Map Overview</h3>
                        <div id="chairmanMap" style="height:380px; border-radius:var(--radius-md); margin-top:20px; z-index:1;"></div>
                    </div>

                    <div class="panel">
                        <h3 style="margin-top:0;">Chairman Expenditure Table</h3>
                        <p style="color:var(--gray); margin:6px 0 18px 0;">Only requests approved by another staff member are shown here.</p>
                        ${chairmanExpenses.length === 0 ? `<div style="padding:18px 0; color:var(--gray);">No approved expenditure requests available for this filter.</div>` : `
                            <div style="overflow:auto;">
                                <table style="width:100%; border-collapse:collapse;">
                                    <thead>
                                        <tr style="background:#1a1a1a; color:white;">
                                            <th style="padding:12px; text-align:left;">Date</th>
                                            <th style="padding:12px; text-align:left;">Title</th>
                                            <th style="padding:12px; text-align:left;">Location</th>
                                            <th style="padding:12px; text-align:left;">Requested By</th>
                                            <th style="padding:12px; text-align:left;">Approved By</th>
                                            <th style="padding:12px; text-align:right;">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${chairmanExpenses.map(exp => `
                                            <tr style="border-bottom:1px solid #eee;">
                                                <td style="padding:12px;">${exp.approvedAt || exp.date}</td>
                                                <td style="padding:12px;">${exp.title || exp.details}</td>
                                                <td style="padding:12px;">${exp.scope}</td>
                                                <td style="padding:12px;">${exp.requestedBy || exp.staffId}</td>
                                                <td style="padding:12px;">${exp.approver || '-'}</td>
                                                <td style="padding:12px; text-align:right; font-weight:700;">${this.formatCurrency(exp.amount)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>

                    <div class="panel">
                        <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap;">
                            <div>
                                <h3 style="margin:0 0 6px 0;">Download Executive Report</h3>
                                <p style="margin:0; color:var(--gray);">Export the current chairman view as income or expenditure.</p>
                            </div>
                            <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
                                <div class="input-floating" style="margin:0; min-width:180px;">
                                    <select onchange="app.updateReportType('chairmanReportType', this.value)">
                                        <option value="income" ${this.chairmanReportType === 'income' ? 'selected' : ''}>Income Report</option>
                                        <option value="expenditure" ${this.chairmanReportType === 'expenditure' ? 'selected' : ''}>Expenditure Report</option>
                                    </select>
                                    <label style="top:5px; font-size:0.7rem;">Report Type</label>
                                </div>
                                <button class="btn-outline" onclick="app.exportReport('csv', 'chairman')"><i class="fa-solid fa-file-csv"></i> CSV</button>
                                <button class="btn-outline" onclick="app.exportReport('excel', 'chairman')"><i class="fa-solid fa-file-excel"></i> Excel</button>
                                <button class="btn-primary" onclick="app.exportReport('pdf', 'chairman')"><i class="fa-solid fa-file-pdf"></i> PDF</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            setTimeout(() => {
                this.renderChairmanCharts(metrics);
                this.initChairmanMap();
            }, 50);
        }

        renderManagementPlChart(metrics) {
            const canvas = document.getElementById('managementPlChart');
            if (!canvas) return;
            if (this.managementPlChart) this.managementPlChart.destroy();

            this.managementPlChart = new Chart(canvas.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: ['Booking Revenue', 'Other Income', 'Salaries', 'Rent', 'Sundry', 'Outstanding Balance'],
                    datasets: [{
                        data: [
                            metrics.bookingRevenue,
                            metrics.otherIncome,
                            metrics.baselines.salary,
                            metrics.baselines.rent,
                            metrics.recordedExpenses,
                            metrics.balanceRemaining
                        ],
                        backgroundColor: ['#ff5a6e', '#2e9b4b', '#111111', '#f0a12b', '#6d6d6d', '#4b7bec'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }

        renderChairmanCharts(metrics) {
            const revenueCanvas = document.getElementById('chairRevenueChart');
            const occupancyCanvas = document.getElementById('chairOccupancyChart');
            if (!revenueCanvas || !occupancyCanvas) return;

            const locations = this.chairmanLocation === 'all' ? this.getAvailableLocations() : [this.chairmanLocation];
            const revenuePerLocation = locations.map(loc =>
                this.getFilteredTransactions(this.chairmanDateFrom, this.chairmanDateTo, loc)
                    .reduce((sum, tx) => sum + (tx.amount || 0), 0)
            );

            if (this.chairRevenueChart) this.chairRevenueChart.destroy();
            if (this.chairOccupancyChart) this.chairOccupancyChart.destroy();

            this.chairRevenueChart = new Chart(revenueCanvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: locations,
                    datasets: [{
                        label: 'Gross Revenue (₦)',
                        data: revenuePerLocation,
                        backgroundColor: '#ff5a6e',
                        borderRadius: 10,
                        maxBarThickness: 48
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true } },
                    scales: {
                        y: { beginAtZero: true, ticks: { callback: value => this.formatCurrency(value) } }
                    }
                }
            });

            this.chairOccupancyChart = new Chart(occupancyCanvas.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Occupied', 'Vacant'],
                    datasets: [{
                        data: [metrics.occupiedUnits, Math.max(metrics.units.length - metrics.occupiedUnits, 0)],
                        backgroundColor: ['#3f8f2d', '#ebebeb'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '68%',
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }

        initChairmanMap() {
            const elementId = 'chairmanMap';
            const element = document.getElementById(elementId);
            if (!element) return;
            if (this.maps && this.maps[elementId]) this.maps[elementId].remove();

            const map = L.map(elementId).setView([9.0765, 7.3986], 12);
            this.addBaseTileLayer(map);

            const filteredUnits = this.getFilteredInventory(this.chairmanLocation);
            const bounds = [];

            filteredUnits.forEach(unit => {
                const lat = parseFloat(unit.coords?.lat);
                const lng = parseFloat(unit.coords?.lng);
                if (isNaN(lat) || isNaN(lng)) return;

                const marker = L.circleMarker([lat, lng], {
                    radius: 8,
                    color: unit.status === 'occupied' ? '#3f8f2d' : '#ff5a6e',
                    fillColor: unit.status === 'occupied' ? '#3f8f2d' : '#ff5a6e',
                    fillOpacity: 0.9,
                    weight: 2
                }).addTo(map);

                marker.bindPopup(`<strong>${unit.name}</strong><br>${unit.loc}<br>${unit.status === 'occupied' ? 'Occupied' : 'Available'}`);
                bounds.push([lat, lng]);
            });

            if (bounds.length) {
                map.fitBounds(bounds, { padding: [30, 30] });
            }

            if (!this.maps) this.maps = {};
            this.maps[elementId] = map;
            setTimeout(() => map.invalidateSize(), 150);
        }

        // Core Functions
        requestRole(r) {
            if (this.role === 'host') {
                this.hostDashboardRole = r;
                this.render();
                return;
            }
            if(r === 'staff') { this.setRole('staff'); return; }
            this.pendingRole = r;
            document.getElementById('pinModal').style.display = 'flex';
            setTimeout(() => document.getElementById('pinModal').classList.add('show'), 10);
            setTimeout(() => document.getElementById('rolePinInput').focus(), 50); 
        }

        verifyPin() {
            const p = document.getElementById('rolePinInput').value;
            if(p === this.rolePins[this.pendingRole]) { 
                this.setRole(this.pendingRole); 
                this.closeModal(); 
                this.showNotification(`Authorized as ${this.pendingRole.toUpperCase()}`, "success");
            } else { 
                this.showNotification("Security Clearance Failed", "error");
            }
            document.getElementById('rolePinInput').value = '';
        }

        setRole(r) {
            this.role = r;
            if (r !== 'host') this.hostDashboardRole = 'host';
            this.render();
        }
        setStaffTab(t) { this.activeStaffTab = t; this.render(); if(t === 'map') setTimeout(() => this.initMap('staffMap'), 500); }
        formatCurrency(n) { return "₦" + Math.round(n).toLocaleString(); }
        updateSearch(v) { this.searchQuery = v; this.renderFilteredGrid(document.getElementById('gridArea')); }
        
        updateSyncUI(s) {
            const dot = document.getElementById('syncDot');
            if(dot) dot.className = `sync-dot ${s === 'online' ? 'online' : s === 'syncing' ? 'syncing' : 'offline'}`;
            const statusText = document.getElementById('syncStatus');
            if(statusText) statusText.innerText = s === 'online' ? 'Engine Live' : s === 'syncing' ? 'Syncing...' : 'Local Mode';
        }
        
        closeModal() { closeModals(); }

        openBookingModal(mode, id) {
            const prop = this.inventory.find(i => i.id === id);
            if(!prop) return;

            this.activeModalPropId = id;
            this.activeModalMode = mode;
            document.getElementById('modalPropName').innerText = prop.name;
            document.getElementById('modalPropPrice').innerText = this.formatCurrency(prop.price) + " / night";
            
            // Auto-set dates to Today and Tomorrow to trigger estimate immediately
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            document.getElementById('checkInDate').value = today.toISOString().split('T')[0];
            document.getElementById('checkOutDate').value = tomorrow.toISOString().split('T')[0];

            // Clear previous inputs
            document.getElementById('guestName').value = '';
            document.getElementById('guestPhone').value = '';
            document.getElementById('guestEmail').value = '';
            this.setCurrencyInputValue('cautionFeePaid', 0);
            
            const btn = document.getElementById('btnConfirm');
            if(mode === 'guest') {
                btn.innerHTML = '<i class="fa-solid fa-credit-card"></i> Proceed to Secure Payment';
            } else {
                btn.innerHTML = '<i class="fa-solid fa-lock"></i> Confirm & Generate Entry Code';
            }

            document.getElementById('bookingModal').style.display = 'flex';
            setTimeout(() => document.getElementById('bookingModal').classList.add('show'), 10);
            this.calcTotal();
        }

        calcTotal() {
            const checkInEl = document.getElementById('checkInDate');
            const checkOutEl = document.getElementById('checkOutDate');
            
            let d1 = new Date(checkInEl.value);
            let d2 = new Date(checkOutEl.value);
            
            // Strictly enforce Checkout is ahead of Check-In
            if (isNaN(d2) || d2 <= d1) {
                d2 = new Date(d1);
                d2.setDate(d2.getDate() + 1);
                checkOutEl.value = d2.toISOString().split('T')[0];
            }
            
            // Dynamically set minimum checkout date attribute
            let minOut = new Date(d1);
            minOut.setDate(minOut.getDate() + 1);
            checkOutEl.min = minOut.toISOString().split('T')[0];

            const nights = Math.max(1, Math.ceil((d2 - d1) / 86400000));
            document.getElementById('nightCount').innerText = isNaN(nights) ? 1 : nights;
            const p = this.inventory.find(i => i.id === this.activeModalPropId);
            const total = (p ? p.price : 0) * (isNaN(nights) ? 1 : nights);
            document.getElementById('modalTotal').innerText = this.formatCurrency(total);
            this.setCurrencyInputValue('actualPaid', total);
        }

        async generateLockCode() {
            // Mocking lock API delay for UI demonstration
            return new Promise(resolve => {
                setTimeout(() => { resolve(Math.floor(100000 + Math.random() * 900000).toString()); }, 800);
            });
        }

        async confirmBooking() {
            const p = this.inventory.find(i => i.id === this.activeModalPropId);
            const paid = this.parseCurrencyValue(document.getElementById('actualPaid').value);
            const cautionFee = this.parseCurrencyValue(document.getElementById('cautionFeePaid').value) || 0;
            const guest = document.getElementById('guestName').value;
            const phone = document.getElementById('guestPhone').value;
            const email = document.getElementById('guestEmail').value;
            const checkIn = document.getElementById('checkInDate').value;
            const checkOut = document.getElementById('checkOutDate').value;
            const estimatedTotal = this.parseCurrencyValue(document.getElementById('modalTotal').innerText);

            if(!p || !guest || !phone || isNaN(paid)) {
                 this.showNotification("Please fill in all required details (Name, Phone, Amount)", "error"); return;
            }

            const btn = document.getElementById('btnConfirm');
            const originalText = btn.innerHTML;
            
            if(this.activeModalMode === 'guest') {
                btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Processing Secure Payment...`;
            } else {
                btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Generating Secure Code...`;
            }
            btn.disabled = true;

            const doorCode = await this.generateLockCode();

            p.status = 'occupied'; p.guestName = guest; p.accessCode = doorCode; 
            
            const transaction = { 
                id: `tx_${Date.now()}`,
                date: new Date().toISOString().split('T')[0], 
                propId: p.id, amount: paid, estimatedTotal, cautionFee, guest: guest, phone: phone, email: email, accessCode: doorCode, checkIn, checkOut
            };
            this.transactions.push(transaction);

            this.saveLocalData();
            this.closeModal(); // Closes the booking modal
            
            // Populate and Show the Beautiful Receipt Modal
            const receiptData = this.getTransactionReceiptData(transaction);
            this.currentReceiptData = receiptData;
            document.getElementById('recGuest').innerText = receiptData.guest;
            document.getElementById('recProp').innerText = receiptData.property;
            document.getElementById('recIn').innerText = receiptData.checkIn;
            document.getElementById('recOut').innerText = receiptData.checkOut;
            document.getElementById('recTotal').innerText = this.formatCurrency(receiptData.total);
            document.getElementById('recCode').innerText = receiptData.code;

            document.getElementById('receiptModal').style.display = 'flex';
            setTimeout(() => document.getElementById('receiptModal').classList.add('show'), 10);
            
            if(this.activeModalMode === 'guest') {
                this.showNotification("Booking confirmed & Payment processed!", "success");
            } else {
                this.showNotification("Booking confirmed & Locks synced!", "success");
            }
            
            btn.innerHTML = originalText;
            btn.disabled = false;
        }

        checkout(id) {
            const p = this.inventory.find(i => i.id === id);
            if (!p) return;
            p.status = 'available'; p.guestName = null; p.accessCode = null;
            this.saveLocalData();
            this.showNotification("Unit reset and locks cleared.", "info");
        }

        initMap(elementId) {
            if (!document.getElementById(elementId)) return;
            if (this.maps && this.maps[elementId]) { this.maps[elementId].remove(); }
            
            const map = L.map(elementId).setView([9.0765, 7.3986], 12);
            this.addBaseTileLayer(map);

            const redIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
            });

            // Put a marker for every property currently loaded in inventory
            this.inventory.forEach(p => {
                if(p.coords && !isNaN(parseFloat(p.coords.lat)) && !isNaN(parseFloat(p.coords.lng))) {
                    // Small jitter to prevent perfectly overlapping pins
                    const jitterLat = parseFloat(p.coords.lat) + (Math.random() - 0.5) * 0.001;
                    const jitterLng = parseFloat(p.coords.lng) + (Math.random() - 0.5) * 0.001;
                    
                    L.marker([jitterLat, jitterLng], {icon: redIcon}).addTo(map)
                        .bindPopup(`<b>${p.name}</b><br>${p.loc}`);
                }
            });
            
            if(!this.maps) this.maps = {};
            this.maps[elementId] = map;
            
            setTimeout(() => map.invalidateSize(), 300);
        }
    }
