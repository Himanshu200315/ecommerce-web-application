const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

let productPage = 0;
const productPageSize = 10;

let orderPage = 0;
const orderPageSize = 10;

if (!token || role !== "ADMIN") {
    window.location.href = "login.html";
}

const productForm = document.getElementById("productForm");
const productId = document.getElementById("productId");
const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productCategory = document.getElementById("productCategory");
const productDescription = document.getElementById("productDescription");
const productImage = document.getElementById("productImage");

const productTableBody = document.getElementById("productTableBody");
const orderTableBody = document.getElementById("orderTableBody");
const formTitle = document.getElementById("formTitle");
const cancelEditButton = document.getElementById("cancelEditButton");
const message = document.getElementById("message");
const totalProducts = document.getElementById("totalProducts");
const totalOrders = document.getElementById("totalOrders");
const pendingOrders = document.getElementById("pendingOrders");

const previousProductPage =
    document.getElementById("previousProductPage");

const nextProductPage =
    document.getElementById("nextProductPage");

const productPageNumber =
    document.getElementById("productPageNumber");

const previousOrderPage =
    document.getElementById("previousOrderPage");

const nextOrderPage =
    document.getElementById("nextOrderPage");

const orderPageNumber =
    document.getElementById("orderPageNumber");

async function request(url, options = {}) {
    const headers = {
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
    };

    if (options.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        window.location.href = "login.html";
        return null;
    }

    return response;
}

function showMessage(text, type = "success") {
    message.innerHTML = `
        <div class="alert alert-${type}" role="alert">
            ${escapeHtml(text)}
        </div>
    `;
}

async function loadProducts() {
    try {
        const response = await request(
            `/products?page=${productPage}&size=${productPageSize}`
        );

        if (!response || !response.ok) {
            showMessage("Unable to load products.", "danger");
            return;
        }

        const data = await response.json();

        const products = data.content || [];

        displayProducts(products);

        totalProducts.textContent = data.totalElements;

        productPageNumber.textContent =
            `Page ${data.number + 1}`;

        previousProductPage.disabled = data.first;
        nextProductPage.disabled = data.last;

    } catch (error) {
        console.error(error);
        showMessage("Unable to load products.", "danger");
    }
}

function displayProducts(products) {
    productTableBody.innerHTML = "";

    if (products.length === 0) {
        productTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    No products found.
                </td>
            </tr>
        `;
        return;
    }

    products.forEach(product => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${product.id}</td>

            <td>
                ${escapeHtml(product.name)}
            </td>

            <td>
                ₹${Number(product.price).toLocaleString("en-IN")}
            </td>

            <td>
                ${escapeHtml(product.category)}
            </td>

            <td>
                ${escapeHtml(product.description)}
            </td>

            <td>
                <button class="btn btn-sm btn-outline-primary me-1 edit-product">
                    Edit
                </button>

                <button class="btn btn-sm btn-outline-danger delete-product">
                    Delete
                </button>
            </td>
        `;

        row.querySelector(".edit-product")
            .addEventListener("click", () => {
                editProduct(product);
            });

        row.querySelector(".delete-product")
            .addEventListener("click", () => {
                deleteProduct(product.id);
            });

        productTableBody.appendChild(row);
    });
}

productForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const product = {
        name: productName.value.trim(),
        price: Number(productPrice.value),
        category: productCategory.value.trim(),
        description: productDescription.value.trim()
    };

    const editing = productId.value !== "";

    try {
        const response = await request(
            editing
                ? `/products/${productId.value}`
                : "/products",
            {
                method: editing ? "PUT" : "POST",
                body: JSON.stringify(product)
            }
        );

        if (!response) {
            return;
        }

        if (!response.ok) {
            const error = await response.text();
            showMessage(
                error || "Unable to save product.",
                "danger"
            );
            return;
        }

        const savedProduct = await response.json();

        const savedProductId = editing
            ? productId.value
            : savedProduct.id;

        if (productImage.files.length > 0) {

            const formData = new FormData();

            formData.append(
                "image",
                productImage.files[0]
            );

            const imageResponse = await request(
                `/products/${savedProductId}/image`,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!imageResponse || !imageResponse.ok) {

                const error = imageResponse
                    ? await imageResponse.text()
                    : "Unable to upload product image.";

                showMessage(
                    error || "Unable to upload product image.",
                    "danger"
                );

                loadProducts();
                return;
            }
        }

        showToast(
            editing
                ? "Product updated successfully."
                : "Product added successfully."
        );

        resetProductForm();
        loadProducts();

    } catch (error) {
        console.error(error);
        showMessage(
            "Unable to save product.",
            "danger"
        );
    }
});

