let payments = [];


// ==================================================
// PAGE LOAD
// ==================================================

document.addEventListener("DOMContentLoaded", function () {

    setTodayDate();

    loadPayments();

});


// ==================================================
// TODAY DATE
// ==================================================

function setTodayDate() {

    const dateInput = document.getElementById("paymentDate");

    if (dateInput) {

        const today = new Date();

        const year = today.getFullYear();

        const month = String(today.getMonth() + 1).padStart(2, "0");

        const day = String(today.getDate()).padStart(2, "0");

        dateInput.value = `${year}-${month}-${day}`;
    }
}


// ==================================================
// SAVE PAYMENT
// ==================================================

document.getElementById("paymentForm").addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();

    const description =
        document.getElementById("description").value.trim();

    const location =
        document.getElementById("location").value.trim();

    const amount =
        document.getElementById("amount").value;

    const paymentType =
        document.getElementById("paymentType").value;

    const paymentMode =
        document.getElementById("paymentMode").value;

    const paymentDate =
        document.getElementById("paymentDate").value;


    if (!name) {

        showMessage("Please enter name.", "error");

        return;
    }


    if (!amount) {

        showMessage("Please enter amount.", "error");

        return;
    }


    if (!paymentType) {

        showMessage("Please select payment type.", "error");

        return;
    }


    if (!paymentMode) {

        showMessage("Please select payment mode.", "error");

        return;
    }


    if (!paymentDate) {

        showMessage("Please select payment date.", "error");

        return;
    }


    const data = {

        name: name,

        description: description,

        location: location,

        amount: parseFloat(amount),

        paymentType: paymentType,

        paymentMode: paymentMode,

        paymentDate: paymentDate

    };


    try {

        const response = await fetch("/save", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });


        const result = await response.json();


        if (response.ok) {

            showMessage(
                result.message || "Payment saved successfully! ✅",
                "success"
            );

            resetForm();

            loadPayments();

        } else {

            showMessage(
                result.error || "Save failed.",
                "error"
            );
        }


    } catch (error) {

        console.error(error);

        showMessage(
            "Server connection error.",
            "error"
        );

    }

});


// ==================================================
// LOAD PAYMENTS
// ==================================================

async function loadPayments() {

    try {

        const response = await fetch("/payments");

        const result = await response.json();


        if (!response.ok) {

            showMessage(
                result.error || "Unable to load payments.",
                "error"
            );

            return;
        }


        payments = result;

        displayPayments(payments);

        calculateSummary();


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to connect to server.",
            "error"
        );
    }
}


// ==================================================
// DISPLAY PAYMENTS
// ==================================================

