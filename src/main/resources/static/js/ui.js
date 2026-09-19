function showToast(message, type = "success") {
    const toast = document.createElement("div");

    toast.className = `app-toast ${type}`;

    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("hide");

        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2500);
}

function confirmAction(message) {
    return new Promise(resolve => {
        const overlay = document.createElement("div");
        overlay.className = "confirm-overlay";

        overlay.innerHTML = `
            <div class="confirm-dialog">
                <h5>Confirm Action</h5>

                <p>${escapeHtml(message)}</p>

                <div class="confirm-actions">
                    <button class="btn btn-outline-secondary" id="cancelConfirm">
                        Cancel
                    </button>

                    <button class="btn btn-danger" id="acceptConfirm">
                        Confirm
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const close = result => {
            overlay.remove();
            resolve(result);
        };

        document
            .getElementById("cancelConfirm")
            .addEventListener("click", () => close(false));

        document
            .getElementById("acceptConfirm")
            .addEventListener("click", () => close(true));

        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                close(false);
            }
        });
    });
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}