/**
 * ============================================================================
 * EXPLORE LESOTHO - MODERN JAVASCRIPT CONTROLLER
 * Interactive Features: Filtering, Lightbox, Dynamic Calculator, Dark Mode, Storage
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initDestinationFilters();
    initGalleryModal();
    initBookingCalculator();
    initForms();
    initServiceModals();
    initBackToTop();
    initUrlParams();
});

/* ==========================================================================
   1. THEME CONTROLLER (Dark / Light Mode)
   ========================================================================== */
function initTheme() {
    const savedTheme = localStorage.getItem("lesothoTheme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    if (isDark) {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }

    // Insert toggle button if not already present
    let toggleBtn = document.getElementById("themeToggleBtn");
    if (!toggleBtn) {
        const navContainer = document.querySelector(".navbar .navbar-nav");
        if (navContainer) {
            const li = document.createElement("li");
            li.className = "nav-item d-flex align-items-center ms-lg-2 my-2 my-lg-0";
            li.innerHTML = `
                <button type="button" id="themeToggleBtn" class="btn-theme-toggle" aria-label="Toggle theme">
                    <i class="bi ${isDark ? 'bi-sun-fill' : 'bi-moon-stars-fill'}"></i>
                    <span class="theme-label">${isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            `;
            navContainer.parentNode.appendChild(li);
            toggleBtn = document.getElementById("themeToggleBtn");
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");
            const currentlyDark = document.body.classList.contains("dark-mode");
            localStorage.setItem("lesothoTheme", currentlyDark ? "dark" : "light");
            
            const icon = toggleBtn.querySelector("i");
            const label = toggleBtn.querySelector(".theme-label");
            if (icon) {
                icon.className = currentlyDark ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
            }
            if (label) {
                label.textContent = currentlyDark ? "Light Mode" : "Dark Mode";
            }
        });
    }
}

/* ==========================================================================
   2. DESTINATION SEARCH & CATEGORY FILTERING
   ========================================================================== */
function initDestinationFilters() {
    const searchInput = document.getElementById("destinationSearch");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const destinationCards = document.querySelectorAll(".destination-card");
    const noResults = document.getElementById("noResults");

    if (!searchInput && filterButtons.length === 0) return;

    let activeFilter = "all";

    function filterDestinations() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        let visibleCount = 0;

        destinationCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const category = card.dataset.category || "";

            const matchesCategory = activeFilter === "all" || category === activeFilter;
            const matchesQuery = query === "" || cardText.includes(query);

            if (matchesCategory && matchesQuery) {
                card.style.display = "";
                card.classList.add("animate-in");
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (noResults) {
            noResults.hidden = visibleCount > 0;
            if (visibleCount === 0) {
                noResults.innerHTML = `
                    <div class="py-4 text-center">
                        <i class="bi bi-search display-6 text-muted mb-2 d-block"></i>
                        <h5>No destinations match your criteria</h5>
                        <p class="text-muted">Try clearing your search keyword or switching category filter.</p>
                        <button class="btn btn-outline-success btn-sm mt-2" onclick="resetFilters()">Reset Search</button>
                    </div>
                `;
            }
        }
    }

    window.resetFilters = function() {
        if (searchInput) searchInput.value = "";
        activeFilter = "all";
        filterButtons.forEach(btn => {
            btn.classList.remove("btn-success");
            btn.classList.add("btn-outline-success");
            if (btn.dataset.filter === "all") {
                btn.classList.add("btn-success");
                btn.classList.remove("btn-outline-success");
            }
        });
        filterDestinations();
    };

    if (searchInput) {
        searchInput.addEventListener("input", filterDestinations);
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter;
            filterButtons.forEach(btn => {
                btn.classList.remove("btn-success");
                btn.classList.add("btn-outline-success");
            });
            button.classList.remove("btn-outline-success");
            button.classList.add("btn-success");
            filterDestinations();
        });
    });
}

/* ==========================================================================
   3. GALLERY LIGHTBOX MODAL WITH KEYBOARD NAVIGATION
   ========================================================================== */
let currentGalleryIndex = 0;
const galleryImages = [];