function displayPayments(data) {

    const tableBody =
        document.getElementById("paymentTableBody");


    tableBody.innerHTML = "";


    if (!data || data.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    No payments found.
                </td>
            </tr>
        `;

        return;
    }


    data.forEach(payment => {

        const id =
            payment.PaymentID ?? payment.paymentID ?? payment.id;

        const name =
            payment.Name ?? payment.name ?? "";

        const description =
            payment.Description ?? payment.description ?? "";

        const location =
            payment.Location ?? payment.location ?? "";

        const amount =
            payment.Amount ?? payment.amount ?? 0;

        const paymentType =
            payment.PaymentType ?? payment.paymentType ?? "";

        const paymentMode =
            payment.PaymentMode ?? payment.paymentMode ?? "";

        const paymentDate =
            payment.PaymentDate ?? payment.paymentDate ?? "";


        const row = document.createElement("tr");


        row.innerHTML = `

            <td>${escapeHTML(id)}</td>

            <td>${escapeHTML(name)}</td>

            <td>${escapeHTML(description)}</td>

            <td>${escapeHTML(location)}</td>

            <td>₹${Number(amount).toFixed(2)}</td>

            <td>${escapeHTML(paymentType)}</td>

            <td>${escapeHTML(paymentMode)}</td>

            <td>${escapeHTML(paymentDate)}</td>

            <td>

                <button
                    class="update-btn"
                    onclick="openUpdateModal(${id})"
                >
                    ✏️ Update
                </button>

                <button
                    class="delete-btn"
                    onclick="deletePayment(${id})"
                >
                    🗑️ Delete
                </button>

            </td>
        `;


        tableBody.appendChild(row);

    });
}


// ==================================================
// OPEN UPDATE MODAL
// ==================================================

function openUpdateModal(paymentId) {

    const payment = payments.find(function (item) {

        const id =
            item.PaymentID ??
            item.paymentID ??
            item.id;

        return Number(id) === Number(paymentId);

    });


    if (!payment) {

        showMessage(
            "Payment record not found.",
            "error"
        );

        return;
    }


    document.getElementById("updateId").value =
        payment.PaymentID ??
        payment.paymentID ??
        payment.id;


    document.getElementById("updateName").value =
        payment.Name ??
        payment.name ??
        "";


    document.getElementById("updateDescription").value =
        payment.Description ??
        payment.description ??
        "";


    document.getElementById("updateLocation").value =
        payment.Location ??
        payment.location ??
        "";


    document.getElementById("updateAmount").value =
        payment.Amount ??
        payment.amount ??
        "";


    document.getElementById("updatePaymentType").value =
        payment.PaymentType ??
        payment.paymentType ??
        "Income";


    document.getElementById("updatePaymentMode").value =
        payment.PaymentMode ??
        payment.paymentMode ??
        "Cash";


    document.getElementById("updatePaymentDate").value =
        payment.PaymentDate ??
        payment.paymentDate ??
        "";


    document.getElementById("updateModal").style.display = "flex";
}


// ==================================================
// UPDATE PAYMENT
// ==================================================

async function updatePayment() {

    const paymentId =
        document.getElementById("updateId").value;


    const name =
        document.getElementById("updateName").value.trim();


    const description =
        document.getElementById("updateDescription").value.trim();


    const location =
        document.getElementById("updateLocation").value.trim();


    const amount =
        document.getElementById("updateAmount").value;


    const paymentType =
        document.getElementById("updatePaymentType").value;


    const paymentMode =
        document.getElementById("updatePaymentMode").value;


    const paymentDate =
        document.getElementById("updatePaymentDate").value;


    console.log("UPDATE ID:", paymentId);

    console.log("UPDATE DATA:", {
        name,
        description,
        location,
        amount,
        paymentType,
        paymentMode,
        paymentDate
    });


    if (!paymentId) {

        showMessage(
            "Payment ID missing.",
            "error"
        );

        return;
    }


    if (!name) {

        showMessage(
            "Please enter name.",
            "error"
        );

        return;
    }


    if (!amount) {

        showMessage(
            "Please enter amount.",
            "error"
        );

        return;
    }


    if (!paymentType) {

        showMessage(
            "Please select payment type.",
            "error"
        );

        return;
    }


    if (!paymentMode) {

        showMessage(
            "Please select payment mode.",
            "error"
        );

        return;
    }


    if (!paymentDate) {

        showMessage(
            "Please select payment date.",
            "error"
        );

        return;
    }


    const data = {

        name: name,

        description: description,

        location: location,

        amount: parseFloat(amount),

        paymentType: paymentType,

        paymentMode: paymentMode,

        paymentDate: paymentDate

    };


    try {

        const response = await fetch(
            `/update/${paymentId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );


        const result = await response.json();


        console.log("UPDATE RESPONSE:", result);


        if (response.ok) {

            showMessage(
                result.message ||
                "Payment updated successfully! ✅",
                "success"
            );


            closeUpdateModal();


            await loadPayments();


        } else {

            showMessage(
                result.error ||
                "Update failed.",
                "error"
            );

        }


    } catch (error) {

        console.error("UPDATE ERROR:", error);

        showMessage(
            "Server connection error.",
            "error"
        );

    }
}


// ==================================================
// CLOSE UPDATE MODAL
// ==================================================

function closeUpdateModal() {

    document.getElementById("updateModal").style.display =
        "none";
}


// ==================================================
// DELETE PAYMENT
// ==================================================

async function deletePayment(paymentId) {

    if (!confirm("Are you sure you want to delete this payment?")) {

        return;
    }


    try {

        const response = await fetch(
            `/delete/${paymentId}`,
            {
                method: "DELETE"
            }
        );


        const result = await response.json();


        if (response.ok) {

            showMessage(
                result.message ||
                "Payment deleted successfully! 🗑️",
                "success"
            );

            loadPayments();

        } else {

            showMessage(
                result.error ||
                "Delete failed.",
                "error"
            );

        }


    } catch (error) {

        console.error(error);

        showMessage(
            "Server connection error.",
            "error"
        );

    }
}


// ==================================================
// SEARCH
// ==================================================