function editProduct(product) {
    productId.value = product.id;
    productName.value = product.name;
    productPrice.value = product.price;
    productCategory.value = product.category;
    productDescription.value = product.description;

    formTitle.textContent = "Edit Product";
    cancelEditButton.classList.remove("d-none");

    productImage.value = "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

async function deleteProduct(id) {

    const confirmed = await confirmAction(
        `Are you sure you want to delete product #${id}?`
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await request(
            `/products/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response) {
            return;
        }

        const result = await response.text();

        if (!response.ok) {
            showMessage(
                result || "Unable to delete product.",
                "danger"
            );
            return;
        }

        showToast("Product deleted successfully.");

        loadProducts();

    } catch (error) {
        console.error(error);
        showMessage(
            "Unable to delete product.",
            "danger"
        );
    }
}

function resetProductForm() {
    productForm.reset();
    productId.value = "";
    productImage.value = "";
    formTitle.textContent = "Add Product";
    cancelEditButton.classList.add("d-none");
}

previousProductPage.addEventListener("click", () => {

    if (productPage > 0) {
        productPage--;
        loadProducts();
    }
});

nextProductPage.addEventListener("click", () => {
    productPage++;
    loadProducts();
});

cancelEditButton.addEventListener(
    "click",
    resetProductForm
);

async function loadOrders() {
    try {

        const response = await request(
            `/orders/admin?page=${orderPage}&size=${orderPageSize}`
        );

        if (!response || !response.ok) {
            showToast(
                "Failed to load orders",
                "error"
            );
            return;
        }

        const data = await response.json();

        const orders = data.content || [];

        displayOrders(orders);

        totalOrders.textContent = data.totalElements;

        orderPageNumber.textContent = `Page ${data.number + 1}`;

        previousOrderPage.disabled = data.first;

        nextOrderPage.disabled = data.last;

    } catch (error) {
        console.error(error);

        showToast(
            "Failed to load orders",
            "error"
        );
    }
}
async function loadPendingOrderCount() {

    try {

        const response = await request(
            "/orders/admin/pending-count"
        );

        if (!response || !response.ok) {
            return;
        }

        const count = await response.json();

        pendingOrders.textContent = count;

    } catch (error) {

        console.error(error);

    }
}

function displayOrders(orders) {
    orderTableBody.innerHTML = "";

    if (orders.length === 0) {
        orderTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    No orders found.
                </td>
            </tr>
        `;

        return;
    }

    orders.forEach(order => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                #${order.orderId}
            </td>

            <td>
                ${formatDate(order.createdAt)}
            </td>

            <td>
                ₹${Number(order.totalAmount).toLocaleString("en-IN")}
            </td>

            <td>
                ${getStatusBadge(order.status)}
            </td>

            <td>
                <select class="form-select form-select-sm order-status">
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                </select>

                <button class="btn btn-sm btn-primary mt-2 update-status">
                    Update
                </button>
            </td>
        `;

        const select =
            row.querySelector(".order-status");

        const updateButton =
            row.querySelector(".update-status");

        select.value = order.status;

        updateButton.addEventListener(
            "click",
            () => {
                updateOrderStatus(
                    order.orderId,
                    select.value
                );
            }
        );

        orderTableBody.appendChild(row);
    });
}

async function updateOrderStatus(orderId, status) {

    message.innerHTML = "";

    try {

        const response = await request(
            `/orders/${orderId}/status`,
            {
                method: "PUT",
                body: JSON.stringify({
                    status: status
                })
            }
        );

        if (!response) {
            return;
        }

        const result = await response.text();

        if (!response.ok) {

            showMessage(
                result || "Unable to update order status.",
                "danger"
            );

            return;
        }

        // Clear old error after successful update
        message.innerHTML = "";

        showToast(
            "Order status updated successfully."
        );

        loadOrders();
        loadPendingOrderCount();

    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to update order status.",
            "danger"
        );
    }
}

function getStatusBadge(status) {

    const classes = {
        PENDING: "bg-warning text-dark",
        CONFIRMED: "bg-info text-dark",
        SHIPPED: "bg-primary",
        DELIVERED: "bg-success",
        CANCELLED: "bg-danger"
    };

    return `
        <span class="badge ${classes[status] || "bg-secondary"}">
            ${status}
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

const navLinks =
    document.querySelectorAll(".admin-nav-link");

const sections =
    document.querySelectorAll(".admin-section");

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        navLinks.forEach(item => {
            item.classList.remove("active");
        });

        sections.forEach(section => {
            section.classList.add("d-none");
        });

        link.classList.add("active");

        const section =
            document.getElementById(
                link.dataset.section
            );

        section.classList.remove("d-none");
    });
});

previousOrderPage.addEventListener("click", () => {

    if (orderPage > 0) {
        orderPage--;
        loadOrders();
    }
});

nextOrderPage.addEventListener("click", () => {

    orderPage++;
    loadOrders();
});

loadProducts();
loadOrders();
loadPendingOrderCount();