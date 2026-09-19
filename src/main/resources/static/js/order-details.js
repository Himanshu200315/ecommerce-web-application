const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const params = new URLSearchParams(window.location.search);
const orderId = params.get("orderId");

const loading = document.getElementById("loading");
const orderContainer = document.getElementById("orderContainer");
const message = document.getElementById("message");

async function loadOrder() {

    if (!orderId) {

        loading.classList.add("d-none");

        message.innerHTML = `
            <div class="alert alert-danger">
                Order details could not be opened.
            </div>
        `;

        return;
    }

    try {

        const response = await fetch(`/orders/${orderId}`, {
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

            let errorMessage = "Unable to load order details.";

            try {
                const error = await response.text();

                if (error.trim()) {
                    errorMessage = error;
                }
            } catch (error) {
                console.error(error);
            }

            loading.classList.add("d-none");

            message.innerHTML = `
                <div class="alert alert-danger">
                    ${escapeHtml(errorMessage)}
                </div>
            `;

            return;
        }

        const order = await response.json();

        displayOrder(order);

    } catch (error) {

        console.error(error);

        loading.classList.add("d-none");

        message.innerHTML = `
            <div class="alert alert-danger">
                Unable to load order details. Please try again.
            </div>
        `;
    }
}

function displayOrder(order) {

    loading.classList.add("d-none");
    orderContainer.classList.remove("d-none");

    document.getElementById("orderDate").textContent =
        formatDate(order.createdAt);

    document.getElementById("orderTotal").textContent =
        `₹${Number(order.totalAmount).toLocaleString("en-IN")}`;

    document.getElementById("orderStatus").innerHTML =
        getStatusBadge(order.status);

    const orderItems =
        document.getElementById("orderItems");

    orderItems.innerHTML = "";

    if (!order.items || order.items.length === 0) {

        orderItems.innerHTML = `
            <div class="order-empty-items">

                <div class="order-empty-icon">
                    <i class="bi bi-box-seam"></i>
                </div>

                <h5>
                    No items found
                </h5>

                <p>
                    No products are associated with this order.
                </p>

            </div>
        `;

        return;
    }

    order.items.forEach(item => {

        const itemTotal =
            Number(item.price) * Number(item.quantity);

        orderItems.innerHTML += `
            <div class="order-item">

                <div class="order-item-main">

                    <div class="order-item-icon">
                        <i class="bi bi-box"></i>
                    </div>

                    <div>
                        <h5>
                            ${escapeHtml(item.productName)}
                        </h5>

                        <span>
                            Purchased product
                        </span>
                    </div>

                </div>


                <div class="order-item-info">

                    <div>
                        <small>
                            Price
                        </small>

                        <strong>
                            ₹${Number(item.price).toLocaleString("en-IN")}
                        </strong>
                    </div>


                    <div>
                        <small>
                            Quantity
                        </small>

                        <strong>
                            ${item.quantity}
                        </strong>
                    </div>


                    <div class="order-item-total">

                        <small>
                            Total
                        </small>

                        <strong>
                            ₹${itemTotal.toLocaleString("en-IN")}
                        </strong>

                    </div>

                </div>

            </div>
        `;
    });
}

function getStatusBadge(status) {

    const statusData = {
        PENDING: {
            className: "status-pending",
            icon: "bi-clock"
        },

        CONFIRMED: {
            className: "status-confirmed",
            icon: "bi-check-circle"
        },

        SHIPPED: {
            className: "status-shipped",
            icon: "bi-truck"
        },

        DELIVERED: {
            className: "status-delivered",
            icon: "bi-check-circle-fill"
        },

        CANCELLED: {
            className: "status-cancelled",
            icon: "bi-x-circle"
        }
    };

    const data = statusData[status] || {
        className: "status-default",
        icon: "bi-info-circle"
    };

    return `
        <span class="order-status-badge ${data.className}">
            <i class="bi ${data.icon}"></i>
            ${escapeHtml(status)}
        </span>
    `;
}

function formatDate(value) {

    return new Date(value).toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loadOrder();