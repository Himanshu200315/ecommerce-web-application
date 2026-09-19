const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const cartContainer = document.getElementById("cartContainer");
const cartSummary = document.getElementById("cartSummary");
const message = document.getElementById("message");

async function loadCart() {
    cartContainer.innerHTML = `
        <div class="text-center py-4">
            <p>Loading cart...</p>
        </div>
    `;

    try {
        const response = await fetch("/cart/items", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            const error = await response.text();
            showPageMessage(error || "Unable to load cart.", "danger");
            return;
        }

        const cartItems = await response.json();

        updateCartCount(cartItems);

        if (cartItems.length === 0) {
            cartContainer.innerHTML = `
                <div class="text-center py-5">
                    <h4>Your cart is empty</h4>
                    <p class="text-muted">
                        Add some products to continue shopping.
                    </p>
                    <a href="products.html" class="btn btn-primary">
                        Continue Shopping
                    </a>
                </div>
            `;

            cartSummary.innerHTML = "";
            return;
        }

        displayCartItems(cartItems);
        displayCartSummary(cartItems);
        message.innerHTML = "";

    } catch (error) {
        console.error(error);

        cartContainer.innerHTML = "";

        showPageMessage(
            "Unable to load cart. Please try again.",
            "danger"
        );
    }
}

function updateCartCount(cartItems) {
    const cartCount = document.getElementById("cartCount");

    if (!cartCount) {
        return;
    }

    const count = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = count;
}

function displayCartItems(cartItems) {
    cartContainer.innerHTML = "";

    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;

        cartContainer.innerHTML += `
            <div class="card mb-3 border-0 shadow-sm">
                <div class="card-body">

                    <div class="row align-items-center g-3">

                        <div class="col-md-3">
                            <h5 class="mb-1">
                                ${escapeHtml(item.productName)}
                            </h5>

                            <p class="text-muted mb-0">
                                ₹${Number(item.price).toLocaleString("en-IN")}
                            </p>
                        </div>

                        <div class="col-md-3">
                            <label
                                for="quantity-${item.cartItemId}"
                                class="form-label">
                                Quantity
                            </label>

                            <div class="d-flex">
                                <input
                                    type="number"
                                    min="1"
                                    value="${item.quantity}"
                                    class="form-control me-2"
                                    id="quantity-${item.cartItemId}">

                                <button
                                    class="btn btn-primary"
                                    onclick="updateCartItem(${item.cartItemId})">
                                    Update
                                </button>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <small class="text-muted">
                                Item Total
                            </small>

                            <p class="fw-bold mb-0">
                                ₹${Number(itemTotal).toLocaleString("en-IN")}
                            </p>
                        </div>

                        <div class="col-md-3 text-md-end">
                            <button
                                class="btn btn-outline-danger"
                                onclick="deleteCartItem(${item.cartItemId})">
                                Remove
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        `;
    });
}

function displayCartSummary(cartItems) {
    const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    cartSummary.innerHTML = `
        <div class="card border-0 shadow-sm">
            <div class="card-body">

                <div class="d-flex justify-content-between align-items-center">
                    <h4 class="mb-0">Total</h4>

                    <h4 class="mb-0">
                        ₹${Number(total).toLocaleString("en-IN")}
                    </h4>
                </div>

                <div class="text-end mt-3">
                    <a
                        href="products.html"
                        class="btn btn-outline-secondary me-2">
                        Continue Shopping
                    </a>

                    <button
                        id="checkoutButton"
                        class="btn btn-success">
                        Place Order
                    </button>
                </div>

            </div>
        </div>
    `;

    document
        .getElementById("checkoutButton")
        .addEventListener("click", placeOrder);
}

async function updateCartItem(cartItemId) {
    const quantityInput =
        document.getElementById(`quantity-${cartItemId}`);

    const quantity = Number(quantityInput.value);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        showToast("Quantity must be greater than 0.", "error");
        return;
    }

    try {
        const response = await fetch(
            `/cart/items/${cartItemId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    quantity
                })
            }
        );

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = "login.html";
            return;
        }

        const result = await response.text();

        if (!response.ok) {
            showToast(
                result || "Unable to update cart item.",
                "error"
            );
            return;
        }

        showToast("Cart quantity updated successfully.");
        await loadCart();

    } catch (error) {
        console.error(error);
        showToast("Unable to update cart item.", "error");
    }
}

async function deleteCartItem(cartItemId) {
    const confirmed = await confirmAction(
        "Remove this item from your cart?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `/cart/items/${cartItemId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = "login.html";
            return;
        }

        const result = await response.text();

        if (!response.ok) {
            showToast(
                result || "Unable to remove cart item.",
                "error"
            );
            return;
        }

        showToast(result || "Cart item removed successfully.");
        await loadCart();

    } catch (error) {
        console.error(error);
        showToast("Unable to remove cart item.", "error");
    }
}

// PLACE ORDER
async function placeOrder() {

    const confirmed =
        confirm("Do you want to place this order?");

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch("/orders", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401 ||
            response.status === 403) {

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

        const order = await response.json();

        document
            .getElementById("orderSuccessModal")
            .classList.add("show");

        document
            .getElementById("viewOrderButton")
            .onclick = function () {

            window.location.href =
                `order-details.html?orderId=${order.orderId}`;
        };

        document
            .getElementById("closeSuccessModal")
            .onclick = function () {

            document
                .getElementById("orderSuccessModal")
                .classList.remove("show");
        };

    } catch (error) {

        console.error(error);

        alert("Unable to place order");
    }
}
function showOrderSuccess(order) {
    const modal = document.getElementById("orderSuccessModal");
    const viewOrderButton =
        document.getElementById("viewOrderButton");

    if (!modal || !orderNumber || !viewOrderButton) {
        window.location.href =
            `order-details.html?orderId=${order.orderId}`;
        return;
    }

    orderNumber.textContent =
        `Order #${order.orderId}`;

    viewOrderButton.onclick = () => {
        window.location.href =
            `order-details.html?orderId=${order.orderId}`;
    };

    modal.classList.add("show");
}

function closeOrderSuccess() {
    const modal =
        document.getElementById("orderSuccessModal");

    if (modal) {
        modal.classList.remove("show");
    }
}

function showPageMessage(text, type) {
    message.innerHTML = `
        <div class="alert alert-${type}" role="alert">
            ${escapeHtml(text)}
        </div>
    `;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

document
    .getElementById("closeSuccessModal")
    .addEventListener("click", closeOrderSuccess);

window.addEventListener("componentsLoaded", () => {
    loadCart();
});