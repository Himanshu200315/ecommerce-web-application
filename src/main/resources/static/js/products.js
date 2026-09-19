
// PRODUCT PAGE VARIABLES
let currentPage = 0;
const pageSize = 6;

let currentSearch = "";
let currentSort = "";

const token = localStorage.getItem("token");
// CHECK LOGIN
if (!token) {
    window.location.href = "login.html";
}



// LOAD PRODUCTS
async function loadProducts() {

    const productContainer =
        document.getElementById("productContainer");

    const message =
        document.getElementById("message");

    productContainer.innerHTML = `
        <div class="text-center">
            <p>Loading products...</p>
        </div>
    `;

    try {

        let url = `/products?page=${currentPage}&size=${pageSize}`;

        // Search
        if (currentSearch.trim() !== "") {
            url = `/products/search?name=${encodeURIComponent(currentSearch)}&page=${currentPage}&size=${pageSize}`;
        }

        // Sorting
        if (currentSort !== "") {
            url += `&sort=${currentSort}`;
        }

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        const data = await response.json();

        displayProducts(data.content);

        updatePagination(data);

        message.innerHTML = "";

    } catch (error) {

        console.error(error);

        productContainer.innerHTML = "";

        message.innerHTML = `
            <div class="alert alert-danger">
                Unable to load products. Please try again.
            </div>
        `;
    }
}


// DISPLAY PRODUCTS
function displayProducts(products) {

    const productContainer =
        document.getElementById("productContainer");

    if (products.length === 0) {

        productContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info text-center">
                    No products found.
                </div>
            </div>
        `;

        return;
    }

    productContainer.innerHTML = "";

    products.forEach(product => {
        const image = product.imageUrl
            ? `<img src="${escapeHtml(product.imageUrl)}"
                alt="${escapeHtml(product.name)}">`
            : `<div class="product-placeholder">
                ${getProductIcon(product)}
           </div>`;

        productContainer.innerHTML += `
        <div class="col-sm-6 col-lg-4 col-xl-3">
            <div class="card product-card h-100 border-0 shadow-sm">

                <div class="product-image">
                    ${image}
                </div>

                <div class="card-body d-flex flex-column">

                    <span class="badge bg-light text-dark align-self-start mb-2">
                        ${escapeHtml(product.category)}
                    </span>

                    <h5 class="card-title">
                        ${escapeHtml(product.name)}
                    </h5>

                    <p class="card-text text-muted small">
                        ${escapeHtml(product.description)}
                    </p>

                    <div class="mt-auto">
                        <h5 class="fw-bold mb-3">
                            ₹${Number(product.price).toLocaleString("en-IN")}
                        </h5>

                        <button
                            class="btn btn-primary w-100"
                            onclick="addToCart(${product.id})">
                            Add to Cart
                        </button>
                    </div>

                </div>
            </div>
        </div>
    `;
    });
}
function getProductIcon(product) {
    const name = String(product.name || "").toLowerCase();
    const category = String(product.category || "").toLowerCase();

    if (name.includes("mobile") || name.includes("phone")) {
        return "📱";
    }

    if (name.includes("mouse")) {
        return "🖱️";
    }

    if (name.includes("keyboard")) {
        return "⌨️";
    }

    if (name.includes("monitor")) {
        return "🖥️";
    }

    if (name.includes("laptop")) {
        return "💻";
    }

    if (name.includes("speaker")) {
        return "🔊";
    }

    if (name.includes("headphone") || name.includes("earphone")) {
        return "🎧";
    }

    if (category.includes("fashion")) {
        return "👕";
    }

    if (category.includes("shoe")) {
        return "👟";
    }

    if (category.includes("book")) {
        return "📚";
    }

    return "🛍️";
}


// PAGINATION
function updatePagination(data) {

    const pageNumber =
        document.getElementById("pageNumber");

    const previousButton =
        document.getElementById("previousButton");

    const nextButton =
        document.getElementById("nextButton");

    pageNumber.textContent =
        `Page ${data.number + 1}`;

    previousButton.disabled =
        data.first;

    nextButton.disabled =
        data.last;
}



// PREVIOUS PAGE
document
    .getElementById("previousButton")
    .addEventListener("click", function () {

        if (currentPage > 0) {

            currentPage--;

            loadProducts();
        }
    });



// NEXT PAGE
document
    .getElementById("nextButton")
    .addEventListener("click", function () {

        currentPage++;

        loadProducts();
    });



// SEARCH
document
    .getElementById("searchInput")
    .addEventListener("input", function () {

        currentSearch = this.value;

        currentPage = 0;

        loadProducts();
    });



// SORT
document
    .getElementById("sortSelect")
    .addEventListener("change", function () {

        currentSort = this.value;

        currentPage = 0;

        loadProducts();
    });


// ADD TO CART
async function addToCart(productId) {

    try {

        const response = await fetch("/cart/items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {

            const errorMessage =
                await response.text();

            alert(errorMessage);

            return;
        }

        showToast("Product added to cart successfully.");
        loadCartCount();

    } catch (error) {

        console.error(error);

        alert("Unable to add product to cart");
    }
}

// HTML ESCAPE
function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}





async function loadCartCount() {
    const cartCount = document.getElementById("cartCount");

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

// INITIAL LOAD
loadProducts();

window.addEventListener("componentsLoaded", () => {
    const role = localStorage.getItem("role");
    const adminLink = document.getElementById("adminLink");

    if (role === "ADMIN" && adminLink) {
        adminLink.classList.remove("d-none");
    }

    loadCartCount();
});