function initGalleryModal() {
    const images = document.querySelectorAll(".gallery-img, .gallery-item");
    if (!images.length) return;

    // Collect images
    images.forEach((imgWrapper, index) => {
        const img = imgWrapper.tagName === 'IMG' ? imgWrapper : imgWrapper.querySelector('img');
        if (!img) return;
        
        galleryImages.push({
            src: img.src,
            alt: img.alt || "Lesotho Tourism Scene",
            title: img.dataset.title || img.alt || "Explore Lesotho",
            category: img.dataset.category || "Landscape"
        });

        imgWrapper.addEventListener("click", () => {
            openGallery(index);
        });
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        const modalEl = document.getElementById("galleryModal");
        if (!modalEl || !modalEl.classList.contains("show")) return;

        if (e.key === "ArrowLeft") {
            changeGallery(-1);
        } else if (e.key === "ArrowRight") {
            changeGallery(1);
        }
    });
}

function openGallery(index) {
    if (!galleryImages.length) return;
    currentGalleryIndex = index;
    displayGalleryImage();

    const modalEl = document.getElementById("galleryModal");
    if (modalEl && window.bootstrap) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}

function displayGalleryImage() {
    if (!galleryImages.length) return;
    const current = galleryImages[currentGalleryIndex];

    const previewImg = document.getElementById("previewImage");
    const previewCaption = document.getElementById("previewCaption");
    const previewCategory = document.getElementById("previewCategory");
    const previewCounter = document.getElementById("previewCounter");

    if (previewImg) {
        previewImg.src = current.src;
        previewImg.alt = current.alt;
    }
    if (previewCaption) {
        previewCaption.textContent = current.title;
    }
    if (previewCategory) {
        previewCategory.textContent = current.category;
    }
    if (previewCounter) {
        previewCounter.textContent = `${currentGalleryIndex + 1} / ${galleryImages.length}`;
    }
}

function changeGallery(direction) {
    if (!galleryImages.length) return;
    currentGalleryIndex = (currentGalleryIndex + direction + galleryImages.length) % galleryImages.length;
    displayGalleryImage();
}

/* ==========================================================================
   4. DYNAMIC BOOKING COST CALCULATOR
   ========================================================================== */
const DESTINATION_RATES = {
    "Maletsunyane Falls": 650,
    "Katse Dam": 550,
    "Sehlabathebe National Park": 950,
    "Thabana Ntlenyana": 850,
    "Sani Pass Mountain Safari": 750,
    "Tsehlanyane National Park": 600,
    "Thaba Bosiu Cultural Village": 450
};

function initBookingCalculator() {
    const peopleInput = document.getElementById("people");
    const priceInput = document.getElementById("tourPrice");
    const destinationSelect = document.getElementById("destination");
    const totalCostDisplay = document.getElementById("totalCost");

    if (!peopleInput || !priceInput || !totalCostDisplay) return;

    function calculateBooking() {
        const people = Math.max(1, Number(peopleInput.value) || 1);
        const price = Math.max(0, Number(priceInput.value) || 0);
        const total = people * price;
        totalCostDisplay.textContent = "M" + total.toLocaleString();
    }

    // Auto-update price when destination changes
    if (destinationSelect) {
        destinationSelect.addEventListener("change", function () {
            const dest = destinationSelect.value;
            for (const key in DESTINATION_RATES) {
                if (dest.includes(key)) {
                    priceInput.value = DESTINATION_RATES[key];
                    break;
                }
            }
            calculateBooking();
        });
    }

    peopleInput.addEventListener("input", calculateBooking);
    priceInput.addEventListener("input", calculateBooking);

    // Set minimum travel date to today
    const travelDate = document.getElementById("travelDate");
    if (travelDate) {
        const today = new Date();
        const localDate = new Date(
            today.getTime() - today.getTimezoneOffset() * 60000
        ).toISOString().split("T")[0];
        travelDate.min = localDate;
    }

    calculateBooking();
}

/* ==========================================================================
   5. BOOKING & CONTACT FORMS WITH LOCALSTORAGE
   ========================================================================== */
