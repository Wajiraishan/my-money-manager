/* =========================================================
   MY MONEY MANAGER - COMPLETE JAVASCRIPT
   Version: 2.0
   ========================================================= */

/* =====================================================
   MY MONEY MANAGER
   Complete CRUD + Automatic Balance Calculation
===================================================== */


/* ================= STORAGE ================= */

const TRANSACTION_KEY = "moneyTransactions";
const FRIEND_KEY = "moneyFriends";
const REMINDER_KEY = "moneyReminders";


/* ================= GLOBAL DATA ================= */

let transactions = [];
let friends = [];
let reminders = [];

let selectedTransactionType = "income";

let editingTransactionId = null;
let editingRepaymentId = null;
let editingFriendId = null;
let editingDebtId = null;
let editingReminderId = null;

let reminderFilter = "all";
let balanceHidden = false;


/* ================= START ================= */

document.addEventListener("DOMContentLoaded", function () {

    loadData();

    initializeStorage();

    setCurrentDate();
    setDefaultDates();

    setupNavigation();
    setupTransactionTypeButtons();
    setupExpenseFilters();
    setupReminderTabs();
    setupTransactionHistoryFilter();

    updateEverything();

});


/* ================= STORAGE ================= */

function loadData() {

    try {

        transactions = JSON.parse(
            localStorage.getItem(TRANSACTION_KEY)
        ) || [];

        friends = JSON.parse(
            localStorage.getItem(FRIEND_KEY)
        ) || [];

        reminders = JSON.parse(
            localStorage.getItem(REMINDER_KEY)
        ) || [];

    } catch (error) {

        transactions = [];
        friends = [];
        reminders = [];

    }

}


function initializeStorage() {

    if (localStorage.getItem(TRANSACTION_KEY) === null) {
        saveTransactions();
    }

    if (localStorage.getItem(FRIEND_KEY) === null) {
        saveFriends();
    }

    if (localStorage.getItem(REMINDER_KEY) === null) {
        saveReminders();
    }

}


function saveTransactions() {

    localStorage.setItem(
        TRANSACTION_KEY,
        JSON.stringify(transactions)
    );

}


function saveFriends() {

    localStorage.setItem(
        FRIEND_KEY,
        JSON.stringify(friends)
    );

}


function saveReminders() {

    localStorage.setItem(
        REMINDER_KEY,
        JSON.stringify(reminders)
    );

}


/* ================= ID ================= */

function generateId(prefix) {

    return prefix +
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8);

}


/* ================= DATE ================= */

function toLocalISODate(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function getToday() {

    return toLocalISODate(new Date());

}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(
        dateString + "T00:00:00"
    );

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


function formatShortDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(
        dateString + "T00:00:00"
    );

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric"
        }
    );

}


function setCurrentDate() {

    const element = document.getElementById(
        "currentDate"
    );

    if (!element) return;

    const today = new Date();

    element.textContent = today.toLocaleDateString(
        "en-US",
        {
            weekday: "short",
            month: "short",
            day: "numeric"
        }
    );

}


function setDefaultDates() {

    const today = getToday();

    const fields = [
        "transactionDate",
        "repaymentDate",
        "debtDate",
        "reminderDate"
    ];

    fields.forEach(function (id) {

        const element = document.getElementById(id);

        if (element) {
            element.value = today;
        }

    });

}


/* ================= MONEY ================= */

function formatMoney(amount) {

    return "Rs. " +
        Number(amount || 0).toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


/* ================= CALCULATIONS ================= */

function getTotals() {

    let income = 0;
    let expenses = 0;
    let lent = 0;
    let borrowed = 0;

    let repaymentReceived = 0;
    let repaymentPaid = 0;

    let adjustmentIncrease = 0;
    let adjustmentDecrease = 0;


    transactions.forEach(function (transaction) {

        const amount = Number(
            transaction.amount || 0
        );


        switch (transaction.type) {

            case "income":
                income += amount;
                break;

            case "expense":
                expenses += amount;
                break;

            case "lent":
                lent += amount;
                break;

            case "borrowed":
                borrowed += amount;
                break;

            case "repayment_received":
                repaymentReceived += amount;
                break;

            case "repayment_paid":
                repaymentPaid += amount;
                break;

            case "adjustment":

                if (
                    transaction.adjustmentDirection ===
                    "decrease"
                ) {
                    adjustmentDecrease += amount;
                } else {
                    adjustmentIncrease += amount;
                }

                break;

        }

    });


    const adjustmentNet =
        adjustmentIncrease -
        adjustmentDecrease;


    const balance =
        income +
        borrowed +
        repaymentReceived +
        adjustmentNet -
        expenses -
        lent -
        repaymentPaid;


    const outstandingLent =
        Math.max(
            0,
            lent - repaymentReceived
        );


    const outstandingBorrowed =
        Math.max(
            0,
            borrowed - repaymentPaid
        );


    return {

        income,
        expenses,
        lent,
        borrowed,

        repaymentReceived,
        repaymentPaid,

        adjustmentIncrease,
        adjustmentDecrease,
        adjustmentNet,

        balance,

        outstandingLent,
        outstandingBorrowed

    };

}


/* ================= MAIN UPDATE ================= */

function updateEverything() {

    updateDashboard();

    renderRecentTransactions();

    renderAllTransactions();

    renderExpenses();

    renderFriends();

    renderDebts();

    renderReports();

    renderReminders();

    renderDashboardReminders();

    updateReminderCount();

}


/* ================= DASHBOARD ================= */

function updateDashboard() {

    const totals = getTotals();


    setText(
        "totalIncome",
        formatMoney(totals.income)
    );


    setText(
        "totalExpenses",
        formatMoney(totals.expenses)
    );


    setText(
        "totalLent",
        formatMoney(totals.outstandingLent)
    );


    setText(
        "totalBorrowed",
        formatMoney(totals.outstandingBorrowed)
    );


    updateBalanceDisplay();

}


function updateBalanceDisplay() {

    const element = document.getElementById(
        "balance"
    );

    const icon = document.getElementById(
        "balanceEyeIcon"
    );

    if (!element) return;


    if (balanceHidden) {

        element.textContent = "••••••••";

        if (icon) {
            icon.className =
                "fa-solid fa-eye-slash";
        }

    } else {

        element.textContent =
            formatMoney(
                getTotals().balance
            );

        if (icon) {
            icon.className =
                "fa-solid fa-eye";
        }

    }

}


function toggleBalance() {

    balanceHidden = !balanceHidden;

    updateBalanceDisplay();

}


/* ================= NAVIGATION ================= */

function setupNavigation() {

    document
        .querySelectorAll(
            ".menu-item, .mobile-nav-item"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const page =
                        button.dataset.page;

                    goToPage(page);

                }
            );

        });

}