function searchPayments() {

    const search =
        document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();


    if (!search) {

        displayPayments(payments);

        return;
    }


    const filtered = payments.filter(function (payment) {

        const text = [

            payment.PaymentID,

            payment.Name,

            payment.Description,

            payment.Location,

            payment.Amount,

            payment.PaymentType,

            payment.PaymentMode,

            payment.PaymentDate

        ].join(" ").toLowerCase();


        return text.includes(search);

    });


    displayPayments(filtered);
}


// ==================================================
// SUMMARY
// ==================================================

function calculateSummary() {

    let totalIncome = 0;

    let totalExpense = 0;


    payments.forEach(function (payment) {

        const amount =
            Number(
                payment.Amount ??
                payment.amount ??
                0
            );


        const type =
            payment.PaymentType ??
            payment.paymentType ??
            "";


        if (type === "Income") {

            totalIncome += amount;

        }


        if (type === "Expense") {

            totalExpense += amount;

        }

    });


    const balance =
        totalIncome - totalExpense;


    document.getElementById("totalIncome").textContent =
        `₹${totalIncome.toFixed(2)}`;


    document.getElementById("totalExpense").textContent =
        `₹${totalExpense.toFixed(2)}`;


    document.getElementById("balance").textContent =
        `₹${balance.toFixed(2)}`;
}


// ==================================================
// RESET FORM
// ==================================================

function resetForm() {

    document.getElementById("paymentForm").reset();

    setTodayDate();
}


// ==================================================
// MESSAGE
// ==================================================

function showMessage(message, type) {

    const messageBox =
        document.getElementById("message");


    messageBox.textContent = message;


    messageBox.className = type;


    setTimeout(function () {

        messageBox.textContent = "";

        messageBox.className = "";

    }, 3000);
}


// ==================================================
// DOWNLOAD CSV
// ==================================================

function downloadPayments() {

    if (!payments.length) {

        showMessage(
            "No payment data available.",
            "error"
        );

        return;
    }


    let csv =
        "ID,Name,Description,Location,Amount,Payment Type,Payment Mode,Date\n";


    payments.forEach(function (payment) {

        csv += [

            csvValue(payment.PaymentID),

            csvValue(payment.Name),

            csvValue(payment.Description),

            csvValue(payment.Location),

            csvValue(payment.Amount),

            csvValue(payment.PaymentType),

            csvValue(payment.PaymentMode),

            csvValue(payment.PaymentDate)

        ].join(",") + "\n";

    });


    const blob =
        new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download = "payments.csv";

    link.click();


    URL.revokeObjectURL(url);
}


// ==================================================
// PRINT
// ==================================================

function printPayments() {

    const printWindow =
        window.open("", "_blank");


    let html = `

        <html>

        <head>

            <title>Payment Report</title>

            <style>

                body {
                    font-family: Arial;
                    padding: 20px;
                }

                h1 {
                    text-align: center;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th,
                td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: left;
                }

                th {
                    background: #eee;
                }

            </style>

        </head>

        <body>

            <h1>Payment Report</h1>

            <table>

                <thead>

                    <tr>

                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Location</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Mode</th>
                        <th>Date</th>

                    </tr>

                </thead>

                <tbody>
    `;


    payments.forEach(function (payment) {

        html += `

            <tr>

                <td>${escapeHTML(payment.PaymentID)}</td>

                <td>${escapeHTML(payment.Name)}</td>

                <td>${escapeHTML(payment.Description)}</td>

                <td>${escapeHTML(payment.Location)}</td>

                <td>₹${Number(payment.Amount).toFixed(2)}</td>

                <td>${escapeHTML(payment.PaymentType)}</td>

                <td>${escapeHTML(payment.PaymentMode)}</td>

                <td>${escapeHTML(payment.PaymentDate)}</td>

            </tr>

        `;

    });


    html += `

                </tbody>

            </table>

        </body>

        </html>

    `;


    printWindow.document.write(html);

    printWindow.document.close();

    printWindow.print();
}


// ==================================================
// CSV VALUE
// ==================================================

function csvValue(value) {

    if (value === null || value === undefined) {

        return '""';

    }


    return `"${String(value).replace(/"/g, '""')}"`;
}


// ==================================================
// HTML ESCAPE
// ==================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==================================================
// CLOSE MODAL WHEN CLICK OUTSIDE
// ==================================================

window.addEventListener("click", function (event) {

    const modal =
        document.getElementById("updateModal");


    if (event.target === modal) {

        closeUpdateModal();

    }

});