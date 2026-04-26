// ── REGISTER ──
document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("regUsername").value.trim();
    const email    = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;

    if (!username || !email || !password) {
        document.getElementById("registerMessage").innerHTML =
            "<span class='error'>Please fill in all fields.</span>";
        return;
    }

    if (localStorage.getItem(email)) {
        document.getElementById("registerMessage").innerHTML =
            "<span class='error'>An account with this email already exists.</span>";
        return;
    }

    const now = new Date().toLocaleDateString("en-US");
    localStorage.setItem(email, JSON.stringify({ username, password, lastUpdated: now }));

    document.getElementById("registerMessage").innerHTML =
        "<span class='success'>Registration successful! You can now log in.</span>";

    logActivity("Registered account");
    document.getElementById("registerForm").reset();
});

// ── LOGIN ──
document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email    = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const rawData = localStorage.getItem(email);

    if (!rawData) {
        document.getElementById("loginMessage").innerHTML =
            "<span class='error'>No account found with that email.</span>";
        return;
    }

    const user = JSON.parse(rawData);

    if (user.password === password) {
        document.getElementById("loginMessage").innerHTML =
            "<span class='success'>Login successful! Redirecting…</span>";

        localStorage.setItem("loggedInUser",  user.username);
        localStorage.setItem("loggedInEmail", email);

        logActivity("Logged in");

        setTimeout(() => {
            window.location.href = "Dashboard.html";
        }, 1200);
    } else {
        document.getElementById("loginMessage").innerHTML =
            "<span class='error'>Incorrect password. Please try again.</span>";
    }
});

// ── Shared activity logger ──
function logActivity(text) {
    const activities = JSON.parse(localStorage.getItem("recentActivity") || "[]");
    activities.unshift({ text, time: new Date().toLocaleString() });
    if (activities.length > 10) activities.pop();
    localStorage.setItem("recentActivity", JSON.stringify(activities));
}