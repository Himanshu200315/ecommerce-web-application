async function loadComponent(elementId, path) {
    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    try {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(`Failed to load ${path}`);
        }

        element.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
    }
}

async function setupNavbar() {
    const role = localStorage.getItem("role");

    const navbarPath =
        role === "ADMIN"
            ? "components/admin-navbar.html"
            : "components/user-navbar.html";

    await loadComponent("navbar", navbarPath);

    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "login.html";
        });
    }

    if (role !== "ADMIN") {
        await loadCartCount();
    }
}

async function loadCartCount() {
    const cartCount = document.getElementById("cartCount");
    const token = localStorage.getItem("token");

    if (!cartCount || !token) {
        return;
    }

    try {
        const response = await fetch("/cart/items", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return;
        }

        const cartItems = await response.json();

        const count = cartItems.reduce(
            (total, item) => total + item.quantity,
            0
        );

        cartCount.textContent = count;
    } catch (error) {
        console.error(error);
    }
}

async function setupFooter() {
    await loadComponent("footer", "components/footer.html");
}

async function initializeComponents() {
    await setupNavbar();
    await setupFooter();

    window.dispatchEvent(new Event("componentsLoaded"));
}

initializeComponents();