function goToPage(pageName) {

    const page = document.getElementById(
        "page-" + pageName
    );

    if (!page) return;


    document
        .querySelectorAll(".page")
        .forEach(function (item) {

            item.classList.remove(
                "active-page"
            );

        });


    page.classList.add(
        "active-page"
    );


    document
        .querySelectorAll(
            ".menu-item, .mobile-nav-item"
        )
        .forEach(function (item) {

            item.classList.toggle(
                "active",
                item.dataset.page === pageName
            );

        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ================= TRANSACTION TYPES ================= */

function setupTransactionTypeButtons() {

    document
        .querySelectorAll(".type-btn")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    selectTransactionType(
                        button.dataset.type
                    );

                }
            );

        });

}


function selectTransactionType(type) {

    selectedTransactionType = type;


    document
        .querySelectorAll(".type-btn")
        .forEach(function (button) {

            button.classList.toggle(
                "active",
                button.dataset.type === type
            );

        });


    const personGroup =
        document.getElementById(
            "transactionPersonGroup"
        );

    const categoryGroup =
        document.getElementById(
            "transactionCategoryGroup"
        );

    const adjustmentGroup =
        document.getElementById(
            "transactionAdjustmentGroup"
        );


    const needsPerson =
        type === "lent" ||
        type === "borrowed";


    const needsCategory =
        type === "income" ||
        type === "expense";


    const needsAdjustment =
        type === "adjustment";


    personGroup.classList.toggle(
        "hidden",
        !needsPerson
    );


    categoryGroup.classList.toggle(
        "hidden",
        !needsCategory
    );


    adjustmentGroup.classList.toggle(
        "hidden",
        !needsAdjustment
    );


    const description =
        document.getElementById(
            "transactionDescription"
        );


    if (type === "income") {

        description.placeholder =
            "e.g. Monthly salary";

    } else if (type === "expense") {

        description.placeholder =
            "e.g. Lunch at restaurant";

    } else if (type === "lent") {

        description.placeholder =
            "e.g. Money given to friend";

    } else if (type === "borrowed") {

        description.placeholder =
            "e.g. Money borrowed";

    } else if (type === "adjustment") {

        description.placeholder =
            "e.g. Cash balance correction";

    }

}


/* ================= TRANSACTION MODAL ================= */

function openTransactionModal(
    type = "income",
    keepEditing = false
) {

    const modal =
        document.getElementById(
            "transactionModal"
        );


    if (!keepEditing) {

        editingTransactionId = null;

        resetTransactionForm();

    }


    if (keepEditing &&
        editingTransactionId) {

        const transaction =
            transactions.find(
                function (item) {

                    return item.id ===
                        editingTransactionId;

                }
            );


        if (!transaction) return;


        document.getElementById(
            "transactionAmount"
        ).value = transaction.amount;


        document.getElementById(
            "transactionDescription"
        ).value =
            transaction.description || "";


        document.getElementById(
            "transactionDate"
        ).value =
            transaction.date || getToday();


        document.getElementById(
            "transactionCategory"
        ).value =
            transaction.category || "other";


        document.getElementById(
            "transactionPerson"
        ).value =
            transaction.person || "";


        document.getElementById(
            "adjustmentDirection"
        ).value =
            transaction.adjustmentDirection ||
            "increase";

    }


    selectedTransactionType = type;

    selectTransactionType(type);


    const editing =
        Boolean(editingTransactionId);


    setText(
        "transactionModalTitle",
        editing
            ? "Edit Transaction"
            : "Add Transaction"
    );


    setText(
        "transactionModalSubtitle",
        editing
            ? "Update the transaction details."
            : "Record a new money transaction."
    );


    setText(
        "transactionSubmitText",
        editing
            ? "Update Transaction"
            : "Save Transaction"
    );


    modal.classList.add("show");

}


function closeTransactionModal() {

    document
        .getElementById("transactionModal")
        .classList.remove("show");

    editingTransactionId = null;

    resetTransactionForm();

}


function resetTransactionForm() {

    const form =
        document.getElementById(
            "transactionForm"
        );

    if (form) {
        form.reset();
    }


    selectedTransactionType = "income";

    selectTransactionType("income");


    document.getElementById(
        "transactionDate"
    ).value = getToday();


    document.getElementById(
        "transactionCategory"
    ).value = "other";


    document.getElementById(
        "adjustmentDirection"
    ).value = "increase";

}


/* ================= SAVE TRANSACTION ================= */

function saveTransaction(event) {

    event.preventDefault();


    const amount = Number(
        document.getElementById(
            "transactionAmount"
        ).value
    );


    const description =
        document.getElementById(
            "transactionDescription"
        ).value.trim();


    const date =
        document.getElementById(
            "transactionDate"
        ).value;


    const category =
        document.getElementById(
            "transactionCategory"
        ).value;


    const person =
        document.getElementById(
            "transactionPerson"
        ).value.trim();


    const adjustmentDirection =
        document.getElementById(
            "adjustmentDirection"
        ).value;


    if (!amount || amount <= 0) {

        showMessage(
            "Please enter a valid amount.",
            "error"
        );

        return;

    }


    if (!description) {

        showMessage(
            "Please enter a description.",
            "error"
        );

        return;

    }


    if (
        (
            selectedTransactionType === "lent" ||
            selectedTransactionType === "borrowed"
        ) &&
        !person
    ) {

        showMessage(
            "Please enter the person's name.",
            "error"
        );

        return;

    }


    const data = {

        type: selectedTransactionType,

        amount: amount,

        description: description,

        date: date || getToday(),

        category:
            selectedTransactionType === "income" ||
            selectedTransactionType === "expense"
                ? category
                : "other",

        person:
            selectedTransactionType === "lent" ||
            selectedTransactionType === "borrowed"
                ? person
                : "",

        adjustmentDirection:
            selectedTransactionType === "adjustment"
                ? adjustmentDirection
                : "",

        updatedAt: new Date().toISOString()

    };


    if (editingTransactionId) {

        const index =
            transactions.findIndex(
                function (item) {

                    return item.id ===
                        editingTransactionId;

                }
            );


        if (index !== -1) {

            transactions[index] = {

                ...transactions[index],

                ...data

            };

        }


        showMessage(
            "Transaction updated successfully.",
            "success"
        );

    } else {

        transactions.push({

            id: generateId("tx_"),

            ...data,

            createdAt:
                new Date().toISOString()

        });


        showMessage(
            "Transaction added successfully.",
            "success"
        );

    }


    saveTransactions();

    closeTransactionModal();

    updateEverything();

}


/* ================= EDIT TRANSACTION ================= */

function editTransaction(id) {

    const transaction =
        transactions.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!transaction) return;


    if (
        transaction.type ===
            "repayment_received" ||
        transaction.type ===
            "repayment_paid"
    ) {

        openRepaymentModal(
            transaction.person || "",
            transaction.id
        );

        return;

    }


    editingTransactionId = id;

    openTransactionModal(
        transaction.type,
        true
    );

}


/* ================= DELETE TRANSACTION ================= */

function deleteTransaction(id) {

    const transaction =
        transactions.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!transaction) return;


    const confirmed = confirm(
        "Delete this transaction?\n\n" +
        transaction.description +
        "\n" +
        formatMoney(transaction.amount)
    );


    if (!confirmed) return;


    transactions =
        transactions.filter(
            function (item) {

                return item.id !== id;

            }
        );


    saveTransactions();

    updateEverything();


    showMessage(
        "Transaction deleted successfully.",
        "success"
    );

}


