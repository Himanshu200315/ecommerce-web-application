function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhoneNumber(phoneNumber) {
    return /^[0-9]{10}$/.test(phoneNumber);
}


// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const emailInput = document.getElementById("email");
        const password = document.getElementById("password").value;

        const email = emailInput.value.trim().toLowerCase();

        const message = document.getElementById("message");

        if (!isValidEmail(email)) {

            message.innerHTML = `
                <div class="alert alert-danger">
                    Please enter a valid email address.
                </div>
            `;

            emailInput.focus();
            return;
        }

        try {

            const response = await fetch("/users/login", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            if (!response.ok) {

                const errorMessage = await response.text();

                message.innerHTML = `
                    <div class="alert alert-danger">
                        ${errorMessage}
                    </div>
                `;

                return;
            }

            const data = await response.json();

            localStorage.setItem("token", data.token);
            localStorage.setItem("email", data.email);
            localStorage.setItem("role", data.role);

            message.innerHTML = `
                <div class="alert alert-success">
                    Login successful!
                </div>
            `;

            setTimeout(() => {

                if (data.role === "ADMIN") {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "index.html";
                }

            }, 500);

        } catch (error) {

            message.innerHTML = `
                <div class="alert alert-danger">
                    Something went wrong. Please try again.
                </div>
            `;

            console.error(error);
        }
    });
}


// REGISTER
const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const username =
            document.getElementById("username").value.trim();

        const phoneNumber =
            document.getElementById("phoneNumber").value.trim();

        const emailInput =
            document.getElementById("email");

        const email =
            emailInput.value.trim().toLowerCase();

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("message");

        if (!isValidPhoneNumber(phoneNumber)) {

            message.innerHTML = `
        <div class="alert alert-danger">
            Phone number must be exactly 10 digits.
        </div>
    `;

            document.getElementById("phoneNumber").focus();
            return;
        }

        if (!isValidEmail(email)) {

            message.innerHTML = `
                <div class="alert alert-danger">
                    Please enter a valid email address.
                </div>
            `;

            emailInput.focus();
            return;
        }

        try {

            const response = await fetch("/users/register", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    phoneNumber: phoneNumber,
                    email: email,
                    password: password
                })
            });

            const result = await response.text();

            if (!response.ok) {

                message.innerHTML = `
                    <div class="alert alert-danger">
                        ${result}
                    </div>
                `;

                return;
            }

            message.innerHTML = `
                <div class="alert alert-success">
                    Registration successful. Redirecting to login...
                </div>
            `;

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);

        } catch (error) {

            message.innerHTML = `
                <div class="alert alert-danger">
                    Something went wrong. Please try again.
                </div>
            `;

            console.error(error);
        }
    });
}