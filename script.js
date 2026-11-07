/* ============================================================
   Discover Lesotho – script.js
   ============================================================ */

// ── 1. DARK MODE ─────────────────────────────────────────────
(function () {
    var btn  = document.getElementById("darkToggle");
    var root = document.documentElement;
    var KEY  = "lesotho-theme";

    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);
        if (btn) {
            btn.innerHTML = theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
        }
    }

    // Apply saved preference on load
    applyTheme(localStorage.getItem(KEY) || "light");

    if (btn) {
        btn.addEventListener("click", function () {
            var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
            localStorage.setItem(KEY, next);
            applyTheme(next);
        });
    }
})();


// ── 2. SCROLL REVEAL ─────────────────────────────────────────
(function () {
    var items = document.querySelectorAll(".reveal");
    if (!items.length || !("IntersectionObserver" in window)) {
        // Fallback: show everything immediately
        items.forEach(function (el) { el.classList.add("visible"); });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    items.forEach(function (el) { observer.observe(el); });
})();


// ── 3. ANIMATED STAT COUNTERS ────────────────────────────────
(function () {
    var counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    function animateCounter(el) {
        var target  = parseInt(el.getAttribute("data-target"), 10);
        var suffix  = el.getAttribute("data-suffix") || "";
        var duration = 1600;
        var start    = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            var progress = Math.min((timestamp - start) / duration, 1);
            var eased    = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString() + suffix;
        }
        requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
        counters.forEach(animateCounter);
        return;
    }

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    counters.forEach(function (el) { io.observe(el); });
})();


// ── 4. BACK TO TOP ───────────────────────────────────────────
(function () {
    var btn = document.getElementById("backToTop");
    if (!btn) return;

    window.addEventListener("scroll", function () {
        btn.classList.toggle("visible", window.scrollY > 400);
    });

    btn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
})();


// ── 5. DESTINATION SEARCH + CATEGORY FILTER ──────────────────
(function () {
    var searchBox    = document.getElementById("searchBox");
    var filterBtns   = document.querySelectorAll(".filter-btn");
    var destinations = document.querySelectorAll(".destination");
    var noResults    = document.getElementById("noResults");

    if (!destinations.length) return;

    var currentFilter = "all";
    var currentQuery  = "";

    function applyFilters() {
        var anyVisible = false;

        destinations.forEach(function (card) {
            var matchesQuery    = card.innerText.toLowerCase().includes(currentQuery);
            var matchesCategory = currentFilter === "all" ||
                                  card.getAttribute("data-category") === currentFilter;

            if (matchesQuery && matchesCategory) {
                card.classList.remove("hidden");
                anyVisible = true;
            } else {
                card.classList.add("hidden");
            }
        });

        if (noResults) {
            noResults.style.display = anyVisible ? "none" : "block";
        }
    }

    if (searchBox) {
        searchBox.addEventListener("input", function () {
            currentQuery = this.value.trim().toLowerCase();
            applyFilters();
        });
    }

    filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            filterBtns.forEach(function (b) { b.classList.remove("active"); });
            this.classList.add("active");
            currentFilter = this.getAttribute("data-filter");
            applyFilters();
        });
    });
})();

// Clear search helper (called from inline onclick)
function clearSearch() {
    var searchBox = document.getElementById("searchBox");
    if (searchBox) { searchBox.value = ""; searchBox.dispatchEvent(new Event("input")); }
}


// ── 6. GALLERY FILTER ────────────────────────────────────────
(function () {
    var galleryBtns  = document.querySelectorAll("#galleryGrid ~ .filter-btns .filter-btn, .filter-btns[data-gallery] .filter-btn");
    var galleryItems = document.querySelectorAll(".gallery-item");

    if (!galleryItems.length) return;

    // Find filter buttons that are siblings to the gallery
    var allFilterBtns = document.querySelectorAll(".filter-btn");

    allFilterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            if (!galleryItems.length) return;
            var filter = this.getAttribute("data-filter");
            if (!filter) return;

            galleryItems.forEach(function (item) {
                if (filter === "all" || item.getAttribute("data-category") === filter) {
                    item.classList.remove("hidden");
                } else {
                    item.classList.add("hidden");
                }
            });
        });
    });
})();


// ── 7. GALLERY MODAL WITH NAVIGATION ─────────────────────────
var galleryImages = [];
var currentImageIndex = 0;

(function () {
    // Collect all visible gallery images for navigation
    document.querySelectorAll(".gallery-image").forEach(function (img, idx) {
        galleryImages.push({ src: img.src, caption: img.alt });
    });
})();