/* ================= REPAYMENTS ================= */

function openRepaymentModal(
    personName = "",
    repaymentId = null
) {

    editingRepaymentId = repaymentId;


    const modal =
        document.getElementById(
            "repaymentModal"
        );


    const title =
        document.getElementById(
            "repaymentModalTitle"
        );


    const submit =
        document.getElementById(
            "repaymentSubmitText"
        );


    if (repaymentId) {

        const repayment =
            transactions.find(
                function (item) {

                    return item.id ===
                        repaymentId;

                }
            );


        if (!repayment) return;


        document.getElementById(
            "repaymentPerson"
        ).value =
            repayment.person || "";


        document.getElementById(
            "repaymentDirection"
        ).value =
            repayment.type ===
                "repayment_paid"
                ? "paid"
                : "received";


        document.getElementById(
            "repaymentAmount"
        ).value =
            repayment.amount;


        document.getElementById(
            "repaymentDate"
        ).value =
            repayment.date || getToday();


        document.getElementById(
            "repaymentNote"
        ).value =
            repayment.note || "";

        title.textContent =
            "Edit Repayment";

        submit.textContent =
            "Update Repayment";

    } else {

        document.getElementById(
            "repaymentPerson"
        ).value =
            personName || "";

        document.getElementById(
            "repaymentAmount"
        ).value = "";

        document.getElementById(
            "repaymentDate"
        ).value = getToday();

        document.getElementById(
            "repaymentNote"
        ).value = "";

        document.getElementById(
            "repaymentDirection"
        ).value = "received";

        title.textContent =
            "Record Repayment";

        submit.textContent =
            "Save Repayment";

    }


    modal.classList.add("show");

}


function closeRepaymentModal() {

    document
        .getElementById("repaymentModal")
        .classList.remove("show");

    editingRepaymentId = null;

}


function saveRepayment(event) {

    event.preventDefault();


    const person =
        document.getElementById(
            "repaymentPerson"
        ).value.trim();


    const direction =
        document.getElementById(
            "repaymentDirection"
        ).value;


    const amount = Number(
        document.getElementById(
            "repaymentAmount"
        ).value
    );


    const date =
        document.getElementById(
            "repaymentDate"
        ).value;


    const note =
        document.getElementById(
            "repaymentNote"
        ).value.trim();


    if (!person) {

        showMessage(
            "Please enter the person's name.",
            "error"
        );

        return;

    }


    if (!amount || amount <= 0) {

        showMessage(
            "Please enter a valid amount.",
            "error"
        );

        return;

    }


    const newType =
        direction === "received"
            ? "repayment_received"
            : "repayment_paid";


    const oldId =
        editingRepaymentId;


    /*
        Check outstanding amount.

        When editing, exclude the old repayment
        from the calculation first.
    */

    const outstanding =
        getOutstandingForPerson(
            person,
            newType,
            oldId
        );


    if (
        amount >
        outstanding + 0.001
    ) {

        showMessage(
            "Amount is higher than the outstanding balance. " +
            "Maximum available: " +
            formatMoney(outstanding),
            "error"
        );

        return;

    }


    const description =
        direction === "received"
            ? "Repayment received from " + person
            : "Repayment paid to " + person;


    const data = {

        type: newType,

        amount: amount,

        description: description,

        person: person,

        date: date || getToday(),

        category: "other",

        note: note,

        updatedAt:
            new Date().toISOString()

    };


    if (editingRepaymentId) {

        const index =
            transactions.findIndex(
                function (item) {

                    return item.id ===
                        editingRepaymentId;

                }
            );


        if (index !== -1) {

            transactions[index] = {

                ...transactions[index],

                ...data

            };

        }


        showMessage(
            "Repayment updated successfully.",
            "success"
        );

    } else {

        transactions.push({

            id: generateId("rep_"),

            ...data,

            createdAt:
                new Date().toISOString()

        });


        showMessage(
            "Repayment added successfully.",
            "success"
        );

    }


    saveTransactions();

    closeRepaymentModal();

    updateEverything();

}


/* ================= PERSON BALANCE ================= */

function normalizePerson(name) {

    return String(name || "")
        .trim()
        .toLowerCase();

}


function getOutstandingForPerson(
    person,
    repaymentType,
    excludeId = null
) {

    const key =
        normalizePerson(person);


    let lent = 0;
    let received = 0;

    let borrowed = 0;
    let paid = 0;


    transactions.forEach(function (transaction) {

        if (
            excludeId &&
            transaction.id === excludeId
        ) {
            return;
        }


        if (
            normalizePerson(
                transaction.person
            ) !== key
        ) {
            return;
        }


        const amount =
            Number(transaction.amount || 0);


        if (transaction.type === "lent") {
            lent += amount;
        }


        if (
            transaction.type ===
            "repayment_received"
        ) {
            received += amount;
        }


        if (
            transaction.type ===
            "borrowed"
        ) {
            borrowed += amount;
        }


        if (
            transaction.type ===
            "repayment_paid"
        ) {
            paid += amount;
        }

    });


    if (
        repaymentType ===
        "repayment_received"
    ) {

        return Math.max(
            0,
            lent - received
        );

    }


    return Math.max(
        0,
        borrowed - paid
    );

}


function getPersonBalances(person) {

    const key =
        normalizePerson(person);


    let lent = 0;
    let received = 0;

    let borrowed = 0;
    let paid = 0;


    transactions.forEach(function (transaction) {

        if (
            normalizePerson(
                transaction.person
            ) !== key
        ) {
            return;
        }


        const amount =
            Number(transaction.amount || 0);


        if (transaction.type === "lent") {
            lent += amount;
        }


        if (
            transaction.type ===
            "repayment_received"
        ) {
            received += amount;
        }


        if (
            transaction.type ===
            "borrowed"
        ) {
            borrowed += amount;
        }


        if (
            transaction.type ===
            "repayment_paid"
        ) {
            paid += amount;
        }

    });


    return {

        lent,
        received,

        borrowed,
        paid,

        owesYou:
            Math.max(
                0,
                lent - received
            ),

        youOwe:
            Math.max(
                0,
                borrowed - paid
            )

    };

}


/* ================= TRANSACTION DISPLAY ================= */

function getTransactionLabel(transaction) {

    switch (transaction.type) {

        case "income":
            return "Income";

        case "expense":
            return "Expense";

        case "lent":
            return "Money Lent";

        case "borrowed":
            return "Money Borrowed";

        case "repayment_received":
            return "Repayment Received";

        case "repayment_paid":
            return "Repayment Paid";

        case "adjustment":

            return transaction.adjustmentDirection ===
                "decrease"
                ? "Balance Decreased"
                : "Balance Increased";

        default:
            return "Transaction";

    }

}


function getTransactionIcon(transaction) {

    switch (transaction.type) {

        case "income":
            return "fa-arrow-trend-up";

        case "expense":
            return "fa-arrow-trend-down";

        case "lent":
            return "fa-hand-holding-dollar";

        case "borrowed":
            return "fa-money-bill-transfer";

        case "repayment_received":
        case "repayment_paid":
            return "fa-rotate";

        case "adjustment":
            return "fa-sliders";

        default:
            return "fa-money-bill";

    }

}