function initForms() {
    const bookingForm = document.getElementById("bookingForm");
    const contactForm = document.getElementById("contactForm");

    renderSavedBookings();

    // 1. TOUR BOOKING FORM
    if (bookingForm) {
        bookingForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const nameInput = document.getElementById("bookingName");
            const emailInput = document.getElementById("bookingEmail");
            const phoneInput = document.getElementById("bookingPhone");
            const destInput = document.getElementById("destination");
            const dateInput = document.getElementById("travelDate");
            const peopleInput = document.getElementById("people");
            const priceInput = document.getElementById("tourPrice");
            const msgBox = document.getElementById("bookingMessage");

            const name = nameInput ? nameInput.value.trim() : "";
            const email = emailInput ? emailInput.value.trim() : "";
            const phone = phoneInput ? phoneInput.value.trim() : "";
            const destination = destInput ? destInput.value : "";
            const date = dateInput ? dateInput.value : "";
            const people = Number(peopleInput ? peopleInput.value : 0) || 0;
            const price = Number(priceInput ? priceInput.value : 0) || 0;

            if (name.length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                msgBox.innerHTML = '<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-triangle-fill me-2"></i>Please enter a valid full name (at least 3 characters) and a valid email address.<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
                if (name.length < 3 && nameInput) nameInput.focus();
                else if (emailInput) emailInput.focus();
                return;
            }

            if (!destination) {
                msgBox.innerHTML = '<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-triangle-fill me-2"></i>Please select a destination from the list.<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
                if (destInput) destInput.focus();
                return;
            }

            if (!date || new Date(date + "T00:00:00") < new Date(new Date().toDateString())) {
                msgBox.innerHTML = '<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-triangle-fill me-2"></i>Please select a valid future travel date.<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
                if (dateInput) dateInput.focus();
                return;
            }

            if (people < 1 || price < 0) {
                msgBox.innerHTML = '<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-triangle-fill me-2"></i>Please enter at least 1 person and a valid tour price.<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
                if (peopleInput) peopleInput.focus();
                return;
            }

            const total = people * price;
            const booking = {
                id: "LES-" + Math.floor(100000 + Math.random() * 900000),
                name: name,
                email: email,
                phone: phone,
                destination: destination,
                date: date,
                people: people,
                price: price,
                total: total,
                totalFormatted: "M" + total.toLocaleString(),
                createdAt: new Date().toLocaleDateString()
            };

            let savedBookings = JSON.parse(localStorage.getItem("lesothoBookings") || "[]");
            savedBookings.unshift(booking);
            localStorage.setItem("lesothoBookings", JSON.stringify(savedBookings));

            msgBox.innerHTML = `
                <div class="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    <strong>Your booking information has been saved successfully!</strong> Reference: <strong>${booking.id}</strong>. Total: <strong>M${total.toLocaleString()}</strong>.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;

            bookingForm.reset();
            const totalCost = document.getElementById("totalCost");
            if (peopleInput && priceInput && totalCost) {
                peopleInput.value = "1";
                priceInput.value = "500";
                totalCost.textContent = "M500";
            }
            renderSavedBookings();
        });
    }

    // 2. CONTACT US FORM
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const nameInput = document.getElementById("contactName");
            const emailInput = document.getElementById("contactEmail");
            const subjectInput = document.getElementById("subject");
            const messageInput = document.getElementById("message");
            const msgBox = document.getElementById("contactMessage");

            const name = nameInput ? nameInput.value.trim() : "";
            const email = emailInput ? emailInput.value.trim() : "";
            const subject = subjectInput ? subjectInput.value.trim() : "";
            const message = messageInput ? messageInput.value.trim() : "";

            if (name.length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                msgBox.innerHTML = '<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-triangle-fill me-2"></i>Please enter a valid name (at least 3 characters) and email address.<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
                if (name.length < 3 && nameInput) nameInput.focus();
                else if (emailInput) emailInput.focus();
                return;
            }

            if (!subject || !message) {
                msgBox.innerHTML = '<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-triangle-fill me-2"></i>Please complete the subject and message fields.<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
                return;
            }

            msgBox.innerHTML = `
                <div class="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    <strong>Thank you!</strong> Your message has been received. Our team will contact you shortly.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;

            contactForm.reset();
        });
    }
}

