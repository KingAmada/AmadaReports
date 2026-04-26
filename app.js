    // --- MARKETING UI LOGIC ---
    
    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('mainHeader');
        if (window.scrollY > 50) header.classList.add('header-scrolled');
        else header.classList.remove('header-scrolled');
    });

    const SUPABASE_URL = 'https://ozodqvrjzlcjgorntazt.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96b2RxdnJqemxjamdvcm50YXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NDAxNDMsImV4cCI6MjA5MDUxNjE0M30.TC4eylpgt3jFaNYQosaAYp_l_ojVMrgtHTnce274tk0';
    let activeViewRequestId = 0;

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

    function openGuestAccessModal() {
        const modal = document.getElementById('guestAccessModal');
        if (!modal) return;
        const phone = document.getElementById('guestAccessPhone');
        const code = document.getElementById('guestAccessCode');
        const output = document.getElementById('guestAccessReservationsArea');
        if (phone) phone.value = '';
        if (code) code.value = '';
        if (output) output.innerHTML = '';
        if(!window.appInitialized) {
            window.app = new AmadaApp();
            window.appInitialized = true;
        }
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    async function submitGuestAccessLookup() {
        if(!window.appInitialized) {
            window.app = new AmadaApp();
            window.appInitialized = true;
        }
        if (window.app?.ready) await window.app.ready;
        window.app?.lookupGuestAccessReservations();
    }

    async function submitLogin() {
        closeModals();
        if(!window.appInitialized) {
            window.app = new AmadaApp();
            window.appInitialized = true;
        }
        if (window.app?.ready) await window.app.ready;
        
        if (currentLoginMode === 'host') {
            const email = document.getElementById('loginEmail').value;
            const pass = document.getElementById('loginPass').value;
            await window.app.loginHost(email, pass);
        } else {
            const staffId = document.getElementById('loginStaffId').value;
            const pin = document.getElementById('loginPin').value;
            await window.app.loginStaff(staffId, pin);
        }
        
        document.getElementById('hostLoginForm').reset();
    }

    // View Switcher (SPA Navigation)
    async function switchView(view) {
        closeMobileMenu();
        const requestId = ++activeViewRequestId;
        const resolvedView = view === 'home' ? 'guest' : view;
        document.getElementById('homeView').style.display = resolvedView === 'marketing' ? 'block' : 'none';
        document.getElementById('hostView').style.display = resolvedView === 'host' ? 'block' : 'none';
        document.getElementById('topBanner').style.display = resolvedView === 'marketing' ? 'flex' : 'none';
        document.getElementById('mainHeader').style.display = (resolvedView === 'marketing' || resolvedView === 'host' || resolvedView === 'guest') ? 'block' : 'none';
        document.getElementById('guestView').style.display = resolvedView === 'guest' ? 'block' : 'none';
        
        const portal = document.getElementById('portalView');
        if(resolvedView === 'portal' || resolvedView === 'guest') {
            portal.style.display = resolvedView === 'portal' ? 'block' : 'none';
            if(!window.appInitialized) {
                window.app = new AmadaApp();
                window.appInitialized = true;
            } else if (resolvedView === 'portal') {
                window.app.render();
            }
            if(resolvedView === 'guest' && window.app) {
                window.app.showGuestExperienceLoader();
                await Promise.all([
                    window.app?.ready || Promise.resolve(),
                    new Promise(resolve => setTimeout(resolve, 1200))
                ]);
                if (requestId !== activeViewRequestId) return;
                window.app.initExclusiveGuestPage();
                await new Promise(resolve => setTimeout(resolve, 220));
                if (requestId !== activeViewRequestId) return;
                window.app.hideGuestExperienceLoader();
            } else if (window.app?.ready) {
                await window.app.ready;
                if (requestId !== activeViewRequestId) return;
            }
        } else {
            portal.style.display = 'none';
            window.app?.hideGuestExperienceLoader();
        }
        if (resolvedView === 'host') updateCalc();
        window.scrollTo(0, 0);
    }

    function closeMobileMenu() {
        const links = document.querySelector('#mainHeader .nav-links');
        const button = document.querySelector('#mainHeader .mobile-menu-button');
        links?.classList.remove('is-open');
        button?.setAttribute('aria-expanded', 'false');
        button?.querySelector('i')?.classList.remove('fa-xmark');
        button?.querySelector('i')?.classList.add('fa-bars');
    }

    function toggleMobileMenu() {
        const links = document.querySelector('#mainHeader .nav-links');
        const button = document.querySelector('#mainHeader .mobile-menu-button');
        if (!links || !button) return;
        const isOpen = links.classList.toggle('is-open');
        button.setAttribute('aria-expanded', String(isOpen));
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars', !isOpen);
            icon.classList.toggle('fa-xmark', isOpen);
        }
    }

    window.toggleMobileMenu = toggleMobileMenu;
    window.closeMobileMenu = closeMobileMenu;
    window.switchView = switchView;

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

    function clearAuthUrlState() {
        if (!window.location.hash && !window.location.search) return;
        const cleanUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.replaceState({}, document.title, cleanUrl);
    }

    function closeModals() {
        document.querySelectorAll('.modal').forEach(m => { 
            m.classList.remove('show'); 
            setTimeout(() => m.style.display = 'none', 300); 
        });
    }

    function closeModalById(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    function refreshFloatingLabels(root = document) {
        root.querySelectorAll('.input-floating').forEach(wrapper => {
            const field = wrapper.querySelector('input, select, textarea');
            if (!field) return;
            const hasValue = field.value != null && String(field.value).trim() !== '';
            wrapper.classList.toggle('is-filled', hasValue);
        });
    }

    function formatPromoCountdown(totalSeconds) {
        const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const secs = String(totalSeconds % 60).padStart(2, '0');
        return `${mins}:${secs}`;
    }

    function getCurrentRafflePeriodStartMs(referenceDate = new Date()) {
        const start = new Date(referenceDate);
        const daysSinceFriday = (start.getDay() + 2) % 7;
        start.setDate(start.getDate() - daysSinceFriday);
        start.setHours(17, 0, 0, 0);
        if (referenceDate.getTime() < start.getTime()) {
            start.setDate(start.getDate() - 7);
        }
        return start.getTime();
    }

    function updateRaffleGuestCountDisplay(count) {
        const countEl = document.getElementById('guestRaffleCount');
        if (!countEl) return;
        countEl.innerText = Math.max(0, Number(count) || 0).toLocaleString();
    }

    function hydrateRaffleGuestCount() {
        const countEl = document.getElementById('guestRaffleCount');
        if (!countEl) return;

        const storageKey = 'bookily-raffle-guest-count';
        const now = Date.now();
        const periodStartAt = getCurrentRafflePeriodStartMs(new Date(now));

        let state = {
            count: 0,
            periodStartAt
        };

        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                state.count = Math.max(0, Number(parsed.count) || 0);
                state.periodStartAt = Number(parsed.periodStartAt) || periodStartAt;
            }
        } catch {}

        if (state.periodStartAt !== periodStartAt) {
            state = {
                count: 0,
                periodStartAt
            };
        }

        updateRaffleGuestCountDisplay(state.count);

        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch {}
    }

    let deferredPwaInstallPrompt = null;
    let pwaInstallDismissed = false;
    let pwaInstallCycleTimer = null;

    function isPwaInstallDisabledOnPage() {
        return document.body?.dataset.disablePwaInstall === 'true';
    }

    function setPwaInstallVisibility(visible) {
        if (isPwaInstallDisabledOnPage()) visible = false;
        const headerButton = document.getElementById('installAppButton');
        const floatingPrompt = document.getElementById('pwaInstallPrompt');
        const canShow = visible && !pwaInstallDismissed;
        if (headerButton) headerButton.hidden = !canShow;
        if (floatingPrompt) floatingPrompt.hidden = !canShow;
    }

    function schedulePwaInstallCycle() {
        clearTimeout(pwaInstallCycleTimer);
        if (!deferredPwaInstallPrompt || pwaInstallDismissed || isPwaInstallDisabledOnPage()) return;
        pwaInstallCycleTimer = setTimeout(() => {
            setPwaInstallVisibility(false);
            pwaInstallCycleTimer = setTimeout(() => {
                if (deferredPwaInstallPrompt && !pwaInstallDismissed) {
                    setPwaInstallVisibility(true);
                    schedulePwaInstallCycle();
                }
            }, 18000);
        }, 7000);
    }

    function dismissPwaInstallPrompt() {
        pwaInstallDismissed = true;
        clearTimeout(pwaInstallCycleTimer);
        setPwaInstallVisibility(false);
    }

    async function promptPwaInstall() {
        if (isPwaInstallDisabledOnPage()) return;
        if (!deferredPwaInstallPrompt) {
            if (window.app?.showNotification) {
                window.app.showNotification('Install is available when your browser offers the app prompt. If you are on iPhone, use Share > Add to Home Screen.', 'info');
            } else {
                alert('Install is available when your browser offers the app prompt. If you are on iPhone, use Share > Add to Home Screen.');
            }
            return;
        }

        deferredPwaInstallPrompt.prompt();
        const { outcome } = await deferredPwaInstallPrompt.userChoice;
        if (outcome === 'accepted') {
            dismissPwaInstallPrompt();
        }
        deferredPwaInstallPrompt = null;
        clearTimeout(pwaInstallCycleTimer);
        setPwaInstallVisibility(false);
    }

    async function registerBookilyServiceWorker() {
        const isInstallableOrigin = window.location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(window.location.hostname);
        if (!('serviceWorker' in navigator) || !isInstallableOrigin) return;
        try {
            await navigator.serviceWorker.register('./sw.js');
        } catch (error) {
            console.warn('Service worker registration failed:', error);
        }
    }

    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        if (isPwaInstallDisabledOnPage()) return;
        deferredPwaInstallPrompt = event;
        pwaInstallDismissed = false;
        setPwaInstallVisibility(true);
        schedulePwaInstallCycle();
    });

    window.addEventListener('appinstalled', () => {
        deferredPwaInstallPrompt = null;
        dismissPwaInstallPrompt();
        if (window.app?.showNotification) {
            window.app.showNotification('Bookily installed successfully.', 'success');
        }
    });

    window.addEventListener('load', () => {
        registerBookilyServiceWorker();
        setPwaInstallVisibility(false);
        hydrateRaffleGuestCount();
        switchView(document.body.dataset.initialView || 'home');
    });

    let tickSound = null;

    function setupSounds() {
        if (typeof Tone === 'undefined') return null;
        if (tickSound) return tickSound;

        try {
            tickSound = new Tone.MembraneSynth({
                pitchDecay: 0.008,
                octaves: 2,
                envelope: { attack: 0.0006, decay: 0.1, sustain: 0 }
            }).toDestination();
        } catch {
            tickSound = null;
        }

        return tickSound;
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
                    <p>By creating an account, listing a property, or using Bookily Stays to book accommodation, you agree to provide accurate information, keep your login credentials secure, and comply with all applicable laws and house rules.</p>
                    <p>Hosts are responsible for listing accuracy, lawful occupancy, and maintaining safe, habitable spaces. Guests are responsible for timely payment, lawful use of the property, and any damages outside normal wear and tear.</p>
                    <p>Bookily Stays may suspend access, remove listings, or restrict bookings where there is fraud, misuse, policy breach, non-payment, or legal risk. Refunds, caution fees, and access credentials may be reviewed against recorded booking data and internal approval workflows.</p>
                `
            },
            privacy: {
                title: 'Privacy Statement',
                body: `
                    <p>Bookily Stays collects only the information needed to run bookings, host onboarding, operations, finance workflows, and team access control. This may include names, email addresses, phone numbers, booking dates, payment records, staff IDs, and property details.</p>
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
        setTimeout(async () => {
            closeModals();
            if(!window.appInitialized) {
                window.app = new AmadaApp();
                window.appInitialized = true;
            }
            if (window.app?.ready) await window.app.ready;
            
            const name = document.getElementById('hostFullName').value;
            const email = document.getElementById('hostEmail').value;
            const phone = document.getElementById('hostPhone').value.trim();
            const pass = document.getElementById('hostPassword').value;

            if (!/^\d{11}$/.test(phone)) {
                btn.innerHTML = originalText;
                btn.disabled = false;
                openHostModal();
                document.getElementById('hostPhone').focus();
                form.reportValidity();
                return;
            }
            
            await window.app.registerNewHost(name, email, phone, pass);
            
            // Reset form and button state for next time
            form.reset();
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 1200);
    }


    // --- THE ENGINE LOGIC (Refactored Bookily Engine App) ---
    class AmadaApp {
        constructor() {
            this.supabase = window.supabase?.createClient
                ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
                : null;
            this.syncDebounceTimer = null;
            this.syncInFlight = null;
            this.syncQueued = false;
            this.authUser = null;
            
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
            this.guestFilters = { rooms: 'all', priceRange: 'all', location: 'all', city: 'all', state: 'all' };
            this.guestSortBy = 'default';

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
            this.vatPercentage = 12.5;
            this.maintenancePercentage = 5;
            
            this.hosts = [];
            this.teamMembers = [];
            this.currentHostEmail = null;
            this.currentUser = null;
            this.guestSearchQuery = '';
            this.guestViewMode = 'grid';
            this.staffViewMode = 'grid';
            this.currentRewardData = null;
            this.currentRewardTransactionId = null;
            this.pendingReceiptData = null;
            this.rewardPrizes = [
                { label: 'Free Drinks On Us', detail: 'A complimentary drinks reward attached to this reservation.', color: '#ff5c7a' },
                { label: 'Free Massage', detail: 'A relaxing massage reward unlocked after booking.', color: '#ffb347' },
                { label: '100% Booking Refund', detail: 'One lucky guest gets the full booking amount refunded.', color: '#ffd166' },
                { label: 'Free Stay Protection', detail: 'A complimentary stay protection perk added to your booking.', color: '#06d6a0' },
                { label: 'Free Dinner', detail: 'Dinner is covered on us for this stay.', color: '#118ab2' },
                { label: 'Free Lunch', detail: 'A lunch reward is now attached to your reservation.', color: '#7b61ff' },
                { label: 'Free Night', detail: 'A lucky guest bonus that can turn this stay into an even bigger win.', color: '#9c6644' },
                { label: '15% Off Next Stay', detail: 'A comeback discount for your next direct booking.', color: '#ef476f' }
            ];
            this.rewardWheelState = {
                angle: 0,
                spinning: false,
                selectedIndex: null
            };
            this.flashOfferInterval = null;
            this.mealOfferInterval = null;
            this.exclusiveGuestInitialized = false;
            this.exclusiveHeroInterval = null;
            this.exclusiveMasterTimerInterval = null;
            this.exclusiveModalTimerInterval = null;
            this.exclusiveSocialProofInterval = null;
            this.exclusiveLiveWinnersInterval = null;
            this.exclusivePerksWidgetInterval = null;
            this.guestLoaderQuoteInterval = null;
            this.exclusiveHasTriggeredExit = false;
            this.exclusiveBookingConfirmed = false;
            this.exclusiveTimerStateLoaded = false;
            this.exclusiveCurrentSlide = 0;
            this.exclusiveDiscountPhase = 1;
            this.exclusiveDiscountTimeLeft = 35;
            this.exclusiveHeroVipTimeLeft = 225;
            this.exclusiveModalTimeLeft = 300;
            this.exclusivePerkDurations = [45, 75, 105, 135, 165, 195, 225];
            this.exclusivePerkLost = [false, false, false, false, false, false, false];
            this.exclusiveIsSpinning = false;
            this.exclusiveCurrentPrizeData = null;
            this.exclusiveSelectedPropertyId = null;
            this.exclusivePendingTransactionId = null;
            this.exclusiveRewardReceiptTxId = null;
            this.exclusiveSpinState = {
                angle: 0,
                phase: 'idle',
                animationStartTime: null,
                initialStartAngle: 0,
                initialTargetAngle: 0,
                bounceStartAngle: 0,
                bounceTargetAngle: 0,
                pointerSwinging: false,
                pointerSwingStartTime: 0,
                lastTickAngle: 0
            };
            this.exclusiveHeroSlides = [
                {
                    title: "You Deserve The Absolute Best.",
                    subtitle: "Book coded stays in the most exclusive locations.",
                    perkTitle: "LUCKY GUESTS GET A",
                    perkHighlight: "FREE NIGHT",
                    perkIcon: "fa-moon"
                },
                {
                    title: "Luxury Apartments For People Like You.",
                    subtitle: "Book lowkey apartments with world-class amenities.",
                    perkTitle: "UNLIMITED",
                    perkHighlight: "FREE DRINKS ON US",
                    perkIcon: "fa-martini-glass-citrus"
                },
                {
                    title: "Unmatched Comfort & Privacy.",
                    subtitle: "Your staycation elevated to the highest standard.",
                    perkTitle: "WIN A RELAXING",
                    perkHighlight: "FREE MASSAGE",
                    perkIcon: "fa-spa"
                }
            ];
            this.exclusiveToastNames = ["Thomas", "Sarah", "Oluwaseun", "Chioma", "Ahmad", "Nneka", "Eze"];
            this.exclusiveToastLocations = ["Maitama", "Wuse 2", "Asokoro", "Gwarinpa", "Katampe", "Lagos"];
            this.exclusiveToastActions = ["just booked the Penthouse!", "claimed a Free Massage!", "won a Free Night!", "secured 15% Off!", "got 100% Refunded!", "activated Free Protection!"];
            this.guestLoaderQuotes = [
                'Every Friday we hold a raffle draw and 7 guests win Free Nights, 100% Refund, 50% off their next booking, Free Lunch, Late Checkout, and more.',
                'Our guests win free nights when they book.',
                'Our guests win free lunch when they book.',
                'You might be lucky too and get 50% off.',
                'Direct bookings unlock surprise rewards attached instantly to confirmed reservations.',
                'Some guests walk away with full refunds after booking through the Friday raffle draw.',
                'Booked stays can unlock free lunch, free nights, late checkout, and comeback discounts.',
                'The next booking could come with a 50% discount if the raffle lands in your favor.',
                'Guests who book early stay eligible for the strongest reward drops and timed perks.',
                'Free nights, refund wins, meal perks, and bonus discounts are built into the Bookily experience.'
            ];
            this.guestLoaderTestimonials = [
                { name: 'Amaka E.', role: 'Weekend guest', text: 'Booked in minutes and still landed a reward on top of the stay.' },
                { name: 'David T.', role: 'Business traveler', text: 'The apartment was ready, the receipt was instant, and the process felt properly premium.' },
                { name: 'Zainab O.', role: 'Returning guest', text: 'I won free lunch after booking once and have been coming back since.' },
                { name: 'Michael A.', role: 'Long-stay guest', text: 'The map view, pricing, and access flow made the booking feel clear from the start.' },
                { name: 'Chinelo U.', role: 'Holiday guest', text: 'I did not expect the raffle perks to be real until my receipt showed the reward.' }
            ];
            this.exclusivePerkPrizeDefinitions = [
                { text: "FREE NIGHT", colors: { start: "#D4AF37", end: "#B8860B" }, detail: "Your entire stay is on us. 100% comped." },
                { text: "50% OFF", colors: { start: "#D32F2F", end: "#8B0000" }, detail: "We are slashing 50% off your total bill." },
                { text: "10% OFF", colors: { start: "#FFFFFF", end: "#F3F4F6" }, detail: "A 10% discount has been attached to your booking.", textColor: "#111111" },
                { text: "FREE RIDE", colors: { start: "#D4AF37", end: "#B8860B" }, detail: "Your ride booking is on us for this stay." },
                { text: "FREE LUNCH", colors: { start: "#FFFFFF", end: "#F3F4F6" }, detail: "A complimentary luxury lunch experience.", textColor: "#111111" },
                { text: "LATE CHECKOUT", colors: { start: "#D32F2F", end: "#8B0000" }, detail: "Enjoy extra time before checkout at no extra cost." },
                { text: "FREE PROTECTION", colors: { start: "#FFFFFF", end: "#F3F4F6" }, detail: "Premium booking protection & concierge included.", textColor: "#111111" }
            ];
            this.exclusiveBasicPerkPrizeDefinitions = [
                { text: "FREE LAUNDRY", colors: { start: "#D4AF37", end: "#B8860B" }, detail: "Complimentary laundry service has been attached to this booking." },
                { text: "FREE BREAKFAST", colors: { start: "#FFFFFF", end: "#F3F4F6" }, detail: "Breakfast is on us for this stay.", textColor: "#111111" },
                { text: "5% OFF", colors: { start: "#D32F2F", end: "#8B0000" }, detail: "A 5% discount has been attached to your booking." }
            ];
            this.exclusiveLosingSpinPrizes = [
                { text: "SO CLOSE!", colors: { start: "#111111", end: "#000000" }, detail: "Almost there! Keep trying!", type: "soClose", isBounce: true },
                { text: "TRY AGAIN", colors: { start: "#111111", end: "#000000" }, detail: "Better luck next time!", type: "tryAgain" },
                { text: "SO CLOSE!", colors: { start: "#111111", end: "#000000" }, detail: "Almost there! Keep trying!", type: "soClose", isBounce: true }
            ];
            this.exclusiveActiveSpinPrizes = [];
            this.exclusiveSpinPrizePool = [];
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
            this.checkedExpenseIds = new Set();

            this.ready = this.init();
        }

        async init() {
            this.setupCurrencyFormatting();
            const authFeedback = this.readAuthFeedbackFromUrl();
            this.loadLocalBackupState();
            this.loadExclusiveTimerState();
            await this.restoreAuthenticatedSession();
            await this.syncFromCloud();
            this.render();
            this.updateRaffleGuestCountFromBookings();
            this.handleAuthFeedback(authFeedback);
            if (document.getElementById('guestView')?.style.display === 'block') {
                this.renderGuestGrid();
                if (this.guestViewMode === 'map') this.initGuestMap();
            }
            refreshFloatingLabels();
            this.setupPinEnter();
            this.startAutoSlide();
            this.startSocialProofEngine();
        }

        getTransactionCreatedAtMs(transaction) {
            const explicitTime = Date.parse(transaction?.createdAt || transaction?.created_at || '');
            if (!Number.isNaN(explicitTime)) return explicitTime;

            const idMatch = String(transaction?.id || '').match(/^tx_(\d{10,})/);
            if (idMatch) {
                const idTime = Number(idMatch[1]);
                if (Number.isFinite(idTime)) return idTime;
            }

            const dateOnlyTime = Date.parse(`${transaction?.date || ''}T00:00:00`);
            return Number.isNaN(dateOnlyTime) ? 0 : dateOnlyTime;
        }

        getCurrentRaffleBookingCount() {
            const periodStartAt = getCurrentRafflePeriodStartMs();
            const seen = new Set();
            return this.transactions.reduce((count, transaction) => {
                const key = transaction?.id || `${transaction?.propId || ''}-${transaction?.guest || ''}-${transaction?.date || ''}`;
                if (!key || seen.has(key)) return count;
                const createdAt = this.getTransactionCreatedAtMs(transaction);
                if (createdAt < periodStartAt) return count;
                seen.add(key);
                return count + 1;
            }, 0);
        }

        updateRaffleGuestCountFromBookings() {
            const periodStartAt = getCurrentRafflePeriodStartMs();
            const count = this.getCurrentRaffleBookingCount();
            updateRaffleGuestCountDisplay(count);
            try {
                localStorage.setItem('bookily-raffle-guest-count', JSON.stringify({ count, periodStartAt }));
            } catch {}
        }

        startSocialProofEngine() {
            const triggerRealProof = () => {
                const events = [];

                this.transactions.slice(-8).forEach(tx => {
                    const prop = this.inventory.find(item => item.id === tx.propId);
                    if (!prop) return;
                    events.push({
                        icon: 'fa-calendar-check',
                        color: 'var(--success)',
                        textHtml: `<strong>${tx.guest || 'A guest'}</strong> booked a stay in <strong>${prop.loc}</strong>`,
                        timeText: tx.date || 'Recently'
                    });
                });

                this.raffleWinners.slice(-4).forEach(entry => {
                    events.push({
                        icon: 'fa-ticket',
                        color: 'var(--warning)',
                        textHtml: `<strong>${entry.guest || entry.guestName || 'A guest'}</strong> won a refund draw`,
                        timeText: entry.drawnAt ? String(entry.drawnAt).slice(0, 10) : 'Recently'
                    });
                });

                this.inventory.slice(-4).forEach(prop => {
                    if (!prop.name || !prop.loc) return;
                    events.push({
                        icon: 'fa-house-circle-check',
                        color: 'var(--primary)',
                        textHtml: `<strong>${prop.name}</strong> is listed in <strong>${prop.loc}</strong>`,
                        timeText: 'Live inventory'
                    });
                });

                if (events.length === 0) return;
                const event = events[Math.floor(Math.random() * events.length)];
                this.displaySocialProof(event.icon, event.color, event.textHtml, event.timeText);
                setTimeout(triggerRealProof, Math.floor(Math.random() * 17000) + 8000);
            };

            setTimeout(triggerRealProof, 3000);
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

        normalizePercentageValue(value, fallback = 0) {
            const parsed = Number(value);
            if (!Number.isFinite(parsed) || parsed < 0) return fallback;
            return Math.round(parsed * 100) / 100;
        }

        isExecutiveDashboardActive() {
            return this.role === 'chairman' || (this.role === 'host' && this.hostDashboardRole === 'chairman');
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

        getTodayIsoDate() {
            const today = new Date();
            const offsetMs = today.getTimezoneOffset() * 60000;
            return new Date(today.getTime() - offsetMs).toISOString().split('T')[0];
        }

        readAuthFeedbackFromUrl() {
            const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
            const queryParams = new URLSearchParams(window.location.search);
            const params = hashParams.toString() ? hashParams : queryParams;
            if (!params.toString()) return null;

            return {
                accessToken: params.get('access_token'),
                error: params.get('error'),
                errorCode: params.get('error_code'),
                errorDescription: params.get('error_description')
            };
        }

        handleAuthFeedback(feedback) {
            if (!feedback) return;

            if (feedback.accessToken) {
                clearAuthUrlState();
                if (this.currentUser) {
                    this.showNotification("Email confirmed. You're now signed in.", "success");
                    switchView('portal');
                } else {
                    this.showNotification("Email confirmed. You can now sign in.", "success");
                    openLoginModal();
                }
                return;
            }

            if (feedback.error) {
                clearAuthUrlState();
                const message = feedback.errorCode === 'otp_expired'
                    ? "That confirmation link is invalid or expired. Request a fresh signup email and try again."
                    : decodeURIComponent(feedback.errorDescription || "Authentication could not be completed.");
                this.showNotification(message, "error");
                openLoginModal();
            }
        }

        getAuthRedirectUrl() {
            const { origin, pathname } = window.location;
            const cleanPath = pathname.endsWith('index.html')
                ? pathname.slice(0, -'index.html'.length)
                : pathname;
            return `${origin}${cleanPath}`;
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
            const premiumAmenities = [
                { icon: 'fa-wifi', text: 'High-Speed WiFi' },
                { icon: 'fa-snowflake', text: 'Air Conditioning' },
                { icon: 'fa-tv', text: 'Smart TV & Netflix' },
                { icon: 'fa-shield-halved', text: '24/7 Security' },
                { icon: 'fa-bolt', text: '24/7 Power' },
                { icon: 'fa-water-ladder', text: 'Private Pool' },
                { icon: 'fa-dumbbell', text: 'Gym Access' }
            ];
            const standardAmenities = [
                { icon: 'fa-wifi', text: 'High-Speed WiFi' },
                { icon: 'fa-snowflake', text: 'Air Conditioning' },
                { icon: 'fa-tv', text: 'Smart TV & Netflix' },
                { icon: 'fa-shield-halved', text: '24/7 Security' },
                { icon: 'fa-bolt', text: '24/7 Power' }
            ];
            const premiumImages = [
                'https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ];
            const standardImages = [
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ];
            const makeProperty = (id, loc, name, price, type, status, guestName, lat, lng, premium) => ({
                id,
                loc,
                name,
                price,
                type,
                status,
                hostEmail: 'sarki@bookily.com',
                guestName: guestName || null,
                accessCode: null,
                coords: { lat, lng },
                images: premium ? premiumImages : standardImages,
                amenities: premium ? premiumAmenities : standardAmenities,
                city: 'Abuja',
                state: 'FCT'
            });

            return [
                makeProperty('h_4bed_1', 'Katampe', 'Premium 4 Bed Duplex 1', 250000, '4-Bed Duplex', 'occupied', 'Aliko D.', 9.129424, 7.429680, true),
                makeProperty('h_4bed_2', 'Katampe', 'Premium 4 Bed Duplex 2', 250000, '4-Bed Duplex', 'available', null, 9.129424, 7.429680, true),
                makeProperty('h_4bed_3', 'Katampe', 'Premium 4 Bed Duplex 3', 250000, '4-Bed Duplex', 'occupied', 'Femi O.', 9.129424, 7.429680, true),
                makeProperty('h_1bed_1', 'Katampe', 'Luxury 1 Bed Apt 1', 80000, '1 Bed', 'available', null, 9.129424, 7.429680, false),
                makeProperty('h_1bed_2', 'Katampe', 'Luxury 1 Bed Apt 2', 80000, '1 Bed', 'available', null, 9.129424, 7.429680, false),
                makeProperty('h_1bed_3', 'Katampe', 'Luxury 1 Bed Apt 3', 80000, '1 Bed', 'occupied', 'Tony E.', 9.129424, 7.429680, false),
                makeProperty('j_3bed_1', 'Jahi', 'Executive 3 Bed Apt 1', 150000, '3 Bed', 'available', null, 9.103536, 7.425503, true),
                makeProperty('j_3bed_2', 'Jahi', 'Executive 3 Bed Apt 2', 150000, '3 Bed', 'available', null, 9.103536, 7.425503, true),
                makeProperty('j_2bed_1', 'Jahi', 'Standard 2 Bed Apt 1', 120000, '2 Bed', 'available', null, 9.103536, 7.425503, false),
                makeProperty('j_2bed_2', 'Jahi', 'Standard 2 Bed Apt 2', 120000, '2 Bed', 'available', null, 9.103536, 7.425503, false),
                makeProperty('j_2bed_3', 'Jahi', 'Standard 2 Bed Apt 3', 120000, '2 Bed', 'available', null, 9.103536, 7.425503, false),
                makeProperty('j_2bed_4', 'Jahi', 'Standard 2 Bed Apt 4', 120000, '2 Bed', 'available', null, 9.103536, 7.425503, false),
                makeProperty('j_1bed_1', 'Jahi', 'Standard 1 Bed Apt 1', 70000, '1 Bed', 'available', null, 9.103536, 7.425503, false),
                makeProperty('j_1bed_2', 'Jahi', 'Standard 1 Bed Apt 2', 70000, '1 Bed', 'available', null, 9.103536, 7.425503, false),
                makeProperty('w_studio_1', 'Gwarinpa', 'Classic Studio 1', 40000, 'Studio', 'available', null, 9.106198, 7.377890, false),
                makeProperty('w_studio_2', 'Gwarinpa', 'Classic Studio 2', 40000, 'Studio', 'available', null, 9.106198, 7.377890, false),
                makeProperty('w_studio_3', 'Gwarinpa', 'Classic Studio 3', 40000, 'Studio', 'available', null, 9.106198, 7.377890, false),
                makeProperty('w_1bed_1', 'Gwarinpa', 'Classic 1 Bed Apt 1', 50000, '1 Bed', 'available', null, 9.106198, 7.377890, false),
                makeProperty('w_1bed_2', 'Gwarinpa', 'Classic 1 Bed Apt 2', 50000, '1 Bed', 'available', null, 9.106198, 7.377890, false),
                makeProperty('w_1bed_3', 'Gwarinpa', 'Classic 1 Bed Apt 3', 50000, '1 Bed', 'available', null, 9.106198, 7.377890, false)
            ];
        }

        getDefaultTeamMembers() { return []; }

        saveLocalData() {
            this.saveLocalBackupState();
            this.render();
            if(document.getElementById('guestView').style.display === 'block') this.renderGuestGrid();
            this.scheduleRemoteSync(); 
        }

        scheduleRemoteSync() {
            if (this.syncDebounceTimer) clearTimeout(this.syncDebounceTimer);
            this.syncDebounceTimer = setTimeout(async () => {
                try {
                    const authUser = await this.getAuthenticatedUser();
                    if (authUser) await this.syncToCloud();
                } catch (e) {
                    this.updateSyncUI('offline');
                    console.warn('Deferred sync failed:', e);
                }
            }, 150);
        }

        getSystemHostRecord() {
            return {
                name: 'System Admin',
                email: 'admin@bookily.com',
                phone: '',
                password: 'demo-admin'
            };
        }

        getLocalBackupKey() {
            return 'bookily-engine-backup';
        }

        getExclusiveTimerStorageKey() {
            return 'bookily-engine-exclusive-timer';
        }

        getExclusiveTimerStateMaxAgeMs() {
            return 12 * 60 * 60 * 1000;
        }

        getDefaultExclusiveTimerState() {
            return {
                exclusiveDiscountPhase: 1,
                exclusiveDiscountTimeLeft: 35,
                exclusiveHeroVipTimeLeft: 225,
                exclusivePerkDurations: [45, 75, 105, 135, 165, 195, 225],
                exclusivePerkLost: [false, false, false, false, false, false, false],
                exclusiveBookingConfirmed: false,
                savedAt: Date.now()
            };
        }

        getExclusivePhaseTwoDiscountSeconds() {
            return 10;
        }

        applyExclusiveTimerState(state) {
            const fallback = this.getDefaultExclusiveTimerState();
            this.exclusiveDiscountPhase = state?.exclusiveDiscountPhase ?? fallback.exclusiveDiscountPhase;
            this.exclusiveDiscountTimeLeft = Math.max(0, state?.exclusiveDiscountTimeLeft ?? fallback.exclusiveDiscountTimeLeft);
            this.exclusiveHeroVipTimeLeft = Math.max(0, state?.exclusiveHeroVipTimeLeft ?? fallback.exclusiveHeroVipTimeLeft);
            this.exclusivePerkDurations = (Array.isArray(state?.exclusivePerkDurations) ? state.exclusivePerkDurations : fallback.exclusivePerkDurations)
                .map(value => Math.max(0, Number(value) || 0))
                .slice(0, fallback.exclusivePerkDurations.length);
            while (this.exclusivePerkDurations.length < fallback.exclusivePerkDurations.length) {
                this.exclusivePerkDurations.push(fallback.exclusivePerkDurations[this.exclusivePerkDurations.length]);
            }
            this.exclusivePerkLost = this.exclusivePerkDurations.map((duration, index) => {
                const explicitLost = Array.isArray(state?.exclusivePerkLost) ? Boolean(state.exclusivePerkLost[index]) : false;
                return explicitLost || duration <= 0;
            });
            if (this.exclusiveDiscountPhase === 2) {
                this.exclusiveDiscountTimeLeft = Math.min(this.exclusiveDiscountTimeLeft, this.exclusivePerkDurations[0] ?? this.exclusiveDiscountTimeLeft);
            }
            this.exclusiveBookingConfirmed = Boolean(state?.exclusiveBookingConfirmed);
            this.exclusiveModalTimeLeft = Math.max(...this.exclusivePerkDurations);
        }

        rehydrateExclusiveTimerState(snapshot) {
            const base = {
                ...this.getDefaultExclusiveTimerState(),
                ...(snapshot || {})
            };
            const savedAt = Number(base.savedAt) || Date.now();
            let elapsed = Math.max(0, Math.floor((Date.now() - savedAt) / 1000));

            base.exclusiveHeroVipTimeLeft = Math.max(0, (Number(base.exclusiveHeroVipTimeLeft) || 0) - elapsed);
            base.exclusivePerkDurations = (Array.isArray(base.exclusivePerkDurations) ? base.exclusivePerkDurations : [])
                .map(value => Math.max(0, (Number(value) || 0) - elapsed));

            let phase = Number(base.exclusiveDiscountPhase) || 1;
            let timeLeft = Math.max(0, Number(base.exclusiveDiscountTimeLeft) || 0);
            while (elapsed > 0 && phase < 3) {
                if (timeLeft > elapsed) {
                    timeLeft -= elapsed;
                    elapsed = 0;
                } else {
                    elapsed -= timeLeft;
                    if (phase === 1) {
                        phase = 2;
                        timeLeft = this.getExclusivePhaseTwoDiscountSeconds();
                    } else {
                        phase = 3;
                        timeLeft = 0;
                    }
                }
            }
            if (phase >= 3) {
                phase = 3;
                timeLeft = 0;
            }

            return {
                exclusiveDiscountPhase: phase,
                exclusiveDiscountTimeLeft: timeLeft,
                exclusiveHeroVipTimeLeft: base.exclusiveHeroVipTimeLeft,
                exclusivePerkDurations: base.exclusivePerkDurations,
                exclusivePerkLost: base.exclusivePerkDurations.map(duration => duration <= 0),
                exclusiveBookingConfirmed: Boolean(base.exclusiveBookingConfirmed),
                savedAt: Date.now()
            };
        }

        saveExclusiveTimerState() {
            try {
                const snapshot = {
                    exclusiveDiscountPhase: this.exclusiveDiscountPhase,
                    exclusiveDiscountTimeLeft: this.exclusiveDiscountTimeLeft,
                    exclusiveHeroVipTimeLeft: this.exclusiveHeroVipTimeLeft,
                    exclusivePerkDurations: [...this.exclusivePerkDurations],
                    exclusivePerkLost: [...this.exclusivePerkLost],
                    exclusiveBookingConfirmed: this.exclusiveBookingConfirmed,
                    savedAt: Date.now()
                };
                localStorage.setItem(this.getExclusiveTimerStorageKey(), JSON.stringify(snapshot));
                this.exclusiveTimerStateLoaded = true;
            } catch (error) {
                console.warn('Exclusive timer state save failed:', error);
            }
        }

        loadExclusiveTimerState() {
            try {
                const raw = localStorage.getItem(this.getExclusiveTimerStorageKey());
                if (!raw) return;
                const snapshot = JSON.parse(raw);
                const savedAt = Number(snapshot?.savedAt) || 0;
                if (!savedAt || (Date.now() - savedAt) > this.getExclusiveTimerStateMaxAgeMs()) {
                    localStorage.removeItem(this.getExclusiveTimerStorageKey());
                    return;
                }
                this.applyExclusiveTimerState(this.rehydrateExclusiveTimerState(snapshot));
                this.exclusiveTimerStateLoaded = true;
            } catch (error) {
                console.warn('Exclusive timer state load failed:', error);
            }
        }

        ensureExclusiveTimerState() {
            if (this.exclusiveTimerStateLoaded) return;
            this.applyExclusiveTimerState(this.getDefaultExclusiveTimerState());
            this.saveExclusiveTimerState();
        }

        mergeRecordsByKey(primary, fallback, keyField = 'id') {
            const merged = new Map();
            [...(fallback || []), ...(primary || [])].forEach(item => {
                if (!item) return;
                const key = item[keyField];
                if (!key) return;
                merged.set(key, { ...merged.get(key), ...item });
            });
            return Array.from(merged.values());
        }

        saveLocalBackupState() {
            try {
                const payload = {
                    inventory: this.inventory,
                    transactions: this.transactions,
                    expenditures: this.expenditures,
                refunds: this.refunds,
                salaryRegistry: this.salaryRegistry,
                rentRegistry: this.rentRegistry,
                otherIncome: this.otherIncome,
                vatPercentage: this.vatPercentage,
                maintenancePercentage: this.maintenancePercentage,
                checkedExpenseIds: Array.from(this.checkedExpenseIds || [])
            };
                localStorage.setItem(this.getLocalBackupKey(), JSON.stringify(payload));
            } catch (error) {
                console.warn('Local backup save failed:', error);
            }
        }

        loadLocalBackupState() {
            try {
                const raw = localStorage.getItem(this.getLocalBackupKey());
                if (!raw) return;
                const payload = JSON.parse(raw);
                this.inventory = Array.isArray(payload.inventory) && payload.inventory.length ? payload.inventory : this.inventory;
                this.transactions = Array.isArray(payload.transactions) ? payload.transactions : this.transactions;
                this.expenditures = Array.isArray(payload.expenditures) ? payload.expenditures : this.expenditures;
                this.refunds = Array.isArray(payload.refunds) ? payload.refunds : this.refunds;
                this.salaryRegistry = Array.isArray(payload.salaryRegistry) ? payload.salaryRegistry : this.salaryRegistry;
                this.rentRegistry = Array.isArray(payload.rentRegistry) ? payload.rentRegistry : this.rentRegistry;
                this.otherIncome = Array.isArray(payload.otherIncome) ? payload.otherIncome : this.otherIncome;
                this.vatPercentage = this.normalizePercentageValue(payload.vatPercentage, this.vatPercentage);
                this.maintenancePercentage = this.normalizePercentageValue(payload.maintenancePercentage, this.maintenancePercentage);
                this.checkedExpenseIds = new Set(Array.isArray(payload.checkedExpenseIds) ? payload.checkedExpenseIds : []);
            } catch (error) {
                console.warn('Local backup load failed:', error);
            }
        }

        mergeLocalBackupState() {
            try {
                const raw = localStorage.getItem(this.getLocalBackupKey());
                if (!raw) return;
                const payload = JSON.parse(raw);
                this.transactions = this.mergeRecordsByKey(this.transactions, payload.transactions || [], 'id');
                this.expenditures = this.mergeRecordsByKey(this.expenditures, payload.expenditures || [], 'id');
                this.refunds = this.mergeRecordsByKey(this.refunds, payload.refunds || [], 'id');
                this.salaryRegistry = this.mergeRecordsByKey(this.salaryRegistry, payload.salaryRegistry || [], 'id');
                this.rentRegistry = this.mergeRecordsByKey(this.rentRegistry, payload.rentRegistry || [], 'id');
                this.otherIncome = this.mergeRecordsByKey(this.otherIncome, payload.otherIncome || [], 'id');
                this.vatPercentage = this.normalizePercentageValue(payload.vatPercentage, this.vatPercentage);
                this.maintenancePercentage = this.normalizePercentageValue(payload.maintenancePercentage, this.maintenancePercentage);
                const backupChecked = Array.isArray(payload.checkedExpenseIds) ? payload.checkedExpenseIds : [];
                this.checkedExpenseIds = new Set([...(this.checkedExpenseIds || []), ...backupChecked]);
            } catch (error) {
                console.warn('Local backup merge failed:', error);
            }
        }

        getHostsForPersistence() {
            if (this.authUser && this.currentHostEmail) {
                return this.hosts.filter(host => host.email === this.currentHostEmail);
            }

            const hosts = [...this.hosts];
            const needsSystemHost = this.inventory.some(item => item.hostEmail === 'admin@bookily.com') ||
                this.teamMembers.some(member => (member.createdBy || '') === 'system');

            if (needsSystemHost && !hosts.some(host => host.email === 'admin@bookily.com')) {
                hosts.push(this.getSystemHostRecord());
            }
            return hosts;
        }

        async fetchAllRows(table) {
            const { data, error } = await this.supabase.from(table).select('*');
            if (error) throw error;
            return data || [];
        }

        async getAuthenticatedUser() {
            if (!this.supabase?.auth) return null;
            const { data, error } = await this.supabase.auth.getSession();
            if (error) throw error;
            this.authUser = data.session?.user || null;
            return this.authUser;
        }

        applyHostSession(host) {
            if (!host) return;
            this.role = 'host';
            this.hostDashboardRole = 'host';
            this.currentHostEmail = host.email;
            this.currentUser = {
                name: host.name,
                role: 'host',
                id: host.email,
                email: host.email
            };

            const existingIndex = this.hosts.findIndex(item => item.email === host.email);
            if (existingIndex >= 0) {
                this.hosts[existingIndex] = host;
            } else {
                this.hosts.push(host);
            }
        }

        async hydrateHostFromAuthUser(user, emailHint = null, passwordHint = null) {
            if (!this.supabase || !user) return null;

            let { data: hostRow, error } = await this.supabase
                .from('hosts')
                .select('*')
                .eq('auth_user_id', user.id)
                .maybeSingle();

            if (error) throw error;

            const normalizedEmail = String(emailHint || user.email || '').trim().toLowerCase();
            if (!hostRow && normalizedEmail) {
                const { error: claimError } = await this.supabase
                    .from('hosts')
                    .update({ auth_user_id: user.id })
                    .eq('email', normalizedEmail)
                    .is('auth_user_id', null);

                if (claimError) throw claimError;

                const claimed = await this.supabase
                    .from('hosts')
                    .select('*')
                    .eq('auth_user_id', user.id)
                    .maybeSingle();

                if (claimed.error) throw claimed.error;
                hostRow = claimed.data;
            }

            if (!hostRow && normalizedEmail) {
                const metadata = user.user_metadata || {};
                const fallbackName = normalizedEmail.includes('@')
                    ? normalizedEmail.split('@')[0].replace(/[._-]+/g, ' ').trim()
                    : 'Host';
                const fullName = String(metadata.full_name || metadata.name || fallbackName || 'Host').trim();
                const phone = String(metadata.phone || '').trim();

                const { data: inserted, error: insertError } = await this.supabase
                    .from('hosts')
                    .insert({
                        auth_user_id: user.id,
                        full_name: fullName || 'Host',
                        email: normalizedEmail,
                        phone: phone || null,
                        password: passwordHint || metadata.password || 'supabase-auth-managed'
                    })
                    .select('*')
                    .single();

                if (insertError) throw insertError;
                hostRow = inserted;
            }

            if (!hostRow) return null;

            const host = {
                name: hostRow.full_name,
                email: hostRow.email,
                phone: hostRow.phone || '',
                password: hostRow.password || ''
            };
            this.applyHostSession(host);
            return host;
        }

        applyTeamSession(member) {
            if (!member) return;
            this.role = member.role;
            this.currentHostEmail = member.createdBy || null;
            this.currentUser = {
                name: member.name,
                role: member.role,
                id: member.staffId,
                email: member.email || '',
                phone: member.phone || ''
            };

            const existingIndex = this.teamMembers.findIndex(item => item.staffId === member.staffId);
            if (existingIndex >= 0) {
                this.teamMembers[existingIndex] = member;
            } else {
                this.teamMembers.push(member);
            }
        }

        getTeamAuthEmail(phone) {
            const digits = String(phone || '').replace(/\D/g, '');
            return digits ? `team-${digits}@bookily.local` : '';
        }

        async findTeamMemberByPhone(phone) {
            const normalizedPhone = String(phone || '').replace(/\D/g, '');
            if (!normalizedPhone) return null;

            const localMember = this.teamMembers.find(member => String(member.phone || '').replace(/\D/g, '') === normalizedPhone);
            if (localMember) return localMember;

            if (!this.supabase) return null;
            const { data, error } = await this.supabase
                .from('team_members')
                .select('*, hosts!team_members_host_id_fkey(email)')
                .eq('phone', normalizedPhone)
                .maybeSingle();

            if (error) throw error;
            if (!data) return null;

            return {
                id: data.id,
                name: data.full_name,
                role: data.role,
                staffId: data.staff_id,
                email: data.email || '',
                phone: data.phone || '',
                pin: data.pin || '',
                createdBy: data.hosts?.email || null,
                assignmentScope: data.assignment_scope || 'admin',
                assignedPropertyId: data.assigned_property_id || '',
                assignmentLabel: data.assignment_label || (data.assignment_scope === 'executive' ? 'Executive Office' : 'Admin Office'),
                badgeLogoUrl: data.badge_logo_url || ''
            };
        }

        async hydrateTeamMemberFromAuthUser(user, emailHint = null, phoneHint = null) {
            if (!this.supabase || !user) return null;

            let { data: teamRow, error } = await this.supabase
                .from('team_members')
                .select('*, hosts!team_members_host_id_fkey(email)')
                .eq('auth_user_id', user.id)
                .maybeSingle();

            if (error) throw error;

            const normalizedPhone = String(phoneHint || user.phone || user.user_metadata?.phone || '').replace(/\D/g, '');
            if (!teamRow && normalizedPhone) {
                const { error: claimError } = await this.supabase
                    .from('team_members')
                    .update({ auth_user_id: user.id })
                    .eq('phone', normalizedPhone)
                    .is('auth_user_id', null);

                if (claimError) throw claimError;

                const claimed = await this.supabase
                    .from('team_members')
                    .select('*, hosts!team_members_host_id_fkey(email)')
                    .eq('auth_user_id', user.id)
                    .maybeSingle();

                if (claimed.error) throw claimed.error;
                teamRow = claimed.data;
            }

            const normalizedEmail = String(emailHint || user.email || '').trim().toLowerCase();
            if (!teamRow && normalizedEmail) {
                const { error: claimError } = await this.supabase
                    .from('team_members')
                    .update({ auth_user_id: user.id })
                    .eq('email', normalizedEmail)
                    .is('auth_user_id', null);

                if (claimError) throw claimError;

                const claimed = await this.supabase
                    .from('team_members')
                    .select('*, hosts!team_members_host_id_fkey(email)')
                    .eq('auth_user_id', user.id)
                    .maybeSingle();

                if (claimed.error) throw claimed.error;
                teamRow = claimed.data;
            }

            if (!teamRow) return null;

            const member = {
                id: teamRow.id,
                name: teamRow.full_name,
                role: teamRow.role,
                staffId: teamRow.staff_id,
                email: teamRow.email || '',
                phone: teamRow.phone || '',
                pin: teamRow.pin || '',
                createdBy: teamRow.hosts?.email || null,
                assignmentScope: teamRow.assignment_scope || 'admin',
                assignedPropertyId: teamRow.assigned_property_id || '',
                assignmentLabel: teamRow.assignment_label || (teamRow.assignment_scope === 'executive' ? 'Executive Office' : 'Admin Office'),
                badgeLogoUrl: teamRow.badge_logo_url || ''
            };
            this.applyTeamSession(member);
            return member;
        }

        async restoreAuthenticatedSession() {
            try {
                const user = await this.getAuthenticatedUser();
                if (!user) return null;
                const host = await this.hydrateHostFromAuthUser(user, user.email);
                if (host) return host;
                return await this.hydrateTeamMemberFromAuthUser(user, user.email, user.phone || user.user_metadata?.phone);
            } catch (e) {
                console.warn('Could not restore authenticated session:', e);
                this.authUser = null;
                return null;
            }
        }

        async syncTableById(table, rows) {
            const { data: existingRows, error: selectError } = await this.supabase.from(table).select('id');
            if (selectError) throw selectError;

            if (rows.length > 0) {
                const { error: upsertError } = await this.supabase.from(table).upsert(rows, { onConflict: 'id' });
                if (upsertError) throw upsertError;
            }

            const nextIds = new Set(rows.map(row => row.id));
            const idsToDelete = (existingRows || []).map(row => row.id).filter(id => !nextIds.has(id));
            if (idsToDelete.length > 0) {
                const { error: deleteError } = await this.supabase.from(table).delete().in('id', idsToDelete);
                if (deleteError) throw deleteError;
            }
        }

        async syncHostsTable(hostRows) {
            if (!this.authUser || !this.currentHostEmail) return [];

            const scopedRows = hostRows.filter(row => row.email === this.currentHostEmail);

            if (scopedRows.length > 0) {
                const { error: upsertError } = await this.supabase.from('hosts').upsert(scopedRows, { onConflict: 'email' });
                if (upsertError) throw upsertError;
            }

            const { data: hosts, error: refreshError } = await this.supabase
                .from('hosts')
                .select('id, email, auth_user_id')
                .eq('auth_user_id', this.authUser.id);
            if (refreshError) throw refreshError;
            return hosts || [];
        }

        async syncTeamMembersTable(memberRows) {
            const { data: existingRows, error: selectError } = await this.supabase.from('team_members').select('staff_id');
            if (selectError) throw selectError;

            if (memberRows.length > 0) {
                const { error: upsertError } = await this.supabase.from('team_members').upsert(memberRows, { onConflict: 'staff_id' });
                if (upsertError) throw upsertError;
            }

            const nextKeys = new Set(memberRows.map(row => row.staff_id));
            const keysToDelete = (existingRows || []).map(row => row.staff_id).filter(staffId => !nextKeys.has(staffId));
            if (keysToDelete.length > 0) {
                const { error: deleteError } = await this.supabase.from('team_members').delete().in('staff_id', keysToDelete);
                if (deleteError) throw deleteError;
            }
        }

        async syncRevenueTargetsTable(rows) {
            const { data: existingRows, error: selectError } = await this.supabase.from('revenue_targets').select('id, location, target_month');
            if (selectError) throw selectError;

            if (rows.length > 0) {
                const { error: upsertError } = await this.supabase.from('revenue_targets').upsert(rows, { onConflict: 'location,target_month' });
                if (upsertError) throw upsertError;
            }

            const nextKeys = new Set(rows.map(row => `${row.location}::${row.target_month}`));
            const idsToDelete = (existingRows || [])
                .filter(row => !nextKeys.has(`${row.location}::${row.target_month}`))
                .map(row => row.id);

            if (idsToDelete.length > 0) {
                const { error: deleteError } = await this.supabase.from('revenue_targets').delete().in('id', idsToDelete);
                if (deleteError) throw deleteError;
            }
        }

        mapHostToRow(host) {
            return {
                auth_user_id: host.email === this.currentHostEmail ? (this.authUser?.id || null) : null,
                full_name: host.name,
                email: host.email,
                phone: host.phone || null,
                password: host.password
            };
        }

        mapPropertyToRow(property, hostIdByEmail) {
            const hostId = hostIdByEmail.get(property.hostEmail || 'admin@bookily.com');
            if (!hostId) return null;

            return {
                id: property.id,
                host_id: hostId,
                property_name: property.name,
                location: property.loc,
                property_type: property.type,
                nightly_price: Number(property.price) || 0,
                status: property.status || 'available',
                guest_name: property.guestName || null,
                access_code: property.accessCode || null,
                coords: property.coords || {},
                images: Array.isArray(property.images) ? property.images : [],
                amenities: this.normalizeAmenities(property.amenities)
            };
        }

        mapBookingToRow(transaction) {
            return {
                id: transaction.id || this.getTransactionId(transaction),
                property_id: transaction.propId,
                booking_date: transaction.date || new Date().toISOString().split('T')[0],
                guest_name: transaction.guest,
                guest_phone: transaction.phone,
                guest_email: transaction.email || null,
                access_code: transaction.accessCode || null,
                check_in: transaction.checkIn || null,
                check_out: transaction.checkOut || null,
                amount_paid: Number(transaction.amount) || 0,
                estimated_total: Number(transaction.estimatedTotal) || 0,
                caution_fee_paid: Number(transaction.cautionFee) || 0
            };
        }

        mapExpenditureToRow(expense, memberIdByStaffId) {
            return {
                id: expense.id,
                title: expense.title,
                amount: Number(expense.amount) || 0,
                category: expense.category,
                scope: expense.scope,
                expense_date: expense.date,
                details: expense.details,
                requested_by_name: expense.requestedBy,
                requested_by_staff_id: expense.staffId || null,
                requested_by_pin: expense.pin || null,
                requested_by_member_id: memberIdByStaffId.get(expense.staffId) || null,
                approver_name: expense.approver || null,
                approver_staff_id: expense.approverStaffId || null,
                approver_pin: expense.approverPin || null,
                approved_by_member_id: memberIdByStaffId.get(expense.approverStaffId) || null,
                status: expense.status || 'Pending approval',
                approved_at: expense.approvedAt || null
            };
        }

        mapRefundToRow(refund, memberIdByStaffId) {
            return {
                id: refund.id,
                booking_id: refund.transactionId,
                property_id: refund.propId || null,
                property_name: refund.propertyName || null,
                guest_name: refund.guest,
                amount: Number(refund.amount) || 0,
                reason: refund.reason,
                processed_by_name: refund.processedBy,
                processed_by_staff_id: refund.processedById || null,
                processed_by_pin: refund.pin || null,
                processed_by_member_id: memberIdByStaffId.get(refund.processedById) || null,
                refund_date: refund.date
            };
        }

        mapSalaryToRow(entry, memberIdByEmail) {
            return {
                id: entry.id,
                staff_name: entry.staffName,
                position: entry.role,
                location: entry.location,
                amount: Number(entry.amount) || 0,
                phone: entry.phone || null,
                email: entry.email || null,
                team_member_id: entry.email ? (memberIdByEmail.get(entry.email.toLowerCase()) || null) : null
            };
        }

        mapRentToRow(entry) {
            return {
                id: entry.id,
                location: entry.location,
                amount: Number(entry.amount) || 0
            };
        }

        mapOtherIncomeToRow(entry, memberIdByStaffId) {
            return {
                id: entry.id,
                income_source: entry.category,
                amount: Number(entry.amount) || 0,
                location: entry.location,
                income_date: entry.date,
                details: entry.details || null,
                guest_name: entry.guest || null,
                recorded_by_name: entry.recordedBy,
                recorded_by_staff_id: entry.recordedByStaffId || null,
                recorded_by_member_id: memberIdByStaffId.get(entry.recordedByStaffId) || null
            };
        }

        mapTargetToRow(key, amount, memberIdByStaffId) {
            const [location, month] = key.split('_');
            return {
                location,
                target_month: `${month}-01`,
                amount: Number(amount) || 0,
                created_by_member_id: memberIdByStaffId.get(this.currentUser?.id) || null
            };
        }

        mapRaffleToRow(entry) {
            return {
                id: entry.id || crypto.randomUUID(),
                guest_name: entry.guest || entry.guestName || 'Guest',
                prize: entry.prize || 'Raffle Reward',
                amount: entry.amount || null,
                booking_id: entry.transactionId || null,
                drawn_at: entry.date || entry.drawnAt || new Date().toISOString()
            };
        }

        async syncFromCloud() {
            if (!this.supabase) {
                this.updateSyncUI('offline');
                console.warn('Supabase client not available. Running without remote persistence.');
                return;
            }

            this.updateSyncUI('syncing');
            try {
                const authUser = await this.getAuthenticatedUser();
                if (!authUser) {
                    const propertyRows = await this.fetchAllRows('properties');
                    if (propertyRows.length > 0) {
                        this.inventory = propertyRows.map(row => ({
                            id: row.id,
                            loc: row.location,
                            name: row.property_name,
                            price: Number(row.nightly_price) || 0,
                            type: row.property_type,
                            status: row.status || 'available',
                            hostEmail: 'public@bookily.com',
                            guestName: row.guest_name || null,
                            accessCode: row.access_code || null,
                            images: Array.isArray(row.images) ? row.images : [],
                            amenities: this.normalizeAmenities(row.amenities),
                            coords: row.coords || {}
                        }));
                    }
                    this.updateSyncUI('online');
                    return;
                }

                await this.hydrateHostFromAuthUser(authUser, authUser.email);
                const hostsRows = await this.fetchAllRows('hosts');
                const hostEmailById = new Map(hostsRows.map(row => [row.id, row.email]));
                this.hosts = hostsRows
                    .map(row => ({
                        name: row.full_name,
                        email: row.email,
                        phone: row.phone || '',
                        password: row.password
                    }))
                    .filter(host => host.email !== 'admin@bookily.com');

                const [
                    teamRows,
                    propertyRows,
                    bookingRows,
                    expenditureRows,
                    refundRows,
                    salaryRows,
                    rentRows,
                    otherIncomeRows,
                    targetRows,
                    raffleRows
                ] = await Promise.all([
                    this.fetchAllRows('team_members'),
                    this.fetchAllRows('properties'),
                    this.fetchAllRows('bookings'),
                    this.fetchAllRows('expenditure_requests'),
                    this.fetchAllRows('refunds'),
                    this.fetchAllRows('salary_registry'),
                    this.fetchAllRows('rent_registry'),
                    this.fetchAllRows('other_income_entries'),
                    this.fetchAllRows('revenue_targets'),
                    this.fetchAllRows('raffle_winners')
                ]);

                this.teamMembers = teamRows.map(row => ({
                    id: row.id,
                    name: row.full_name,
                    role: row.role,
                    staffId: row.staff_id,
                    email: row.email || '',
                    phone: row.phone || '',
                    pin: row.pin,
                    createdBy: hostEmailById.get(row.host_id) || 'admin@bookily.com',
                    assignmentScope: row.assignment_scope || 'admin',
                    assignedPropertyId: row.assigned_property_id || '',
                    assignmentLabel: row.assignment_label || (row.assignment_scope === 'executive' ? 'Executive Office' : 'Admin Office'),
                    badgeLogoUrl: row.badge_logo_url || ''
                }));

                if (propertyRows.length > 0) {
                    this.inventory = propertyRows.map(row => ({
                        id: row.id,
                        loc: row.location,
                        name: row.property_name,
                        price: Number(row.nightly_price) || 0,
                        type: row.property_type,
                        status: row.status || 'available',
                        hostEmail: hostEmailById.get(row.host_id) || 'admin@bookily.com',
                        guestName: row.guest_name || null,
                        accessCode: row.access_code || null,
                        images: Array.isArray(row.images) ? row.images : [],
                        amenities: this.normalizeAmenities(row.amenities),
                        coords: row.coords || {}
                    }));
                }

                const propertyLookup = new Map(this.inventory.map(item => [item.id, item]));
                this.transactions = bookingRows.map(row => this.mapBookingRowToTransaction(row, propertyLookup));

                this.expenditures = expenditureRows.map(row => ({
                    id: row.id,
                    title: row.title,
                    amount: Number(row.amount) || 0,
                    category: row.category,
                    scope: row.scope,
                    date: row.expense_date,
                    details: row.details,
                    requestedBy: row.requested_by_name,
                    staffId: row.requested_by_staff_id || '',
                    pin: row.requested_by_pin || '',
                    approver: row.approver_name || '',
                    approverStaffId: row.approver_staff_id || '',
                    approverPin: row.approver_pin || '',
                    status: row.status,
                    approvedAt: row.approved_at || null,
                    createdAt: row.created_at
                }));

                this.refunds = refundRows.map(row => ({
                    id: row.id,
                    transactionId: row.booking_id,
                    propId: row.property_id || '',
                    propertyName: row.property_name || '',
                    guest: row.guest_name,
                    amount: Number(row.amount) || 0,
                    reason: row.reason,
                    processedBy: row.processed_by_name,
                    processedById: row.processed_by_staff_id || '',
                    pin: row.processed_by_pin || '',
                    date: row.refund_date
                }));

                this.salaryRegistry = salaryRows.map(row => ({
                    id: row.id,
                    staffName: row.staff_name,
                    role: row.position,
                    location: row.location,
                    amount: Number(row.amount) || 0,
                    phone: row.phone || '',
                    email: row.email || '',
                    assignedPropertyId: row.property_id || '',
                    assignedPropertyName: row.property_name || ''
                }));

                this.rentRegistry = rentRows.map(row => ({
                    id: row.id,
                    location: row.location,
                    amount: Number(row.amount) || 0
                }));

                this.otherIncome = otherIncomeRows.map(row => ({
                    id: row.id,
                    category: row.income_source,
                    amount: Number(row.amount) || 0,
                    location: row.location,
                    date: row.income_date,
                    details: row.details || '',
                    guest: row.guest_name || '',
                    recordedBy: row.recorded_by_name,
                    recordedByStaffId: row.recorded_by_staff_id || ''
                }));

                this.targets = Object.fromEntries(targetRows.map(row => [
                    `${row.location}_${String(row.target_month).slice(0, 7)}`,
                    Number(row.amount) || 0
                ]));

                this.raffleWinners = raffleRows.map(row => ({
                    id: row.id,
                    guest: row.guest_name,
                    prize: row.prize,
                    amount: row.amount || 0,
                    transactionId: row.booking_id || '',
                    drawnAt: row.drawn_at
                }));

                this.mergeLocalBackupState();
                this.saveLocalBackupState();
                this.updateSyncUI('online');
            } catch (e) { 
                this.updateSyncUI('offline');
                console.warn("Supabase sync failed:", e);
                if (!this.inventory.length) {
                    this.inventory = this.getInitialInventory();
                }
                this.mergeLocalBackupState();
            }
        }

        async syncToCloud() {
            if (!this.supabase) {
                this.updateSyncUI('offline');
                return;
            }

            const authUser = await this.getAuthenticatedUser();
            if (!authUser) {
                this.updateSyncUI('offline');
                return;
            }

            if (this.syncInFlight) {
                this.syncQueued = true;
                return this.syncInFlight;
            }

            this.syncInFlight = this.performSupabaseSync().finally(() => {
                this.syncInFlight = null;
                if (this.syncQueued) {
                    this.syncQueued = false;
                    this.syncToCloud();
                }
            });

            return this.syncInFlight;
        }

        async saveGuestBookingToCloud(transaction) {
            if (!this.supabase) return false;

            const { error } = await this.supabase
                .from('bookings')
                .upsert(this.mapBookingToRow(transaction), { onConflict: 'id' });

            if (error) {
                console.warn('Guest booking sync failed:', error);
                this.updateSyncUI('offline');
                return false;
            }

            this.updateSyncUI('online');
            return true;
        }

        async fetchGuestBookingsByAccess(phone, accessCode) {
            if (!this.supabase) return [];

            const { data: bookingRows, error } = await this.supabase
                .from('bookings')
                .select('*')
                .eq('guest_phone', phone)
                .eq('access_code', accessCode)
                .order('booking_date', { ascending: false });

            if (error) {
                console.warn('Guest booking lookup failed:', error);
                this.updateSyncUI('offline');
                return [];
            }

            const propertyIds = [...new Set((bookingRows || []).map(row => row.property_id).filter(Boolean))];
            const propertyLookup = new Map(this.inventory.map(item => [item.id, item]));

            if (propertyIds.length) {
                const { data: propertyRows, error: propertyError } = await this.supabase
                    .from('properties')
                    .select('id, property_name, location')
                    .in('id', propertyIds);

                if (!propertyError && Array.isArray(propertyRows)) {
                    propertyRows.forEach(row => {
                        propertyLookup.set(row.id, {
                            id: row.id,
                            name: row.property_name,
                            loc: row.location
                        });
                    });
                }
            }

            this.updateSyncUI('online');
            return (bookingRows || []).map(row => this.mapBookingRowToTransaction(row, propertyLookup));
        }

        async performSupabaseSync() {
            this.updateSyncUI('syncing');
            try {
                const hostRows = this.getHostsForPersistence().map(host => this.mapHostToRow(host));
                const syncedHosts = await this.syncHostsTable(hostRows);
                const hostIdByEmail = new Map(syncedHosts.map(row => [row.email, row.id]));

                const memberRows = this.teamMembers
                    .map(member => {
                        const createdByEmail = member.createdBy === 'system' ? 'admin@bookily.com' : (member.createdBy || this.currentHostEmail || 'admin@bookily.com');
                        const hostId = hostIdByEmail.get(createdByEmail);
                        if (!hostId) return null;
                        return {
                            host_id: hostId,
                            full_name: member.name,
                            role: member.role,
                            staff_id: member.staffId,
                            email: member.email || null,
                            phone: member.phone || null,
                            pin: member.pin,
                            assignment_scope: member.assignmentScope || 'admin',
                            assigned_property_id: member.assignedPropertyId || null,
                            assignment_label: member.assignmentLabel || null,
                            badge_logo_url: member.badgeLogoUrl || null,
                            is_active: true
                        };
                    })
                    .filter(Boolean);

                await this.syncTeamMembersTable(memberRows);

                const memberLookupRows = await this.fetchAllRows('team_members');
                const memberIdByStaffId = new Map(memberLookupRows.map(row => [row.staff_id, row.id]));
                const memberIdByEmail = new Map(memberLookupRows.filter(row => row.email).map(row => [String(row.email).toLowerCase(), row.id]));

                await this.syncTableById('properties', this.inventory.map(item => this.mapPropertyToRow(item, hostIdByEmail)).filter(Boolean));
                await this.syncTableById('bookings', this.transactions.map(item => this.mapBookingToRow(item)));
                await this.syncTableById('expenditure_requests', this.expenditures.map(item => this.mapExpenditureToRow(item, memberIdByStaffId)));
                await this.syncTableById('refunds', this.refunds.map(item => this.mapRefundToRow(item, memberIdByStaffId)));
                await this.syncTableById('salary_registry', this.salaryRegistry.map(item => this.mapSalaryToRow(item, memberIdByEmail)));
                await this.syncTableById('rent_registry', this.rentRegistry.map(item => this.mapRentToRow(item)));
                await this.syncTableById('other_income_entries', this.otherIncome.map(item => this.mapOtherIncomeToRow(item, memberIdByStaffId)));
                await this.syncRevenueTargetsTable(
                    Object.entries(this.targets).map(([key, amount]) => this.mapTargetToRow(key, amount, memberIdByStaffId))
                );
                await this.syncTableById('raffle_winners', this.raffleWinners.map(item => this.mapRaffleToRow(item)));

                this.updateSyncUI('online');
            } catch (e) { 
                this.updateSyncUI('offline');
                console.warn(`Supabase save failed: ${e.message}`);
                this.showNotification("Cloud sync failed. Your records are still kept locally on this device.", "error");
            }
        }

        render() {
            const container = document.getElementById('appContainer');
            container.innerHTML = '';

            const roleToggle = document.getElementById('staffRoleToggle');
            const hostBtn = document.getElementById('btnHost');
            const staffBtn = document.getElementById('btnStaff');
            const mgmtBtn = document.getElementById('btnMgmt');
            const chairBtn = document.getElementById('btnChair');
            if (roleToggle) roleToggle.style.display = 'flex';
            if (hostBtn) hostBtn.style.display = this.role === 'host' ? 'inline-flex' : 'none';

            const signedInRole = this.role === 'host' ? 'host' : (this.currentUser?.role || this.role);
            if (staffBtn) staffBtn.style.display = (signedInRole === 'host' || signedInRole === 'staff' || signedInRole === 'management' || signedInRole === 'chairman') ? 'inline-flex' : 'none';
            if (mgmtBtn) mgmtBtn.style.display = (signedInRole === 'host' || signedInRole === 'management' || signedInRole === 'chairman') ? 'inline-flex' : 'none';
            if (chairBtn) chairBtn.style.display = (signedInRole === 'host' || signedInRole === 'chairman') ? 'inline-flex' : 'none';

            // Buttons UI state
            document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
            const effectiveRole = this.role === 'host' ? this.hostDashboardRole : this.role;
            if(effectiveRole === 'host' && hostBtn) hostBtn.classList.add('active');
            if(effectiveRole === 'staff' && staffBtn) staffBtn.classList.add('active');
            if(effectiveRole === 'management' && mgmtBtn) mgmtBtn.classList.add('active');
            if(effectiveRole === 'chairman' && chairBtn) chairBtn.classList.add('active');

            if (effectiveRole === 'host') this.renderHostDashboard(container);
            else if (effectiveRole === 'chairman') this.renderChairmanDashboard(container);
            else if (effectiveRole === 'management') this.renderManagementView(container);
            else this.renderStaffView(container);
            
            refreshFloatingLabels(container);
            this.setupPinEnter();
        }

        // --- NEW HOST & GUEST LOGIC ---
        
        async loginHost(identifier, pass) {
            const normalized = (identifier || '').trim().toLowerCase();
            if (!this.supabase?.auth) {
                this.showNotification("Supabase Auth is unavailable in this environment.", "error");
                return;
            }

            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: normalized,
                password: pass
            });

            if (error || !data.user) {
                this.showNotification("Invalid host credentials", "error");
                return;
            }

            this.authUser = data.user;
            const host = await this.hydrateHostFromAuthUser(data.user, normalized, pass);
            if (!host) {
                this.showNotification("Host profile not found for this authenticated account.", "error");
                return;
            }

            this.showNotification(`Welcome back, ${host.name}`, "success");
            await switchView('portal');
        }
        
        async loginStaff(identifier, pin) {
            const normalizedPhone = String(identifier || '').replace(/\D/g, '');
            if (!normalizedPhone || !pin) {
                this.showNotification("Enter your team phone number and password.", "error");
                return;
            }

            if (!/^\d{11}$/.test(normalizedPhone)) {
                this.showNotification("Enter a valid 11-digit team phone number.", "error");
                return;
            }

            if (!this.supabase?.auth) {
                this.showNotification("Supabase Auth is unavailable in this environment.", "error");
                return;
            }

            const memberProfile = await this.findTeamMemberByPhone(normalizedPhone);
            if (!memberProfile) {
                this.showNotification("No team member was found for that phone number.", "error");
                return;
            }

            const authEmail = memberProfile.email || this.getTeamAuthEmail(normalizedPhone);
            let authResult = await this.supabase.auth.signInWithPassword({
                email: authEmail,
                password: pin
            });

            if (authResult.error || !authResult.data.user) {
                const signUpResult = await this.supabase.auth.signUp({
                    email: authEmail,
                    password: pin,
                    options: {
                        emailRedirectTo: this.getAuthRedirectUrl(),
                        data: {
                            phone: normalizedPhone,
                            full_name: memberProfile.name || ''
                        }
                    }
                });

                if (signUpResult.error || !signUpResult.data.user) {
                    this.showNotification("Invalid team access credentials", "error");
                    return;
                }

                if (!signUpResult.data.session) {
                    this.showNotification("Team account created. Complete email verification, then log in.", "info");
                    return;
                }

                authResult = signUpResult;
            }

            this.authUser = authResult.data.user;
            const member = await this.hydrateTeamMemberFromAuthUser(authResult.data.user, authEmail, normalizedPhone);
            if (!member) {
                this.showNotification("Team profile not found for this authenticated account.", "error");
                return;
            }

            this.showNotification(`${member.name} signed in as ${member.role}`, "success");
            await switchView('portal');
        }

        async registerNewHost(name, email, phone, pass) {
            const normalizedEmail = String(email || '').trim().toLowerCase();
            if (!this.supabase?.auth) {
                this.showNotification("Supabase Auth is unavailable in this environment.", "error");
                return;
            }

            const { data, error } = await this.supabase.auth.signUp({
                email: normalizedEmail,
                password: pass,
                options: {
                    emailRedirectTo: this.getAuthRedirectUrl(),
                    data: {
                        full_name: name,
                        phone
                    }
                }
            });

            if (error || !data.user) {
                this.showNotification(error?.message || "Could not create host account.", "error");
                return;
            }

            if (!data.session) {
                this.showNotification("Account created. Complete email verification, then log in. Your host profile will finish linking on first sign-in.", "info");
                return;
            }

            this.authUser = data.user;

            const { error: hostError } = await this.supabase
                .from('hosts')
                .upsert([{
                    auth_user_id: data.user.id,
                    full_name: name,
                    email: normalizedEmail,
                    phone,
                    password: pass
                }], { onConflict: 'email' });

            if (hostError) {
                this.showNotification(hostError.message || "Host profile could not be linked.", "error");
                return;
            }

            const host = await this.hydrateHostFromAuthUser(data.user, normalizedEmail);
            if (!host) {
                this.showNotification("Host profile was created but could not be loaded.", "error");
                return;
            }

            this.saveLocalData();
            this.showNotification(`Profile created successfully! Welcome to Bookily.`, "success");
            await switchView('portal');
        }

        renderHostDashboard(container) {
            const myProps = this.inventory.filter(i => i.hostEmail === this.currentHostEmail);
            const occCount = myProps.filter(i => i.status === 'occupied').length;
            const myTeamMembers = this.teamMembers.filter(member => member.createdBy === this.currentHostEmail);
            const assignmentOptions = [
                { value: 'office:admin', label: 'Admin Office' },
                { value: 'office:executive', label: 'Executive Office' },
                ...myProps.map(property => ({
                    value: `property:${property.id}`,
                    label: property.name
                }))
            ];
            
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
                                <p style="margin:0; color:var(--gray);">Create staff, management, and executive accounts, then switch into those dashboards from the top role selector.</p>
                            </div>
                        </div>
                        <form id="teamMemberForm" onsubmit="event.preventDefault(); app.addTeamMember();" style="margin-bottom:24px;">
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                                <div class="input-floating"><input type="text" id="teamMemberName" required><label>Full Name</label></div>
                                <div class="input-floating">
                                    <select id="teamMemberRole" onchange="app.refreshTeamMemberStaffId()" required>
                                        <option value="staff">Staff</option>
                                        <option value="management">Management</option>
                                        <option value="chairman">Executive</option>
                                    </select>
                                    <label style="top:5px; font-size:0.7rem;">Position</label>
                                </div>
                                <div class="input-floating">
                                    <select id="teamMemberAssignment" onchange="app.refreshTeamMemberStaffId()" required>
                                        ${assignmentOptions.map(option => `<option value="${option.value}">${option.label}</option>`).join('')}
                                    </select>
                                    <label style="top:5px; font-size:0.7rem;">Assign To</label>
                                </div>
                                <div class="input-floating"><input type="text" id="teamMemberStaffId" readonly required><label>Staff ID</label></div>
                                <div class="input-floating"><input type="tel" id="teamMemberPhone" required maxlength="11" pattern="[0-9]{11}" title="Please enter exactly 11 digits" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 11)"><label>Phone Number</label></div>
                                <div class="input-floating"><input type="email" id="teamMemberEmail"><label>Email Address (Optional)</label></div>
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
                                        <div style="font-size:0.84rem; color:var(--gray);">${this.getDisplayRole(member.role).toUpperCase()} • ${String(member.staffId || '').toUpperCase()} • ${member.phone || 'No phone'}${member.email ? ` • ${member.email}` : ''}</div>
                                        <div style="font-size:0.8rem; color:var(--gray); margin-top:4px;">Assigned to ${member.assignmentLabel || 'Admin Office'}</div>
                                    </div>
                                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                                        <button class="btn-outline" onclick="app.downloadTeamMemberId('${member.id}')">
                                            <i class="fa-solid fa-id-card"></i> Download ID
                                        </button>
                                        <button class="btn-outline" onclick="app.removeTeamMember('${member.id}')" style="border-color:var(--danger); color:var(--danger);">
                                            <i class="fa-solid fa-trash"></i> Remove
                                        </button>
                                    </div>
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
            const assignmentValue = document.getElementById('teamMemberAssignment').value;
            const staffId = document.getElementById('teamMemberStaffId').value.trim().toUpperCase();
            const phone = document.getElementById('teamMemberPhone').value.trim();
            const email = document.getElementById('teamMemberEmail').value.trim();
            const pin = document.getElementById('teamMemberPin').value.trim();
            const assignment = this.getTeamAssignmentDetails(assignmentValue);

            if (!name || !role || !assignmentValue || !staffId || !phone || !pin) {
                this.showNotification("Complete the team access form before saving.", "error");
                return;
            }

            if (!/^\d{11}$/.test(phone)) {
                this.showNotification("Enter a valid 11-digit phone number.", "error");
                document.getElementById('teamMemberPhone')?.focus();
                return;
            }

            const duplicate = this.teamMembers.find(member =>
                member.staffId.toLowerCase() === staffId.toLowerCase() ||
                (phone && member.phone && member.phone === phone) ||
                (email && member.email && member.email.toLowerCase() === email.toLowerCase())
            );
            if (duplicate) {
                this.showNotification("That staff ID, phone number, or email already has access.", "error");
                return;
            }

            this.teamMembers.push({
                id: `team_${Date.now()}`,
                name,
                role,
                staffId,
                phone,
                email,
                pin,
                createdBy: this.currentHostEmail,
                assignmentScope: assignment.scope,
                assignedPropertyId: assignment.propertyId,
                assignmentLabel: assignment.label,
                badgeLogoUrl: assignment.logoUrl
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
            const assignmentValue = document.getElementById('teamMemberAssignment')?.value || 'office:admin';
            const input = document.getElementById('teamMemberStaffId');
            if (!input) return;

            const prefixMap = {
                staff: 'ops',
                management: 'mgt',
                chairman: 'exec'
            };
            const prefix = `${this.toStaffCodeFragment(this.getTeamAssignmentDetails(assignmentValue).label, 4)}-${prefixMap[role] || 'team'}`.toLowerCase();
            const existingNumbers = this.teamMembers
                .map(member => member.staffId || '')
                .filter(id => id.startsWith(`${prefix}-`))
                .map(id => parseInt(id.split('-').pop(), 10))
                .filter(num => !isNaN(num));
            const nextNumber = (existingNumbers.length ? Math.max(...existingNumbers) : 0) + 1;
            input.value = `${prefix}-${String(nextNumber).padStart(3, '0')}`.toUpperCase();
            refreshFloatingLabels();
        }

        getTeamAssignmentDetails(value) {
            if (String(value || '').startsWith('property:')) {
                const propertyId = String(value).split(':')[1];
                const property = this.inventory.find(item => item.id === propertyId);
                return {
                    scope: 'property',
                    propertyId,
                    label: property?.name || 'Property Desk',
                    logoUrl: Array.isArray(property?.images) && property.images[0] ? property.images[0] : ''
                };
            }

            if (value === 'office:executive') {
                return {
                    scope: 'executive',
                    propertyId: '',
                    label: 'Executive Office',
                    logoUrl: ''
                };
            }

            return {
                scope: 'admin',
                propertyId: '',
                label: 'Admin Office',
                logoUrl: ''
            };
        }

        toStaffCodeFragment(text, maxLength = 4) {
            const cleaned = String(text || '')
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, ' ')
                .trim();
            if (!cleaned) return 'team';

            const words = cleaned.split(/\s+/).filter(Boolean);
            if (words.length > 1) {
                return words.map(word => word[0]).join('').slice(0, maxLength) || 'team';
            }

            return cleaned.replace(/\s+/g, '').slice(0, maxLength) || 'team';
        }

        getDisplayRole(role) {
            return role === 'chairman' ? 'Executive' : String(role || '');
        }

        isExecutiveApprovedStatus(status) {
            return status === 'Approved for chairman' || status === 'Approved for executive';
        }

        getDisplayExpenseStatus(status) {
            return this.isExecutiveApprovedStatus(status) ? 'Approved for Executive' : (status || 'Pending approval');
        }

        getHostNameByEmail(email) {
            const normalizedEmail = String(email || '').trim().toLowerCase();
            if (!normalizedEmail) return '';
            const host = this.hosts.find(item => String(item.email || '').trim().toLowerCase() === normalizedEmail);
            return String(host?.name || '').trim();
        }

        async loadImageForCanvas(url) {
            return await new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Image failed to load'));
                img.src = url;
            });
        }

        async downloadTeamMemberId(id) {
            const member = this.teamMembers.find(item => item.id === id);
            if (!member) {
                this.showNotification("Staff member not found.", "error");
                return;
            }

            const width = 1200;
            const height = 720;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                this.showNotification("Staff ID card could not be prepared.", "error");
                return;
            }

            const property = member.assignedPropertyId
                ? this.inventory.find(item => item.id === member.assignedPropertyId)
                : null;
            const accent = member.assignmentScope === 'executive' ? '#1f7a8c' : member.assignmentScope === 'property' ? '#0f9d58' : '#ff385c';
            const issuerName = this.getHostNameByEmail(member.createdBy) ||
                this.getHostNameByEmail(this.currentHostEmail) ||
                member.createdBy ||
                this.currentHostEmail ||
                'Bookily Host';

            const roundRect = (x, y, w, h, r) => {
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                ctx.lineTo(x + w, y + h - r);
                ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                ctx.lineTo(x + r, y + h);
                ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                ctx.lineTo(x, y + r);
                ctx.quadraticCurveTo(x, y, x + r, y);
                ctx.closePath();
            };

            const writeText = (text, x, y, options = {}) => {
                const {
                    size = 28,
                    weight = '400',
                    color = '#111111',
                    align = 'left',
                    font = 'Poppins, Arial, sans-serif'
                } = options;
                ctx.font = `${weight} ${size}px ${font}`;
                ctx.fillStyle = color;
                ctx.textAlign = align;
                ctx.fillText(String(text ?? ''), x, y);
            };

            const wrapText = (text, x, y, maxWidth, lineHeight, options = {}) => {
                const words = String(text || '').split(/\s+/);
                let line = '';
                words.forEach((word, index) => {
                    const next = line ? `${line} ${word}` : word;
                    ctx.font = `${options.weight || '400'} ${options.size || 28}px ${options.font || 'Poppins, Arial, sans-serif'}`;
                    if (ctx.measureText(next).width > maxWidth && line) {
                        writeText(line, x, y, options);
                        line = word;
                        y += lineHeight;
                    } else {
                        line = next;
                    }
                    if (index === words.length - 1 && line) writeText(line, x, y, options);
                });
            };

            const getWrappedLines = (text, maxWidth, options = {}) => {
                const words = String(text || '').split(/\s+/).filter(Boolean);
                const lines = [];
                let line = '';
                ctx.font = `${options.weight || '400'} ${options.size || 28}px ${options.font || 'Poppins, Arial, sans-serif'}`;
                words.forEach(word => {
                    const next = line ? `${line} ${word}` : word;
                    if (ctx.measureText(next).width > maxWidth && line) {
                        lines.push(line);
                        line = word;
                    } else {
                        line = next;
                    }
                });
                if (line) lines.push(line);
                return lines.length ? lines : [''];
            };

            const drawFittedName = (text, x, y, maxWidth, maxLines = 2) => {
                let size = 48;
                let lines = [];
                while (size >= 30) {
                    lines = getWrappedLines(text, maxWidth, { size, weight: '700', font: 'Playfair Display, Georgia, serif' });
                    if (lines.length <= maxLines) break;
                    size -= 2;
                }
                const visibleLines = lines.slice(0, maxLines);
                const lineHeight = size + 10;
                visibleLines.forEach((line, index) => {
                    writeText(line, x, y + (index * lineHeight), { size, weight: '700', color: '#161616', font: 'Playfair Display, Georgia, serif' });
                });
                return y + ((visibleLines.length - 1) * lineHeight);
            };

            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#fff6f7');
            gradient.addColorStop(0.55, '#ffffff');
            gradient.addColorStop(1, '#fff2e8');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#ffffff';
            roundRect(50, 50, width - 100, height - 100, 36);
            ctx.fill();
            ctx.strokeStyle = '#f0d8de';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = accent;
            roundRect(50, 50, 360, height - 100, 36);
            ctx.fill();

            if (member.badgeLogoUrl) {
                try {
                    const logoImage = await this.loadImageForCanvas(member.badgeLogoUrl);
                    ctx.save();
                    roundRect(95, 150, 270, 240, 28);
                    ctx.clip();
                    ctx.drawImage(logoImage, 95, 150, 270, 240);
                    ctx.restore();
                } catch (error) {
                    ctx.fillStyle = 'rgba(255,255,255,0.18)';
                    roundRect(95, 150, 270, 240, 28);
                    ctx.fill();
                }
            } else {
                ctx.fillStyle = 'rgba(255,255,255,0.16)';
                roundRect(95, 150, 270, 240, 28);
                ctx.fill();
            }

            ctx.fillStyle = '#ffffff';
            writeText('Bookily', 95, 105, { size: 44, weight: '700', color: '#ffffff' });
            writeText('Engine Staff ID', 95, 140, { size: 22, weight: '500', color: 'rgba(255,255,255,0.85)' });
            writeText(member.assignmentLabel || 'Admin Office', 95, 455, { size: 30, weight: '700', color: '#ffffff' });
            wrapText(property?.loc || 'Abuja, Nigeria', 95, 495, 250, 32, { size: 22, color: 'rgba(255,255,255,0.82)' });
            writeText(String(member.staffId || '').toUpperCase(), 95, 585, { size: 32, weight: '700', color: '#ffe38a', font: 'monospace' });
            writeText(this.getDisplayRole(member.role).toUpperCase(), 95, 625, { size: 22, weight: '700', color: '#ffffff' });

            writeText('OFFICIAL STAFF PASS', 470, 130, { size: 18, weight: '700', color: accent });
            const nameBottomY = drawFittedName(member.name, 470, 210, 560, 2);
            writeText(member.phone || 'No phone provided', 470, nameBottomY + 44, { size: 24, color: '#555555' });
            writeText(member.email || 'No email provided', 470, nameBottomY + 79, { size: 24, color: '#555555' });

            ctx.fillStyle = '#f8f8f8';
            roundRect(470, 345, 620, 235, 28);
            ctx.fill();
            ctx.strokeStyle = '#ececec';
            ctx.stroke();

            writeText('Assigned Unit', 510, 395, { size: 18, weight: '700', color: '#888888' });
            wrapText(member.assignmentLabel || 'Admin Office', 510, 438, 520, 42, { size: 32, weight: '700', color: '#1f1f1f' });
            writeText('Role', 510, 505, { size: 18, weight: '700', color: '#888888' });
            writeText(this.getDisplayRole(member.role).toUpperCase(), 510, 545, { size: 28, weight: '700', color: accent });
            writeText('Issued By', 860, 505, { size: 18, weight: '700', color: '#888888' });
            writeText(issuerName, 860, 545, { size: 24, weight: '600', color: '#1f1f1f' });

            writeText('Valid for internal operations and access control only.', 470, 635, { size: 18, color: '#888888' });

            const link = document.createElement('a');
            link.download = `bookily-staff-id-${member.staffId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            this.showNotification(`Staff ID downloaded for ${member.name}.`, "success");
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
                images: processedImages, amenities: selectedAmenities, coords: { lat, lng }, city: 'Abuja', state: 'FCT'
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
            this.inventory[propIndex].city = this.inventory[propIndex].city || 'Abuja';
            this.inventory[propIndex].state = this.inventory[propIndex].state || 'FCT';

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

        updateGuestFilter(key, value) {
            this.guestFilters[key] = value;
            this.renderGuestGrid();
            if (this.guestViewMode === 'map') this.initGuestMap();
        }

        updateGuestSort(value) {
            this.guestSortBy = value;
            this.renderGuestGrid();
            if (this.guestViewMode === 'map') this.initGuestMap();
        }

        resetGuestFilters() {
            this.guestFilters = { rooms: 'all', priceRange: 'all', location: 'all', city: 'all', state: 'all' };
            this.guestSortBy = 'default';
            this.guestSearchQuery = '';

            const searchInput = document.querySelector('#guestView input[onkeyup*="updateGuestSearch"]');
            if (searchInput) searchInput.value = '';
            const setValue = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.value = value;
            };
            setValue('guestRoomsFilter', 'all');
            setValue('guestPriceRangeFilter', 'all');
            setValue('guestLocationFilter', 'all');
            setValue('guestCityFilter', 'all');
            setValue('guestStateFilter', 'all');
            setValue('guestSortSelect', 'default');

            refreshFloatingLabels(document.getElementById('guestView'));
            this.renderGuestGrid();
            if (this.guestViewMode === 'map') this.initGuestMap();
        }

        getPropertyCity(prop) {
            return prop.city || 'Abuja';
        }

        getPropertyState(prop) {
            return prop.state || 'FCT';
        }

        getPropertyRoomCount(prop) {
            const type = String(prop.type || '').toLowerCase();
            if (type.includes('studio')) return 0;
            const match = type.match(/(\d+)/);
            return match ? parseInt(match[1], 10) : 1;
        }

        getFilteredGuestProperties() {
            let data = this.inventory.filter(i => i.status === 'available');

            if (this.guestSearchQuery) {
                const q = this.guestSearchQuery.toLowerCase();
                data = data.filter(i =>
                    i.name.toLowerCase().includes(q) ||
                    i.loc.toLowerCase().includes(q) ||
                    this.getPropertyCity(i).toLowerCase().includes(q) ||
                    this.getPropertyState(i).toLowerCase().includes(q)
                );
            }

            if (this.guestFilters.location !== 'all') {
                data = data.filter(i => i.loc === this.guestFilters.location);
            }

            if (this.guestFilters.city !== 'all') {
                data = data.filter(i => this.getPropertyCity(i) === this.guestFilters.city);
            }

            if (this.guestFilters.state !== 'all') {
                data = data.filter(i => this.getPropertyState(i) === this.guestFilters.state);
            }

            if (this.guestFilters.rooms !== 'all') {
                const selectedRooms = parseInt(this.guestFilters.rooms, 10);
                data = data.filter(i => {
                    const rooms = this.getPropertyRoomCount(i);
                    return selectedRooms >= 4 ? rooms >= 4 : rooms === selectedRooms;
                });
            }

            if (this.guestFilters.priceRange !== 'all') {
                data = data.filter(i => {
                    const price = Number(i.price) || 0;
                    const range = this.guestFilters.priceRange;
                    if (range === '250001+') return price >= 250001;
                    const [min, max] = range.split('-').map(Number);
                    return price >= min && price <= max;
                });
            }

            if (this.guestSortBy === 'priceAsc') {
                data = [...data].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
            } else if (this.guestSortBy === 'priceDesc') {
                data = [...data].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
            }

            return data;
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

            let data = this.getFilteredGuestProperties();

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
            
            let data = this.getFilteredGuestProperties();
            
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
            let data = this.getScopedInventoryRecords();
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
                    const detailsModal = document.getElementById('propDetailsModal');
                    if (detailsModal) {
                        detailsModal.classList.remove('show');
                        setTimeout(() => {
                            detailsModal.style.display = 'none';
                            this.openBookingModal(isGuestMode ? 'guest' : 'staff', prop.id);
                        }, 300);
                    } else {
                        this.openBookingModal(isGuestMode ? 'guest' : 'staff', prop.id);
                    }
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
            const estimatedTotal = Number(tx.estimatedTotal) || 0;
            const totalPaid = Number(tx.amount) || 0;
            return {
                receiptNumber: tx.id || this.getTransactionId(tx),
                guest: tx.guest,
                property: tx.propertyName || prop?.name || tx.propId,
                location: tx.propertyLocation || prop?.loc || '',
                checkIn: tx.checkIn || '',
                checkOut: tx.checkOut || '',
                total: estimatedTotal,
                estimatedTotal,
                totalPaid,
                balance: Math.max(0, estimatedTotal - totalPaid),
                code: tx.accessCode || '',
                phone: tx.phone || '',
                email: tx.email || '',
                date: tx.date || '',
                reward: tx.reward || null
            };
        }

        mapBookingRowToTransaction(row, propertyLookup = new Map()) {
            const property = propertyLookup.get(row.property_id) || null;
            return {
                id: row.id,
                date: row.booking_date,
                propId: row.property_id,
                propertyName: row.property_name || property?.name || '',
                propertyLocation: row.property_location || property?.loc || '',
                amount: Number(row.amount_paid) || 0,
                estimatedTotal: Number(row.estimated_total) || 0,
                cautionFee: Number(row.caution_fee_paid) || 0,
                guest: row.guest_name,
                phone: row.guest_phone,
                email: row.guest_email || '',
                accessCode: row.access_code || '',
                checkIn: row.check_in || '',
                checkOut: row.check_out || '',
                createdAt: row.created_at || '',
                reward: row.reward ? { label: row.reward, detail: row.reward_detail || '' } : null
            };
        }

        buildReceiptHtml(data) {
            return `
                <html>
                <head>
                    <title>Bookily Receipt</title>
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
                                <div class="brand">Bookily Stays</div>
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
                                <div><div class="label">Total Paid</div><div class="value">${this.formatCurrency(data.totalPaid)}</div></div>
                                <div style="text-align:center;"><div class="label">Balance</div><div class="value">${this.formatCurrency(data.balance)}</div></div>
                                <div style="text-align:right;"><div class="label">Email</div><div class="value" style="font-size:15px;">${data.email || 'N/A'}</div></div>
                            </div>
                        </div>
                        ${data.reward ? `
                            <div class="box" style="background:#fff7df; border-color:#f2d081;">
                                <div class="label" style="color:#8a5a00;">Booking Reward</div>
                                <div class="value" style="font-size:26px;">${data.reward.label}</div>
                                <div class="sub" style="margin-top:8px; line-height:1.6;">${data.reward.detail || ''}</div>
                            </div>
                        ` : ''}
                        <div class="code">${data.code}</div>
                    </div>
                </body>
                </html>
            `;
        }

        async downloadReceiptImage(data) {
            const width = 1200;
            const height = 1600;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                this.showNotification("Receipt image could not be prepared.", "error");
                return;
            }

            const radiusRect = (x, y, w, h, r, fill) => {
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                ctx.lineTo(x + w, y + h - r);
                ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                ctx.lineTo(x + r, y + h);
                ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                ctx.lineTo(x, y + r);
                ctx.quadraticCurveTo(x, y, x + r, y);
                ctx.closePath();
                if (fill) ctx.fill();
            };

            const writeText = (text, x, y, options = {}) => {
                const {
                    size = 34,
                    weight = '400',
                    color = '#1a1a1a',
                    align = 'left',
                    font = 'Poppins, Arial, sans-serif'
                } = options;
                ctx.font = `${weight} ${size}px ${font}`;
                ctx.fillStyle = color;
                ctx.textAlign = align;
                ctx.fillText(String(text ?? ''), x, y);
            };

            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#ffffff';
            radiusRect(70, 70, 1060, 1460, 36, true);

            writeText('Bookily Stays', 130, 170, { size: 54, weight: '700', color: '#ff385c' });
            writeText('Booking Receipt', 130, 220, { size: 24, color: '#666666' });

            ctx.fillStyle = '#fff0f3';
            radiusRect(870, 110, 170, 58, 29, true);
            writeText('CONFIRMED', 955, 148, { size: 20, weight: '700', color: '#ff385c', align: 'center' });
            writeText(`Receipt: ${data.receiptNumber}`, 1040, 210, { size: 22, color: '#666666', align: 'right' });
            writeText(data.date || '', 1040, 245, { size: 22, color: '#666666', align: 'right' });

            ctx.fillStyle = '#fafafa';
            radiusRect(120, 290, 960, 250, 28, true);
            ctx.strokeStyle = '#eeeeee';
            ctx.lineWidth = 2;
            radiusRect(120, 290, 960, 250, 28, false);
            ctx.stroke();

            writeText('GUEST', 160, 350, { size: 18, weight: '700', color: '#777777' });
            writeText(data.guest, 160, 392, { size: 34, weight: '700' });
            writeText('PHONE', 1040, 350, { size: 18, weight: '700', color: '#777777', align: 'right' });
            writeText(data.phone, 1040, 392, { size: 34, weight: '700', align: 'right' });
            writeText('PROPERTY', 160, 465, { size: 18, weight: '700', color: '#777777' });
            writeText(data.property, 160, 507, { size: 34, weight: '700' });
            writeText('LOCATION', 1040, 465, { size: 18, weight: '700', color: '#777777', align: 'right' });
            writeText(data.location || 'N/A', 1040, 507, { size: 34, weight: '700', align: 'right' });

            ctx.fillStyle = '#fafafa';
            radiusRect(120, 580, 960, 330, 28, true);
            ctx.strokeStyle = '#eeeeee';
            ctx.lineWidth = 2;
            radiusRect(120, 580, 960, 330, 28, false);
            ctx.stroke();

            writeText('CHECK-IN', 160, 640, { size: 18, weight: '700', color: '#777777' });
            writeText(data.checkIn || 'N/A', 160, 682, { size: 34, weight: '700' });
            writeText('CHECK-OUT', 1040, 640, { size: 18, weight: '700', color: '#777777', align: 'right' });
            writeText(data.checkOut || 'N/A', 1040, 682, { size: 34, weight: '700', align: 'right' });

            writeText('TOTAL PAID', 160, 780, { size: 18, weight: '700', color: '#777777' });
            writeText(this.formatCurrency(data.totalPaid), 160, 822, { size: 40, weight: '700', color: '#ff385c' });
            writeText('BALANCE', 560, 780, { size: 18, weight: '700', color: '#777777', align: 'center' });
            writeText(this.formatCurrency(data.balance), 560, 822, { size: 40, weight: '700', align: 'center' });
            writeText('EMAIL', 1040, 780, { size: 18, weight: '700', color: '#777777', align: 'right' });
            writeText(data.email || 'N/A', 1040, 822, { size: 24, weight: '700', align: 'right' });

            ctx.strokeStyle = '#dddddd';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(160, 860);
            ctx.lineTo(1040, 860);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#1a1a1a';
            radiusRect(120, 960, 960, 260, 28, true);
            writeText('SMART LOCK ACCESS CODE', 600, 1035, { size: 20, weight: '700', color: '#aaaaaa', align: 'center' });
            writeText(data.code || 'N/A', 600, 1135, { size: 76, weight: '700', color: '#ffd700', align: 'center', font: 'monospace' });
            writeText('Use this code to unlock the door during your stay.', 600, 1195, { size: 24, color: '#888888', align: 'center' });

            if (data.reward?.label) {
                ctx.fillStyle = '#fff7df';
                radiusRect(120, 1255, 960, 180, 28, true);
                ctx.strokeStyle = '#f2d081';
                ctx.lineWidth = 2;
                radiusRect(120, 1255, 960, 180, 28, false);
                ctx.stroke();
                writeText('BOOKING REWARD', 160, 1315, { size: 18, weight: '700', color: '#8a5a00' });
                writeText(data.reward.label, 160, 1360, { size: 40, weight: '700', color: '#1a1a1a' });
                writeText(data.reward.detail || '', 160, 1405, { size: 24, color: '#6d6257' });
            }

            const link = document.createElement('a');
            link.download = `bookily-receipt-${data.receiptNumber}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }

        async downloadRewardReceiptImage(data) {
            const width = 1200;
            const height = 1500;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                this.showNotification("Reward receipt could not be prepared.", "error");
                return;
            }

            const radiusRect = (x, y, w, h, r, fill) => {
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                ctx.lineTo(x + w, y + h - r);
                ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                ctx.lineTo(x + r, y + h);
                ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                ctx.lineTo(x, y + r);
                ctx.quadraticCurveTo(x, y, x + r, y);
                ctx.closePath();
                if (fill) ctx.fill();
            };

            const writeText = (text, x, y, options = {}) => {
                const {
                    size = 34,
                    weight = '400',
                    color = '#1a1a1a',
                    align = 'left',
                    font = 'Poppins, Arial, sans-serif'
                } = options;
                ctx.font = `${weight} ${size}px ${font}`;
                ctx.fillStyle = color;
                ctx.textAlign = align;
                ctx.fillText(String(text ?? ''), x, y);
            };

            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#ffffff';
            radiusRect(70, 70, 1060, 1360, 36, true);

            writeText('Bookily Stays', 130, 170, { size: 54, weight: '700', color: '#ff385c' });
            writeText('Reward Receipt', 130, 220, { size: 24, color: '#666666' });

            ctx.fillStyle = '#fff0f3';
            radiusRect(845, 110, 195, 58, 29, true);
            writeText('REWARD CONFIRMED', 942, 148, { size: 18, weight: '700', color: '#ff385c', align: 'center' });
            writeText(`Reference: ${data.rewardReceiptNumber}`, 1040, 210, { size: 22, color: '#666666', align: 'right' });
            writeText(data.date || '', 1040, 245, { size: 22, color: '#666666', align: 'right' });

            ctx.fillStyle = '#fafafa';
            radiusRect(120, 290, 960, 220, 28, true);
            ctx.strokeStyle = '#eeeeee';
            ctx.lineWidth = 2;
            radiusRect(120, 290, 960, 220, 28, false);
            ctx.stroke();

            writeText('GUEST', 160, 350, { size: 18, weight: '700', color: '#777777' });
            writeText(data.guest, 160, 392, { size: 34, weight: '700' });
            writeText('PHONE', 1040, 350, { size: 18, weight: '700', color: '#777777', align: 'right' });
            writeText(data.phone, 1040, 392, { size: 30, weight: '700', align: 'right' });
            writeText('PROPERTY', 160, 465, { size: 18, weight: '700', color: '#777777' });
            writeText(data.property, 160, 507, { size: 34, weight: '700' });

            ctx.fillStyle = '#fff7df';
            radiusRect(120, 560, 960, 300, 28, true);
            ctx.strokeStyle = '#f2d081';
            ctx.lineWidth = 2;
            radiusRect(120, 560, 960, 300, 28, false);
            ctx.stroke();

            writeText('UNLOCKED REWARD', 160, 625, { size: 18, weight: '700', color: '#8a5a00' });
            writeText(data.reward.label, 160, 700, { size: 56, weight: '700', color: '#1a1a1a' });
            writeText(data.reward.detail || '', 160, 760, { size: 28, color: '#6d6257' });
            writeText('Valid for this confirmed booking only.', 160, 820, { size: 24, weight: '700', color: '#8a5a00' });

            ctx.fillStyle = '#1a1a1a';
            radiusRect(120, 910, 960, 240, 28, true);
            writeText('CLAIM CODE', 600, 985, { size: 20, weight: '700', color: '#aaaaaa', align: 'center' });
            writeText(data.code || 'N/A', 600, 1085, { size: 76, weight: '700', color: '#ffd700', align: 'center', font: 'monospace' });
            writeText('Present this reward receipt with your claim code at check-in.', 600, 1145, { size: 24, color: '#888888', align: 'center' });

            ctx.fillStyle = '#fafafa';
            radiusRect(120, 1195, 960, 150, 28, true);
            ctx.strokeStyle = '#eeeeee';
            ctx.lineWidth = 2;
            radiusRect(120, 1195, 960, 150, 28, false);
            ctx.stroke();
            writeText('CHECK-IN', 160, 1255, { size: 18, weight: '700', color: '#777777' });
            writeText(data.checkIn || 'N/A', 160, 1297, { size: 30, weight: '700' });
            writeText('CHECK-OUT', 1040, 1255, { size: 18, weight: '700', color: '#777777', align: 'right' });
            writeText(data.checkOut || 'N/A', 1040, 1297, { size: 30, weight: '700', align: 'right' });

            const link = document.createElement('a');
            link.download = `bookily-reward-${data.rewardReceiptNumber}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }

        downloadCurrentReceipt() {
            if (!this.currentReceiptData) {
                this.showNotification("No receipt available to download.", "error");
                return;
            }
            this.downloadReceiptImage(this.currentReceiptData);
        }

        downloadGuestReceipt(transactionId) {
            const tx = this.transactions.find(item => (item.id || this.getTransactionId(item)) === transactionId);
            if (!tx) {
                this.showNotification("Reservation receipt not found.", "error");
                return;
            }
            this.downloadReceiptImage(this.getTransactionReceiptData(tx));
        }

        populateReceiptModal(receiptData) {
            this.currentReceiptData = receiptData;
            document.getElementById('recGuest').innerText = receiptData.guest;
            document.getElementById('recProp').innerText = receiptData.property;
            document.getElementById('recIn').innerText = receiptData.checkIn;
            document.getElementById('recOut').innerText = receiptData.checkOut;
            document.getElementById('recTotal').innerText = this.formatCurrency(receiptData.total);
            document.getElementById('recPaid').innerText = this.formatCurrency(receiptData.totalPaid);
            document.getElementById('recBalance').innerText = this.formatCurrency(receiptData.balance);
            document.getElementById('recCode').innerText = receiptData.code;

            const rewardBox = document.getElementById('receiptRewardBox');
            const rewardTitle = document.getElementById('recRewardTitle');
            const rewardDetail = document.getElementById('recRewardDetail');
            if (rewardBox && rewardTitle && rewardDetail) {
                if (receiptData.reward?.label) {
                    rewardBox.style.display = 'block';
                    rewardTitle.innerText = receiptData.reward.label;
                    rewardDetail.innerText = receiptData.reward.detail || '';
                } else {
                    rewardBox.style.display = 'none';
                    rewardTitle.innerText = '';
                    rewardDetail.innerText = '';
                }
            }
        }

        renderRewardLegend() {
            const legend = document.getElementById('rewardLegend');
            if (!legend) return;
            legend.innerHTML = this.rewardPrizes.map(prize => `
                <div class="reward-legend-item">
                    <span class="reward-legend-swatch" style="background:${prize.color};"></span>
                    <div><strong>${prize.label}</strong><br>${prize.detail}</div>
                </div>
            `).join('');
        }

        startGuestSalesTimers() {
            const flashHeadline = document.getElementById('flashOfferHeadline');
            const flashDetail = document.getElementById('flashOfferDetail');
            const flashTimer = document.getElementById('flashOfferTimer');
            const flashCaption = document.getElementById('flashOfferCaption');
            const mealHeadline = document.getElementById('mealOfferHeadline');
            const mealTimer = document.getElementById('mealOfferTimer');

            if (!flashHeadline || !flashDetail || !flashTimer || !flashCaption || !mealHeadline || !mealTimer) {
                return;
            }

            if (this.flashOfferInterval) clearInterval(this.flashOfferInterval);
            if (this.mealOfferInterval) clearInterval(this.mealOfferInterval);

            let flashSeconds = 35;
            let flashPhase = 'phase1';
            const renderFlash = () => {
                if (flashPhase === 'phase1') {
                    flashHeadline.innerText = '50% off if you book within 35 seconds.';
                    flashDetail.innerText = 'When this ends, the next wave drops to 15% off until the first VIP perk expires.';
                    flashCaption.innerText = 'Phase 1 live now';
                } else {
                    flashHeadline.innerText = '15% off if you book within 10 seconds.';
                    flashDetail.innerText = 'Short second-chance burst for guests still deciding.';
                    flashCaption.innerText = 'Phase 2 live now';
                }
                flashTimer.innerText = formatPromoCountdown(flashSeconds);
            };

            renderFlash();
            this.flashOfferInterval = setInterval(() => {
                flashSeconds -= 1;
                if (flashSeconds < 0) {
                    if (flashPhase === 'phase1') {
                        flashPhase = 'phase2';
                        flashSeconds = this.getExclusivePhaseTwoDiscountSeconds();
                    } else {
                        flashPhase = 'phase1';
                        flashSeconds = 35;
                    }
                }
                renderFlash();
            }, 1000);

            const mealOffers = [
                'Free lunch if you book within the next 5 minutes.',
                'Free dinner if you book within the next 5 minutes.',
                'Free drinks on us if you lock in your stay within the next 5 minutes.'
            ];
            let mealSeconds = 300;
            let mealIndex = 0;
            mealHeadline.innerText = mealOffers[mealIndex];
            mealTimer.innerText = formatPromoCountdown(mealSeconds);

            this.mealOfferInterval = setInterval(() => {
                mealSeconds -= 1;
                if (mealSeconds < 0) {
                    mealSeconds = 300;
                    mealIndex = (mealIndex + 1) % mealOffers.length;
                    mealHeadline.innerText = mealOffers[mealIndex];
                }
                mealTimer.innerText = formatPromoCountdown(mealSeconds);
            }, 1000);
        }

        formatExclusiveTime(seconds, includeHours = false) {
            const safe = Math.max(0, seconds);
            const m = Math.floor((safe % 3600) / 60);
            const s = safe % 60;
            if (includeHours) {
                const h = Math.floor(safe / 3600);
                return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            }
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }

        initExclusiveGuestPage() {
            this.ensureExclusiveTimerState();
            this.updateExclusiveHeroText(this.exclusiveCurrentSlide);
            this.restartExclusiveHeroSlider();
            this.restartExclusiveMasterTimer();
            this.restartExclusiveSocialProof();
            this.restartExclusiveWinnersTicker();
            this.restartExclusivePerksWidgetMotion();
            this.ensureExclusiveExitIntent();
            this.ensureExclusiveSpinBindings();
            this.populateExclusiveFilterOptions();
            this.syncExclusiveControls();
            this.renderExclusiveListings();
            this.resizeExclusiveCanvas();
        }

        showGuestExperienceLoader() {
            const loader = document.getElementById('guestExperienceLoader');
            if (!loader) return;
            loader.classList.add('show');
            this.renderGuestLoaderState(0);
            if (this.guestLoaderQuoteInterval) clearInterval(this.guestLoaderQuoteInterval);
            let quoteIndex = 0;
            this.guestLoaderQuoteInterval = setInterval(() => {
                quoteIndex = (quoteIndex + 1) % this.guestLoaderQuotes.length;
                this.renderGuestLoaderState(quoteIndex);
            }, 2600);
        }

        hideGuestExperienceLoader() {
            const loader = document.getElementById('guestExperienceLoader');
            if (loader) loader.classList.remove('show');
            if (this.guestLoaderQuoteInterval) clearInterval(this.guestLoaderQuoteInterval);
            this.guestLoaderQuoteInterval = null;
        }

        renderGuestLoaderState(quoteIndex = 0) {
            const quoteEl = document.getElementById('guestLoaderQuote');
            const testimonialsEl = document.getElementById('guestLoaderTestimonials');
            if (quoteEl) quoteEl.innerText = this.guestLoaderQuotes[quoteIndex % this.guestLoaderQuotes.length];
            if (!testimonialsEl) return;

            const cards = Array.from({ length: 3 }, (_, index) => {
                const item = this.guestLoaderTestimonials[(quoteIndex + index) % this.guestLoaderTestimonials.length];
                return `
                    <article class="guest-loader-testimonial-card">
                        <p>${item.text}</p>
                        <strong>${item.name}</strong>
                        <span>${item.role}</span>
                    </article>
                `;
            });

            testimonialsEl.innerHTML = cards.join('');
        }

        restartExclusivePerksWidgetMotion() {
            const widget = document.getElementById('guestExclusivePerksWidget');
            if (!widget) return;
            widget.classList.add('is-visible');
            if (this.exclusivePerksWidgetInterval) clearInterval(this.exclusivePerksWidgetInterval);
            this.exclusivePerksWidgetInterval = setInterval(() => {
                widget.classList.toggle('is-visible');
            }, 8000);
        }

        populateExclusiveFilterOptions() {
            const available = this.inventory.filter(item => item.status === 'available');
            const fillSelect = (id, items, label) => {
                const select = document.getElementById(id);
                if (!select) return;
                const current = select.value || 'all';
                select.innerHTML = `<option value="all">${label}</option>${items.map(item => `<option value="${item}">${item}</option>`).join('')}`;
                select.value = items.includes(current) ? current : 'all';
            };

            fillSelect('guestExclusiveLocationFilter', [...new Set(available.map(item => item.loc).filter(Boolean))].sort(), 'Location');
            fillSelect('guestExclusiveCityFilter', [...new Set(available.map(item => this.getPropertyCity(item)).filter(Boolean))].sort(), 'City');
            fillSelect('guestExclusiveStateFilter', [...new Set(available.map(item => this.getPropertyState(item)).filter(Boolean))].sort(), 'State');
        }

        syncExclusiveControls() {
            const setValue = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.value = value;
            };

            setValue('guestExclusiveSearchInput', this.guestSearchQuery);
            setValue('guestExclusiveRoomsFilter', this.guestFilters.rooms);
            setValue('guestExclusivePriceRangeFilter', this.guestFilters.priceRange);
            setValue('guestExclusiveLocationFilter', this.guestFilters.location);
            setValue('guestExclusiveCityFilter', this.guestFilters.city);
            setValue('guestExclusiveStateFilter', this.guestFilters.state);
            setValue('guestExclusiveSortSelect', this.guestSortBy);

            const activeClasses = ['bg-amada-red', 'text-white', 'shadow-sm'];
            const idleClasses = ['text-gray-800'];
            const buttons = [
                { id: 'guestExclusiveBtnGrid', mode: 'grid' },
                { id: 'guestExclusiveBtnList', mode: 'list' },
                { id: 'guestExclusiveBtnMap', mode: 'map' }
            ];

            buttons.forEach(({ id, mode }) => {
                const button = document.getElementById(id);
                if (!button) return;
                const isActive = this.guestViewMode === mode;
                button.classList.remove(...activeClasses, ...idleClasses);
                if (isActive) button.classList.add(...activeClasses);
                else button.classList.add(...idleClasses);
            });
        }

        updateExclusiveSearch(value) {
            this.guestSearchQuery = value;
            this.renderExclusiveListings();
        }

        submitExclusiveHeroSearch() {
            const locationInput = document.getElementById('guestExclusiveHeroLocationInput');
            const guestSelect = document.getElementById('guestExclusiveHeroGuestSelect');
            const dateInput = document.getElementById('guestExclusiveHeroDateInput');
            const query = locationInput?.value?.trim() || '';
            const guestChoice = guestSelect?.value || '1 Guest';

            this.guestSearchQuery = query;
            this.guestViewMode = 'grid';

            if (guestChoice === '3+ Guests') this.guestFilters.rooms = '2';
            else if (guestChoice === '2 Guests') this.guestFilters.rooms = '1';
            else this.guestFilters.rooms = 'all';

            this.syncExclusiveControls();
            this.renderExclusiveListings();

            const resultsSection = document.getElementById('guestExclusiveListingsGrid');
            resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });

            const summaryParts = [];
            if (query) summaryParts.push(query);
            if (guestChoice) summaryParts.push(guestChoice);
            if (dateInput?.value) summaryParts.push(new Date(dateInput.value).toLocaleDateString());
            this.showNotification(summaryParts.length ? `Showing stays for ${summaryParts.join(' • ')}` : 'Showing all available stays.', 'success');
        }

        updateExclusiveFilter(key, value) {
            this.guestFilters[key] = value;
            this.renderExclusiveListings();
        }

        updateExclusiveSort(value) {
            this.guestSortBy = value;
            this.renderExclusiveListings();
        }

        resetExclusiveFilters() {
            this.guestFilters = { rooms: 'all', priceRange: 'all', location: 'all', city: 'all', state: 'all' };
            this.guestSortBy = 'default';
            this.guestSearchQuery = '';
            this.populateExclusiveFilterOptions();
            this.syncExclusiveControls();
            this.renderExclusiveListings();
        }

        toggleExclusiveView(mode) {
            this.guestViewMode = mode;
            this.syncExclusiveControls();
            this.renderExclusiveListings();
        }

        getExclusiveListingMeta(prop, index) {
            const rooms = this.getPropertyRoomCount(prop);
            const viewers = 6 + ((index * 4) % 11);
            const bookedPct = Math.min(96, 58 + ((index * 11) % 39));
            const badgeSets = [
                {
                    primary: { cls: 'bg-amada-red text-white', text: 'High Demand', icon: 'fa-fire' },
                    secondary: { cls: 'bg-white/95 text-red-600 border border-red-100', text: 'Only 1 unit left!' }
                },
                {
                    primary: { cls: 'bg-amada-dark text-amada-gold', text: 'Premium', icon: 'fa-crown' },
                    secondary: null
                },
                {
                    primary: { cls: 'bg-white/90 backdrop-blur text-blue-600 border border-blue-200', text: 'Rare Find', icon: 'fa-gem' },
                    secondary: null
                }
            ];
            return {
                rooms,
                viewers,
                bookedPct,
                badges: badgeSets[index % badgeSets.length]
            };
        }

        getExclusiveMarketingPerks() {
            return [
                { text: 'Free Night', icon: 'fa-moon', cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
                { text: '50% Off', icon: 'fa-tags', cls: 'bg-red-50 text-amada-red border border-red-200' },
                { text: 'Free Lunch', icon: 'fa-utensils', cls: 'bg-yellow-50 text-yellow-700 border border-yellow-200' }
            ];
        }

        renderExclusiveListings() {
            const container = document.getElementById('guestExclusiveListingsGrid');
            const mapArea = document.getElementById('guestExclusiveMapArea');
            if (!container) return;
            const data = this.getFilteredGuestProperties();
            this.syncExclusiveControls();
            container.innerHTML = '';

            if (this.guestViewMode === 'map') {
                container.className = 'hidden';
                if (mapArea) mapArea.classList.remove('hidden');
                this.initExclusiveMap(data);
                if (!data.length && mapArea) {
                    mapArea.innerHTML = `<div class="h-full flex items-center justify-center text-center p-10 text-gray-500"><div><i class="fa-solid fa-map-location-dot text-5xl text-gray-300 mb-4"></i><h4 class="font-serif text-3xl font-bold text-gray-900 mb-3">No stays match these filters.</h4><p>Adjust your filters to repopulate the map.</p></div></div>`;
                }
                return;
            }

            container.className = this.guestViewMode === 'list'
                ? 'grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-6'
                : 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10';
            if (mapArea) mapArea.classList.add('hidden');

            if (!data.length) {
                container.innerHTML = `
                    <div class="col-span-full bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
                        <i class="fa-solid fa-house-circle-xmark text-5xl text-gray-300 mb-4"></i>
                        <h4 class="font-serif text-3xl font-bold text-gray-900 mb-3">No coded stays available right now.</h4>
                        <p class="text-gray-500 font-medium">Once properties are available in the database, they will appear here automatically.</p>
                    </div>
                `;
                return;
            }

            data.forEach((prop, index) => {
                const meta = this.getExclusiveListingMeta(prop, index);
                const promoPerks = this.getExclusiveMarketingPerks();
                const img = Array.isArray(prop.images) && prop.images.length
                    ? prop.images[0]
                    : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                const card = document.createElement('div');
                card.className = `listing-card rounded-2xl overflow-hidden border border-gray-200 relative group cursor-pointer shadow-lg flex flex-col ${this.guestViewMode === 'list' ? 'list-mode' : ''}`;
                card.onclick = () => this.openExclusivePropertyDetails(prop.id);
                card.innerHTML = `
                    <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        <span class="${meta.badges.primary.cls} text-xs font-black px-3 py-1.5 rounded shadow-lg uppercase tracking-wider"><i class="fa-solid ${meta.badges.primary.icon} mr-1"></i> ${meta.badges.primary.text}</span>
                        ${meta.badges.secondary ? `<span class="${meta.badges.secondary.cls} text-[11px] font-extrabold px-3 py-1 rounded shadow uppercase">${meta.badges.secondary.text}</span>` : ''}
                    </div>
                    <div class="absolute top-4 right-4 z-10">
                        <button class="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-400 hover:text-amada-red transition shadow"><i class="fa-solid fa-heart text-lg"></i></button>
                    </div>
                    <div class="guest-exclusive-media h-72 overflow-hidden bg-gray-100">
                        <img src="${img}" alt="${prop.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">
                    </div>
                    <div class="guest-exclusive-card-body p-6 flex-grow flex flex-col">
                        <div class="guest-exclusive-card-header flex justify-between items-start mb-1">
                            <h4 class="font-serif text-2xl font-bold text-gray-900">${prop.name}</h4>
                            <span class="flex items-center text-gray-900 text-sm font-black bg-yellow-100 px-2 py-0.5 rounded"><i class="fa-solid fa-star text-amada-gold mr-1"></i> ${(4.8 + ((index % 3) * 0.07)).toFixed(2)}</span>
                        </div>
                        <p class="guest-exclusive-card-location text-gray-500 text-sm mb-4 font-medium">${prop.loc} • ${Math.max(2, roomsToGuests(meta.rooms))} Guests • ${roomsLabel(meta.rooms)}</p>
                        <div class="guest-exclusive-card-perks flex flex-wrap gap-2 mb-4">
                            ${promoPerks.map(perk => `
                                <span class="${perk.cls} text-xs font-bold px-2.5 py-1 rounded"><i class="fa-solid ${perk.icon} mr-1"></i> ${perk.text}</span>
                            `).join('')}
                        </div>
                        <div class="guest-exclusive-card-meta mb-5 mt-auto">
                            <div class="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-1">
                                <span>Repeated Booking Rate</span>
                                <span class="${meta.bookedPct > 85 ? 'text-amada-red' : 'text-yellow-600'}">${meta.bookedPct}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div class="${meta.bookedPct > 85 ? 'shimmer-bg animate-shimmer' : 'bg-yellow-500'} h-1.5 rounded-full" style="width: ${meta.bookedPct}%"></div>
                            </div>
                        </div>
                        <div class="guest-exclusive-card-footer flex justify-between items-end border-t border-gray-100 pt-5">
                            <div>
                                <p class="text-gray-400 text-xs line-through font-bold">${this.formatCurrency(Math.round((Number(prop.price) || 0) * 1.25))}</p>
                                <p class="text-2xl font-black text-amada-red">${this.formatCurrency(prop.price)} <span class="text-sm font-medium text-gray-500">/night</span></p>
                            </div>
                            <button class="bg-amada-dark text-white font-bold py-2.5 px-6 rounded-lg hover:bg-amada-gold transition shadow-md">Reserve</button>
                        </div>
                    </div>
                    <div class="${meta.bookedPct > 85 ? 'bg-red-50 text-amada-red border-red-100' : 'bg-gray-50 text-gray-600 border-gray-200'} text-xs text-center py-2.5 font-bold border-t uppercase tracking-wide">
                        <i class="fa-solid ${meta.bookedPct > 85 ? 'fa-eye animate-pulse' : 'fa-clock'} mr-1"></i> ${meta.bookedPct > 85 ? `${meta.viewers} people are viewing this right now` : 'Frequently booked'}
                    </div>
                `;
                container.appendChild(card);
            });

            function roomsLabel(rooms) {
                if (rooms === 0) return 'Studio';
                return `${rooms} Bedroom${rooms > 1 ? 's' : ''}`;
            }

            function roomsToGuests(rooms) {
                if (rooms === 0) return 2;
                return rooms * 2;
            }
        }

        initExclusiveMap(data = this.getFilteredGuestProperties()) {
            const elementId = 'guestExclusiveMapArea';
            const area = document.getElementById(elementId);
            if (!area || typeof L === 'undefined') return;

            if (!this.exclusiveGuestMapInstance) {
                this.exclusiveGuestMapInstance = L.map(elementId, { zoomControl: true }).setView([9.0765, 7.3986], 12);
                this.addBaseTileLayer(this.exclusiveGuestMapInstance);
            }

            if (this.exclusiveGuestMapMarkers) {
                this.exclusiveGuestMapMarkers.forEach(marker => marker.remove());
            }
            this.exclusiveGuestMapMarkers = [];

            const locationCounts = new Map();
            const validCoords = data.filter(prop => prop.coords && !isNaN(parseFloat(prop.coords.lat)) && !isNaN(parseFloat(prop.coords.lng)));
            validCoords.forEach(prop => {
                const baseLat = parseFloat(prop.coords.lat);
                const baseLng = parseFloat(prop.coords.lng);
                const coordKey = `${baseLat.toFixed(5)}:${baseLng.toFixed(5)}`;
                const overlapIndex = locationCounts.get(coordKey) || 0;
                locationCounts.set(coordKey, overlapIndex + 1);
                const angle = overlapIndex * 0.95;
                const offset = overlapIndex * 0.00045;
                const lat = baseLat + (overlapIndex ? Math.sin(angle) * offset : 0);
                const lng = baseLng + (overlapIndex ? Math.cos(angle) * offset : 0);
                const marker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'guest-map-price-marker-wrap',
                        html: `<div class="guest-map-price-marker">${this.formatCurrency(prop.price)}</div>`,
                        iconSize: [96, 34],
                        iconAnchor: [48, 17],
                        popupAnchor: [0, -12]
                    })
                }).addTo(this.exclusiveGuestMapInstance);
                marker.bindPopup(`
                    <div style="min-width:180px;">
                        <strong style="display:block; margin-bottom:6px; font-size:1rem;">${prop.name}</strong>
                        <div style="color:#D32F2F; font-weight:700; margin-bottom:10px;">${this.formatCurrency(prop.price)} / night</div>
                        <div style="font-size:0.85rem; color:#6b7280; margin-bottom:12px;">${prop.loc}</div>
                        <button class="btn-primary" style="width:100%; justify-content:center; padding:10px 14px;" onclick="window.app.openExclusivePropertyDetails('${prop.id}')">View & Reserve</button>
                    </div>
                `);
                this.exclusiveGuestMapMarkers.push(marker);
            });

            if (validCoords.length) {
                const bounds = L.latLngBounds(validCoords.map(prop => [parseFloat(prop.coords.lat), parseFloat(prop.coords.lng)]));
                this.exclusiveGuestMapInstance.fitBounds(bounds.pad(0.18));
            } else {
                this.exclusiveGuestMapInstance.setView([9.0765, 7.3986], 12);
            }

            setTimeout(() => this.exclusiveGuestMapInstance.invalidateSize(), 120);
        }

        openExclusivePropertyDetails(id) {
            const prop = this.inventory.find(item => item.id === id);
            if (!prop) return;

            this.exclusiveSelectedPropertyId = prop.id;
            document.getElementById('pdName').innerText = prop.name;
            document.getElementById('pdLoc').innerText = prop.loc;
            document.getElementById('pdType').innerText = this.getExclusivePropertyTypeLabel(prop);
            document.getElementById('pdPrice').innerText = this.formatCurrency(prop.price);

            let images = Array.isArray(prop.images) ? prop.images.filter(Boolean) : [];
            if (!images.length) images = ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];
            const slidesHtml = images.map(img => `<div class="carousel-slide" style="background-image:url('${img}')"></div>`).join('');
            document.getElementById('pdCarousel').innerHTML = `
                ${images.length > 1 ? `<button class="carousel-btn prev" style="left:20px; width:40px; height:40px;" onclick="app.slideCarousel(event, -1)"><i class="fa-solid fa-chevron-left"></i></button>` : ''}
                <div class="carousel-track">${slidesHtml}</div>
                ${images.length > 1 ? `<button class="carousel-btn next" style="right:20px; width:40px; height:40px;" onclick="app.slideCarousel(event, 1)"><i class="fa-solid fa-chevron-right"></i></button>` : ''}
            `;

            const amenities = this.normalizeAmenities(prop.amenities);
            document.getElementById('pdAmenities').innerHTML = amenities.map(item =>
                `<div class="amenity-tag"><i class="fa-solid ${item.icon || 'fa-check'}" style="color:var(--primary)"></i> ${item.text || ''}</div>`
            ).join('');
            const promoPerks = this.getExclusiveMarketingPerks();
            const perksEl = document.getElementById('pdPerks');
            if (perksEl) {
                perksEl.innerHTML = promoPerks.map(item =>
                    `<div class="amenity-tag"><i class="fa-solid ${item.icon}" style="color:var(--primary)"></i> ${item.text}</div>`
                ).join('');
            }

            const narrative = document.getElementById('pdDescription');
            if (narrative) {
                narrative.innerText = this.getExclusivePropertyDescription(prop);
            }

            const bookBtn = document.getElementById('pdBookBtn');
            if (bookBtn) {
                bookBtn.disabled = false;
                bookBtn.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Book This Stay';
                bookBtn.onclick = () => {
                    const detailsModal = document.getElementById('propDetailsModal');
                    if (detailsModal) {
                        detailsModal.classList.remove('show');
                        setTimeout(() => {
                            detailsModal.style.display = 'none';
                            this.openExclusiveBookingModal(prop.name, this.formatCurrency(prop.price));
                        }, 300);
                    } else {
                        this.openExclusiveBookingModal(prop.name, this.formatCurrency(prop.price));
                    }
                };
            }

            document.getElementById('propDetailsModal').style.display = 'flex';
            setTimeout(() => {
                document.getElementById('propDetailsModal').classList.add('show');
                this.initDetailsMap(prop.coords || { lat: 9.0765, lng: 7.3986 }, prop.name);
            }, 300);
        }

        getExclusivePropertyTypeLabel(prop) {
            const rooms = this.getPropertyRoomCount(prop);
            if (rooms === 0) return 'Studio';
            return `${rooms} Bed`;
        }

        getExclusivePropertyDescription(prop) {
            if (prop.description) return prop.description;
            const rooms = this.getPropertyRoomCount(prop);
            const guestCount = rooms === 0 ? 2 : rooms * 2;
            return `${prop.name} delivers a refined private-stay experience in ${prop.loc}, built for ${guestCount} guest${guestCount > 1 ? 's' : ''}. Expect curated comfort, strong privacy, premium finishes, and the kind of atmosphere that makes short stays feel indulgent.`;
        }

        updateExclusiveHeroText(index) {
            const data = this.exclusiveHeroSlides[index];
            const container = document.getElementById('guestExclusiveHeroTextContainer');
            if (!container || !data) return;
            container.innerHTML = `
                <h2 class="font-serif text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-4 drop-shadow-sm animate-slide-in">
                    ${data.title.replace('Absolute Best', '<span class="text-amada-red">Absolute Best</span>')}
                </h2>
                <p class="text-lg md:text-2xl text-gray-700 mb-8 font-medium animate-slide-in" style="animation-delay: 0.1s; animation-fill-mode: both;">
                    ${data.subtitle}
                </p>
                <div class="bg-white/90 backdrop-blur border-l-4 border-amada-gold p-4 rounded-r-xl shadow-lg inline-block animate-slide-in" style="animation-delay: 0.2s; animation-fill-mode: both;">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">${data.perkTitle}</p>
                    <p class="text-2xl md:text-3xl font-black text-amada-gold flex items-center gap-3">
                        <i class="fa-solid ${data.perkIcon}"></i> ${data.perkHighlight}
                    </p>
                </div>
            `;
        }

        restartExclusiveHeroSlider() {
            if (this.exclusiveHeroInterval) clearInterval(this.exclusiveHeroInterval);
            this.exclusiveHeroInterval = setInterval(() => {
                const slides = document.querySelectorAll('#guestExclusivePage .slide');
                if (!slides.length) return;
                slides[this.exclusiveCurrentSlide]?.classList.remove('active');
                this.exclusiveCurrentSlide = (this.exclusiveCurrentSlide + 1) % slides.length;
                slides[this.exclusiveCurrentSlide]?.classList.add('active');
                this.updateExclusiveHeroText(this.exclusiveCurrentSlide);
            }, 6000);
        }

        getExclusiveExpiredOfferMessage() {
            const missedOffer = this.exclusiveDiscountPhase === 1 ? '50% OFF' : '15% OFF';
            return `You just missed a <span class="text-red-200">${missedOffer}</span> opportunity... Standard rates apply.`;
        }

        updateExclusiveMissedOfferNotice(show = false) {
            const notice = document.getElementById('guestExclusiveMissedOfferNotice');
            if (!notice) return;
            if (!show) {
                notice.classList.add('hidden');
                notice.innerHTML = '';
                return;
            }
            notice.innerHTML = this.getExclusiveExpiredOfferMessage();
            notice.classList.remove('hidden');
        }

        restartExclusiveMasterTimer() {
            const discountEl = document.getElementById('guestExclusiveCountdownTimer');
            const heroVipEl = document.getElementById('guestExclusiveHeroVipTimer');
            const bannerText = document.getElementById('guestExclusiveBannerText');
            const banner = document.getElementById('guestExclusiveTopBanner');
            if (!discountEl || !heroVipEl || !bannerText || !banner) return;

            this.ensureExclusiveTimerState();
            discountEl.style.display = '';
            discountEl.classList.remove('text-gray-900');
            discountEl.classList.add('text-amada-red');
            banner.classList.add('urgency-banner-red', 'border-red-900');
            banner.classList.remove('bg-gray-900', 'bg-black');
            if (this.exclusiveDiscountPhase === 1) {
                bannerText.innerHTML = 'FLASH SALE: Claim 50% OFF your stay. Price jumps in:';
                discountEl.style.display = '';
                discountEl.classList.remove('text-gray-900');
                discountEl.classList.add('text-amada-red');
                banner.classList.add('urgency-banner-red', 'border-red-900');
                banner.classList.remove('bg-gray-900', 'bg-black');
                discountEl.innerText = this.formatExclusiveTime(this.exclusiveDiscountTimeLeft, true);
                this.updateExclusiveMissedOfferNotice(false);
            } else if (this.exclusiveDiscountPhase === 2) {
                bannerText.innerHTML = "CHALLENGE FAILED. <span class='text-red-200'>New Offer:</span> Claim 15% OFF in:";
                discountEl.style.display = '';
                banner.classList.remove('urgency-banner-red', 'border-red-900');
                banner.classList.add('bg-gray-900');
                discountEl.classList.remove('text-amada-red');
                discountEl.classList.add('text-gray-900');
                discountEl.innerText = this.formatExclusiveTime(this.exclusiveDiscountTimeLeft, true);
                this.updateExclusiveMissedOfferNotice(false);
            } else {
                bannerText.innerHTML = this.getExclusiveExpiredOfferMessage();
                discountEl.style.display = 'none';
                banner.classList.remove('urgency-banner-red', 'border-red-900', 'bg-gray-900');
                banner.classList.add('bg-black');
                this.updateExclusiveMissedOfferNotice(true);
            }
            heroVipEl.innerText = this.formatExclusiveTime(this.exclusiveHeroVipTimeLeft);
            if (this.exclusiveHeroVipTimeLeft > 0) {
                heroVipEl.classList.remove('text-gray-400');
                heroVipEl.classList.add('text-amada-red');
                heroVipEl.parentElement?.parentElement?.classList.remove('opacity-50');
            } else {
                heroVipEl.classList.remove('text-amada-red');
                heroVipEl.classList.add('text-gray-400');
                heroVipEl.parentElement?.parentElement?.classList.add('opacity-50');
            }
            this.updateExclusivePerkHighlights();
            this.updateExclusiveDynamicTexts();
            this.prepareExclusiveSpinPrizes();
            this.saveExclusiveTimerState();

            if (this.exclusiveMasterTimerInterval) clearInterval(this.exclusiveMasterTimerInterval);
            this.exclusiveMasterTimerInterval = setInterval(() => {
                if (this.exclusiveDiscountTimeLeft > 0) {
                    this.exclusiveDiscountTimeLeft--;
                } else if (this.exclusiveDiscountPhase === 1) {
                    this.exclusiveDiscountPhase = 2;
                    this.exclusiveDiscountTimeLeft = Math.max(0, this.exclusivePerkDurations[0] ?? this.getExclusivePhaseTwoDiscountSeconds());
                    bannerText.innerHTML = "CHALLENGE FAILED. <span class='text-red-200'>New Offer:</span> Claim 15% OFF in:";
                    banner.classList.remove('urgency-banner-red', 'border-red-900');
                    banner.classList.add('bg-gray-900');
                    discountEl.classList.remove('text-amada-red');
                    discountEl.classList.add('text-gray-900');
                    this.updateExclusiveMissedOfferNotice(false);
                } else {
                    bannerText.innerHTML = this.getExclusiveExpiredOfferMessage();
                    discountEl.style.display = 'none';
                    banner.classList.remove('bg-gray-900');
                    banner.classList.add('bg-black');
                    this.updateExclusiveMissedOfferNotice(true);
                }

                if (discountEl.style.display !== 'none') {
                    discountEl.innerText = this.formatExclusiveTime(this.exclusiveDiscountTimeLeft, true);
                }

                if (this.exclusiveHeroVipTimeLeft > 0) {
                    this.exclusiveHeroVipTimeLeft--;
                    heroVipEl.innerText = this.formatExclusiveTime(this.exclusiveHeroVipTimeLeft);
                } else {
                    heroVipEl.innerText = '00:00';
                    heroVipEl.classList.remove('text-amada-red');
                    heroVipEl.classList.add('text-gray-400');
                    heroVipEl.parentElement?.parentElement?.classList.add('opacity-50');
                }

                const bookingOpen = document.getElementById('guestExclusiveBookingModal')?.classList.contains('show');
                const perkStep = bookingOpen ? 2 : 1;
                let anyUpdate = false;
                for (let step = 0; step < perkStep; step++) {
                    anyUpdate = this.advanceExclusivePerkTimers() || anyUpdate;
                }
                this.renderExclusiveBookingPerks();

                if (anyUpdate) {
                    this.updateExclusivePerkHighlights();
                    this.updateExclusiveDynamicTexts();
                }

                const modalCountdown = document.getElementById('guestExclusiveModalCountdown');
                const maxTimeLeft = Math.max(...this.exclusivePerkDurations);
                if (modalCountdown) {
                    modalCountdown.innerText = maxTimeLeft > 0 ? this.formatExclusiveTime(maxTimeLeft) : 'EXPIRED';
                }

                this.saveExclusiveTimerState();
            }, 1000);
        }

        crossOutExclusivePerk(index) {
            const perkEl = document.getElementById(`guestExclusivePerk${index + 1}`);
            const timerEl = document.getElementById(`guestExclusiveTimer${index + 1}`);
            if (!perkEl || !timerEl) return;

            perkEl.className = 'flex justify-between items-center bg-red-50 border border-red-100 p-2 rounded-xl transition-all duration-300 opacity-50 scale-[0.98]';
            const titleEl = perkEl.querySelector('span:first-child');
            if (titleEl) {
                titleEl.className = 'text-[11px] font-bold text-red-800 flex items-center gap-2 line-through decoration-red-500 decoration-2';
                const icon = titleEl.querySelector('i');
                if (icon) {
                    icon.classList.remove('text-green-600');
                    icon.classList.add('text-red-500');
                }
            }
            timerEl.className = 'font-mono text-[11px] font-black text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200 shadow-sm';
            timerEl.innerText = 'LOST';
        }

        advanceExclusivePerkTimers() {
            let anyUpdate = false;
            for (let i = 0; i < this.exclusivePerkDurations.length; i++) {
                if (this.exclusivePerkDurations[i] > 0) {
                    this.exclusivePerkDurations[i]--;
                    const timerEl = document.getElementById(`guestExclusiveTimer${i + 1}`);
                    if (timerEl) timerEl.innerText = this.formatExclusiveTime(this.exclusivePerkDurations[i]);
                } else if (!this.exclusivePerkLost[i]) {
                    this.exclusivePerkLost[i] = true;
                    this.crossOutExclusivePerk(i);
                    anyUpdate = true;
                }
            }
            return anyUpdate;
        }

        updateExclusivePerkHighlights() {
            let activeFound = false;
            for (let i = 0; i < this.exclusivePerkLost.length; i++) {
                const perkEl = document.getElementById(`guestExclusivePerk${i + 1}`);
                if (!perkEl) continue;
                if (this.exclusivePerkLost[i]) {
                    this.crossOutExclusivePerk(i);
                    continue;
                }
                perkEl.classList.remove('border-green-500', 'shadow-[0_0_12px_rgba(34,197,94,0.4)]', 'scale-[1.02]', 'border-green-100', 'scale-100');
                if (!activeFound) {
                    perkEl.classList.add('border-green-500', 'shadow-[0_0_12px_rgba(34,197,94,0.4)]', 'scale-[1.02]');
                    activeFound = true;
                } else {
                    perkEl.classList.add('border-green-100', 'scale-100');
                }
            }
            const giftIcon = document.getElementById('guestExclusiveGiftIconAnim');
            if (giftIcon) {
                giftIcon.classList.toggle('animate-pulse', activeFound);
            }
        }

        updateExclusiveDynamicTexts() {
            const survivingCount = this.exclusivePerkLost.filter(lost => !lost).length;
            const label = document.getElementById('guestExclusivePerkBoxLabel');
            const notice = document.getElementById('guestExclusiveFlightRiskText');
            const checkbox = document.getElementById('guestExclusivePerkBox');

            if (survivingCount > 0) {
                if (label) label.innerText = `Yes, apply my ${survivingCount} remaining VIP perk${survivingCount > 1 ? 's' : ''} to this booking.`;
                if (notice) notice.innerHTML = `<strong class="font-black text-amada-red">High Flight Risk!</strong> Another guest is viewing these dates. Complete your booking now to secure your stay and your <strong class="underline decoration-2">remaining ${survivingCount} perk${survivingCount > 1 ? 's' : ''}.</strong>`;
            } else {
                if (label) label.innerText = 'I understand all VIP perks have expired.';
                if (checkbox) checkbox.checked = false;
                if (notice) notice.innerHTML = '<strong class="font-black text-amada-red">All Perks Expired.</strong> Secure your dates before standard pricing increases.';
            }
            this.renderExclusiveBookingPerks();
        }

        renderExclusiveBookingPerks() {
            const container = document.getElementById('guestExclusiveBookingPerksList');
            if (!container) return;

            const livePerks = this.exclusivePerkPrizeDefinitions
                .map((perk, index) => ({ perk, index, lost: this.exclusivePerkLost[index], timeLeft: this.exclusivePerkDurations[index] }))
                .filter(item => !item.lost);

            if (!livePerks.length) {
                container.innerHTML = `<div class="md:col-span-2 text-sm font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">All timed perks have expired for this booking window.</div>`;
                return;
            }

            container.innerHTML = livePerks.map(item => `
                <div class="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                    <span class="text-[12px] font-black text-amber-900 uppercase tracking-wide">${item.perk.text}</span>
                    <span class="font-mono text-[12px] font-black text-amada-red bg-white px-2.5 py-1 rounded-lg border border-amber-100">${this.formatExclusiveTime(item.timeLeft)}</span>
                </div>
            `).join('');
        }

        prepareExclusiveSpinPrizes() {
            const vipActive = this.exclusivePerkPrizeDefinitions
                .filter((_, index) => !this.exclusivePerkLost[index])
                .map(item => ({ ...item }));
            const basicActive = this.exclusiveBasicPerkPrizeDefinitions.map(item => ({ ...item }));
            const active = [...vipActive, ...basicActive];

            this.exclusiveActiveSpinPrizes = active;

            const pool = [];
            if (active.length) {
                active.forEach((item, index) => {
                    pool.push(item);
                    const losing = this.exclusiveLosingSpinPrizes[index % this.exclusiveLosingSpinPrizes.length];
                    pool.push({ ...losing });
                });
                while (pool.length < 12) {
                    const losing = this.exclusiveLosingSpinPrizes[pool.length % this.exclusiveLosingSpinPrizes.length];
                    pool.push({ ...losing });
                }
            } else {
                while (pool.length < 8) {
                    const losing = this.exclusiveLosingSpinPrizes[pool.length % this.exclusiveLosingSpinPrizes.length];
                    pool.push({ ...losing });
                }
            }

            this.exclusiveSpinPrizePool = pool;
            this.renderExclusiveEligiblePerks();
        }

        renderExclusiveEligiblePerks() {
            const container = document.getElementById('guestExclusiveEligiblePerksList');
            if (!container) return;
            if (!this.exclusiveActiveSpinPrizes.length) {
                container.innerHTML = `<span class="text-xs font-bold text-gray-500">No live perks survived. This spin is currently a recovery chance only.</span>`;
                return;
            }
            container.innerHTML = this.exclusiveActiveSpinPrizes.map(item => `
                <span class="bg-yellow-50 text-amada-dark text-[11px] font-black px-2.5 py-1.5 rounded-full border border-yellow-200 uppercase tracking-wide">${item.text}</span>
            `).join('');
        }

        restartExclusiveSocialProof() {
            if (this.exclusiveSocialProofInterval) clearInterval(this.exclusiveSocialProofInterval);
            this.createExclusiveToast();
            this.exclusiveSocialProofInterval = setInterval(() => this.createExclusiveToast(), 10000);
        }

        createExclusiveToast() {
            const container = document.getElementById('guestExclusiveToastContainer');
            if (!container) return;
            const name = this.exclusiveToastNames[Math.floor(Math.random() * this.exclusiveToastNames.length)];
            const loc = this.exclusiveToastLocations[Math.floor(Math.random() * this.exclusiveToastLocations.length)];
            const action = this.exclusiveToastActions[Math.floor(Math.random() * this.exclusiveToastActions.length)];
            const toast = document.createElement('div');
            toast.className = 'bg-white border border-gray-200 rounded-xl p-4 shadow-xl flex items-center gap-4 animate-slide-in max-w-sm';
            toast.innerHTML = `
                <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-amada-red font-bold flex-shrink-0 border border-red-100">
                    <i class="fa-solid fa-bell text-xl animate-pulse"></i>
                </div>
                <div>
                    <p class="text-sm text-gray-900 font-bold">${name} from ${loc}</p>
                    <p class="text-xs font-black text-amada-red">${action}</p>
                    <p class="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Just now</p>
                </div>
            `;
            container.appendChild(toast);
            setTimeout(() => {
                toast.classList.remove('animate-slide-in');
                toast.classList.add('animate-slide-out');
                setTimeout(() => toast.remove(), 500);
            }, 5000);
        }

        restartExclusiveWinnersTicker() {
            if (this.exclusiveLiveWinnersInterval) clearInterval(this.exclusiveLiveWinnersInterval);
            const list = document.getElementById('guestExclusiveLiveWinnersList');
            if (!list) return;
            this.exclusiveLiveWinnersInterval = setInterval(() => {
                const first = list.firstElementChild;
                if (!first) return;
                list.style.transition = 'transform 0.5s ease';
                list.style.transform = 'translateY(-36px)';
                setTimeout(() => {
                    list.style.transition = 'none';
                    list.appendChild(first);
                    list.style.transform = 'translateY(0)';
                }, 500);
            }, 3500);
        }

        ensureExclusiveExitIntent() {
            if (this.exclusiveGuestInitialized) return;
            document.addEventListener('mouseout', (e) => {
                if (e.clientY >= 20 || this.exclusiveHasTriggeredExit || this.exclusiveBookingConfirmed) return;
                const booking = document.getElementById('guestExclusiveBookingModal');
                const spin = document.getElementById('guestExclusiveSpinModal');
                const prize = document.getElementById('guestExclusivePrizeModal');
                if (booking?.classList.contains('show') || spin?.classList.contains('show') || prize?.classList.contains('show')) return;
                if (document.getElementById('guestView')?.style.display !== 'block') return;
                this.exclusiveHasTriggeredExit = true;
                document.getElementById('guestExclusiveExitModal')?.classList.add('show');
            });
            ['guestExclusiveBookingModal', 'guestExclusiveSpinModal', 'guestExclusivePrizeModal', 'guestExclusiveExitModal', 'propDetailsModal'].forEach(id => {
                const modal = document.getElementById(id);
                if (!modal) return;
                modal.addEventListener('mousedown', (event) => {
                    if (event.target !== modal) return;
                    if (id === 'guestExclusiveBookingModal') this.closeExclusiveBookingModal();
                    else if (id === 'guestExclusiveSpinModal') this.closeExclusiveSpinModal();
                    else if (id === 'guestExclusivePrizeModal') this.closeExclusivePrizeModal();
                    else if (id === 'guestExclusiveExitModal') this.closeExclusiveExitModal();
                    else this.closeModal();
                });
            });
            window.addEventListener('resize', () => this.resizeExclusiveCanvas());
            this.exclusiveGuestInitialized = true;
        }

        claimExclusiveExitOffer() {
            this.closeExclusiveExitModal();
            const widget = document.getElementById('guestExclusiveSearchWidget');
            if (!widget) return;
            widget.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                widget.style.transform = 'scale(1.03)';
                widget.style.boxShadow = '0 0 50px rgba(211,47,47,0.4)';
                widget.style.borderColor = '#D32F2F';
                setTimeout(() => {
                    widget.style.transform = 'scale(1)';
                    widget.style.boxShadow = '';
                    widget.style.borderColor = 'white';
                }, 1000);
            }, 600);
        }

        closeExclusiveExitModal() {
            document.getElementById('guestExclusiveExitModal')?.classList.remove('show');
        }

        openExclusiveBookingModal(title, price) {
            const selected = this.exclusiveSelectedPropertyId
                ? this.inventory.find(item => item.id === this.exclusiveSelectedPropertyId)
                : this.inventory.find(item => item.name === title);
            if (selected) this.exclusiveSelectedPropertyId = selected.id;
            document.getElementById('guestExclusiveBookingTitle').innerText = title;
            document.getElementById('guestExclusiveBookingPrice').innerText = `${price} / night`;
            document.getElementById('guestExclusiveBookingInfoTitle').innerText = title;
            document.getElementById('guestExclusiveBookingInfoPrice').innerText = `${price} / night`;
            const todayIso = this.getTodayIsoDate();
            const tomorrow = new Date(todayIso);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const checkIn = document.getElementById('guestExclusiveCheckInDate');
            const checkOut = document.getElementById('guestExclusiveCheckOutDate');
            if (checkIn && checkOut) {
                checkIn.min = todayIso;
                checkOut.min = todayIso;
                checkIn.value = todayIso;
                checkOut.value = tomorrow.toISOString().split('T')[0];
            }
            const clearValue = id => {
                const field = document.getElementById(id);
                if (field) field.value = '';
            };
            clearValue('guestExclusiveName');
            clearValue('guestExclusivePhone');
            clearValue('guestExclusiveEmail');
            this.setCurrencyInputValue('guestExclusiveCautionFeePaid', 0);
            this.exclusivePendingTransactionId = null;
            document.getElementById('guestExclusiveBookingModal')?.classList.add('show');
            document.getElementById('guestExclusiveBookingPerksDock')?.classList.remove('hidden');
            this.startExclusiveModalTimer();
            this.renderExclusiveBookingPerks();
            this.calcExclusiveTotal();
        }

        closeExclusiveBookingModal() {
            document.getElementById('guestExclusiveBookingModal')?.classList.remove('show');
            document.getElementById('guestExclusiveBookingPerksDock')?.classList.add('hidden');
            this.stopExclusiveModalTimer();
        }

        startExclusiveModalTimer() {
            const countdown = document.getElementById('guestExclusiveModalCountdown');
            const modalBox = document.getElementById('guestExclusiveModalBox');
            if (!countdown || !modalBox) return;
            this.exclusiveModalTimeLeft = Math.max(...this.exclusivePerkDurations);
            countdown.innerText = this.exclusiveModalTimeLeft > 0 ? this.formatExclusiveTime(this.exclusiveModalTimeLeft) : 'EXPIRED';
            countdown.classList.remove('text-amada-red');
            countdown.classList.add('text-amada-gold');
            modalBox.classList.remove('border-red-500', 'shadow-[0_0_50px_rgba(211,47,47,0.5)]');
            this.updateExclusiveDynamicTexts();
            if (this.exclusiveModalTimerInterval) clearInterval(this.exclusiveModalTimerInterval);
            this.exclusiveModalTimerInterval = setInterval(() => {
                this.exclusiveModalTimeLeft = Math.max(...this.exclusivePerkDurations);
                if (this.exclusiveModalTimeLeft <= 0) {
                    this.stopExclusiveModalTimer();
                    countdown.innerText = 'EXPIRED';
                    return;
                }
                countdown.innerText = this.formatExclusiveTime(this.exclusiveModalTimeLeft);
                if (this.exclusiveModalTimeLeft <= 60) {
                    modalBox.classList.add('border-red-500', 'shadow-[0_0_50px_rgba(211,47,47,0.5)]');
                    countdown.classList.remove('text-amada-gold');
                    countdown.classList.add('text-amada-red');
                }
            }, 1000);
        }

        stopExclusiveModalTimer() {
            if (this.exclusiveModalTimerInterval) clearInterval(this.exclusiveModalTimerInterval);
            this.exclusiveModalTimerInterval = null;
        }

        calcExclusiveTotal() {
            const checkInEl = document.getElementById('guestExclusiveCheckInDate');
            const checkOutEl = document.getElementById('guestExclusiveCheckOutDate');
            const totalEl = document.getElementById('guestExclusiveModalTotal');
            const nightsEl = document.getElementById('guestExclusiveNightCount');
            const breakdownEl = document.getElementById('guestExclusiveChargeBreakdown');
            if (!checkInEl || !checkOutEl || !totalEl || !nightsEl || !breakdownEl) return;

            const todayIso = this.getTodayIsoDate();
            if (checkInEl.value && checkInEl.value < todayIso) checkInEl.value = todayIso;

            let checkInDate = new Date(checkInEl.value);
            let checkOutDate = new Date(checkOutEl.value);
            if (isNaN(checkInDate)) checkInDate = new Date(todayIso);
            if (isNaN(checkOutDate) || checkOutDate <= checkInDate) {
                checkOutDate = new Date(checkInDate);
                checkOutDate.setDate(checkOutDate.getDate() + 1);
                checkOutEl.value = checkOutDate.toISOString().split('T')[0];
            }

            const minOut = new Date(checkInDate);
            minOut.setDate(minOut.getDate() + 1);
            checkOutEl.min = minOut.toISOString().split('T')[0];

            const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / 86400000));
            nightsEl.innerText = nights;

            const property = this.inventory.find(item => item.id === this.exclusiveSelectedPropertyId);
            const cautionFee = this.parseCurrencyValue(document.getElementById('guestExclusiveCautionFeePaid')?.value) || 0;
            const stayTotal = (property ? property.price : 0) * nights;
            const total = stayTotal + cautionFee;
            totalEl.innerText = this.formatCurrency(total);
            breakdownEl.innerText = cautionFee > 0
                ? `Stay ${this.formatCurrency(stayTotal)} + caution ${this.formatCurrency(cautionFee)}`
                : `Stay ${this.formatCurrency(stayTotal)}`;
            this.setCurrencyInputValue('guestExclusiveActualPaid', total);
        }

        async handleExclusiveCheckout() {
            const property = this.inventory.find(item => item.id === this.exclusiveSelectedPropertyId);
            const phone = document.getElementById('guestExclusivePhone')?.value.trim();
            const name = document.getElementById('guestExclusiveName')?.value.trim();
            const email = document.getElementById('guestExclusiveEmail')?.value.trim();
            const checkIn = document.getElementById('guestExclusiveCheckInDate')?.value;
            const checkOut = document.getElementById('guestExclusiveCheckOutDate')?.value;
            const paid = this.parseCurrencyValue(document.getElementById('guestExclusiveActualPaid')?.value);
            const cautionFee = this.parseCurrencyValue(document.getElementById('guestExclusiveCautionFeePaid')?.value) || 0;
            if (!property || !name || !phone || !/^\d{10,11}$/.test(phone)) {
                this.showNotification('Complete your name and a valid phone number to secure the stay.', 'error');
                return;
            }
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                this.showNotification('Enter a valid email address or leave it blank.', 'error');
                return;
            }
            if (!checkIn || !checkOut) {
                this.showNotification('Select valid check-in and check-out dates.', 'error');
                return;
            }
            if (isNaN(paid)) {
                this.showNotification('Enter the amount paid to proceed.', 'error');
                return;
            }

            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / 86400000));
            const estimatedTotal = (Number(property.price) || 0) * nights + cautionFee;
            const button = document.querySelector('#guestExclusiveCheckoutForm button[type="submit"]');
            const originalText = button?.innerHTML;
            if (button) {
                button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing Secure Payment...';
                button.disabled = true;
            }

            const doorCode = await this.generateLockCode();
            const previousStatus = property.status;
            const previousGuestName = property.guestName;
            const previousAccessCode = property.accessCode;
            property.status = 'occupied';
            property.guestName = name;
            property.accessCode = doorCode;
            const transaction = {
                id: `tx_${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                propId: property.id,
                amount: paid,
                estimatedTotal,
                cautionFee,
                guest: name,
                phone,
                email,
                accessCode: doorCode,
                checkIn,
                checkOut,
                propertyName: property.name,
                propertyLocation: property.loc,
                createdAt: new Date().toISOString()
            };
            const cloudSaved = await this.saveGuestBookingToCloud(transaction).catch(() => false);
            if (!cloudSaved) {
                property.status = previousStatus;
                property.guestName = previousGuestName;
                property.accessCode = previousAccessCode;
                if (button) {
                    button.innerHTML = originalText || 'Proceed To Secure Payment';
                    button.disabled = false;
                }
                this.showNotification('Booking could not be confirmed right now. Please try again.', 'error');
                return;
            }

            this.transactions = [transaction, ...this.transactions.filter(item => item.id !== transaction.id)];
            this.updateRaffleGuestCountFromBookings();
            this.exclusivePendingTransactionId = transaction.id;
            this.exclusiveBookingConfirmed = true;
            this.saveExclusiveTimerState();
            this.saveLocalData();
            this.prepareExclusiveSpinPrizes();
            this.closeExclusiveBookingModal();
            if (button) {
                button.innerHTML = originalText || 'Proceed To Secure Payment';
                button.disabled = false;
            }
            setTimeout(() => this.openExclusiveSpinModal(), 400);
        }

        openExclusiveSpinModal() {
            document.getElementById('guestExclusiveSpinModal')?.classList.add('show');
            this.renderExclusiveEligiblePerks();
            this.resizeExclusiveCanvas();
            const survivingCount = this.exclusivePerkLost.filter(lost => !lost).length;
            const postText = document.getElementById('guestExclusivePostBookingText');
            if (postText) {
                let survivorText = '';
                if (survivingCount === 7) survivorText = 'Incredible! You secured ALL 7 VIP Perks.';
                else if (survivingCount > 0) survivorText = `You successfully locked in ${survivingCount} VIP perk${survivingCount > 1 ? 's' : ''}.`;
                else survivorText = 'Even though your VIP perks expired, you still snagged a luxury stay!';
                postText.innerHTML = `${survivorText} Now, take your <strong class="text-amada-red font-black">Free Spin</strong> to win a Cash Refund, Free Night, or Dinner.`;
            }
        }

        closeExclusiveSpinModal(force = false) {
            if (this.exclusiveIsSpinning && !force) return;
            document.getElementById('guestExclusiveSpinModal')?.classList.remove('show');
        }

        ensureExclusiveSpinBindings() {
            const button = document.getElementById('guestExclusiveSpinButton');
            if (!button || button.dataset.bound === 'true') return;
            button.addEventListener('click', () => this.spinExclusiveWheel());
            button.dataset.bound = 'true';
        }

        resizeExclusiveCanvas() {
            const container = document.querySelector('#guestExclusiveSpinModal .wheel-container');
            const canvas = document.getElementById('guestExclusiveSpinWheelCanvas');
            if (!container || !canvas) return;
            const size = Math.min(container.offsetWidth || 320, container.offsetHeight || 320, 320);
            canvas.width = size;
            canvas.height = size;
            this.drawExclusiveWheel();
        }

        drawExclusiveWheel() {
            const canvas = document.getElementById('guestExclusiveSpinWheelCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const prizes = this.exclusiveSpinPrizePool.length ? this.exclusiveSpinPrizePool : this.exclusiveLosingSpinPrizes;
            const numSegments = prizes.length;
            const segmentAngle = (2 * Math.PI) / numSegments;
            const radius = canvas.width / 2;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(radius, radius);
            ctx.rotate(this.exclusiveSpinState.angle);

            for (let i = 0; i < numSegments; i++) {
                const prize = prizes[i];
                const start = -segmentAngle / 2;
                const end = segmentAngle / 2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, radius, start, end, false);
                ctx.closePath();
                const gradient = ctx.createLinearGradient(0, -radius, 0, radius);
                gradient.addColorStop(0, prize.colors.start);
                gradient.addColorStop(1, prize.colors.end);
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.save();
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = prize.textColor || '#FFFFFF';
                ctx.font = `800 ${Math.max(10, Math.min(13, radius / 12))}px Poppins`;
                ctx.translate(radius * 0.82, 0);
                ctx.fillText(prize.text, 0, 0);
                ctx.restore();
                ctx.rotate(segmentAngle);
            }
            ctx.restore();

            ctx.beginPath();
            ctx.arc(radius, radius, radius / 7, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(radius, radius, radius / 15, 0, 2 * Math.PI);
            ctx.fillStyle = '#111111';
            ctx.fill();
        }

        normalizeExclusiveAngle(angle) {
            return (angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        }

        getExclusiveSegmentIndexAtPointer(wheelRotationAngle) {
            const prizes = this.exclusiveSpinPrizePool.length ? this.exclusiveSpinPrizePool : this.exclusiveLosingSpinPrizes;
            const numSegments = prizes.length;
            const segmentAngle = (2 * Math.PI) / numSegments;
            const pointerAngle = this.normalizeExclusiveAngle(3 * Math.PI / 2 - wheelRotationAngle);
            const shifted = pointerAngle + segmentAngle / 2 + 1e-10;
            return Math.floor(shifted / segmentAngle) % numSegments;
        }

        async spinExclusiveWheel() {
            if (this.exclusiveIsSpinning) return;
            this.exclusiveIsSpinning = true;
            const button = document.getElementById('guestExclusiveSpinButton');
            const pointer = document.getElementById('guestExclusivePointerEl');
            if (button) {
                button.disabled = true;
                button.innerText = 'SPINNING...';
            }
            if (pointer) pointer.style.transform = 'translateX(-50%) rotate(0deg)';

            if (typeof Tone !== 'undefined' && Tone.context.state !== 'running') {
                try {
                    await Tone.start();
                    if (!tickSound) setupSounds();
                } catch {}
            } else if (typeof Tone !== 'undefined' && !tickSound) {
                setupSounds();
            }

            const prizes = this.exclusiveSpinPrizePool.length ? this.exclusiveSpinPrizePool : this.exclusiveLosingSpinPrizes;
            const numSegments = prizes.length;
            const segmentAngle = (2 * Math.PI) / numSegments;
            this.exclusiveSpinState.phase = 'initialSpin';
            this.exclusiveSpinState.animationStartTime = null;
            this.exclusiveSpinState.pointerSwinging = false;
            this.exclusiveSpinState.initialStartAngle = this.exclusiveSpinState.angle;
            const winningIndex = Math.floor(Math.random() * numSegments);
            const fullRotations = Math.floor(Math.random() * 5) + 15;
            let targetOrientation = this.normalizeExclusiveAngle((3 * Math.PI / 2) - (winningIndex * segmentAngle));
            let currentNormalizedAngle = this.normalizeExclusiveAngle(this.exclusiveSpinState.initialStartAngle);
            let diffAngle = targetOrientation - currentNormalizedAngle;
            if (diffAngle < 0) diffAngle += (2 * Math.PI);
            this.exclusiveSpinState.initialTargetAngle = this.exclusiveSpinState.initialStartAngle + (fullRotations * 2 * Math.PI) + diffAngle;
            this.exclusiveSpinState.lastTickAngle = this.exclusiveSpinState.initialStartAngle;

            const animate = (timestamp) => {
                if (!this.exclusiveSpinState.animationStartTime) this.exclusiveSpinState.animationStartTime = timestamp;
                const elapsed = timestamp - this.exclusiveSpinState.animationStartTime;
                const fastSpinDuration = 3000;
                const slowDownDuration = 8000;
                const totalDuration = fastSpinDuration + slowDownDuration;
                const bounceDuration = 700;
                const pointerSwingDuration = 150;
                const pointerSwingMagnitude = 15;

                if (this.exclusiveSpinState.phase === 'initialSpin') {
                    let progress = Math.min(elapsed / totalDuration, 1);
                    let eased;
                    if (elapsed < fastSpinDuration) {
                        const fastProgress = elapsed / fastSpinDuration;
                        eased = fastProgress * (fastSpinDuration / totalDuration);
                    } else {
                        const slowProgress = (elapsed - fastSpinDuration) / slowDownDuration;
                        eased = (fastSpinDuration / totalDuration) + (slowDownDuration / totalDuration) * (1 - Math.pow(1 - slowProgress, 4));
                    }
                    this.exclusiveSpinState.angle = this.exclusiveSpinState.initialStartAngle + eased * (this.exclusiveSpinState.initialTargetAngle - this.exclusiveSpinState.initialStartAngle);
                    if (tickSound && Tone.context.state === 'running' && Math.abs(this.exclusiveSpinState.angle - this.exclusiveSpinState.lastTickAngle) >= segmentAngle / 2) {
                        try { tickSound.triggerAttackRelease('C3', '32n', Tone.now() + 0.02); } catch {}
                        this.exclusiveSpinState.lastTickAngle = this.exclusiveSpinState.angle;
                        this.exclusiveSpinState.pointerSwinging = true;
                        this.exclusiveSpinState.pointerSwingStartTime = timestamp;
                    }
                    this.drawExclusiveWheel();
                    if (progress >= 1) {
                        this.exclusiveSpinState.angle = this.exclusiveSpinState.initialTargetAngle;
                        this.drawExclusiveWheel();
                        this.exclusiveCurrentPrizeData = prizes[this.getExclusiveSegmentIndexAtPointer(this.exclusiveSpinState.angle)];
                        if (this.exclusiveCurrentPrizeData.isBounce) {
                            this.exclusiveSpinState.phase = 'bouncing';
                            this.exclusiveSpinState.animationStartTime = timestamp;
                            this.exclusiveSpinState.bounceStartAngle = this.exclusiveSpinState.angle;
                            this.exclusiveSpinState.bounceTargetAngle = this.exclusiveSpinState.angle + segmentAngle * (0.4 + Math.random() * 0.2);
                            requestAnimationFrame(animate);
                        } else {
                            this.exclusiveSpinState.phase = 'finalizing';
                            requestAnimationFrame(animate);
                        }
                        return;
                    }
                } else if (this.exclusiveSpinState.phase === 'bouncing') {
                    const progress = Math.min(elapsed / bounceDuration, 1);
                    const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                    this.exclusiveSpinState.angle = this.exclusiveSpinState.bounceStartAngle + eased * (this.exclusiveSpinState.bounceTargetAngle - this.exclusiveSpinState.bounceStartAngle);
                    this.drawExclusiveWheel();
                    if (progress >= 1) {
                        this.exclusiveSpinState.angle = this.exclusiveSpinState.bounceTargetAngle;
                        this.exclusiveCurrentPrizeData = prizes[this.getExclusiveSegmentIndexAtPointer(this.exclusiveSpinState.angle)];
                        this.exclusiveSpinState.phase = 'finalizing';
                        requestAnimationFrame(animate);
                        return;
                    }
                } else if (this.exclusiveSpinState.phase === 'finalizing') {
                    this.showExclusiveResultModal(this.exclusiveCurrentPrizeData);
                    this.exclusiveIsSpinning = false;
                    this.exclusiveSpinState.phase = 'idle';
                    if (pointer) pointer.style.transform = 'translateX(-50%) rotate(0deg)';
                    return;
                }

                if (this.exclusiveSpinState.pointerSwinging && pointer) {
                    const swingElapsed = timestamp - this.exclusiveSpinState.pointerSwingStartTime;
                    const swingProgress = swingElapsed / pointerSwingDuration;
                    if (swingProgress < 1) {
                        pointer.style.transform = `translateX(-50%) rotate(${pointerSwingMagnitude * Math.sin(swingProgress * Math.PI)}deg)`;
                    } else {
                        this.exclusiveSpinState.pointerSwinging = false;
                        pointer.style.transform = 'translateX(-50%) rotate(0deg)';
                    }
                }
                requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
        }

        showExclusiveResultModal(prize) {
            this.closeExclusiveSpinModal(true);
            const tx = this.transactions.find(item => item.id === this.exclusivePendingTransactionId);
            if (tx) {
                tx.reward = prize.type === 'tryAgain' || prize.type === 'soClose' ? null : prize;
                this.saveLocalData();
            }
            const titleEl = document.getElementById('guestExclusivePrizeModalTitle');
            const resultEl = document.getElementById('guestExclusivePrizeResult');
            const detailEl = document.getElementById('guestExclusivePrizeDetail');
            const qrEl = document.getElementById('guestExclusiveQrCodeEl');
            const claimNoteEl = document.getElementById('guestExclusivePrizeClaimNote');
            const downloadButton = document.getElementById('guestExclusiveRewardDownloadButton');
            if (!titleEl || !resultEl || !detailEl || !qrEl || !claimNoteEl || !downloadButton) return;

            if (prize.type === 'tryAgain' || prize.type === 'soClose') {
                titleEl.innerText = 'Ah, So Close!';
                resultEl.innerText = 'No Reward This Time';
                detailEl.innerText = 'But you still secured a luxury stay. Check your email for confirmation.';
                qrEl.style.display = 'none';
                claimNoteEl.style.display = 'none';
                downloadButton.classList.add('hidden');
                this.exclusiveRewardReceiptTxId = null;
            } else {
                titleEl.innerText = 'JACKPOT!';
                resultEl.innerText = prize.text;
                detailEl.innerText = prize.detail;
                qrEl.style.display = 'inline-block';
                claimNoteEl.style.display = '';
                downloadButton.classList.remove('hidden');
                this.exclusiveRewardReceiptTxId = tx?.id || null;
                qrEl.innerHTML = '';
                try {
                    new QRCode(qrEl, {
                        text: `Bookily Reward: ${prize.text}\nCode: BOOKILY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                        width: 120,
                        height: 120,
                        colorDark: '#111111',
                        colorLight: '#ffffff'
                    });
                } catch {}
                if (typeof confetti === 'function') {
                    confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 }, colors: ['#D4AF37', '#D32F2F', '#111111'] });
                }
            }

            document.getElementById('guestExclusivePrizeModal')?.classList.add('show');
            const button = document.getElementById('guestExclusiveSpinButton');
            if (button) {
                button.disabled = false;
                button.innerText = 'SPIN NOW';
            }
        }

        showExclusiveStoredReward(prize, transactionId = null) {
            if (!prize) {
                this.showNotification('No reward is attached to this reservation yet.', 'error');
                return;
            }

            const titleEl = document.getElementById('guestExclusivePrizeModalTitle');
            const resultEl = document.getElementById('guestExclusivePrizeResult');
            const detailEl = document.getElementById('guestExclusivePrizeDetail');
            const qrEl = document.getElementById('guestExclusiveQrCodeEl');
            const claimNoteEl = document.getElementById('guestExclusivePrizeClaimNote');
            const downloadButton = document.getElementById('guestExclusiveRewardDownloadButton');
            if (!titleEl || !resultEl || !detailEl || !qrEl || !claimNoteEl || !downloadButton) return;

            titleEl.innerText = 'Reward Unlocked';
            resultEl.innerText = prize.label || prize.text || 'Reward';
            detailEl.innerText = prize.detail || 'Download your reward receipt and present it at check-in to claim it.';
            qrEl.style.display = 'inline-block';
            claimNoteEl.style.display = '';
            downloadButton.classList.remove('hidden');
            this.exclusiveRewardReceiptTxId = transactionId;
            qrEl.innerHTML = '';

            try {
                new QRCode(qrEl, {
                    text: `Bookily Reward: ${prize.label || prize.text}\nCode: BOOKILY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    width: 120,
                    height: 120,
                    colorDark: '#111111',
                    colorLight: '#ffffff'
                });
            } catch {}

            document.getElementById('guestExclusivePrizeModal')?.classList.add('show');
        }

        openExclusiveReceiptFromPendingBooking() {
            const tx = this.transactions.find(item => item.id === this.exclusivePendingTransactionId);
            if (!tx) return;

            const receiptData = this.getTransactionReceiptData(tx);
            this.populateReceiptModal(receiptData);
            document.getElementById('receiptModal').style.display = 'flex';
            setTimeout(() => document.getElementById('receiptModal').classList.add('show'), 10);
            this.exclusivePendingTransactionId = null;
        }

        claimExclusiveReservationReward(transactionId) {
            const tx = this.transactions.find(item => (item.id || this.getTransactionId(item)) === transactionId);
            if (!tx?.reward) {
                this.showNotification('No reward is attached to this reservation yet.', 'error');
                return;
            }
            this.showExclusiveStoredReward(tx.reward, tx.id || this.getTransactionId(tx));
        }

        downloadExclusiveRewardReceipt() {
            if (!this.exclusiveRewardReceiptTxId) {
                this.showNotification('No reward receipt is available to download.', 'error');
                return;
            }
            const tx = this.transactions.find(item => (item.id || this.getTransactionId(item)) === this.exclusiveRewardReceiptTxId);
            if (!tx?.reward) {
                this.showNotification('No reward receipt is available to download.', 'error');
                return;
            }
            const receiptData = this.getTransactionReceiptData(tx);
            this.downloadRewardReceiptImage({
                rewardReceiptNumber: `RW-${receiptData.receiptNumber}`,
                date: receiptData.date,
                guest: receiptData.guest,
                phone: receiptData.phone,
                property: receiptData.property,
                checkIn: receiptData.checkIn,
                checkOut: receiptData.checkOut,
                code: receiptData.code,
                reward: receiptData.reward
            });
        }

        closeExclusivePrizeModal() {
            document.getElementById('guestExclusivePrizeModal')?.classList.remove('show');
            this.openExclusiveReceiptFromPendingBooking();
        }

        drawRewardWheel() {
            const canvas = document.getElementById('rewardWheelCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const size = canvas.width;
            const radius = size / 2;
            const innerRadius = 28;
            const slice = (Math.PI * 2) / this.rewardPrizes.length;

            ctx.clearRect(0, 0, size, size);
            ctx.save();
            ctx.translate(radius, radius);
            ctx.rotate(this.rewardWheelState.angle);

            this.rewardPrizes.forEach((prize, index) => {
                const start = -Math.PI / 2 - slice / 2 + index * slice;
                const end = start + slice;
                const grad = ctx.createLinearGradient(-radius, -radius, radius, radius);
                grad.addColorStop(0, prize.color);
                grad.addColorStop(1, '#fff4d6');

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, radius - 12, start, end);
                ctx.closePath();
                ctx.fillStyle = grad;
                ctx.fill();

                ctx.strokeStyle = 'rgba(255,255,255,0.75)';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.save();
                ctx.rotate(start + slice / 2);
                ctx.translate(0, -(radius - 66));
                ctx.rotate(Math.PI / 2);
                ctx.textAlign = 'center';
                ctx.fillStyle = '#1a1a1a';
                ctx.font = '700 15px Poppins';

                const words = prize.label.split(' ');
                const firstLine = words.slice(0, Math.ceil(words.length / 2)).join(' ');
                const secondLine = words.slice(Math.ceil(words.length / 2)).join(' ');
                ctx.fillText(firstLine, 0, -8);
                if (secondLine) ctx.fillText(secondLine, 0, 12);
                ctx.restore();
            });

            ctx.beginPath();
            ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.lineWidth = 8;
            ctx.strokeStyle = '#ffcf6a';
            ctx.stroke();
            ctx.fillStyle = '#1a1a1a';
            ctx.font = '700 13px Poppins';
            ctx.textAlign = 'center';
            ctx.fillText('BONUS', 0, 4);

            ctx.restore();
        }

        getRewardWinningIndex() {
            const weightedPool = [0, 0, 1, 1, 2, 2, 3, 4, 5, 6, 7];
            return weightedPool[Math.floor(Math.random() * weightedPool.length)];
        }

        openRewardModal(transaction, receiptData) {
            this.currentRewardTransactionId = transaction.id;
            this.currentRewardData = transaction.reward || null;
            this.pendingReceiptData = receiptData;
            this.rewardWheelState = {
                angle: 0,
                spinning: false,
                selectedIndex: null
            };

            this.renderRewardLegend();
            this.drawRewardWheel();

            const result = document.getElementById('rewardResultText');
            const spinBtn = document.getElementById('rewardSpinButton');
            const continueBtn = document.getElementById('rewardContinueButton');
            if (result) result.innerText = 'Press spin to reveal your booking reward.';
            if (spinBtn) {
                spinBtn.disabled = false;
                spinBtn.innerHTML = '<i class="fa-solid fa-dice"></i> Spin My Reward';
            }
            if (continueBtn) continueBtn.disabled = true;

            document.getElementById('rewardModal').style.display = 'flex';
            setTimeout(() => document.getElementById('rewardModal').classList.add('show'), 10);
        }

        spinRewardWheel() {
            if (this.rewardWheelState.spinning) return;

            const spinBtn = document.getElementById('rewardSpinButton');
            const continueBtn = document.getElementById('rewardContinueButton');
            const result = document.getElementById('rewardResultText');
            const winIndex = this.getRewardWinningIndex();
            const fullTurns = 6 + Math.floor(Math.random() * 3);
            const startAngle = this.rewardWheelState.angle;
            const slice = (Math.PI * 2) / this.rewardPrizes.length;
            const targetAngle = startAngle + (fullTurns * Math.PI * 2) - (winIndex * slice);
            const duration = 4600;

            this.rewardWheelState.spinning = true;
            if (spinBtn) {
                spinBtn.disabled = true;
                spinBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Revealing...';
            }
            if (result) result.innerText = 'Spinning... your reward is being unlocked.';

            const startTime = performance.now();
            const animate = (now) => {
                const progress = Math.min((now - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 4);
                this.rewardWheelState.angle = startAngle + (targetAngle - startAngle) * eased;
                this.drawRewardWheel();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                    return;
                }

                const prize = this.rewardPrizes[winIndex];
                this.rewardWheelState.angle = targetAngle;
                this.rewardWheelState.spinning = false;
                this.rewardWheelState.selectedIndex = winIndex;
                this.currentRewardData = prize;

                const tx = this.transactions.find(item => item.id === this.currentRewardTransactionId);
                if (tx) {
                    tx.reward = prize;
                    tx.rewardIssuedAt = new Date().toISOString();
                }

                if (this.pendingReceiptData) {
                    this.pendingReceiptData.reward = prize;
                }
                this.saveLocalData();

                if (result) {
                    result.innerHTML = `<strong>${prize.label}</strong>${prize.detail}`;
                }
                if (continueBtn) continueBtn.disabled = false;
                if (spinBtn) {
                    spinBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Reward Unlocked';
                }
            };

            requestAnimationFrame(animate);
        }

        completeRewardFlow() {
            const modal = document.getElementById('rewardModal');
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }

            if (!this.pendingReceiptData) return;
            this.populateReceiptModal(this.pendingReceiptData);
            this.pendingReceiptData = null;
            document.getElementById('receiptModal').style.display = 'flex';
            setTimeout(() => document.getElementById('receiptModal').classList.add('show'), 10);
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

        async lookupGuestAccessReservations() {
            const phone = document.getElementById('guestAccessPhone')?.value.trim();
            const accessCode = document.getElementById('guestAccessCode')?.value.trim();
            const target = document.getElementById('guestAccessReservationsArea');
            if (!target) return;

            if (!phone || !accessCode) {
                target.innerHTML = `<div class="text-gray-500 font-medium">Enter your phone number and access code to continue.</div>`;
                return;
            }

            target.innerHTML = `<div class="text-gray-500 font-medium">Checking your reservation...</div>`;
            const remoteMatches = await this.fetchGuestBookingsByAccess(phone, accessCode);
            const localMatches = this.transactions.filter(tx => tx.phone === phone && tx.accessCode === accessCode);
            const matches = remoteMatches.length ? remoteMatches : localMatches;

            if (remoteMatches.length) {
                const merged = new Map(this.transactions.map(tx => [tx.id || this.getTransactionId(tx), tx]));
                remoteMatches.forEach(tx => {
                    const key = tx.id || this.getTransactionId(tx);
                    merged.set(key, { ...merged.get(key), ...tx });
                });
                this.transactions = Array.from(merged.values());
                this.saveLocalBackupState();
            }

            if (!matches.length) {
                target.innerHTML = `<div class="text-gray-500 font-medium">No reservations matched that phone number and access code.</div>`;
                return;
            }

            target.innerHTML = matches.slice().reverse().map(tx => {
                const receipt = this.getTransactionReceiptData(tx);
                const txId = tx.id || this.getTransactionId(tx);
                const rewardButton = tx.reward
                    ? `<button class="inline-flex items-center gap-2 border-2 border-amber-400 text-amber-700 px-5 py-2.5 rounded-full font-bold hover:bg-amber-50 transition" onclick="app.claimExclusiveReservationReward('${txId}')">
                                <i class="fa-solid fa-gift"></i> Claim Reward
                            </button>`
                    : `<span class="text-sm text-gray-400 font-medium">No reward attached yet</span>`;
                return `
                    <div class="bg-white border border-gray-200 rounded-[1.5rem] p-6 shadow-sm mb-4">
                        <div class="flex justify-between gap-4 flex-wrap">
                            <div>
                                <div class="font-black text-2xl text-gray-900">${receipt.property}</div>
                                <div class="text-gray-500 font-medium mt-1">${receipt.location}</div>
                                <div class="text-sm text-gray-500 mt-3">${receipt.checkIn} to ${receipt.checkOut}</div>
                            </div>
                            <div class="text-left md:text-right">
                                <div class="font-black text-2xl text-amada-red">${this.formatCurrency(receipt.total)}</div>
                                <div class="text-sm text-gray-500 mt-2">Access Code: ${receipt.code}</div>
                            </div>
                        </div>
                        <div class="flex justify-between items-center gap-4 mt-6 flex-wrap">
                            <div class="text-sm text-gray-500">Guest: ${receipt.guest} • Receipt: ${receipt.receiptNumber}</div>
                            <div class="flex items-center gap-3 flex-wrap">
                                ${rewardButton}
                                <button class="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 px-5 py-2.5 rounded-full font-bold hover:bg-gray-900 hover:text-white transition" onclick="app.downloadGuestReceipt('${txId}')">
                                    <i class="fa-solid fa-download"></i> Download Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        lookupExclusiveReservations() {
            return this.lookupGuestAccessReservations();
        }
        
        renderExpenditureTab() {
            return `<div class="panel"><h3>Expense Tracker loaded. (Reused from core logic).</h3></div>`;
        }

        renderManagementPropertyTab() {
            const locations = this.getAvailableLocations();
            const properties = this.getFilteredInventory(this.managementLocation);

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
            const myRecentRequests = this.getFilteredExpenditures('', '', 'all')
                .slice()
                .sort((a, b) => (b.createdAt || b.date || '').localeCompare(a.createdAt || a.date || ''))
                .slice(0, 5);
            const locations = this.getAvailableLocations();
            const actorName = this.currentUser?.name || 'Current Staff';
            const actorId = this.currentUser?.id || '';

            return `
                <div class="panel">
                    <h3 style="margin-top:0; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-money-bill-wave" style="color:var(--primary)"></i> Submit Expenditure Request</h3>
                    <p style="color:var(--gray); margin:6px 0 22px 0;">A second staff member must approve each request before it reaches the executive table.</p>
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
                            <div style="text-align:right; display:flex; align-items:center; gap:12px;">
                                <label style="display:flex; align-items:center; gap:8px; color:var(--gray); font-size:0.84rem; cursor:pointer;">
                                    <input type="checkbox" ${this.isExpenseChecked(exp.id) ? 'checked' : ''} onchange="app.toggleExpenseChecked('${exp.id}', this.checked)" style="accent-color: var(--primary);">
                                    Check
                                </label>
                                <div>
                                <strong>${this.formatCurrency(exp.amount)}</strong>
                                <div style="font-size:0.8rem; color:${this.isExecutiveApprovedStatus(exp.status) ? 'var(--success)' : 'var(--warning)'}; margin-top:6px;">${this.getDisplayExpenseStatus(exp.status)}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        renderStaffIncomeTab() {
            const locations = this.getAvailableLocations();
            const scopedLocations = this.getScopedLocationsSet();
            const recentIncome = this.otherIncome
                .filter(entry => !this.isHostDelegatedView() || scopedLocations.has(entry.location) || entry.recordedByStaffId === this.currentHostEmail)
                .slice()
                .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
                .slice(0, 6);
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
            return [...new Set(this.getScopedInventoryRecords().map(item => item.loc))].sort();
        }

        isDateInRange(dateValue, from, to) {
            if (!dateValue) return false;
            if (from && dateValue < from) return false;
            if (to && dateValue > to) return false;
            return true;
        }

        isHostDelegatedView() {
            return this.role === 'host' && this.hostDashboardRole !== 'host';
        }

        getScopedInventoryRecords() {
            if (!this.isHostDelegatedView()) return this.inventory;
            return this.inventory.filter(item => item.hostEmail === this.currentHostEmail);
        }

        getScopedPropertyIds() {
            return new Set(this.getScopedInventoryRecords().map(item => item.id));
        }

        getScopedLocationsSet() {
            return new Set(this.getScopedInventoryRecords().map(item => item.loc));
        }

        getCurrentTeamMemberRecord() {
            if (!this.currentUser || this.role === 'host') return null;
            return this.teamMembers.find(member =>
                member.staffId === this.currentUser.id ||
                (member.phone && member.phone === this.currentUser.phone) ||
                (member.email && member.email === this.currentUser.email)
            ) || null;
        }

        getMapInventoryRecords(elementId) {
            if (elementId === 'guestMapArea') return this.inventory;
            const scopedInventory = this.getScopedInventoryRecords();
            if (elementId === 'staffMap') {
                const member = this.getCurrentTeamMemberRecord();
                if (member?.assignmentScope === 'property' && member.assignedPropertyId) {
                    return scopedInventory.filter(item => item.id === member.assignedPropertyId);
                }
            }
            return scopedInventory;
        }

        getFilteredTransactions(from, to, location) {
            const scopedPropertyIds = this.getScopedPropertyIds();
            return this.transactions.filter(tx => {
                if (!this.isDateInRange(tx.date, from, to)) return false;
                if (this.isHostDelegatedView() && !scopedPropertyIds.has(tx.propId)) return false;
                if (location === 'all') return true;
                const prop = this.inventory.find(item => item.id === tx.propId);
                return prop?.loc === location;
            });
        }

        getTransactionId(tx, index = 0) {
            return tx.id || `${tx.propId || 'prop'}-${tx.date || 'date'}-${tx.guest || 'guest'}-${index}`;
        }

        getFilteredExpenditures(from, to, location) {
            const scopedLocations = this.getScopedLocationsSet();
            return this.expenditures.filter(exp => {
                if (!this.isDateInRange(exp.date, from, to)) return false;
                if (this.isHostDelegatedView()) {
                    const inOwnedLocation = scopedLocations.has(exp.scope);
                    const ownedByHost = exp.staffId === this.currentHostEmail || exp.approverStaffId === this.currentHostEmail;
                    if (!inOwnedLocation && !ownedByHost) return false;
                }
                if (location === 'all') return true;
                return (exp.scope || '').toLowerCase() === location.toLowerCase();
            });
        }

        getFilteredRefunds(from, to, location) {
            const scopedPropertyIds = this.getScopedPropertyIds();
            return this.refunds.filter(refund => {
                if (!this.isDateInRange(refund.date, from, to)) return false;
                if (this.isHostDelegatedView() && !scopedPropertyIds.has(refund.propId)) return false;
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
                member.staffId === this.currentUser.id ||
                (member.phone && member.phone === this.currentUser.phone) ||
                (member.email && member.email === this.currentUser.email)
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
            return this.getScopedInventoryRecords().filter(item => location === 'all' || item.loc === location);
        }

        getLocationForExpense(expense) {
            const scope = expense.scope || '';
            if (this.getAvailableLocations().includes(scope)) return scope;
            return 'Global Ops';
        }

        getReportingRentAmount(entry, from, to) {
            const annualRent = Number(entry?.amount) || 0;
            if (!annualRent) return 0;
            if (!from || !to) return annualRent / 12;

            const fromDate = new Date(from);
            const toDate = new Date(to);
            if (isNaN(fromDate) || isNaN(toDate) || toDate < fromDate) return annualRent / 12;

            const isWholeMonthRange =
                fromDate.getDate() === 1 &&
                toDate.getDate() === new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0).getDate();

            if (isWholeMonthRange) {
                const monthCount = ((toDate.getFullYear() - fromDate.getFullYear()) * 12) + (toDate.getMonth() - fromDate.getMonth()) + 1;
                return (annualRent / 12) * Math.max(monthCount, 1);
            }

            const oneDay = 86400000;
            const dayCount = Math.floor((toDate - fromDate) / oneDay) + 1;
            return (annualRent / 365) * Math.max(dayCount, 1);
        }

        getBaselineTotals(location, from, to) {
            const scopedLocations = this.getScopedLocationsSet();
            const salaries = this.salaryRegistry
                .filter(entry => !this.isHostDelegatedView() || scopedLocations.has(entry.location))
                .filter(entry => location === 'all' || entry.location === location)
                .reduce((sum, entry) => sum + (entry.amount || 0), 0);
            const rent = this.rentRegistry
                .filter(entry => !this.isHostDelegatedView() || scopedLocations.has(entry.location))
                .filter(entry => location === 'all' || entry.location === location)
                .reduce((sum, entry) => sum + this.getReportingRentAmount(entry, from, to), 0);
            const sundry = this.expenditures
                .filter(entry => this.isExecutiveApprovedStatus(entry.status))
                .filter(entry => this.isDateInRange(entry.approvedAt || entry.date, from, to))
                .filter(entry => !this.isHostDelegatedView() || scopedLocations.has(entry.scope) || entry.staffId === this.currentHostEmail || entry.approverStaffId === this.currentHostEmail)
                .filter(entry => location === 'all' || entry.scope === location)
                .reduce((sum, entry) => sum + (entry.amount || 0), 0);
            return { salary: salaries, sundry, rent };
        }

        isExpenseChecked(id) {
            return this.checkedExpenseIds.has(id);
        }

        toggleExpenseChecked(id, checked) {
            if (!id) return;
            if (checked) this.checkedExpenseIds.add(id);
            else this.checkedExpenseIds.delete(id);
            this.render();
        }

        getExecutiveMetrics(from, to, location) {
            const txs = this.getFilteredTransactions(from, to, location);
            const exps = this.getFilteredExpenditures(from, to, location);
            const units = this.getFilteredInventory(location);
            const occupiedUnits = units.filter(item => item.status === 'occupied').length;
            const baselines = this.getBaselineTotals(location, from, to);
            const scopedLocations = this.getScopedLocationsSet();
            const otherIncome = this.otherIncome
                .filter(entry => this.isDateInRange(entry.date, from, to))
                .filter(entry => !this.isHostDelegatedView() || scopedLocations.has(entry.location) || entry.recordedByStaffId === this.currentHostEmail)
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
            const vatRate = this.normalizePercentageValue(this.vatPercentage, 12.5) / 100;
            const maintenanceRate = this.normalizePercentageValue(this.maintenancePercentage, 5) / 100;
            const vat = netRevenue > 0 ? netRevenue * vatRate : 0;
            const maintenance = netRevenue > 0 ? netRevenue * maintenanceRate : 0;
            const approvedExpenses = exps
                .filter(exp => this.isExecutiveApprovedStatus(exp.status))
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
                vatRate,
                vat,
                maintenanceRate,
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

            const isHostSelfApproval = this.role === 'host';
            if (!isHostSelfApproval && expense.staffId === approverStaffId) {
                this.showNotification("A different staff member must approve this expenditure.", "error");
                return;
            }

            expense.approver = approverName;
            expense.approverStaffId = approverStaffId;
            expense.approverPin = approverPin;
            expense.status = 'Approved for executive';
            expense.approvedAt = new Date().toISOString().split('T')[0];

            this.saveLocalData();
            this.showNotification("Expenditure approved and forwarded to executive.", "success");
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
            const assignedPropertyId = document.getElementById('salaryAssignedProperty').value;
            const assignedPropertyName = this.inventory.find(item => item.id === assignedPropertyId)?.name || '';

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
                existing.assignedPropertyId = assignedPropertyId;
                existing.assignedPropertyName = assignedPropertyName;
            } else {
                this.salaryRegistry.push({
                    id: `sal_${Date.now()}`,
                    staffName,
                    role,
                    location,
                    amount,
                    phone,
                    email,
                    assignedPropertyId,
                    assignedPropertyName
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
            if (!this.isExecutiveDashboardActive()) {
                this.showNotification("Only executive access can update rent registry.", "error");
                return;
            }

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

        saveExecutiveFinanceSettings() {
            if (!this.isExecutiveDashboardActive()) {
                this.showNotification("Only executive access can update finance settings.", "error");
                return;
            }

            const vatInput = document.getElementById('executiveVatPercentage');
            const maintenanceInput = document.getElementById('executiveMaintenancePercentage');
            const nextVat = this.normalizePercentageValue(vatInput?.value, NaN);
            const nextMaintenance = this.normalizePercentageValue(maintenanceInput?.value, NaN);

            if (!Number.isFinite(nextVat) || !Number.isFinite(nextMaintenance)) {
                this.showNotification("Enter valid VAT and maintenance percentages.", "error");
                return;
            }

            this.vatPercentage = nextVat;
            this.maintenancePercentage = nextMaintenance;
            this.saveLocalData();
            this.showNotification("Executive finance settings updated.", "success");
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
                    title: "Executive Report"
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
                .filter(exp => scope !== 'chairman' || this.isExecutiveApprovedStatus(exp.status))
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
                                <div class="brand">Bookily Stays</div>
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
                .filter(exp => this.isExecutiveApprovedStatus(exp.status))
                .slice()
                .sort((a, b) => ((b.approvedAt || b.date || '')).localeCompare(a.approvedAt || a.date || ''))
                .slice(0, 5);
            const pendingExpenses = this.getFilteredExpenditures(this.managementDateFrom, this.managementDateTo, this.managementLocation)
                .filter(exp => !this.isExecutiveApprovedStatus(exp.status))
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
                        <div class="mgmt-tab ${this.activeMgmtTab === 'payroll' ? 'active' : ''}" onclick="app.setManagementTab('payroll')"><i class="fa-solid fa-users-gear"></i> Salaries</div>
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
                                    <div style="display:flex; justify-content:space-between; gap:15px;"><span style="color:var(--gray);"><i class="fa-solid fa-building" style="margin-right:8px;"></i>Rent (Allocated)</span><strong>${this.formatCurrency(metrics.baselines.rent)}</strong></div>
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
                                    <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: VAT (${this.vatPercentage}%)</span><strong>-${this.formatCurrency(metrics.vat)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Maint (${this.maintenancePercentage}%)</span><strong>-${this.formatCurrency(metrics.maintenance)}</strong></div>
                                    <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Rent (Allocated)</span><strong>-${this.formatCurrency(metrics.baselines.rent)}</strong></div>
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
                            <p style="color:var(--gray); margin:6px 0 18px 0;">Management users need a different approver, while the host owner can approve directly before it reaches the executive table.</p>
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
                                        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                                            <label style="display:flex; align-items:center; gap:8px; color:var(--gray); font-size:0.84rem; cursor:pointer;">
                                                <input type="checkbox" ${this.isExpenseChecked(exp.id) ? 'checked' : ''} onchange="app.toggleExpenseChecked('${exp.id}', this.checked)" style="accent-color: var(--primary);">
                                                Check
                                            </label>
                                            <button class="btn-primary" onclick="app.approveExpenseRequest('${exp.id}')" style="height:52px; justify-content:center;">
                                                <i class="fa-solid fa-badge-check"></i> Approve
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="panel">
                            <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap;">
                                <div>
                                    <h3 style="margin:0 0 6px 0;">Approved Expenditure Ledger</h3>
                                    <p style="margin:0; color:var(--gray);">Only approved expenditure entries flow onward to the executive table and exports.</p>
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
                                    <div style="text-align:right; display:flex; align-items:center; gap:12px;">
                                        <label style="display:flex; align-items:center; gap:8px; color:var(--gray); font-size:0.84rem; cursor:pointer;">
                                            <input type="checkbox" ${this.isExpenseChecked(exp.id) ? 'checked' : ''} onchange="app.toggleExpenseChecked('${exp.id}', this.checked)" style="accent-color: var(--primary);">
                                            Check
                                        </label>
                                        <div>
                                        <strong>${this.formatCurrency(exp.amount)}</strong>
                                        <div style="font-size:0.8rem; color:${this.isExecutiveApprovedStatus(exp.status) ? 'var(--success)' : 'var(--warning)'}; margin-top:6px;">${this.getDisplayExpenseStatus(exp.status)}</div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : this.activeMgmtTab === 'payroll' ? `
                        ${(() => {
                            const editingSalary = this.salaryRegistry.find(entry => entry.id === this.currentSalaryEditId);
                            const presetRole = editingSalary && ['Housekeeper', 'Manager', 'Supervisor', 'Chef', 'Driver', 'Laundry', 'Security', 'Other'].includes(editingSalary.role) ? editingSalary.role : editingSalary ? 'Other' : 'Housekeeper';
                            const presetOtherRole = editingSalary && !['Housekeeper', 'Manager', 'Supervisor', 'Chef', 'Driver', 'Laundry', 'Security'].includes(editingSalary.role) ? editingSalary.role : '';
                            const salaryPropertyOptions = this.getScopedInventoryRecords();
                            return `
                        <div style="display:grid; grid-template-columns:minmax(320px, 1fr); gap:24px;">
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
                                        <div class="input-floating">
                                            <select id="salaryAssignedProperty">
                                                <option value="">No specific property</option>
                                                ${salaryPropertyOptions.map(prop => `<option value="${prop.id}" ${editingSalary?.assignedPropertyId === prop.id ? 'selected' : ''}>${prop.name} (${prop.loc})</option>`).join('')}
                                            </select>
                                            <label style="top:5px; font-size:0.7rem;">Assigned Property</label>
                                        </div>
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
                        </div>
                        <div class="panel">
                            <h3 style="margin-top:0;">Salary Ledger</h3>
                            ${this.salaryRegistry.length === 0 ? `<div style="padding:24px 0; color:var(--gray);">No staff salaries added yet.</div>` : this.salaryRegistry.map(entry => `
                                <div style="display:flex; justify-content:space-between; gap:16px; padding:16px 0; border-bottom:1px solid #eee;">
                                    <div>
                                        <div style="font-weight:600;">${entry.staffName}</div>
                                        <div style="font-size:0.84rem; color:var(--gray);">${entry.role} • ${entry.location}</div>
                                        <div style="font-size:0.8rem; color:var(--gray);">${entry.assignedPropertyName || 'No assigned property'}</div>
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
                const properties = this.getFilteredInventory(this.managementLocation);
                if (grid) properties.forEach(prop => grid.appendChild(this.createManagementPropertyCard(prop)));
            }
            if (this.activeMgmtTab === 'pl') {
                setTimeout(() => this.renderManagementPlChart(metrics), 50);
            }
        }
        
        renderChairmanDashboard(container) {
            const metrics = this.getExecutiveMetrics(this.chairmanDateFrom, this.chairmanDateTo, this.chairmanLocation);
            const locations = this.getAvailableLocations();
            const editingRent = this.rentRegistry.find(entry => entry.location === this.currentRentEditLocation);
            const chairmanExpenses = this.getFilteredExpenditures(this.chairmanDateFrom, this.chairmanDateTo, this.chairmanLocation)
                .filter(exp => this.isExecutiveApprovedStatus(exp.status))
                .sort((a, b) => (b.approvedAt || b.date || '').localeCompare(a.approvedAt || a.date || ''))
                .slice(0, 8);

            container.innerHTML = `
                <div style="animation: fadeIn 0.5s ease;">
                    <div style="margin-bottom:24px;">
                        <h2 style="font-family:var(--font-body); font-size:2.3rem; margin:0 0 4px 0;">Executive Dashboard</h2>
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
                            <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: VAT (${this.vatPercentage}%)</span><strong>-${this.formatCurrency(metrics.vat)}</strong></div>
                            <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Maint (${this.maintenancePercentage}%)</span><strong>-${this.formatCurrency(metrics.maintenance)}</strong></div>
                            <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Rent (Allocated)</span><strong>-${this.formatCurrency(metrics.baselines.rent)}</strong></div>
                            <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Total Sundry</span><strong>-${this.formatCurrency(metrics.recordedExpenses)}</strong></div>
                            <div style="display:flex; justify-content:space-between; color:#ff9f9f;"><span>Less: Salaries</span><strong>-${this.formatCurrency(metrics.baselines.salary)}</strong></div>
                            <div style="display:flex; justify-content:space-between; margin-top:12px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.15); font-size:1.05rem;"><span style="font-weight:700;">Operating Profit / Loss</span><strong style="color:${metrics.operatingProfit >= 0 ? '#7ED957' : '#FF8B8B'}">${this.formatCurrency(metrics.operatingProfit)}</strong></div>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:minmax(320px, 0.9fr) minmax(320px, 1.1fr); gap:24px; margin-bottom:24px;">
                        <div class="panel">
                            <h3 style="margin-top:0;"><i class="fa-solid fa-sliders" style="color:var(--primary)"></i> Executive Finance Controls</h3>
                            <p style="color:var(--gray); margin:6px 0 18px 0;">Set the percentages used in the consolidated profit calculation.</p>
                            <form onsubmit="event.preventDefault(); app.saveExecutiveFinanceSettings();">
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                                    <div class="input-floating">
                                        <input type="number" id="executiveVatPercentage" min="0" step="0.01" value="${this.vatPercentage}" required>
                                        <label>VAT Percentage</label>
                                    </div>
                                    <div class="input-floating">
                                        <input type="number" id="executiveMaintenancePercentage" min="0" step="0.01" value="${this.maintenancePercentage}" required>
                                        <label>Maint Percentage</label>
                                    </div>
                                </div>
                                <button class="btn-primary" style="margin-top:12px; justify-content:center;">
                                    <i class="fa-solid fa-floppy-disk"></i> Save Percentages
                                </button>
                            </form>
                        </div>
                        <div class="panel">
                            <h3 style="margin-top:0;"><i class="fa-solid fa-building-circle-check" style="color:var(--primary)"></i> Rent Registry</h3>
                            <p style="color:var(--gray); margin:6px 0 18px 0;">Annual rent is now controlled from the executive dashboard.</p>
                            <form id="rentForm" onsubmit="event.preventDefault(); app.upsertRentEntry();">
                                <input type="hidden" id="rentEditLocation" value="${editingRent?.location || ''}">
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                                    <div class="input-floating">
                                        <select id="rentLocation" required>
                                            ${locations.map(loc => `<option value="${loc}" ${editingRent?.location === loc ? 'selected' : ''}>${loc}</option>`).join('')}
                                        </select>
                                        <label style="top:5px; font-size:0.7rem;">Location</label>
                                    </div>
                                    <div class="input-floating">
                                        <input type="text" id="rentAmount" value="${this.formatCurrencyInputValue(editingRent?.amount || '')}" data-currency inputmode="numeric" autocomplete="off" required>
                                        <label>Annual Rent (₦)</label>
                                    </div>
                                </div>
                                <button class="btn-primary" style="margin-top:12px; justify-content:center;">
                                    <i class="fa-solid fa-cloud-arrow-up"></i> ${editingRent ? 'Update Annual Rent' : 'Save Annual Rent'}
                                </button>
                            </form>
                            <div style="margin-top:20px; border-top:1px solid #eee; padding-top:16px;">
                                <div style="font-size:0.9rem; color:var(--gray); margin-bottom:12px;">Allocated Rent For Selected Period</div>
                                <div style="font-size:2rem; font-weight:700;">${this.formatCurrency(metrics.baselines.rent)}</div>
                            </div>
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
                        <h3 style="margin-top:0;">Executive Expenditure Table</h3>
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
                                            <th style="padding:12px; text-align:center;">Check</th>
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
                                                <td style="padding:12px; text-align:center;"><input type="checkbox" ${this.isExpenseChecked(exp.id) ? 'checked' : ''} onchange="app.toggleExpenseChecked('${exp.id}', this.checked)" style="accent-color: var(--primary);"></td>
                                                <td style="padding:12px; text-align:right; font-weight:700;">${this.formatCurrency(exp.amount)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>

                    <div class="panel">
                        <h3 style="margin-top:0;">Rent Ledger</h3>
                        ${this.rentRegistry.length === 0 ? `<div style="padding:24px 0; color:var(--gray);">No rent entries added yet.</div>` : this.rentRegistry.map(entry => `
                            <div style="display:flex; justify-content:space-between; gap:16px; padding:16px 0; border-bottom:1px solid #eee;">
                                <div>
                                    <div style="font-weight:600;">${entry.location}</div>
                                    <div style="font-size:0.82rem; color:var(--gray);">Annual baseline controlled by executive</div>
                                </div>
                                <div style="display:flex; gap:12px; align-items:center;">
                                    <strong>${this.formatCurrency(entry.amount)} / year</strong>
                                    <button class="btn-outline" onclick="app.startEditRentEntry('${entry.location}')"><i class="fa-solid fa-pen"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="panel">
                        <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap;">
                            <div>
                                <h3 style="margin:0 0 6px 0;">Download Executive Report</h3>
                                <p style="margin:0; color:var(--gray);">Export the current executive view as income or expenditure.</p>
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

            const signedInRole = this.currentUser?.role || this.role;
            if (signedInRole === 'staff') {
                if (r !== 'staff') {
                    this.showNotification("Staff accounts can only access the staff dashboard.", "error");
                    return;
                }
                this.setRole('staff');
                return;
            }

            if (signedInRole === 'management') {
                if (r === 'chairman' || r === 'host') {
                    this.showNotification("Management accounts can only access management and staff dashboards.", "error");
                    return;
                }
                this.setRole(r === 'staff' ? 'staff' : 'management');
                return;
            }

            if (signedInRole === 'chairman') {
                if (r === 'host') {
                    this.showNotification("Executive accounts do not have host access.", "error");
                    return;
                }
                this.setRole(r);
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
            if(statusText) statusText.innerText = s === 'online' ? 'Supabase Live' : s === 'syncing' ? 'Syncing...' : 'Offline';
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
            const todayIso = this.getTodayIsoDate();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            document.getElementById('checkInDate').min = todayIso;
            document.getElementById('checkOutDate').min = todayIso;
            document.getElementById('checkInDate').value = todayIso;
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
            const todayIso = this.getTodayIsoDate();

            if (checkInEl.value && checkInEl.value < todayIso) {
                checkInEl.value = todayIso;
            }
            
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
            const cautionFee = this.parseCurrencyValue(document.getElementById('cautionFeePaid')?.value) || 0;
            const stayTotal = (p ? p.price : 0) * (isNaN(nights) ? 1 : nights);
            const total = stayTotal + cautionFee;
            document.getElementById('modalTotal').innerText = this.formatCurrency(total);
            const breakdown = document.getElementById('modalChargeBreakdown');
            if (breakdown) {
                breakdown.innerText = cautionFee > 0
                    ? `Stay ${this.formatCurrency(stayTotal)} + caution ${this.formatCurrency(cautionFee)}`
                    : `Stay ${this.formatCurrency(stayTotal)}`;
            }
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
            const stayTotal = (() => {
                const checkInDate = new Date(checkIn);
                const checkOutDate = new Date(checkOut);
                const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / 86400000));
                return (p ? p.price : 0) * (isNaN(nights) ? 1 : nights);
            })();
            const estimatedTotal = stayTotal + cautionFee;

            if(!p || !guest || !phone || isNaN(paid)) {
                 this.showNotification("Please fill in all required details (Name, Phone, Amount)", "error"); return;
            }

            const todayIso = this.getTodayIsoDate();
            if (!checkIn || !checkOut || checkIn < todayIso) {
                this.showNotification("Check-in date cannot be before today.", "error");
                return;
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
                propId: p.id, amount: paid, estimatedTotal, cautionFee, guest: guest, phone: phone, email: email, accessCode: doorCode, checkIn, checkOut, createdAt: new Date().toISOString()
            };
            this.transactions.push(transaction);
            this.updateRaffleGuestCountFromBookings();

            this.saveLocalData();
            if (this.activeModalMode === 'guest') {
                const authUser = await this.getAuthenticatedUser().catch(() => null);
                if (!authUser) {
                    await this.saveGuestBookingToCloud(transaction);
                }
            }
            closeModalById('bookingModal');
            
            // Populate and Show the Beautiful Receipt Modal
            const receiptData = this.getTransactionReceiptData(transaction);
            this.populateReceiptModal(receiptData);
            
            if(this.activeModalMode === 'guest') {
                this.openRewardModal(transaction, receiptData);
                this.showNotification("Booking confirmed. Your bonus spin is ready.", "success");
            } else {
                document.getElementById('receiptModal').style.display = 'flex';
                setTimeout(() => document.getElementById('receiptModal').classList.add('show'), 10);
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

            // Put markers only for the properties visible to the current map context
            this.getMapInventoryRecords(elementId).forEach(p => {
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