function getTransactionAmountClass(
    transaction
) {

    if (
        transaction.type === "income" ||
        transaction.type === "borrowed" ||
        transaction.type === "repayment_received"
    ) {

        return "amount-positive";

    }


    if (
        transaction.type === "expense" ||
        transaction.type === "lent" ||
        transaction.type === "repayment_paid"
    ) {

        return "amount-negative";

    }


    return "amount-adjustment";

}


function getSignedAmount(transaction) {

    const amount =
        Number(transaction.amount || 0);


    if (
        transaction.type === "income" ||
        transaction.type === "borrowed" ||
        transaction.type === "repayment_received"
    ) {

        return "+ " + formatMoney(amount);

    }


    if (
        transaction.type === "expense" ||
        transaction.type === "lent" ||
        transaction.type === "repayment_paid"
    ) {

        return "- " + formatMoney(amount);

    }


    if (
        transaction.type === "adjustment"
    ) {

        if (
            transaction.adjustmentDirection ===
            "decrease"
        ) {

            return "- " + formatMoney(amount);

        }

        return "+ " + formatMoney(amount);

    }


    return formatMoney(amount);

}


function sortTransactions(list) {

    return [...list].sort(
        function (a, b) {

            const dateA =
                new Date(
                    (a.date || "") +
                    "T00:00:00"
                ).getTime();

            const dateB =
                new Date(
                    (b.date || "") +
                    "T00:00:00"
                ).getTime();


            if (dateB !== dateA) {
                return dateB - dateA;
            }


            return String(
                b.createdAt || ""
            ).localeCompare(
                String(a.createdAt || "")
            );

        }
    );

}


/* ================= TRANSACTION HTML ================= */

function createTransactionHTML(
    transaction
) {

    const icon =
        getTransactionIcon(transaction);


    const label =
        getTransactionLabel(transaction);


    const personText =
        transaction.person
            ? " • " + escapeHTML(transaction.person)
            : "";


    return `

        <div class="transaction-row">

            <div class="transaction-icon">
                <i class="fa-solid ${icon}"></i>
            </div>

            <div class="transaction-info">

                <strong>
                    ${escapeHTML(
                        transaction.description ||
                        label
                    )}
                </strong>

                <span>
                    ${label}
                    ${personText}
                    •
                    ${formatDate(transaction.date)}
                </span>

            </div>

            <div class="
                transaction-amount
                ${getTransactionAmountClass(transaction)}
            ">

                ${getSignedAmount(transaction)}

            </div>

            <div class="transaction-actions">

                <button
                    class="small-action"
                    title="Edit"
                    onclick="editTransaction('${transaction.id}')">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                    class="small-action"
                    title="Delete"
                    onclick="deleteTransaction('${transaction.id}')">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </div>

    `;

}


/* ================= RECENT ================= */

function renderRecentTransactions() {

    const container =
        document.getElementById(
            "recentTransactions"
        );


    if (!container) return;


    const list =
        sortTransactions(
            transactions
        ).slice(0, 8);


    if (!list.length) {

        container.innerHTML =
            emptyStateHTML(
                "fa-receipt",
                "No transactions yet."
            );

        return;

    }


    container.innerHTML =
        list.map(
            createTransactionHTML
        ).join("");

}


/* ================= ALL TRANSACTIONS ================= */

function setupTransactionHistoryFilter() {

    const filter =
        document.getElementById(
            "transactionHistoryFilter"
        );


    if (!filter) return;


    filter.addEventListener(
        "change",
        renderAllTransactions
    );

}


function renderAllTransactions() {

    const container =
        document.getElementById(
            "allTransactionList"
        );


    if (!container) return;


    const filter =
        document.getElementById(
            "transactionHistoryFilter"
        )?.value || "all";


    let list =
        sortTransactions(
            transactions
        );


    if (filter !== "all") {

        if (filter === "repayment") {

            list =
                list.filter(
                    function (transaction) {

                        return (
                            transaction.type ===
                                "repayment_received" ||
                            transaction.type ===
                                "repayment_paid"
                        );

                    }
                );

        } else {

            list =
                list.filter(
                    function (transaction) {

                        return transaction.type ===
                            filter;

                    }
                );

        }

    }


    if (!list.length) {

        container.innerHTML =
            emptyStateHTML(
                "fa-receipt",
                "No transactions found."
            );

        return;

    }


    container.innerHTML =
        list.map(
            createTransactionHTML
        ).join("");

}


/* ================= EXPENSES ================= */

function setupExpenseFilters() {

    [
        "expenseSearch",
        "expenseCategory",
        "expenseDateFilter"
    ].forEach(function (id) {

        const element =
            document.getElementById(id);

        if (!element) return;

        element.addEventListener(
            "input",
            renderExpenses
        );

        element.addEventListener(
            "change",
            renderExpenses
        );

    });

}


function clearExpenseFilters() {

    document.getElementById(
        "expenseSearch"
    ).value = "";

    document.getElementById(
        "expenseCategory"
    ).value = "all";

    document.getElementById(
        "expenseDateFilter"
    ).value = "";

    renderExpenses();

}


function renderExpenses() {

    const listContainer =
        document.getElementById(
            "expenseList"
        );


    if (!listContainer) return;


    const allExpenses =
        transactions.filter(
            function (transaction) {

                return transaction.type ===
                    "expense";

            }
        );


    const total =
        allExpenses.reduce(
            function (sum, transaction) {

                return sum +
                    Number(transaction.amount || 0);

            },
            0
        );


    const currentMonth =
        getToday().substring(0, 7);


    const monthTotal =
        allExpenses
            .filter(function (transaction) {

                return (
                    transaction.date || ""
                ).startsWith(
                    currentMonth
                );

            })
            .reduce(
                function (sum, transaction) {

                    return sum +
                        Number(transaction.amount || 0);

                },
                0
            );


    setText(
        "expensePageTotal",
        formatMoney(total)
    );


    setText(
        "expenseMonthTotal",
        formatMoney(monthTotal)
    );


    const search =
        (
            document.getElementById(
                "expenseSearch"
            )?.value || ""
        ).toLowerCase().trim();


    const category =
        document.getElementById(
            "expenseCategory"
        )?.value || "all";


    const date =
        document.getElementById(
            "expenseDateFilter"
        )?.value || "";


    const filtered =
        allExpenses.filter(
            function (transaction) {

                const matchesSearch =
                    !search ||
                    String(
                        transaction.description || ""
                    )
                    .toLowerCase()
                    .includes(search);


                const matchesCategory =
                    category === "all" ||
                    transaction.category === category;


                const matchesDate =
                    !date ||
                    transaction.date === date;


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesDate
                );

            }
        );


    setText(
        "expenseTransactionCount",
        String(filtered.length)
    );


    if (!filtered.length) {

        listContainer.innerHTML =
            emptyStateHTML(
                "fa-receipt",
                "No expenses found."
            );

        return;

    }


    listContainer.innerHTML =
        sortTransactions(filtered)
            .map(createExpenseHTML)
            .join("");

}