function renderSavedBookings() {
    const container = document.getElementById("savedBookingsList");
    if (!container) return;

    let savedBookings = JSON.parse(localStorage.getItem("lesothoBookings") || "[]");

    if (!savedBookings.length) {
        container.innerHTML = `
            <div class="text-center py-3 text-muted">
                <i class="bi bi-calendar2-check fs-2 mb-1 d-block text-secondary"></i>
                <small>No reservations saved yet. Submit a booking above to store your trip.</small>
            </div>
        `;
        return;
    }

    let html = '<div class="vstack gap-2">';
    savedBookings.forEach((b, index) => {
        const totalDisp = typeof b.total === "number" ? "M" + b.total.toLocaleString() : (b.totalFormatted || b.total || "M0");
        const refId = b.id || ("LES-" + (index + 1));
        html += `
            <div class="p-3 bg-body-tertiary rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="badge bg-success text-white fw-bold">${refId}</span>
                    <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2" onclick="cancelBooking(${index})" title="Cancel this reservation">
                        <i class="bi bi-trash3"></i> Delete
                    </button>
                </div>
                <h6 class="fw-bold mb-1 text-main">${b.destination || "Lesotho Tour"}</h6>
                <div class="small text-muted mb-2">
                    <span class="me-3"><i class="bi bi-calendar-event me-1"></i>${b.date || "Date unset"}</span>
                    <span class="me-3"><i class="bi bi-people me-1"></i>${b.people || 1} guest(s)</span>
                    <span><i class="bi bi-person me-1"></i>${b.name || "Guest"}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center pt-2 border-top small">
                    <span class="text-muted">Estimated Total:</span>
                    <span class="fw-bold text-success fs-6">${totalDisp}</span>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

window.cancelBooking = function (index) {
    let savedBookings = JSON.parse(localStorage.getItem("lesothoBookings") || "[]");
    if (index >= 0 && index < savedBookings.length) {
        savedBookings.splice(index, 1);
        localStorage.setItem("lesothoBookings", JSON.stringify(savedBookings));
        renderSavedBookings();
    }
};

/* ==========================================================================
   6. SERVICE / ACTIVITY INFORMATION MODAL
   ========================================================================== */
const SERVICE_DATA = {
    "Luxury Hotels": {
        title: "Luxury Hotels & Casino Resorts",
        tag: "Premium Accommodation",
        img: "hotel.jfif",
        desc: "Relax in five-star elegance at premier destinations like Avani Lesotho Hotel & Casino. Features panoramic views of Maseru, heated swimming pools, world-class fine dining restaurants, full-service health spa, and state-of-the-art conference facilities.",
        amenities: ["Free High-Speed Wi-Fi", "Outdoor Heated Pool", "Fine Dining Restaurants", "Spa & Wellness Center", "Airport Shuttle"],
        price: "From M1,850 / night"
    },
    "Mountain Lodges": {
        title: "Scenic Maloti Mountain Lodges",
        tag: "Nature & Alpine Retreat",
        img: "lodge.jfif",
        desc: "Tucked inside indigenous alpine valleys, retreats like Maliba Mountain Lodge in Ts'ehlanyane National Park provide luxury thatched chalets with personal fireplaces, private viewing decks, and natural mountain stream swimming holes.",
        amenities: ["Private Fireplace", "Mountain-view Decks", "Forest Hiking Trails", "Gourmet Meals Included", "Pony Trekking on-site"],
        price: "From M1,400 / night"
    },
    "Camping": {
        title: "High-Altitude Wilderness Camping",
        tag: "Rugged Adventure",
        img: "camp.jfif",
        desc: "Sleep under the clearest starry skies in Africa. Designated wilderness campsites near Katse Dam, Sehlabathebe National Park, and Sani Pass provide secure 4x4 access, potable mountain spring water, and campfire sites.",
        amenities: ["Designated 4x4 Camp Bays", "Braai / Campfire Facilities", "Mountain Spring Water", "Stargazing Hotspots", "Ranger Patrols"],
        price: "From M250 / night per site"
    },
    "Horse Riding": {
        title: "Basotho Pony Trekking",
        tag: "Signature Cultural Adventure",
        img: "zz.jfif",
        desc: "The quintessential Lesotho experience. The hardy Basotho pony has carried travelers through rugged cliffside passes for centuries. Guided multi-hour and multi-day treks wind through isolated mountain villages and gorges.",
        amenities: ["Experienced Local Guide", "Traditional Saddle & Tack", "Helmet & Safety Gear", "Village Cultural Stops"],
        price: "From M350 / person"
    },
    "Hiking": {
        title: "Maloti-Drakensberg Escarpment Trails",
        tag: "Outdoor Wilderness",
        img: "thaba.jfif",
        desc: "Hike Southern Africa's rooftop, including routes leading to the summit of Thabana Ntlenyana (3,482m) and dramatic drops at Sani Pass. Trails cater to day hikers and experienced mountaineers alike.",
        amenities: ["Trail Maps & GPS Tracks", "Certified Mountain Guide", "Emergency Support", "Packed Alpine Lunch option"],
        price: "From M300 / person"
    },
    "Cultural Tours": {
        title: "Living Basotho Cultural Immersion",
        tag: "Heritage & History",
        img: "food.jfif",
        desc: "Step inside authentic mountain villages. Learn the history of King Moshoeshoe I at Thaba Bosiu, discover the significance of the Basotho blanket (Seanamarena), listen to the Lesiba instrument, and taste freshly prepared Papa and Morogo.",
        amenities: ["Village Elder Welcome", "Traditional Cuisine Tasting", "Blanket Ceremony Explanation", "Craft Workshop Visit"],
        price: "From M400 / person"
    }
};

function showService(serviceKey) {
    const data = SERVICE_DATA[serviceKey] || {
        title: serviceKey,
        tag: "Tourism Service",
        img: "leso.jfif",
        desc: "Contact our Lesotho travel team for personalized itineraries, group bookings, and tailored recommendations.",
        amenities: ["Personalized Guide", "Flexible Scheduling", "Local Transport"],
        price: "Custom Quote"
    };

    const titleEl = document.getElementById("serviceTitle");
    const descEl = document.getElementById("serviceDescription");
    const bookLink = document.getElementById("serviceBookLink");

    if (titleEl) titleEl.textContent = data.title;
    if (descEl) {
        let amenitiesHtml = data.amenities ? data.amenities.map(a => `<li><i class="bi bi-check2-circle text-success me-2"></i>${a}</li>`).join("") : "";
        descEl.innerHTML = `
            <div class="mb-3">
                <span class="badge bg-warning text-dark mb-2">${data.tag}</span>
                <p class="mb-3">${data.desc}</p>
                <div class="p-3 bg-body-tertiary rounded mb-3">
                    <h6 class="fw-bold mb-2">Service Highlights & Amenities:</h6>
                    <ul class="list-unstyled mb-0 small">
                        ${amenitiesHtml}
                    </ul>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="text-muted small">Estimated Rate:</span>
                    <span class="fw-bold text-success fs-5">${data.price}</span>
                </div>
            </div>
        `;
    }

    if (bookLink) {
        bookLink.href = `contact.html?dest=${encodeURIComponent(data.title)}`;
    }

    const modalEl = document.getElementById("serviceModal");
    if (modalEl && window.bootstrap) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}

/* ==========================================================================
   7. URL PARAMETER HANDLING (Pre-filling Contact / Booking)
   ========================================================================== */
function initUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const destParam = params.get("dest");
    const serviceParam = params.get("service");

    const destSelect = document.getElementById("destination");
    if (destSelect && destParam) {
        for (let i = 0; i < destSelect.options.length; i++) {
            if (destSelect.options[i].value.toLowerCase().includes(destParam.toLowerCase()) ||
                destParam.toLowerCase().includes(destSelect.options[i].value.toLowerCase())) {
                destSelect.selectedIndex = i;
                destSelect.dispatchEvent(new Event("change"));
                break;
            }
        }
    }

    const subjectInput = document.getElementById("subject");
    if (subjectInput && serviceParam) {
        subjectInput.value = `Inquiry regarding ${serviceParam}`;
    }
}

/* ==========================================================================
   8. BACK TO TOP BUTTON
   ========================================================================== */
function initBackToTop() {
    let btn = document.getElementById("backToTopBtn");
    if (!btn) {
        btn = document.createElement("button");
        btn.id = "backToTopBtn";
        btn.setAttribute("aria-label", "Scroll back to top");
        btn.innerHTML = `<i class="bi bi-arrow-up"></i>`;
        document.body.appendChild(btn);
    }

    window.addEventListener("scroll", () => {
        if (window.scrollY > 350) {
            btn.classList.add("visible");
        } else {
            btn.classList.remove("visible");
        }
    });

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}
