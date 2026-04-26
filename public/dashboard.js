const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        window.location.href = "SignUp.html";
    } else {
        document.getElementById("displayUsername").textContent = loggedInUser;
    }

    const facts = [
        "The oldest known musical instrument is over 40,000 years old.",
        "Mozart wrote his first composition at age five.",
        "Listening to music can improve memory and focus.",
        "Beethoven continued composing even after becoming deaf.",
        "The piano has over 12,000 individual parts.",
        "Music can reduce stress and lower heart rate.",
        "The world's longest concert has been ongoing for over 639 years.",
        "A single violin is made from over 70 pieces of wood.",
        "The word 'music' comes from the Greek word 'mousike'."
    ];

    document.getElementById("randomFact").textContent =
        facts[Math.floor(Math.random() * facts.length)];

    function saveNotes() {
        const content = document.getElementById("notes").value;
        localStorage.setItem("userNotes", content);
        alert("Notes saved!");
    }

    function loadNotes() {
        const saved = localStorage.getItem("userNotes");
        if (saved) document.getElementById("notes").value = saved;
    }

    const ACTIVITY_LINKS = {
        "Completed Quiz": "Games&Quizzes.html",
        "Updated account information": "Settings.html",
        "Registered account": "SignUp.html",
        "default": "Dashboard.html"
    };

    function getLink(text) {
        for (const key in ACTIVITY_LINKS) {
            if (text.includes(key)) return ACTIVITY_LINKS[key];
        }
        if (text.includes("composition") || text.includes("Composition")) return "CreateMusic.html";
        if (text.includes("community") || text.includes("Community")) return "CommunityCreations.html";
        return ACTIVITY_LINKS["default"];
    }

    function renderActivity() {
        const list = document.getElementById("activityList");
        const activities = JSON.parse(localStorage.getItem("recentActivity") || "[]");

        if (activities.length === 0) {
            list.innerHTML = '<li class="no-activity">No recent activity yet.</li>';
            return;
        }

        list.innerHTML = activities.map(a => `
            <li>
                <span class="act-text">• ${a.text}</span>
                <a class="return-link" href="${getLink(a.text)}">{Return}</a>
            </li>
        `).join("");
    }

    window.onload = () => {
        loadNotes();
        renderActivity();
    };