function showImage(src, caption) {
    var modal   = document.getElementById("imageModal");
    var preview = document.getElementById("previewImage");
    var capEl   = document.getElementById("previewCaption");

    if (!modal || !preview) return;

    // Find index of clicked image
    for (var i = 0; i < galleryImages.length; i++) {
        if (galleryImages[i].src === src) { currentImageIndex = i; break; }
    }

    preview.src         = src;
    if (capEl) capEl.textContent = caption || "";
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeImage() {
    var modal = document.getElementById("imageModal");
    if (modal) {
        modal.style.display  = "none";
        document.body.style.overflow = "";
    }
}

function navigateGallery(dir) {
    var visibleImages = [];
    document.querySelectorAll(".gallery-item:not(.hidden) .gallery-image").forEach(function (img) {
        visibleImages.push({ src: img.src, caption: img.alt });
    });

    if (!visibleImages.length) return;

    // Find current in visible list
    var preview = document.getElementById("previewImage");
    var currentSrc = preview ? preview.src : "";
    var idx = 0;
    for (var i = 0; i < visibleImages.length; i++) {
        if (visibleImages[i].src === currentSrc) { idx = i; break; }
    }

    idx = (idx + dir + visibleImages.length) % visibleImages.length;
    var next = visibleImages[idx];

    if (preview) preview.src = next.src;
    var capEl = document.getElementById("previewCaption");
    if (capEl) capEl.textContent = next.caption || "";
}

// Close modal on Escape key, navigate with arrow keys
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeImage();
    if (e.key === "ArrowRight") navigateGallery(1);
    if (e.key === "ArrowLeft")  navigateGallery(-1);
});


// ── 9. AUTH – TAB SWITCHING ──────────────────────────────────
function switchAuthTab(tab) {
    var loginPane    = document.getElementById("pane-login");
    var registerPane = document.getElementById("pane-register");
    var loginTab     = document.getElementById("tab-login");
    var registerTab  = document.getElementById("tab-register");

    if (!loginPane) return;

    if (tab === "login") {
        loginPane.style.display    = "";
        registerPane.style.display = "none";
        loginTab.classList.add("active");
        loginTab.setAttribute("aria-selected", "true");
        registerTab.classList.remove("active");
        registerTab.setAttribute("aria-selected", "false");
    } else {
        registerPane.style.display = "";
        loginPane.style.display    = "none";
        registerTab.classList.add("active");
        registerTab.setAttribute("aria-selected", "true");
        loginTab.classList.remove("active");
        loginTab.setAttribute("aria-selected", "false");
    }
}


// ── 10. AUTH – SHOW/HIDE PASSWORD ────────────────────────────
function togglePw(inputId, btn) {
    var input = document.getElementById(inputId);
    if (!input) return;
    var isText = input.type === "text";
    input.type = isText ? "password" : "text";
    btn.textContent = isText ? "👁" : "🙈";
    btn.setAttribute("aria-label", isText ? "Show password" : "Hide password");
}


// ── 11. AUTH – PASSWORD STRENGTH METER ───────────────────────
function updateStrength(pw) {
    var fill  = document.getElementById("strengthFill");
    var label = document.getElementById("strengthLabel");
    if (!fill || !label) return;

    var score = 0;
    if (pw.length >= 8)                      score++;
    if (/[A-Z]/.test(pw))                    score++;
    if (/[0-9]/.test(pw))                    score++;
    if (/[^A-Za-z0-9]/.test(pw))            score++;
    if (pw.length >= 12)                     score++;

    var levels = [
        { pct: "0%",   color: "#ccc",    text: "" },
        { pct: "25%",  color: "#e74c3c", text: "Weak" },
        { pct: "50%",  color: "#f39c12", text: "Fair" },
        { pct: "75%",  color: "#2ecc71", text: "Good" },
        { pct: "100%", color: "#1a7a40", text: "Strong 💪" }
    ];

    var lvl = pw.length === 0 ? levels[0] : levels[Math.min(score, 4)];
    fill.style.width      = lvl.pct;
    fill.style.background = lvl.color;
    label.textContent     = lvl.text;
    label.style.color     = lvl.color;
}


// ── 12. AUTH – FORGOT PASSWORD ───────────────────────────────
function showForgot() {
    var email = prompt("Enter your registered email address and we'll send a reset link:");
    if (!email) return;
    if (!/\S+@\S+\.\S+/.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }
    alert("✅ If that email is registered, a reset link has been sent to:\n" + email);
}


// ── 13. AUTH – USER STORAGE HELPERS ─────────────────────────
var USERS_KEY    = "lesothoUsers";
var SESSION_KEY  = "lesothoSession";

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}
function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

// Show logged-in state if already signed in
(function () {
    var session = getSession();
    if (session) showLoggedInState(session);
})();

function showLoggedInState(user) {
    var loginPane = document.getElementById("pane-login");
    var regPane   = document.getElementById("pane-register");
    var tabRow    = document.querySelector(".auth-tabs");
    if (!loginPane) return;

    var greeting =
        '<div class="logged-in-banner">' +
        '  <div class="logged-in-avatar">' + initials(user.firstName, user.lastName) + '</div>' +
        '  <div>' +
        '    <strong>Welcome back, ' + user.firstName + '! 👋</strong>' +
        '    <p>You\'re signed in as <em>' + user.email + '</em></p>' +
        '  </div>' +
        '</div>' +
        '<button class="btn btn-outline-danger btn-sm mt-3" onclick="signOut()">Sign Out</button>';

    loginPane.innerHTML  = greeting;
    if (regPane)   regPane.style.display  = "none";
    if (tabRow)    tabRow.style.display   = "none";
}

