const loggedInUser = localStorage.getItem("loggedInUser");
    const loggedInEmail = localStorage.getItem("loggedInEmail");

    if (!loggedInUser) {
        window.location.href = "SignUp.html";
    }

    function getUserData() {
        return loggedInEmail ? JSON.parse(localStorage.getItem(loggedInEmail) || "{}") : {};
    }

    function populateStatus() {
        const user = getUserData();
        document.getElementById("statusUsername").textContent = loggedInUser || "—";
        document.getElementById("statusEmail").textContent = loggedInEmail || "—";
        document.getElementById("lastUpdated").textContent = user.lastUpdated || "Never";
        document.getElementById("setUsername").value = loggedInUser || "";
        document.getElementById("setEmail").value = loggedInEmail || "";
    }

    populateStatus();

    const prefs = JSON.parse(localStorage.getItem("resonusPrefs") || "{}");
    document.getElementById("prefTransitions").checked = !!prefs.disableTransitions;
    document.getElementById("prefSoundEffects").checked = !!prefs.disableSoundEffects;
    document.getElementById("prefDarkMode").checked = !!prefs.darkMode;

    ["prefTransitions", "prefSoundEffects", "prefDarkMode"].forEach(id => {
        document.getElementById(id).addEventListener("change", savePrefs);
    });

    function savePrefs() {
        localStorage.setItem("resonusPrefs", JSON.stringify({
            disableTransitions: document.getElementById("prefTransitions").checked,
            disableSoundEffects: document.getElementById("prefSoundEffects").checked,
            darkMode: document.getElementById("prefDarkMode").checked
        }));
    }

    let editing = false;

    function toggleEdit() {
        editing = !editing;
        const inputs = ["setUsername", "setEmail", "setPassword", "setConfirm"];
        inputs.forEach(id => {
            document.getElementById(id).disabled = !editing;
        });
        document.getElementById("editToggle").textContent = editing ? "{ Editing... }" : "{ Edit Information }";
        document.getElementById("settingsMsg").textContent = "";
    }

    function cancelEdit() {
        editing = false;
        ["setUsername", "setEmail", "setPassword", "setConfirm"].forEach(id => {
            document.getElementById(id).disabled = true;
        });
        document.getElementById("setPassword").value = "";
        document.getElementById("setConfirm").value = "";
        document.getElementById("editToggle").textContent = "{ Edit Information }";
        document.getElementById("settingsMsg").textContent = "";
        populateStatus();
    }

    function saveChanges() {
        if (!editing) {
            document.getElementById("settingsMsg").innerHTML = "<span class='error'>Click 'Edit Information' first.</span>";
            return;
        }

        const newUsername = document.getElementById("setUsername").value.trim();
        const newEmail    = document.getElementById("setEmail").value.trim();
        const newPassword = document.getElementById("setPassword").value;
        const confirmPw   = document.getElementById("setConfirm").value;

        if (!newUsername || !newEmail) {
            document.getElementById("settingsMsg").innerHTML = "<span class='error'>Username and email cannot be empty.</span>";
            return;
        }

        if (newPassword && newPassword !== confirmPw) {
            document.getElementById("settingsMsg").innerHTML = "<span class='error'>Passwords do not match.</span>";
            return;
        }

        const oldData = getUserData();
        const finalPassword = newPassword || oldData.password;
        const now = new Date().toLocaleDateString("en-US");

        const updatedData = { username: newUsername, password: finalPassword, lastUpdated: now };

        if (newEmail !== loggedInEmail) {
            localStorage.removeItem(loggedInEmail);
        }
        localStorage.setItem(newEmail, JSON.stringify(updatedData));
        localStorage.setItem("loggedInUser", newUsername);
        localStorage.setItem("loggedInEmail", newEmail);

        logActivity("Updated account information");
        document.getElementById("settingsMsg").innerHTML = "<span class='success'>Changes saved!</span>";
        cancelEdit();
        populateStatus();
    }

    function deleteAccount() {
        const confirmed = confirm("Are you sure you want to delete your account? This cannot be undone.");
        if (!confirmed) return;

        if (loggedInEmail) localStorage.removeItem(loggedInEmail);
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("loggedInEmail");
        localStorage.removeItem("userNotes");
        localStorage.removeItem("recentActivity");

        alert("Your account has been deleted.");
        window.location.href = "SignUp.html";
    }

    let revealed = false;
    function toggleReveal() {
        const user = getUserData();
        const el = document.getElementById("statusPassword");
        const btn = document.querySelector(".reveal-btn");
        if (!revealed) {
            el.textContent = user.password || "—";
            btn.textContent = "{ Hide Password }";
        } else {
            el.textContent = "••••••";
            btn.textContent = "{ Reveal Password }";
        }
        revealed = !revealed;
    }

    function logActivity(text) {
        const activities = JSON.parse(localStorage.getItem("recentActivity") || "[]");
        activities.unshift({ text, time: new Date().toLocaleString() });
        if (activities.length > 10) activities.pop();
        localStorage.setItem("recentActivity", JSON.stringify(activities));
    }