// Navigation mobile
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }

    // Fermer le menu en cliquant sur un lien
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
            }
        });
    });

    // Gestion du formulaire de réservation
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        initializeBookingForm();
    }

    // Gestion du tableau de bord
    initializeDashboard();

    // Animation au défilement
    initializeScrollAnimations();
});

// Formulaire de réservation
function initializeBookingForm() {
    const roomOptions = document.querySelectorAll('.room-option');
    const roomTypeInput = document.getElementById('roomType');
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const priceSummary = document.getElementById('priceSummary');
    const roomTypeDisplay = document.getElementById('roomTypeDisplay');
    const nightsCount = document.getElementById('nightsCount');
    const totalPrice = document.getElementById('totalPrice');

    // Définir la date minimale (aujourd'hui)
    const today = new Date().toISOString().split('T')[0];
    if (checkinInput) checkinInput.min = today;
    if (checkoutInput) checkoutInput.min = today;

    // Sélection de chambre
    roomOptions.forEach(option => {
        option.addEventListener('click', function() {
            roomOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            roomTypeInput.value = this.dataset.type;
            updatePriceCalculation();
        });
    });

    // Calcul du prix
    function updatePriceCalculation() {
        const checkin = new Date(checkinInput.value);
        const checkout = new Date(checkoutInput.value);
        
        if (checkinInput.value && checkoutInput.value && checkin < checkout) {
            const timeDiff = checkout.getTime() - checkin.getTime();
            const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
            const selectedRoom = document.querySelector('.room-option.selected');
            
            if (selectedRoom) {
                const roomPrice = parseInt(selectedRoom.dataset.price);
                const total = nights * roomPrice;

                roomTypeDisplay.textContent = selectedRoom.querySelector('h4').textContent;
                nightsCount.textContent = `${nights} nuit(s)`;
                totalPrice.textContent = `${total}€`;
                
                priceSummary.style.display = 'block';
            }
        } else {
            priceSummary.style.display = 'none';
        }
    }

    // Événements pour le calcul du prix
    if (checkinInput) checkinInput.addEventListener('change', updatePriceCalculation);
    if (checkoutInput) checkoutInput.addEventListener('change', updatePriceCalculation);

    // Soumission du formulaire
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validation
            if (!roomTypeInput.value) {
                alert('Veuillez sélectionner un type de chambre.');
                return;
            }

            // Simulation d'envoi
            const formData = new FormData(this);
            const reservationData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                checkin: formData.get('checkin'),
                checkout: formData.get('checkout'),
                roomType: formData.get('roomType')
            };

            // Sauvegarder dans le localStorage
            saveReservation(reservationData);
            
            // Redirection
            alert('Réservation confirmée ! Vous allez être redirigé vers le tableau de bord.');
            window.location.href = 'tableau-de-bord.html';
        });
    }
}

// Sauvegarde des réservations
function saveReservation(reservationData) {
    let reservations = JSON.parse(localStorage.getItem('hotelReservations')) || [];
    reservationData.id = Date.now();
    reservationData.status = 'confirmée';
    reservations.push(reservationData);
    localStorage.setItem('hotelReservations', JSON.stringify(reservations));
}

// Tableau de bord
function initializeDashboard() {
    const navItems = document.querySelectorAll('.nav-item');
    const dashboardSections = document.querySelectorAll('.dashboard-section');

    // Navigation du tableau de bord
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Retirer la classe active de tous les éléments
            navItems.forEach(nav => nav.classList.remove('active'));
            dashboardSections.forEach(section => section.classList.remove('active'));
            
            // Ajouter la classe active à l'élément cliqué
            this.classList.add('active');
            
            // Afficher la section correspondante
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Charger les réservations
    loadReservations();
}

function loadReservations() {
    const reservations = JSON.parse(localStorage.getItem('hotelReservations')) || [];
    const reservationsList = document.querySelector('.reservations-list');
    
    if (reservationsList && reservations.length > 0) {
        reservationsList.innerHTML = reservations.map(reservation => `
            <div class="reservation-card">
                <div class="reservation-header">
                    <h3>${getRoomName(reservation.roomType)}</h3>
                    <span class="status confirmed">${reservation.status}</span>
                </div>
                <div class="reservation-details">
                    <div class="detail">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(reservation.checkin)} - ${formatDate(reservation.checkout)}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-user"></i>
                        <span>${reservation.firstName} ${reservation.lastName}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-envelope"></i>
                        <span>${reservation.email}</span>
                    </div>
                </div>
                <div class="reservation-actions">
                    <button class="btn btn-outline" onclick="editReservation(${reservation.id})">Modifier</button>
                    <button class="btn btn-danger" onclick="cancelReservation(${reservation.id})">Annuler</button>
                </div>
            </div>
        `).join('');
    }
}