function getCategoryIcon(category) {

    const icons = {

        food: "fa-utensils",
        fuel: "fa-gas-pump",
        shopping: "fa-bag-shopping",
        bills: "fa-file-invoice-dollar",
        transport: "fa-car",
        health: "fa-heart-pulse",
        entertainment: "fa-film",
        other: "fa-receipt"

    };

    return icons[category] ||
        icons.other;

}


function createExpenseHTML(transaction) {

    return `

        <div class="expense-row">

            <div class="expense-icon">

                <i class="fa-solid ${
                    getCategoryIcon(
                        transaction.category
                    )
                }"></i>

            </div>


            <div class="expense-info">

                <strong>
                    ${escapeHTML(
                        transaction.description
                    )}
                </strong>

                <span>
                    ${
                        escapeHTML(
                            transaction.category ||
                            "other"
                        )
                    }
                    •
                    ${formatDate(transaction.date)}
                </span>

            </div>


            <div class="expense-amount">

                - ${formatMoney(transaction.amount)}

            </div>


            <div class="transaction-actions">

                <button
                    class="small-action"
                    onclick="editTransaction('${transaction.id}')">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                    class="small-action"
                    onclick="deleteTransaction('${transaction.id}')">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </div>

    `;

}


/* ================= FRIENDS ================= */

function openFriendModal(friendId = null) {

    editingFriendId = friendId;


    const modal =
        document.getElementById(
            "friendModal"
        );


    if (friendId) {

        const friend =
            friends.find(
                function (item) {

                    return item.id === friendId;

                }
            );


        if (!friend) return;


        document.getElementById(
            "friendName"
        ).value =
            friend.name || "";


        document.getElementById(
            "friendPhone"
        ).value =
            friend.phone || "";


        document.getElementById(
            "friendNote"
        ).value =
            friend.note || "";


        setText(
            "friendModalTitle",
            "Edit Friend"
        );

    } else {

        document.getElementById(
            "friendName"
        ).value = "";

        document.getElementById(
            "friendPhone"
        ).value = "";

        document.getElementById(
            "friendNote"
        ).value = "";


        setText(
            "friendModalTitle",
            "Add Friend"
        );

    }


    modal.classList.add("show");

}


function closeFriendModal() {

    document
        .getElementById("friendModal")
        .classList.remove("show");

    editingFriendId = null;

}


function saveFriend(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "friendName"
        ).value.trim();


    const phone =
        document.getElementById(
            "friendPhone"
        ).value.trim();


    const note =
        document.getElementById(
            "friendNote"
        ).value.trim();


    if (!name) {

        showMessage(
            "Please enter the friend's name.",
            "error"
        );

        return;

    }


    if (editingFriendId) {

        const friend =
            friends.find(
                function (item) {

                    return item.id ===
                        editingFriendId;

                }
            );


        if (friend) {

            const oldName =
                friend.name;


            friend.name = name;
            friend.phone = phone;
            friend.note = note;


            /*
                If friend name changes,
                update related transaction names.
            */

            transactions.forEach(
                function (transaction) {

                    if (
                        normalizePerson(
                            transaction.person
                        ) ===
                        normalizePerson(oldName)
                    ) {

                        transaction.person =
                            name;

                    }

                }
            );


            saveTransactions();

        }


        showMessage(
            "Friend updated successfully.",
            "success"
        );

    } else {

        friends.push({

            id: generateId("friend_"),

            name: name,

            phone: phone,

            note: note,

            createdAt:
                new Date().toISOString()

        });


        showMessage(
            "Friend added successfully.",
            "success"
        );

    }


    saveFriends();

    closeFriendModal();

    updateEverything();

}


function deleteFriend(id) {

    const friend =
        friends.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!friend) return;


    const confirmed = confirm(
        "Delete " +
        friend.name +
        " from your friends list?\n\n" +
        "Their transactions will NOT be deleted."
    );


    if (!confirmed) return;


    friends =
        friends.filter(
            function (item) {

                return item.id !== id;

            }
        );


    saveFriends();

    renderFriends();


    showMessage(
        "Friend deleted.",
        "success"
    );

}


function renderFriends() {

    const container =
        document.getElementById(
            "friendsList"
        );


    if (!container) return;


    setText(
        "friendsCount",
        String(friends.length)
    );


    let totalOwed = 0;
    let active = 0;


    friends.forEach(function (friend) {

        const balance =
            getPersonBalances(
                friend.name
            );


        totalOwed += balance.owesYou;


        if (
            balance.owesYou > 0 ||
            balance.youOwe > 0
        ) {
            active++;
        }

    });


    setText(
        "friendsTotalOwed",
        formatMoney(totalOwed)
    );


    setText(
        "friendsActiveCount",
        String(active)
    );


    if (!friends.length) {

        container.innerHTML =
            emptyStateHTML(
                "fa-user-group",
                "No friends added yet."
            );

        return;

    }


    container.innerHTML =
        friends.map(
            createFriendHTML
        ).join("");

}


function createFriendHTML(friend) {

    const balance =
        getPersonBalances(
            friend.name
        );


    return `

        <div class="person-card">

            <div class="person-header">

                <div class="person-title">

                    <div class="person-avatar">

                        ${getInitials(friend.name)}

                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(friend.name)}
                        </strong>

                        <small>
                            ${
                                escapeHTML(
                                    friend.phone ||
                                    "No phone added"
                                )
                            }
                        </small>

                    </div>

                </div>


                <div class="person-actions">

                    <button
                        class="small-action"
                        onclick="editFriend('${friend.id}')">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="small-action"
                        onclick="deleteFriend('${friend.id}')">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>


            <div class="person-balances">

                <div class="person-balance">

                    <span>They Owe You</span>

                    <strong class="owe-you">
                        ${formatMoney(balance.owesYou)}
                    </strong>

                </div>


                <div class="person-balance">

                    <span>You Owe Them</span>

                    <strong class="you-owe">
                        ${formatMoney(balance.youOwe)}
                    </strong>

                </div>

            </div>


            ${
                friend.note
                    ? `
                        <p class="muted"
                           style="margin-bottom:15px;">
                            ${escapeHTML(friend.note)}
                        </p>
                    `
                    : ""
            }


            <div class="person-footer">

                <button
                    class="secondary-btn"
                    onclick="openRepaymentModal('${escapeAttribute(friend.name)}')">

                    <i class="fa-solid fa-rotate"></i>

                    Repayment

                </button>

            </div>

        </div>

    `;

}


function editFriend(id) {

    openFriendModal(id);

}


/* ================= DEBTS ================= */

