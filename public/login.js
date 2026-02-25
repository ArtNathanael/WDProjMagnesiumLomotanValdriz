 // REGISTER
    document.getElementById("registerForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const username = document.getElementById("regUsername").value;
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;

        if(localStorage.getItem(email)) {
            document.getElementById("registerMessage").innerHTML =
                "<span class='error'>Account already exists!</span>";
        } else {    
            localStorage.setItem(email, JSON.stringify({username, password}));
            document.getElementById("registerMessage").innerHTML =
                "<span class='success'> Registration successful! </span>";
        }
    });

    // LOGIN
    document.getElementById("loginForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const userData = localStorage.getItem(email);

        if(!userData) {
            document.getElementById("loginMessage").innerHTML =
                "<span class='error'>Account not found!</span>";
        } else {
            const user = JSON.parse(userData);
            if(user.password === password) {
                document.getElementById("loginMessage").innerHTML =
                    "<span class='success'>Login successful! Redirecting...</span>";
                
                setTimeout(() => {
                    localStorage.setItem("loggedInUser", user.username);
                    window.location.href = "Dashboard.html";
                }, 1500);
            } else {
                document.getElementById("loginMessage").innerHTML =
                    "<span class='error'>Incorrect password!</span>";
            }
        }
    });