function getRoomName(roomType) {
    const roomNames = {
        'standard': 'Chambre Standard',
        'deluxe': 'Chambre Deluxe',
        'suite': 'Suite',
        'presidentielle': 'Suite Présidentielle'
    };
    return roomNames[roomType] || 'Chambre';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function editReservation(id) {
    alert(`Modification de la réservation ${id}`);
    // Implémentation de la modification
}

function cancelReservation(id) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
        let reservations = JSON.parse(localStorage.getItem('hotelReservations')) || [];
        reservations = reservations.filter(res => res.id !== id);
        localStorage.setItem('hotelReservations', JSON.stringify(reservations));
        loadReservations();
        alert('Réservation annulée avec succès.');
    }
}

// Animations au défilement
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observer les éléments à animer
    const animatedElements = document.querySelectorAll('.service-card, .room-card, .testimonial-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Gestion des dates pour le formulaire
function updateMinDates() {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    if (checkinInput && checkoutInput) {
        checkinInput.addEventListener('change', function() {
            if (this.value) {
                const nextDay = new Date(this.value);
                nextDay.setDate(nextDay.getDate() + 1);
                checkoutInput.min = nextDay.toISOString().split('T')[0];
                
                // Réinitialiser la date de départ si elle est antérieure
                if (checkoutInput.value && new Date(checkoutInput.value) < nextDay) {
                    checkoutInput.value = '';
                }
            }
        });
    }
}

// Initialiser la gestion des dates
updateMinDates();

// Gestion de la page contact
function initializeContactPage() {
    const contactForm = document.getElementById('contactForm');
    const messageTextarea = document.getElementById('contactMessage');
    const charCount = document.getElementById('messageCharCount');
    const faqItems = document.querySelectorAll('.faq-item');

    // Compteur de caractères pour le message
    if (messageTextarea && charCount) {
        messageTextarea.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            if (count > 450) {
                charCount.style.color = 'var(--warning-color)';
            } else if (count >= 500) {
                charCount.style.color = 'var(--danger-color)';
                this.value = this.value.substring(0, 500);
                charCount.textContent = '500';
                showToast('Limite de caractères atteinte (500 maximum)', 'error');
            } else {
                charCount.style.color = 'var(--text-light)';
            }
        });
    }

    // FAQ accordéon
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', function() {
                // Fermer tous les autres items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Basculer l'item actuel
                item.classList.toggle('active');
            });
        });
    }

    // Soumission du formulaire de contact
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validation
            const formData = new FormData(this);
            const contactData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                newsletter: formData.get('newsletter') === 'on',
                timestamp: new Date().toISOString()
            };

            // Sauvegarder le message
            saveContactMessage(contactData);
            
            // Afficher confirmation
            showToast('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
            
            // Réinitialiser le formulaire
            this.reset();
            if (charCount) charCount.textContent = '0';
        });
    }
}

// Sauvegarder le message de contact
function saveContactMessage(contactData) {
    let contactMessages = JSON.parse(localStorage.getItem('hotelContactMessages')) || [];
    contactData.id = Date.now();
    contactData.status = 'nouveau';
    contactMessages.push(contactData);
    localStorage.setItem('hotelContactMessages', JSON.stringify(contactMessages));
}

// Afficher les notifications toast
function showToast(message, type = 'success') {
    // Créer l'élément toast s'il n'existe pas
    let toast = document.getElementById('contactToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'contactToast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // Configurer le toast
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    if (type === 'error') {
        toast.classList.add('error');
    } else {
        toast.classList.remove('error');
    }
    
    // Afficher le toast
    toast.classList.add('show');
    
    // Masquer après 5 secondes
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// Initialiser la page contact si on est sur contact.html
if (window.location.pathname.includes('contact.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        initializeContactPage();
    });
}