function openDebtModal(transactionId = null) {

    editingDebtId = transactionId;


    const modal =
        document.getElementById(
            "debtModal"
        );


    if (transactionId) {

        const debt =
            transactions.find(
                function (item) {

                    return item.id ===
                        transactionId &&
                        item.type === "borrowed";

                }
            );


        if (!debt) return;


        document.getElementById(
            "debtPerson"
        ).value =
            debt.person || "";


        document.getElementById(
            "debtAmount"
        ).value =
            debt.amount;


        document.getElementById(
            "debtDate"
        ).value =
            debt.date || getToday();


        document.getElementById(
            "debtDueDate"
        ).value =
            debt.dueDate || "";


        document.getElementById(
            "debtNote"
        ).value =
            debt.note || debt.description || "";


        setText(
            "debtModalTitle",
            "Edit Debt"
        );

    } else {

        document.getElementById(
            "debtPerson"
        ).value = "";

        document.getElementById(
            "debtAmount"
        ).value = "";

        document.getElementById(
            "debtDate"
        ).value = getToday();

        document.getElementById(
            "debtDueDate"
        ).value = "";

        document.getElementById(
            "debtNote"
        ).value = "";


        setText(
            "debtModalTitle",
            "Add Debt"
        );

    }


    modal.classList.add("show");

}


function closeDebtModal() {

    document
        .getElementById("debtModal")
        .classList.remove("show");

    editingDebtId = null;

}


function saveDebt(event) {

    event.preventDefault();


    const person =
        document.getElementById(
            "debtPerson"
        ).value.trim();


    const amount = Number(
        document.getElementById(
            "debtAmount"
        ).value
    );


    const date =
        document.getElementById(
            "debtDate"
        ).value;


    const dueDate =
        document.getElementById(
            "debtDueDate"
        ).value;


    const note =
        document.getElementById(
            "debtNote"
        ).value.trim();


    if (!person || !amount || amount <= 0) {

        showMessage(
            "Please enter a valid person and amount.",
            "error"
        );

        return;

    }


    const data = {

        type: "borrowed",

        amount: amount,

        person: person,

        date: date || getToday(),

        dueDate: dueDate,

        note: note,

        description:
            note ||
            "Money borrowed from " +
            person,

        category: "other",

        updatedAt:
            new Date().toISOString()

    };


    if (editingDebtId) {

        const index =
            transactions.findIndex(
                function (item) {

                    return item.id ===
                        editingDebtId;

                }
            );


        if (index !== -1) {

            transactions[index] = {

                ...transactions[index],

                ...data

            };

        }


        showMessage(
            "Debt updated successfully.",
            "success"
        );

    } else {

        transactions.push({

            id: generateId("debt_"),

            ...data,

            createdAt:
                new Date().toISOString()

        });


        showMessage(
            "Debt added successfully.",
            "success"
        );

    }


    saveTransactions();

    closeDebtModal();

    updateEverything();

}


function deleteDebt(id) {

    deleteTransaction(id);

}


function getDebtGroups() {

    const groups = {};


    transactions
        .filter(function (transaction) {

            return transaction.type ===
                "borrowed";

        })
        .forEach(function (transaction) {

            const key =
                normalizePerson(
                    transaction.person
                );


            if (!groups[key]) {

                groups[key] = {

                    name:
                        transaction.person ||
                        "Unknown",

                    borrowed: 0,

                    repayments: 0,

                    transactions: []

                };

            }


            groups[key].borrowed +=
                Number(transaction.amount || 0);


            groups[key].transactions.push(
                transaction
            );

        });


    transactions
        .filter(function (transaction) {

            return (
                transaction.type ===
                    "repayment_paid" &&
                transaction.person
            );

        })
        .forEach(function (transaction) {

            const key =
                normalizePerson(
                    transaction.person
                );


            if (groups[key]) {

                groups[key].repayments +=
                    Number(transaction.amount || 0);

            }

        });


    return Object.values(groups);

}


function renderDebts() {

    const container =
        document.getElementById(
            "debtsList"
        );


    if (!container) return;


    const groups =
        getDebtGroups();


    let totalBorrowed = 0;
    let remaining = 0;
    let active = 0;


    groups.forEach(function (group) {

        const left =
            Math.max(
                0,
                group.borrowed -
                group.repayments
            );


        totalBorrowed +=
            group.borrowed;


        remaining += left;


        if (left > 0) {
            active++;
        }

    });


    setText(
        "debtsTotal",
        formatMoney(totalBorrowed)
    );


    setText(
        "debtsRemaining",
        formatMoney(remaining)
    );


    setText(
        "debtsActiveCount",
        String(active)
    );


    if (!groups.length) {

        container.innerHTML =
            emptyStateHTML(
                "fa-credit-card",
                "No debts recorded."
            );

        return;

    }


    container.innerHTML =
        groups.map(
            createDebtHTML
        ).join("");

}


function createDebtHTML(group) {

    const remaining =
        Math.max(
            0,
            group.borrowed -
            group.repayments
        );


    const sortedRecords =
        sortTransactions(
            group.transactions
        );


    return `

        <div class="person-card">

            <div class="person-header">

                <div class="person-title">

                    <div class="person-avatar">
                        ${getInitials(group.name)}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(group.name)}
                        </strong>

                        <small>
                            ${group.transactions.length}
                            debt record(s)
                        </small>

                    </div>

                </div>

            </div>


            <div class="debt-summary"
                 style="margin-top:15px;">

                <div>
                    <span>Total Borrowed</span>
                    <strong>
                        ${formatMoney(group.borrowed)}
                    </strong>
                </div>

                <div>
                    <span>Remaining</span>
                    <strong>
                        ${formatMoney(remaining)}
                    </strong>
                </div>

            </div>


            <div class="debt-records">

                ${
                    sortedRecords.map(
                        function (transaction) {

                            return `

                                <div class="debt-record">

                                    <div class="debt-record-top">

                                        <div>
                                            <strong>
                                                ${formatMoney(
                                                    transaction.amount
                                                )}
                                            </strong>

                                            <span>
                                                ${formatDate(
                                                    transaction.date
                                                )}
                                            </span>
                                        </div>


                                        ${
                                            transaction.dueDate
                                                ? `
                                                    <span>
                                                        Due:
                                                        ${formatShortDate(
                                                            transaction.dueDate
                                                        )}
                                                    </span>
                                                `
                                                : ""
                                        }

                                    </div>


                                    ${
                                        transaction.note
                                            ? `
                                                <span style="
                                                    display:block;
                                                    margin-top:6px;
                                                ">
                                                    ${escapeHTML(
                                                        transaction.note
                                                    )}
                                                </span>
                                            `
                                            : ""
                                    }


                                    <div class="debt-record-actions">

                                        <button
                                            class="small-action"
                                            onclick="openDebtModal('${transaction.id}')">

                                            <i class="fa-solid fa-pen"></i>

                                        </button>

                                        <button
                                            class="small-action"
                                            onclick="deleteDebt('${transaction.id}')">

                                            <i class="fa-solid fa-trash"></i>

                                        </button>

                                    </div>

                                </div>

                            `;

                        }
                    ).join("")
                }

            </div>


            <div class="person-footer"
                 style="margin-top:15px;">

                <button
                    class="secondary-btn"
                    onclick="openRepaymentModal('${escapeAttribute(group.name)}')">

                    <i class="fa-solid fa-rotate"></i>

                    Record Repayment

                </button>

            </div>

        </div>

    `;

}


/* ================= REPORTS ================= */

