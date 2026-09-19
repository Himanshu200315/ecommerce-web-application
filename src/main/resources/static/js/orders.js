const token = localStorage.getItem("token");

if (role === "ADMIN") {
    adminLink.classList.remove("d-none");
}

if (!token) {
    window.location.href = "login.html";
}

const ordersContainer = document.getElementById("ordersContainer");
const loading = document.getElementById("loading");
const message = document.getElementById("message");

async function loadOrders() {
    try {
        const response = await fetch("/orders", {
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
            showMessage(error || "Unable to load orders.", "danger");
            return;
        }

        const orders = await response.json();

        loading.classList.add("d-none");

        if (orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="alert alert-info text-center">
                    You haven't placed any orders yet.
                </div>
            `;
            return;
        }

        displayOrders(orders);

    } catch (error) {
        console.error(error);
        loading.classList.add("d-none");
        showMessage("Unable to load your orders.", "danger");
    }
}

function displayOrders(orders) {
    ordersContainer.innerHTML = "";

    orders.forEach(order => {
        const canCancel =
            order.status === "PENDING" ||
            order.status === "CONFIRMED";

        ordersContainer.innerHTML += `
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-body">

                    <div class="row align-items-center">

                        <div class="col-md-3">
                            <small class="text-muted">
                                Order
                            </small>
                            <h5 class="mb-0">
                                #${order.orderId}
                            </h5>
                        </div>

                        <div class="col-md-3">
                            <small class="text-muted">
                                Date
                            </small>
                            <p class="mb-0">
                                ${formatDate(order.createdAt)}
                            </p>
                        </div>

                        <div class="col-md-2">
                            <small class="text-muted">
                                Total
                            </small>
                            <p class="mb-0 fw-semibold">
                                ₹${order.totalAmount.toLocaleString("en-IN")}
                            </p>
                        </div>

                        <div class="col-md-2">
                            <small class="text-muted">
                                Status
                            </small>
                            <div class="mt-1">
                                ${getStatusBadge(order.status)}
                            </div>
                        </div>

                        <div class="col-md-2 text-md-end mt-3 mt-md-0">
                            <a
                                href="order-details.html?orderId=${order.orderId}"
                                class="btn btn-outline-primary btn-sm">
                                View Details
                            </a>

                            ${
            canCancel
                ? `
                                    <button
                                        class="btn btn-outline-danger btn-sm mt-2"
                                        onclick="cancelOrder(${order.orderId})">
                                        Cancel Order
                                    </button>
                                    `
                : ""
        }
                        </div>

                    </div>

                </div>
            </div>
        `;
    });
}

async function cancelOrder(orderId) {
    const confirmed = await confirmAction(
        `Are you sure you want to cancel Order #${orderId}?`
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/orders/${orderId}/cancel`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = "login.html";
            return;
        }

        const result = await response.text();

        if (!response.ok) {
            showMessage(result || "Unable to cancel order.", "danger");
            return;
        }

        showMessage("Order cancelled successfull");
        loadOrders();

    } catch (error) {
        console.error(error);
        showMessage("Unable to cancel order.", "danger");
    }
}

function getStatusBadge(status) {
    const statusClasses = {
        PENDING: "bg-warning text-dark",
        CONFIRMED: "bg-info text-dark",
        SHIPPED: "bg-primary",
        DELIVERED: "bg-success",
        CANCELLED: "bg-danger"
    };

    const className =
        statusClasses[status] || "bg-secondary";

    return `
        <span class="badge ${className}">
            ${status}
        </span>
    `;
}

function formatDate(value) {
    return new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function showMessage(text, type) {
    message.innerHTML = `
        <div class="alert alert-${type}">
            ${text}
        </div>
    `;
}



window.addEventListener("componentsLoaded", () => {
    loadOrders();
});