function initials(first, last) {
    return ((first || "?")[0] + (last || "?")[0]).toUpperCase();
}

function signOut() {
    clearSession();
    location.reload();
}


// ── 14. AUTH – REGISTER ──────────────────────────────────────
(function () {
    var form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        var firstName = document.getElementById("regFirstName").value.trim();
        var lastName  = document.getElementById("regLastName").value.trim();
        var email     = document.getElementById("regEmail").value.trim().toLowerCase();
        var phone     = document.getElementById("regPhone").value.trim();
        var country   = document.getElementById("regCountry").value;
        var password  = document.getElementById("regPassword").value;
        var confirm   = document.getElementById("regConfirm").value;
        var newsletter = document.getElementById("regNewsletter").checked;
        var feedback  = document.getElementById("registerFeedback");

        // Password match check
        if (password !== confirm) {
            feedback.innerHTML = '<div class="alert alert-danger">❌ Passwords do not match.</div>';
            return;
        }

        // Duplicate email check
        var users = getUsers();
        if (users.find(function (u) { return u.email === email; })) {
            feedback.innerHTML =
                '<div class="alert alert-warning">⚠️ An account with that email already exists. ' +
                '<a href="#" onclick="switchAuthTab(\'login\'); return false;">Sign in instead →</a></div>';
            return;
        }

        // Simple hash (XOR obfuscation — purely for demo; not cryptographic)
        var stored = btoa(unescape(encodeURIComponent(password)));

        var newUser = {
            firstName: firstName,
            lastName:  lastName,
            email:     email,
            phone:     phone,
            country:   country,
            password:  stored,
            newsletter: newsletter,
            joined:    new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);
        setSession({ firstName: firstName, lastName: lastName, email: email });

        feedback.innerHTML =
            '<div class="alert alert-success">' +
            '🎉 Welcome, <strong>' + firstName + '</strong>! Your account has been created.<br>' +
            'You are now signed in.' +
            '</div>';

        form.reset();
        document.getElementById("strengthFill").style.width = "0%";
        document.getElementById("strengthLabel").textContent = "";

        setTimeout(function () { showLoggedInState({ firstName: firstName, lastName: lastName, email: email }); }, 1200);
    });
})();


// ── 15. AUTH – SIGN IN ───────────────────────────────────────
(function () {
    var form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        var email    = document.getElementById("loginEmail").value.trim().toLowerCase();
        var password = document.getElementById("loginPassword").value;
        var remember = document.getElementById("rememberMe").checked;
        var feedback = document.getElementById("loginFeedback");
        var users    = getUsers();
        var stored   = btoa(unescape(encodeURIComponent(password)));

        var match = users.find(function (u) {
            return u.email === email && u.password === stored;
        });

        if (!match) {
            feedback.innerHTML =
                '<div class="alert alert-danger">❌ Incorrect email or password. Please try again.</div>';
            return;
        }

        setSession({ firstName: match.firstName, lastName: match.lastName, email: match.email });

        if (remember) {
            localStorage.setItem("lesothoRemember", email);
        } else {
            localStorage.removeItem("lesothoRemember");
        }

        feedback.innerHTML =
            '<div class="alert alert-success">' +
            '✅ Welcome back, <strong>' + match.firstName + '</strong>!' +
            '</div>';

        form.reset();
        setTimeout(function () { showLoggedInState(match); }, 900);
    });

    // Pre-fill remembered email
    var remembered = localStorage.getItem("lesothoRemember");
    if (remembered) {
        var emailInput = document.getElementById("loginEmail");
        if (emailInput) emailInput.value = remembered;
        var cb = document.getElementById("rememberMe");
        if (cb) cb.checked = true;
    }
})();

(function () {
    var form = document.getElementById("bookingForm");
    if (!form) return;

    // Set min date to today
    var dateInput = document.getElementById("date");
    if (dateInput) {
        var today = new Date().toISOString().split("T")[0];
        dateInput.setAttribute("min", today);
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        var booking = {
            name:          document.getElementById("name").value,
            email:         document.getElementById("email").value,
            phone:         document.getElementById("phone").value,
            date:          document.getElementById("date").value,
            guests:        (document.getElementById("guests") || {}).value || "2",
            destination:   document.getElementById("destination").value,
            accommodation: (document.getElementById("accommodation") || {}).value || "",
            message:       (document.getElementById("message") || {}).value || ""
        };

        var bookings = JSON.parse(localStorage.getItem("tourismBookings") || "[]");
        bookings.push(booking);
        localStorage.setItem("tourismBookings", JSON.stringify(bookings));

        document.getElementById("feedback").innerHTML =
            '<div class="alert alert-success">' +
            '✅ Thank you, <strong>' + booking.name + '</strong>! ' +
            'Your booking enquiry for <strong>' + booking.destination + '</strong> ' +
            'on <strong>' + booking.date + '</strong> has been saved. ' +
            'We will contact you at <strong>' + booking.email + '</strong> within 24 hours.' +
            '</div>';

        form.reset();
        window.scrollTo({ top: document.getElementById("feedback").offsetTop - 80, behavior: "smooth" });
    });
})();