function renderReports() {

    const totals =
        getTotals();


    setText(
        "reportIncome",
        formatMoney(totals.income)
    );


    setText(
        "reportExpenses",
        formatMoney(totals.expenses)
    );


    setText(
        "reportLent",
        formatMoney(totals.lent)
    );


    setText(
        "reportBorrowed",
        formatMoney(totals.borrowed)
    );


    setText(
        "reportAdjustments",
        formatMoney(totals.adjustmentNet)
    );


    renderMonthlyReport();

    renderCategoryReport();

}


function renderMonthlyReport() {

    const container =
        document.getElementById(
            "monthlyReport"
        );


    if (!container) return;


    const months = {};


    transactions.forEach(function (transaction) {

        const month =
            String(
                transaction.date || ""
            ).substring(0, 7);


        if (!month) return;


        if (!months[month]) {

            months[month] = {

                income: 0,
                expense: 0,
                lent: 0,
                borrowed: 0,
                received: 0,
                paid: 0,
                adjustment: 0

            };

        }


        const amount =
            Number(transaction.amount || 0);


        switch (transaction.type) {

            case "income":
                months[month].income += amount;
                break;

            case "expense":
                months[month].expense += amount;
                break;

            case "lent":
                months[month].lent += amount;
                break;

            case "borrowed":
                months[month].borrowed += amount;
                break;

            case "repayment_received":
                months[month].received += amount;
                break;

            case "repayment_paid":
                months[month].paid += amount;
                break;

            case "adjustment":

                months[month].adjustment +=
                    transaction.adjustmentDirection ===
                    "decrease"
                        ? -amount
                        : amount;

                break;

        }

    });


    const entries =
        Object.entries(months)
            .sort(function (a, b) {

                return b[0].localeCompare(a[0]);

            });


    if (!entries.length) {

        container.innerHTML =
            emptyStateHTML(
                "fa-chart-line",
                "No report data yet."
            );

        return;

    }


    container.innerHTML =
        entries.map(function ([month, data]) {

            const net =
                data.income +
                data.borrowed +
                data.received +
                data.adjustment -
                data.expense -
                data.lent -
                data.paid;


            const date =
                new Date(
                    month + "-01T00:00:00"
                );


            const monthName =
                date.toLocaleDateString(
                    "en-US",
                    {
                        month: "long",
                        year: "numeric"
                    }
                );


            return `

                <div class="month-row">

                    <div class="month-row-top">

                        <strong>
                            ${monthName}
                        </strong>

                        <strong class="${
                            net >= 0
                                ? "amount-positive"
                                : "amount-negative"
                        }">

                            ${
                                net >= 0
                                    ? "+ "
                                    : "- "
                            }

                            ${formatMoney(Math.abs(net))}

                        </strong>

                    </div>

                    <span>
                        Income:
                        ${formatMoney(data.income)}
                        •
                        Expenses:
                        ${formatMoney(data.expense)}
                    </span>

                    <span>
                        Lent:
                        ${formatMoney(data.lent)}
                        •
                        Borrowed:
                        ${formatMoney(data.borrowed)}
                    </span>

                </div>

            `;

        }).join("");

}


function renderCategoryReport() {

    const container =
        document.getElementById(
            "categoryReport"
        );


    if (!container) return;


    const categories = {};


    transactions
        .filter(function (transaction) {

            return transaction.type ===
                "expense";

        })
        .forEach(function (transaction) {

            const category =
                transaction.category ||
                "other";


            categories[category] =
                (
                    categories[category] || 0
                ) +
                Number(transaction.amount || 0);

        });


    const entries =
        Object.entries(categories)
            .sort(function (a, b) {

                return b[1] - a[1];

            });


    if (!entries.length) {

        container.innerHTML =
            emptyStateHTML(
                "fa-chart-pie",
                "No expense categories yet."
            );

        return;

    }


    const max =
        entries[0][1];


    container.innerHTML =
        entries.map(function ([category, amount]) {

            const percentage =
                max > 0
                    ? (amount / max) * 100
                    : 0;


            return `

                <div class="category-row">

                    <div class="category-row-top">

                        <strong>
                            ${escapeHTML(
                                capitalize(category)
                            )}
                        </strong>

                        <span>
                            ${formatMoney(amount)}
                        </span>

                    </div>


                    <div class="category-bar">

                        <div style="
                            width:${percentage}%;
                        "></div>

                    </div>

                </div>

            `;

        }).join("");

}


/* ================= REMINDERS ================= */

function setupReminderTabs() {

    document
        .querySelectorAll(".reminder-tab")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    reminderFilter =
                        button.dataset.filter;


                    document
                        .querySelectorAll(
                            ".reminder-tab"
                        )
                        .forEach(function (item) {

                            item.classList.remove(
                                "active"
                            );

                        });


                    button.classList.add(
                        "active"
                    );


                    renderReminders();

                }
            );

        });

}


function openReminderModal(reminderId = null) {

    editingReminderId = reminderId;


    const modal =
        document.getElementById(
            "reminderModal"
        );


    if (reminderId) {

        const reminder =
            reminders.find(
                function (item) {

                    return item.id ===
                        reminderId;

                }
            );


        if (!reminder) return;


        document.getElementById(
            "reminderTitle"
        ).value =
            reminder.title || "";


        document.getElementById(
            "reminderAmount"
        ).value =
            reminder.amount || "";


        document.getElementById(
            "reminderDate"
        ).value =
            reminder.date || getToday();


        document.getElementById(
            "reminderNote"
        ).value =
            reminder.note || "";


        setText(
            "reminderModalTitle",
            "Edit Reminder"
        );


        setText(
            "reminderSubmitText",
            "Update Reminder"
        );

    } else {

        document.getElementById(
            "reminderTitle"
        ).value = "";

        document.getElementById(
            "reminderAmount"
        ).value = "";

        document.getElementById(
            "reminderDate"
        ).value = getToday();

        document.getElementById(
            "reminderNote"
        ).value = "";


        setText(
            "reminderModalTitle",
            "Add Reminder"
        );


        setText(
            "reminderSubmitText",
            "Save Reminder"
        );

    }


    modal.classList.add("show");

}


function closeReminderModal() {

    document
        .getElementById("reminderModal")
        .classList.remove("show");

    editingReminderId = null;

}


function saveReminder(event) {

    event.preventDefault();


    const title =
        document.getElementById(
            "reminderTitle"
        ).value.trim();


    const amount = Number(
        document.getElementById(
            "reminderAmount"
        ).value || 0
    );


    const date =
        document.getElementById(
            "reminderDate"
        ).value;


    const note =
        document.getElementById(
            "reminderNote"
        ).value.trim();


    if (!title || !date) {

        showMessage(
            "Please enter a title and date.",
            "error"
        );

        return;

    }


    if (editingReminderId) {

        const reminder =
            reminders.find(
                function (item) {

                    return item.id ===
                        editingReminderId;

                }
            );


        if (reminder) {

            reminder.title = title;
            reminder.amount = amount;
            reminder.date = date;
            reminder.note = note;
            reminder.updatedAt =
                new Date().toISOString();

        }


        showMessage(
            "Reminder updated successfully.",
            "success"
        );

    } else {

        reminders.push({

            id: generateId("rem_"),

            title: title,

            amount: amount,

            date: date,

            note: note,

            completed: false,

            createdAt:
                new Date().toISOString()

        });


        showMessage(
            "Reminder added successfully.",
            "success"
        );

    }


    saveReminders();

    closeReminderModal();

    updateEverything();

}


function getReminderStatus(reminder) {

    const today = getToday();


    if (reminder.completed) {
        return "completed";
    }


    if (reminder.date < today) {
        return "overdue";
    }


    if (reminder.date === today) {
        return "today";
    }


    return "upcoming";

}


function renderReminders() {

    const container =
        document.getElementById(
            "reminderList"
        );


    if (!container) return;


    let list =
        [...reminders];


    if (reminderFilter !== "all") {

        list =
            list.filter(
                function (reminder) {

                    return (
                        getReminderStatus(
                            reminder
                        ) ===
                        reminderFilter
                    );

                }
            );

    }


    list.sort(function (a, b) {

        return a.date.localeCompare(
            b.date
        );

    });


    if (!list.length) {

        container.innerHTML =
            emptyStateHTML(
                "fa-bell",
                "No reminders found."
            );

        return;

    }


    container.innerHTML =
        list.map(
            createReminderHTML
        ).join("");

}


function createReminderHTML(reminder) {

    const status =
        getReminderStatus(reminder);


    let statusText =
        capitalize(status);


    if (status === "today") {
        statusText = "Today";
    }


    return `

        <div class="
            reminder-page-card
            ${reminder.completed ? "completed" : ""}
        ">

            <div class="reminder-main">

                <button
                    class="reminder-check"
                    onclick="toggleReminder('${reminder.id}')">

                    <i class="fa-solid ${
                        reminder.completed
                            ? "fa-check"
                            : "fa-bell"
                    }"></i>

                </button>


                <div>

                    <h3>
                        ${escapeHTML(reminder.title)}
                    </h3>

                    <p>
                        ${escapeHTML(
                            reminder.note || ""
                        )}
                    </p>

                </div>

            </div>


            <div class="reminder-meta">

                <div>

                    <span>
                        ${statusText}
                        •
                        ${formatDate(reminder.date)}
                    </span>

                    ${
                        reminder.amount
                            ? `
                                <strong>
                                    ${formatMoney(
                                        reminder.amount
                                    )}
                                </strong>
                            `
                            : ""
                    }

                </div>


                <div class="reminder-actions">

                    <button
                        class="small-action"
                        onclick="openReminderModal('${reminder.id}')">

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        class="small-action"
                        onclick="deleteReminder('${reminder.id}')">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>

        </div>

    `;

}


function toggleReminder(id) {

    const reminder =
        reminders.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!reminder) return;


    reminder.completed =
        !reminder.completed;


    saveReminders();

    updateEverything();

}


function deleteReminder(id) {

    const reminder =
        reminders.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!reminder) return;


    if (
        !confirm(
            "Delete this reminder?"
        )
    ) {
        return;
    }


    reminders =
        reminders.filter(
            function (item) {

                return item.id !== id;

            }
        );


    saveReminders();

    updateEverything();


    showMessage(
        "Reminder deleted.",
        "success"
    );

}


function updateReminderCount() {

    const activeReminders =
        reminders.filter(
            function (reminder) {

                return (
                    !reminder.completed &&
                    (
                        getReminderStatus(reminder) ===
                            "today" ||
                        getReminderStatus(reminder) ===
                            "overdue"
                    )
                );

            }
        );


    const count =
        activeReminders.length;


    const badge =
        document.getElementById(
            "reminderCount"
        );


    const dot =
        document.getElementById(
            "notificationDot"
        );


    if (badge) {

        badge.textContent =
            String(count);

        badge.style.display =
            count > 0
                ? "grid"
                : "none";

    }


    if (dot) {

        dot.style.display =
            count > 0
                ? "block"
                : "none";

    }

}


function renderDashboardReminders() {

    const container =
        document.getElementById(
            "dashboardReminders"
        );


    if (!container) return;


    const list =
        reminders
            .filter(function (reminder) {

                return !reminder.completed;

            })
            .sort(function (a, b) {

                return a.date.localeCompare(
                    b.date
                );

            })
            .slice(0, 4);


    if (!list.length) {

        container.innerHTML =
            emptyStateHTML(
                "fa-circle-check",
                "No active reminders."
            );

        return;

    }


    container.innerHTML =
        list.map(function (reminder) {

            return `

                <div class="dashboard-reminder">

                    <div class="reminder-dot"></div>

                    <div style="flex:1;">

                        <strong>
                            ${escapeHTML(
                                reminder.title
                            )}
                        </strong>

                        <span>
                            ${formatDate(
                                reminder.date
                            )}
                            ${
                                reminder.amount
                                    ? " • " +
                                      formatMoney(
                                          reminder.amount
                                      )
                                    : ""
                            }
                        </span>

                    </div>

                    <button
                        class="small-action"
                        onclick="openReminderModal('${reminder.id}')">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                </div>

            `;

        }).join("");

}


/* ================= UTILITIES ================= */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {
        element.textContent = value;
    }

}


function emptyStateHTML(icon, message) {

    return `

        <div class="empty-state">

            <i class="fa-solid ${icon}"></i>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


function getInitials(name) {

    const parts =
        String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!parts.length) {
        return "?";
    }


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


function capitalize(text) {

    if (!text) return "";

    return String(text)
        .charAt(0)
        .toUpperCase() +
        String(text)
            .slice(1);

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


/* ================= TOAST ================= */

function showMessage(
    message,
    type = "success"
) {

    const container =
        document.getElementById(
            "toastContainer"
        );


    const toast =
        document.createElement("div");


    toast.className =
        "toast " + type;


    toast.textContent =
        message;


    container.appendChild(toast);


    setTimeout(function () {

        toast.remove();

    }, 3000);

}


/* ================= DATA INFO ================= */

function showDataInfo() {

    alert(
        "My Money Manager\n\n" +
        "Your data is currently stored locally in your browser using LocalStorage.\n\n" +
        "Transactions: " + transactions.length + "\n" +
        "Friends: " + friends.length + "\n" +
        "Reminders: " + reminders.length + "\n\n" +
        "If you clear browser site data, these records may be removed."
    );

}


/* ================= MODAL OUTSIDE CLICK ================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList.contains(
                "modal-overlay"
            )
        ) {

            event.target.classList.remove(
                "show"
            );


            editingTransactionId = null;
            editingRepaymentId = null;
            editingFriendId = null;
            editingDebtId = null;
            editingReminderId = null;

        }

    }
);


/* ================= ESC KEY ================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {
            return;
        }


        document
            .querySelectorAll(".modal-overlay.show")
            .forEach(function (modal) {

                modal.classList.remove(
                    "show"
                );

            });


        editingTransactionId = null;
        editingRepaymentId = null;
        editingFriendId = null;
        editingDebtId = null;
        editingReminderId = null;

    }
);