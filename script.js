/* =========================================================
   MY MONEY MANAGER - COMPLETE JAVASCRIPT
   Version: 2.0
   ========================================================= */

"use strict";


/* =========================================================
   STORAGE KEYS
========================================================= */

const TRANSACTION_KEY = "moneyTransactions";
const FRIEND_KEY = "moneyFriends";
const REMINDER_KEY = "moneyReminders";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let transactions = [];
let friends = [];
let reminders = [];

let selectedTransactionType = "income";

let editingTransactionId = null;
let editingFriendId = null;
let editingDebtId = null;
let editingReminderId = null;

let reminderFilter = "all";

let balanceHidden = false;


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadData();

    seedDemoData();

    setCurrentDate();

    setDefaultDates();

    setupNavigation();

    setupTransactionTypeButtons();

    setupExpenseFilters();

    setupReminderTabs();

    updateEverything();

});


/* =========================================================
   LOAD DATA
========================================================= */

function loadData() {

    try {

        transactions =
            JSON.parse(
                localStorage.getItem(TRANSACTION_KEY)
            ) || [];

        friends =
            JSON.parse(
                localStorage.getItem(FRIEND_KEY)
            ) || [];

        reminders =
            JSON.parse(
                localStorage.getItem(REMINDER_KEY)
            ) || [];

    } catch (error) {

        transactions = [];
        friends = [];
        reminders = [];

        console.error(
            "Data loading error:",
            error
        );

    }

}


/* =========================================================
   SAVE DATA
========================================================= */

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


/* =========================================================
   UNIQUE ID
========================================================= */

function generateId() {

    return Date.now() +
        Math.floor(
            Math.random() * 100000
        );

}


/* =========================================================
   DEMO DATA
========================================================= */

function seedDemoData() {

    if (localStorage.getItem(TRANSACTION_KEY) === null) {
        transactions = [];
        saveTransactions();
    }

    if (localStorage.getItem(FRIEND_KEY) === null) {
        friends = [];
        saveFriends();
    }

    if (localStorage.getItem(REMINDER_KEY) === null) {
        reminders = [];
        saveReminders();
    }

}


/* =========================================================
   DATE FUNCTIONS
========================================================= */

/*
   Local date is used instead of toISOString()
   to avoid Sri Lanka timezone date problems.
*/

function toLocalISODate(date = new Date()) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function getToday() {

    return toLocalISODate();

}


function getYesterday() {

    const date =
        new Date();

    date.setDate(
        date.getDate() - 1
    );

    return toLocalISODate(date);

}


function futureDate(days) {

    const date =
        new Date();

    date.setDate(
        date.getDate() + days
    );

    return toLocalISODate(date);

}


function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(
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
        return "";
    }

    const date =
        new Date(
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

    const element =
        document.getElementById(
            "currentDate"
        );

    if (!element) {
        return;
    }

    element.textContent =
        new Date().toLocaleDateString(
            "en-US",
            {
                month: "long",
                day: "2-digit",
                year: "numeric"
            }
        );

}


function setDefaultDates() {

    const transactionDate =
        document.getElementById(
            "transactionDate"
        );

    const debtDate =
        document.getElementById(
            "debtDate"
        );

    const reminderDate =
        document.getElementById(
            "reminderDate"
        );


    if (transactionDate) {
        transactionDate.value =
            getToday();
    }


    if (debtDate) {
        debtDate.value =
            getToday();
    }


    if (reminderDate) {
        reminderDate.value =
            getToday();
    }

}


/* =========================================================
   MONEY FORMAT
========================================================= */

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


/* =========================================================
   FINANCIAL CALCULATIONS
========================================================= */

function calculateFinancialData() {

    let income = 0;
    let expenses = 0;

    let lent = 0;
    let borrowed = 0;

    let repaymentReceived = 0;
    let repaymentPaid = 0;


    transactions.forEach(
        function (transaction) {

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            switch (
                transaction.type
            ) {

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

                    repaymentReceived +=
                        amount;

                    break;


                case "repayment_paid":

                    repaymentPaid +=
                        amount;

                    break;

            }

        }
    );


    /*
       Outstanding debt
    */

    const outstandingLent =
        Math.max(
            0,
            lent -
            repaymentReceived
        );


    const outstandingBorrowed =
        Math.max(
            0,
            borrowed -
            repaymentPaid
        );


    /*
       REAL CASH BALANCE

       Money coming in:
       Income
       + Borrowed
       + Repayment received

       Money going out:
       Expenses
       + Lent
       + Repayment paid
    */

    const balance =
        income +
        borrowed +
        repaymentReceived -
        expenses -
        lent -
        repaymentPaid;


    return {

        income: income,

        expenses: expenses,

        lent: outstandingLent,

        borrowed: outstandingBorrowed,

        repaymentReceived:
            repaymentReceived,

        repaymentPaid:
            repaymentPaid,

        balance: balance

    };

}


/* =========================================================
   UPDATE EVERYTHING
========================================================= */

function updateEverything() {

    updateDashboard();

    renderTransactions();

    renderExpenses();

    renderFriends();

    renderDebts();

    renderReports();

    renderReminders();

    renderDashboardReminders();

    updateReminderCount();

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const data =
        calculateFinancialData();


    const balance =
        document.getElementById(
            "balance"
        );


    if (balance) {

        balance.textContent =
            balanceHidden
                ? "Rs. •••••••"
                : formatMoney(
                    data.balance
                );

    }


    const income =
        document.getElementById(
            "totalIncome"
        );


    const expenses =
        document.getElementById(
            "totalExpenses"
        );


    const lent =
        document.getElementById(
            "totalLent"
        );


    const borrowed =
        document.getElementById(
            "totalBorrowed"
        );


    if (income) {
        income.textContent =
            formatMoney(data.income);
    }


    if (expenses) {
        expenses.textContent =
            formatMoney(data.expenses);
    }


    if (lent) {
        lent.textContent =
            formatMoney(data.lent);
    }


    if (borrowed) {
        borrowed.textContent =
            formatMoney(data.borrowed);
    }

}


/* =========================================================
   BALANCE VISIBILITY
========================================================= */

function toggleBalance() {

    balanceHidden =
        !balanceHidden;


    const balance =
        document.getElementById(
            "balance"
        );


    const icon =
        document.getElementById(
            "eyeIcon"
        );


    const data =
        calculateFinancialData();


    if (balance) {

        balance.textContent =
            balanceHidden
                ? "Rs. •••••••"
                : formatMoney(
                    data.balance
                );

    }


    if (icon) {

        icon.className =
            balanceHidden
                ? "fa-solid fa-eye-slash"
                : "fa-solid fa-eye";

    }

}


/* =========================================================
   TRANSACTION MODAL
========================================================= */

function openTransactionModal(
    type = "income",
    keepEditing = false
) {

    const modal =
        document.getElementById(
            "transactionModal"
        );


    if (!modal) {
        return;
    }


    if (!keepEditing) {

        editingTransactionId =
            null;

    }


    const form =
        document.getElementById(
            "transactionForm"
        );


    if (!keepEditing && form) {

        form.reset();

    }


    if (!keepEditing) {

        const date =
            document.getElementById(
                "transactionDate"
            );

        if (date) {
            date.value =
                getToday();
        }

    }


    selectedTransactionType =
        type || "income";


    updateTransactionTypeButtons();


    const title =
        modal.querySelector(
            ".modal-header h2"
        );


    const subtitle =
        modal.querySelector(
            ".modal-header p"
        );


    const saveButton =
        modal.querySelector(
            ".save-btn"
        );


    if (editingTransactionId) {

        if (title) {
            title.textContent =
                "Edit Transaction";
        }

        if (subtitle) {
            subtitle.textContent =
                "Update your money activity";
        }

        if (saveButton) {
            saveButton.innerHTML =
                '<i class="fa-solid fa-check"></i> Update Transaction';
        }

    } else {

        if (title) {
            title.textContent =
                "Add Transaction";
        }

        if (subtitle) {
            subtitle.textContent =
                "Record your money activity";
        }

        if (saveButton) {
            saveButton.innerHTML =
                '<i class="fa-solid fa-check"></i> Save Transaction';
        }

    }


    modal.classList.add(
        "show"
    );

    document.body.classList.add(
        "modal-open"
    );


    setTimeout(
        function () {

            const amount =
                document.getElementById(
                    "transactionAmount"
                );

            if (amount) {
                amount.focus();
            }

        },
        100
    );

}


function closeTransactionModal() {

    const modal =
        document.getElementById(
            "transactionModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "modal-open"
    );


    editingTransactionId =
        null;

}


/* =========================================================
   TRANSACTION TYPE BUTTONS
========================================================= */

function setupTransactionTypeButtons() {

    const buttons =
        document.querySelectorAll(
            ".type-btn"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const type =
                        this.dataset.type;


                    if (!type) {
                        return;
                    }


                    selectedTransactionType =
                        type;


                    updateTransactionTypeButtons();

                }
            );

        }
    );

}


function updateTransactionTypeButtons() {

    const buttons =
        document.querySelectorAll(
            ".type-btn"
        );


    buttons.forEach(
        function (button) {

            button.classList.toggle(
                "active",
                button.dataset.type ===
                selectedTransactionType
            );

        }
    );

}


/* =========================================================
   SAVE TRANSACTION
========================================================= */

function saveTransaction(event) {

    event.preventDefault();


    const amountInput =
        document.getElementById(
            "transactionAmount"
        );


    const descriptionInput =
        document.getElementById(
            "transactionDescription"
        );


    const dateInput =
        document.getElementById(
            "transactionDate"
        );


    const categoryInput =
        document.getElementById(
            "transactionCategory"
        );


    const amount =
        Number(
            amountInput
                ? amountInput.value
                : 0
        );


    const description =
        descriptionInput
            ? descriptionInput.value.trim()
            : "";


    const date =
        dateInput
            ? dateInput.value
            : "";


    const category =
        categoryInput
            ? categoryInput.value
            : "other";


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


    if (!date) {

        showMessage(
            "Please select a date.",
            "error"
        );

        return;

    }


    /*
       Person is needed for Lent / Borrowed.
       Current HTML doesn't have a person field,
       so we ask only when needed.
    */

    let person = "";


    if (
        selectedTransactionType ===
            "lent" ||
        selectedTransactionType ===
            "borrowed"
    ) {

        const existing =
            editingTransactionId
                ? transactions.find(
                    t =>
                        t.id ===
                        editingTransactionId
                )
                : null;


        if (existing) {

            person =
                existing.person || "";

        }


        if (!person) {

            person =
                prompt(
                    selectedTransactionType ===
                        "lent"
                        ? "Who did you lend this money to?"
                        : "Who did you borrow this money from?"
                ) || "";

            person =
                person.trim();

        }


        if (!person) {

            showMessage(
                "Please enter the person's name.",
                "error"
            );

            return;

        }

    }


    /*
       EDIT EXISTING TRANSACTION
    */

    if (editingTransactionId) {

        const transaction =
            transactions.find(
                t =>
                    t.id ===
                    editingTransactionId
            );


        if (!transaction) {

            showMessage(
                "Transaction not found.",
                "error"
            );

            return;

        }


        transaction.type =
            selectedTransactionType;

        transaction.amount =
            amount;

        transaction.description =
            description;

        transaction.category =
            category;

        transaction.date =
            date;

        transaction.person =
            person;


        saveTransactions();


        showMessage(
            "Transaction updated successfully."
        );

    }


    /*
       ADD NEW TRANSACTION
    */

    else {

        transactions.unshift({

            id:
                generateId(),

            type:
                selectedTransactionType,

            amount:
                amount,

            description:
                description,

            category:
                category,

            date:
                date,

            person:
                person

        });


        saveTransactions();


        showMessage(
            "Transaction saved successfully."
        );

    }


    closeTransactionModal();


    resetTransactionForm();


    updateEverything();

}


/* =========================================================
   RESET TRANSACTION FORM
========================================================= */

function resetTransactionForm() {

    const form =
        document.getElementById(
            "transactionForm"
        );


    if (form) {

        form.reset();

    }


    editingTransactionId =
        null;


    selectedTransactionType =
        "income";


    updateTransactionTypeButtons();


    const date =
        document.getElementById(
            "transactionDate"
        );


    if (date) {

        date.value =
            getToday();

    }

}


/* =========================================================
   EDIT TRANSACTION
========================================================= */

function editTransaction(id) {

    const transaction =
        transactions.find(
            t =>
                t.id === id
        );


    if (!transaction) {
        return;
    }


    editingTransactionId =
        id;


    openTransactionModal(
        transaction.type,
        true
    );


    const amount =
        document.getElementById(
            "transactionAmount"
        );


    const description =
        document.getElementById(
            "transactionDescription"
        );


    const date =
        document.getElementById(
            "transactionDate"
        );


    const category =
        document.getElementById(
            "transactionCategory"
        );


    if (amount) {

        amount.value =
            transaction.amount;

    }


    if (description) {

        description.value =
            transaction.description;

    }


    if (date) {

        date.value =
            transaction.date;

    }


    if (category) {

        category.value =
            transaction.category ||
            "other";

    }

}


/* =========================================================
   DELETE TRANSACTION
========================================================= */

function deleteTransaction(id) {

    const transaction =
        transactions.find(
            t =>
                t.id === id
        );


    if (!transaction) {
        return;
    }


    if (
        !confirm(
            `Delete "${transaction.description}"?`
        )
    ) {

        return;

    }


    transactions =
        transactions.filter(
            t =>
                t.id !== id
        );


    saveTransactions();


    updateEverything();


    showMessage(
        "Transaction deleted."
    );

}


/* =========================================================
   RECENT TRANSACTIONS
========================================================= */

function renderTransactions() {

    const list =
        document.getElementById(
            "recentTransactions"
        );


    if (!list) {
        return;
    }


    const latest =
        [...transactions]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 6);


    if (latest.length === 0) {

        list.innerHTML =
            emptyStateHTML(
                "fa-receipt",
                "No transactions yet",
                "Add your first transaction."
            );

        return;

    }


    list.innerHTML =
        latest
            .map(
                createTransactionHTML
            )
            .join("");

}


function createTransactionHTML(
    transaction
) {

    let icon =
        "fa-wallet";

    let iconClass =
        "expense";

    let amountClass =
        "expense";

    let prefix =
        "-";


    switch (
        transaction.type
    ) {

        case "income":

            icon =
                "fa-arrow-down";

            iconClass =
                "salary";

            amountClass =
                "income";

            prefix =
                "+";

            break;


        case "expense":

            icon =
                getExpenseIcon(
                    transaction.category,
                    transaction.description
                );

            iconClass =
                "expense";

            amountClass =
                "expense";

            prefix =
                "-";

            break;


        case "lent":

            icon =
                "fa-hand-holding-dollar";

            iconClass =
                "lent";

            amountClass =
                "lent-amount";

            prefix =
                "-";

            break;


        case "borrowed":

            icon =
                "fa-money-bill-transfer";

            iconClass =
                "borrowed";

            amountClass =
                "borrowed-amount";

            prefix =
                "+";

            break;


        case "repayment_received":

            icon =
                "fa-arrow-left";

            iconClass =
                "income";

            amountClass =
                "income";

            prefix =
                "+";

            break;


        case "repayment_paid":

            icon =
                "fa-arrow-right";

            iconClass =
                "expense";

            amountClass =
                "expense";

            prefix =
                "-";

            break;

    }


    const personText =
        transaction.person
            ? ` • ${escapeHTML(
                transaction.person
            )}`
            : "";


    return `

        <div class="transaction">

            <div class="transaction-icon ${iconClass}">

                <i class="fa-solid ${icon}"></i>

            </div>


            <div class="transaction-info">

                <strong>
                    ${escapeHTML(
                        transaction.description
                    )}
                </strong>

                <span>
                    ${getRelativeDate(
                        transaction.date
                    )}${personText}
                </span>

            </div>


            <div class="transaction-amount ${amountClass}">

                ${prefix}
                ${formatMoney(
                    transaction.amount
                )}

            </div>

        </div>

    `;

}


/* =========================================================
   RELATIVE DATE
========================================================= */

function getRelativeDate(
    dateString
) {

    if (
        dateString ===
        getToday()
    ) {

        return "Today";

    }


    if (
        dateString ===
        getYesterday()
    ) {

        return "Yesterday";

    }


    return formatDate(
        dateString
    );

}


/* =========================================================
   EXPENSE FILTER SETUP
========================================================= */

function setupExpenseFilters() {

    const search =
        document.getElementById(
            "expenseSearch"
        );


    const category =
        document.getElementById(
            "expenseCategory"
        );


    const date =
        document.getElementById(
            "expenseDateFilter"
        );


    if (search) {

        search.addEventListener(
            "input",
            renderExpenses
        );

    }


    if (category) {

        category.addEventListener(
            "change",
            renderExpenses
        );

    }


    if (date) {

        date.addEventListener(
            "change",
            renderExpenses
        );

    }

}


/* =========================================================
   CLEAR EXPENSE FILTERS
========================================================= */

function clearExpenseFilters() {

    const search =
        document.getElementById(
            "expenseSearch"
        );


    const category =
        document.getElementById(
            "expenseCategory"
        );


    const date =
        document.getElementById(
            "expenseDateFilter"
        );


    if (search) {
        search.value = "";
    }


    if (category) {
        category.value = "all";
    }


    if (date) {
        date.value = "";
    }


    renderExpenses();

}


/* =========================================================
   RENDER EXPENSES
========================================================= */

function renderExpenses() {

    const list =
        document.getElementById(
            "expenseList"
        );


    if (!list) {
        return;
    }


    const searchInput =
        document.getElementById(
            "expenseSearch"
        );


    const categoryInput =
        document.getElementById(
            "expenseCategory"
        );


    const dateInput =
        document.getElementById(
            "expenseDateFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const category =
        categoryInput
            ? categoryInput.value
            : "all";


    const selectedDate =
        dateInput
            ? dateInput.value
            : "";


    let expenseList =
        transactions.filter(
            t =>
                t.type ===
                "expense"
        );


    /*
       SEARCH
    */

    if (search) {

        expenseList =
            expenseList.filter(
                function (transaction) {

                    const text =
                        (
                            transaction.description ||
                            ""
                        ).toLowerCase();


                    const cat =
                        (
                            transaction.category ||
                            ""
                        ).toLowerCase();


                    return (
                        text.includes(search) ||
                        cat.includes(search)
                    );

                }
            );

    }


    /*
       CATEGORY
    */

    if (
        category &&
        category !== "all"
    ) {

        expenseList =
            expenseList.filter(
                t =>
                    (
                        t.category ||
                        "other"
                    ).toLowerCase() ===
                    category.toLowerCase()
            );

    }


    /*
       DATE
    */

    if (selectedDate) {

        expenseList =
            expenseList.filter(
                t =>
                    t.date ===
                    selectedDate
            );

    }


    expenseList.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );


    updateExpenseSummary();


    /*
       EMPTY
    */

    if (expenseList.length === 0) {

        list.innerHTML =
            emptyStateHTML(
                "fa-receipt",
                "No expenses found",
                "Try changing your filters or add a new expense."
            );

        return;

    }


    list.innerHTML =
        expenseList
            .map(
                createExpenseHTML
            )
            .join("");

}


/* =========================================================
   EXPENSE SUMMARY
========================================================= */

function updateExpenseSummary() {

    const expenses =
        transactions.filter(
            t =>
                t.type ===
                "expense"
        );


    const total =
        expenses.reduce(
            (sum, t) =>
                sum +
                Number(
                    t.amount || 0
                ),
            0
        );


    const monthStart =
        new Date();

    monthStart.setDate(1);


    const monthTotal =
        expenses
            .filter(
                function (t) {

                    const date =
                        new Date(
                            t.date +
                            "T00:00:00"
                        );


                    return (
                        date.getMonth() ===
                            monthStart.getMonth() &&
                        date.getFullYear() ===
                            monthStart.getFullYear()
                    );

                }
            )
            .reduce(
                (sum, t) =>
                    sum +
                    Number(
                        t.amount || 0
                    ),
                0
            );


    const totalElement =
        document.getElementById(
            "expensePageTotal"
        );


    const monthElement =
        document.getElementById(
            "expenseMonthTotal"
        );


    const countElement =
        document.getElementById(
            "expenseTransactionCount"
        );


    if (totalElement) {

        totalElement.textContent =
            formatMoney(total);

    }


    if (monthElement) {

        monthElement.textContent =
            formatMoney(monthTotal);

    }


    if (countElement) {

        countElement.textContent =
            expenses.length;

    }

}


/* =========================================================
   EXPENSE HTML
========================================================= */

function createExpenseHTML(
    transaction
) {

    const icon =
        getExpenseIcon(
            transaction.category,
            transaction.description
        );


    return `

        <div class="expense-row">

            <div class="expense-row-icon food">

                <i class="fa-solid ${icon}"></i>

            </div>


            <div class="expense-row-info">

                <strong>
                    ${escapeHTML(
                        transaction.description
                    )}
                </strong>

                <span>
                    ${formatDate(
                        transaction.date
                    )}
                </span>

            </div>


            <div class="expense-row-category">

                ${escapeHTML(
                    getCategoryName(
                        transaction.category
                    )
                )}

            </div>


            <div class="expense-row-amount">

                - ${formatMoney(
                    transaction.amount
                )}

            </div>


            <div class="row-actions">

                <button
                    class="row-action-btn"
                    onclick="editTransaction(${transaction.id})"
                    title="Edit"
                >

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    class="row-action-btn delete"
                    onclick="deleteTransaction(${transaction.id})"
                    title="Delete"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   CATEGORY NAME
========================================================= */

function getCategoryName(
    category
) {

    const names = {

        food: "Food",

        fuel: "Fuel",

        shopping: "Shopping",

        bills: "Bills",

        transport: "Transport",

        health: "Health",

        salary: "Salary",

        business: "Business",

        lent: "Lent",

        borrowed: "Borrowed",

        repayment: "Repayment",

        income: "Income",

        other: "Other"

    };


    return (
        names[category] ||
        category ||
        "Other"
    );

}


/* =========================================================
   EXPENSE ICON
========================================================= */

function getExpenseIcon(
    category,
    description
) {

    const text =
        (
            (category || "") +
            " " +
            (description || "")
        ).toLowerCase();


    if (
        text.includes("food") ||
        text.includes("meal") ||
        text.includes("restaurant")
    ) {

        return "fa-utensils";

    }


    if (
        text.includes("fuel") ||
        text.includes("petrol") ||
        text.includes("diesel")
    ) {

        return "fa-gas-pump";

    }


    if (
        text.includes("shop") ||
        text.includes("shopping")
    ) {

        return "fa-bag-shopping";

    }


    if (
        text.includes("bill") ||
        text.includes("electricity") ||
        text.includes("water")
    ) {

        return "fa-file-invoice-dollar";

    }


    if (
        text.includes("phone") ||
        text.includes("mobile")
    ) {

        return "fa-mobile-screen";

    }


    if (
        text.includes("travel") ||
        text.includes("transport")
    ) {

        return "fa-car";

    }


    if (
        text.includes("health") ||
        text.includes("medicine")
    ) {

        return "fa-heart-pulse";

    }


    return "fa-wallet";

}


/* =========================================================
   FRIEND MODAL
========================================================= */

function openFriendModal() {

    const modal =
        document.getElementById(
            "friendModal"
        );


    if (!modal) {
        return;
    }


    editingFriendId =
        null;


    const form =
        document.getElementById(
            "friendForm"
        );


    if (form) {
        form.reset();
    }


    const title =
        modal.querySelector(
            ".modal-header h2"
        );


    if (title) {

        title.textContent =
            "Add Friend";

    }


    const button =
        modal.querySelector(
            ".save-btn"
        );


    if (button) {

        button.innerHTML =
            '<i class="fa-solid fa-user-plus"></i> Save Friend';

    }


    modal.classList.add(
        "show"
    );

    document.body.classList.add(
        "modal-open"
    );

}


function closeFriendModal() {

    const modal =
        document.getElementById(
            "friendModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "modal-open"
    );


    editingFriendId =
        null;

}


/* =========================================================
   SAVE FRIEND
========================================================= */

function saveFriend(event) {

    event.preventDefault();


    const nameInput =
        document.getElementById(
            "friendName"
        );


    const phoneInput =
        document.getElementById(
            "friendPhone"
        );


    const noteInput =
        document.getElementById(
            "friendNote"
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const phone =
        phoneInput
            ? phoneInput.value.trim()
            : "";


    const note =
        noteInput
            ? noteInput.value.trim()
            : "";


    if (!name) {

        showMessage(
            "Please enter friend's name.",
            "error"
        );

        return;

    }


    /*
       EDIT
    */

    if (editingFriendId) {

        const friend =
            friends.find(
                f =>
                    f.id ===
                    editingFriendId
            );


        if (friend) {

            const oldName =
                friend.name;


            friend.name =
                name;

            friend.phone =
                phone;

            friend.note =
                note ||
                "Friend";


            /*
               Update transaction person
               when friend name changes.
            */

            transactions.forEach(
                function (transaction) {

                    if (
                        transaction.person &&
                        transaction.person.toLowerCase() ===
                        oldName.toLowerCase()
                    ) {

                        transaction.person =
                            name;

                    }

                }
            );


            saveFriends();
            saveTransactions();


            showMessage(
                "Friend updated successfully."
            );

        }

    }


    /*
       ADD
    */

    else {

        const exists =
            friends.some(
                f =>
                    f.name.toLowerCase() ===
                    name.toLowerCase()
            );


        if (exists) {

            showMessage(
                "This friend already exists.",
                "error"
            );

            return;

        }


        friends.push({

            id:
                generateId(),

            name:
                name,

            phone:
                phone,

            note:
                note ||
                "Friend"

        });


        saveFriends();


        showMessage(
            "Friend added successfully."
        );

    }


    closeFriendModal();


    updateEverything();

}


/* =========================================================
   RENDER FRIENDS
========================================================= */

function renderFriends() {

    const list =
        document.getElementById(
            "friendsList"
        );


    if (!list) {
        return;
    }


    let totalOwed = 0;
    let activeCount = 0;


    friends.forEach(
        function (friend) {

            const balance =
                getPersonOwedAmount(
                    friend.name
                );


            totalOwed +=
                balance;


            if (balance > 0) {

                activeCount++;

            }

        }
    );


    const totalElement =
        document.getElementById(
            "friendsTotalOwed"
        );


    const countElement =
        document.getElementById(
            "friendsCount"
        );


    const activeElement =
        document.getElementById(
            "friendsActiveCount"
        );


    if (totalElement) {

        totalElement.textContent =
            formatMoney(totalOwed);

    }


    if (countElement) {

        countElement.textContent =
            friends.length;

    }


    if (activeElement) {

        activeElement.textContent =
            activeCount;

    }


    if (friends.length === 0) {

        list.innerHTML =
            emptyStateHTML(
                "fa-user-group",
                "No friends added",
                "Add a friend to start tracking money."
            );

        return;

    }


    list.innerHTML =
        friends
            .map(
                createFriendHTML
            )
            .join("");

}


/* =========================================================
   FRIEND BALANCE
========================================================= */

function getPersonOwedAmount(
    name
) {

    let lent = 0;
    let received = 0;


    transactions.forEach(
        function (t) {

            if (
                !t.person ||
                t.person.toLowerCase() !==
                name.toLowerCase()
            ) {

                return;

            }


            if (
                t.type === "lent"
            ) {

                lent +=
                    Number(
                        t.amount || 0
                    );

            }


            if (
                t.type ===
                "repayment_received"
            ) {

                received +=
                    Number(
                        t.amount || 0
                    );

            }

        }
    );


    return Math.max(
        0,
        lent - received
    );

}


/* =========================================================
   FRIEND HTML
========================================================= */

function createFriendHTML(
    friend
) {

    const owed =
        getPersonOwedAmount(
            friend.name
        );


    return `

        <div class="person-card">

            <div class="person-card-header">

                <div class="person-avatar">

                    ${escapeHTML(
                        getInitials(
                            friend.name
                        )
                    )}

                </div>


                <div>

                    <h3>
                        ${escapeHTML(
                            friend.name
                        )}
                    </h3>

                    <span>
                        ${escapeHTML(
                            friend.note ||
                            "Friend"
                        )}
                    </span>

                </div>


                <button
                    class="delete-person"
                    onclick="deleteFriend(${friend.id})"
                    title="Delete friend"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>


            ${
                friend.phone
                    ? `
                    <div style="margin-top:10px; font-size:13px; opacity:.7;">
                        <i class="fa-solid fa-phone"></i>
                        ${escapeHTML(
                            friend.phone
                        )}
                    </div>
                    `
                    : ""
            }


            <div class="person-money">

                <div>

                    <small>
                        Owes You
                    </small>

                    <strong class="owed">
                        ${formatMoney(owed)}
                    </strong>

                </div>


                <div style="display:flex; gap:8px;">

                    <button
                        class="primary-btn"
                        onclick="openRepaymentModal('${escapeAttribute(friend.name)}')"
                    >

                        <i class="fa-solid fa-money-bill-transfer"></i>

                        Repayment

                    </button>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   DELETE FRIEND
========================================================= */

function deleteFriend(id) {

    const friend =
        friends.find(
            f =>
                f.id === id
        );


    if (!friend) {
        return;
    }


    if (
        !confirm(
            `Delete friend "${friend.name}"?`
        )
    ) {

        return;

    }


    friends =
        friends.filter(
            f =>
                f.id !== id
        );


    saveFriends();


    renderFriends();


    showMessage(
        "Friend deleted."
    );

}


/* =========================================================
   DEBT MODAL
========================================================= */

function openDebtModal() {

    const modal =
        document.getElementById(
            "debtModal"
        );


    if (!modal) {
        return;
    }


    editingDebtId =
        null;


    const form =
        document.getElementById(
            "debtForm"
        );


    if (form) {
        form.reset();
    }


    const date =
        document.getElementById(
            "debtDate"
        );


    if (date) {
        date.value =
            getToday();
    }


    modal.classList.add(
        "show"
    );

    document.body.classList.add(
        "modal-open"
    );

}


function closeDebtModal() {

    const modal =
        document.getElementById(
            "debtModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "modal-open"
    );


    editingDebtId =
        null;

}


/* =========================================================
   SAVE DEBT
========================================================= */

function saveDebt(event) {

    event.preventDefault();


    const personInput =
        document.getElementById(
            "debtPerson"
        );


    const amountInput =
        document.getElementById(
            "debtAmount"
        );


    const dateInput =
        document.getElementById(
            "debtDate"
        );


    const dueDateInput =
        document.getElementById(
            "debtDueDate"
        );


    const noteInput =
        document.getElementById(
            "debtNote"
        );


    const person =
        personInput
            ? personInput.value.trim()
            : "";


    const amount =
        Number(
            amountInput
                ? amountInput.value
                : 0
        );


    const date =
        dateInput
            ? dateInput.value
            : getToday();


    const dueDate =
        dueDateInput
            ? dueDateInput.value
            : "";


    const note =
        noteInput
            ? noteInput.value.trim()
            : "";


    if (!person) {

        showMessage(
            "Please enter the person or organization.",
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


    /*
       Debt is recorded as borrowed money.
    */

    transactions.unshift({

        id:
            generateId(),

        type:
            "borrowed",

        amount:
            amount,

        description:
            note ||
            `Borrowed from ${person}`,

        category:
            "borrowed",

        date:
            date,

        person:
            person,

        dueDate:
            dueDate

    });


    saveTransactions();


    closeDebtModal();


    updateEverything();


    showMessage(
        "Debt added successfully."
    );

}


/* =========================================================
   DEBT CALCULATIONS
========================================================= */

function getDebtSummary() {

    let totalDebt = 0;
    let remaining = 0;
    let active = 0;


    const people = {};


    transactions.forEach(
        function (t) {

            if (!t.person) {
                return;
            }


            const key =
                t.person.toLowerCase();


            if (!people[key]) {

                people[key] = {

                    borrowed: 0,

                    paid: 0

                };

            }


            if (
                t.type ===
                "borrowed"
            ) {

                people[key].borrowed +=
                    Number(
                        t.amount || 0
                    );

            }


            if (
                t.type ===
                "repayment_paid"
            ) {

                people[key].paid +=
                    Number(
                        t.amount || 0
                    );

            }

        }
    );


    Object.values(
        people
    ).forEach(
        function (person) {

            totalDebt +=
                person.borrowed;


            const balance =
                Math.max(
                    0,
                    person.borrowed -
                    person.paid
                );


            remaining +=
                balance;


            if (balance > 0) {

                active++;

            }

        }
    );


    return {

        totalDebt:
            totalDebt,

        remaining:
            remaining,

        active:
            active

    };

}


/* =========================================================
   RENDER DEBTS
========================================================= */

function renderDebts() {

    const list =
        document.getElementById(
            "debtsList"
        );


    if (!list) {
        return;
    }


    const summary =
        getDebtSummary();


    const total =
        document.getElementById(
            "debtsTotal"
        );


    const remaining =
        document.getElementById(
            "debtsRemaining"
        );


    const active =
        document.getElementById(
            "debtsActiveCount"
        );


    if (total) {

        total.textContent =
            formatMoney(
                summary.totalDebt
            );

    }


    if (remaining) {

        remaining.textContent =
            formatMoney(
                summary.remaining
            );

    }


    if (active) {

        active.textContent =
            summary.active;

    }


    const people = {};


    transactions.forEach(
        function (t) {

            if (!t.person) {
                return;
            }


            const key =
                t.person.toLowerCase();


            if (!people[key]) {

                people[key] = {

                    name:
                        t.person,

                    borrowed:
                        0,

                    paid:
                        0,

                    lent:
                        0,

                    received:
                        0

                };

            }


            const person =
                people[key];


            if (
                t.type ===
                "borrowed"
            ) {

                person.borrowed +=
                    Number(
                        t.amount || 0
                    );

            }


            if (
                t.type ===
                "repayment_paid"
            ) {

                person.paid +=
                    Number(
                        t.amount || 0
                    );

            }


            if (
                t.type ===
                "lent"
            ) {

                person.lent +=
                    Number(
                        t.amount || 0
                    );

            }


            if (
                t.type ===
                "repayment_received"
            ) {

                person.received +=
                    Number(
                        t.amount || 0
                    );

            }

        }
    );


    const debtPeople =
        Object.values(
            people
        ).filter(
            function (person) {

                const owe =
                    person.borrowed -
                    person.paid;

                const owedToYou =
                    person.lent -
                    person.received;


                return (
                    owe > 0 ||
                    owedToYou > 0
                );

            }
        );


    if (
        debtPeople.length ===
        0
    ) {

        list.innerHTML =
            emptyStateHTML(
                "fa-credit-card",
                "No active debts",
                "Your borrowed money will appear here."
            );

        return;

    }


    list.innerHTML =
        debtPeople
            .map(
                createDebtHTML
            )
            .join("");

}


/* =========================================================
   DEBT HTML
========================================================= */

function createDebtHTML(
    person
) {

    const youOwe =
        Math.max(
            0,
            person.borrowed -
            person.paid
        );


    const owedToYou =
        Math.max(
            0,
            person.lent -
            person.received
        );


    let label =
        "You Owe";


    let amount =
        youOwe;


    let amountClass =
        "debt";


    if (
        owedToYou >
        0
    ) {

        label =
            "Owes You";

        amount =
            owedToYou;

        amountClass =
            "owed";

    }


    return `

        <div class="person-card">

            <div class="person-card-header">

                <div class="person-avatar">

                    ${escapeHTML(
                        getInitials(
                            person.name
                        )
                    )}

                </div>


                <div>

                    <h3>
                        ${escapeHTML(
                            person.name
                        )}
                    </h3>

                    <span>
                        Debt overview
                    </span>

                </div>

            </div>


            <div class="person-money">

                <div>

                    <small>
                        ${label}
                    </small>

                    <strong class="${amountClass}">
                        ${formatMoney(amount)}
                    </strong>

                </div>


                <button
                    class="primary-btn"
                    onclick="openRepaymentModal('${escapeAttribute(person.name)}')"
                >

                    <i class="fa-solid fa-money-bill-transfer"></i>

                    Repayment

                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   REPAYMENT
========================================================= */

function openRepaymentModal(
    personName
) {

    const personTransactions =
        transactions.filter(
            t =>
                t.person &&
                t.person.toLowerCase() ===
                personName.toLowerCase()
        );


    let lent = 0;
    let received = 0;

    let borrowed = 0;
    let paid = 0;


    personTransactions.forEach(
        function (t) {

            const amount =
                Number(
                    t.amount || 0
                );


            if (
                t.type === "lent"
            ) {

                lent += amount;

            }


            if (
                t.type ===
                "repayment_received"
            ) {

                received += amount;

            }


            if (
                t.type ===
                "borrowed"
            ) {

                borrowed += amount;

            }


            if (
                t.type ===
                "repayment_paid"
            ) {

                paid += amount;

            }

        }
    );


    const friendOwesYou =
        Math.max(
            0,
            lent - received
        );


    const youOweFriend =
        Math.max(
            0,
            borrowed - paid
        );


    if (
        friendOwesYou <= 0 &&
        youOweFriend <= 0
    ) {

        showMessage(
            "No active debt found for this person.",
            "error"
        );

        return;

    }


    /*
       Ask which direction when both exist.
    */

    let repaymentType =
        "";


    if (
        friendOwesYou > 0 &&
        youOweFriend > 0
    ) {

        const choice =
            prompt(
                `Choose repayment type for ${personName}:\n\n1 = Receive money from them\n2 = Pay money to them`
            );


        if (
            choice !== "1" &&
            choice !== "2"
        ) {

            return;

        }


        repaymentType =
            choice === "1"
                ? "received"
                : "paid";

    }

    else if (
        friendOwesYou > 0
    ) {

        repaymentType =
            "received";

    }

    else {

        repaymentType =
            "paid";

    }


    const available =
        repaymentType ===
            "received"
            ? friendOwesYou
            : youOweFriend;


    const amountText =
        prompt(
            `Enter repayment amount.\nMaximum: ${formatMoney(available)}`
        );


    if (
        amountText ===
        null
    ) {

        return;

    }


    const amount =
        Number(amountText);


    if (
        !amount ||
        amount <= 0
    ) {

        showMessage(
            "Enter a valid repayment amount.",
            "error"
        );

        return;

    }


    const actualAmount =
        Math.min(
            amount,
            available
        );


    transactions.unshift({

        id:
            generateId(),

        type:
            repaymentType ===
                "received"
                ? "repayment_received"
                : "repayment_paid",

        amount:
            actualAmount,

        description:
            repaymentType ===
                "received"
                ? `Repayment received from ${personName}`
                : `Repayment paid to ${personName}`,

        category:
            "repayment",

        person:
            personName,

        date:
            getToday()

    });


    saveTransactions();


    updateEverything();


    showMessage(
        repaymentType ===
            "received"
            ? "Repayment received recorded."
            : "Repayment paid recorded."
    );

}


/* =========================================================
   REPORTS
========================================================= */

function renderReports() {

    const data =
        calculateFinancialData();


    const income =
        document.getElementById(
            "reportIncome"
        );


    const expenses =
        document.getElementById(
            "reportExpenses"
        );


    const lent =
        document.getElementById(
            "reportLent"
        );


    const borrowed =
        document.getElementById(
            "reportBorrowed"
        );


    if (income) {

        income.textContent =
            formatMoney(
                data.income
            );

    }


    if (expenses) {

        expenses.textContent =
            formatMoney(
                data.expenses
            );

    }


    if (lent) {

        lent.textContent =
            formatMoney(
                data.lent
            );

    }


    if (borrowed) {

        borrowed.textContent =
            formatMoney(
                data.borrowed
            );

    }


    renderMonthlyReport();

    renderCategoryReport();

}


/* =========================================================
   MONTHLY REPORT
========================================================= */

function renderMonthlyReport() {

    const container =
        document.getElementById(
            "monthlyReport"
        );


    if (!container) {
        return;
    }


    const months = {};


    transactions.forEach(
        function (t) {

            if (
                t.type !==
                "expense"
            ) {

                return;

            }


            const date =
                new Date(
                    t.date +
                    "T00:00:00"
                );


            const key =
                date.getFullYear() +
                "-" +
                String(
                    date.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );


            if (!months[key]) {

                months[key] = {

                    label:
                        date.toLocaleDateString(
                            "en-US",
                            {
                                month: "long",
                                year: "numeric"
                            }
                        ),

                    amount:
                        0

                };

            }


            months[key].amount +=
                Number(
                    t.amount || 0
                );

        }
    );


    /*
       Newest month first
    */

    const values =
        Object.entries(
            months
        )
        .sort(
            (a, b) =>
                b[0].localeCompare(
                    a[0]
                )
        )
        .slice(0, 6)
        .map(
            item =>
                item[1]
        );


    if (
        values.length ===
        0
    ) {

        container.innerHTML =
            emptyStateHTML(
                "fa-chart-column",
                "No report data",
                "Add expenses to generate reports."
            );

        return;

    }


    const max =
        Math.max(
            ...values.map(
                v =>
                    v.amount
            ),
            1
        );


    container.innerHTML =
        values
            .map(
                function (month) {

                    const percent =
                        (
                            month.amount /
                            max
                        ) * 100;


                    return `

                        <div class="month-row">

                            <div class="month-row-top">

                                <strong>
                                    ${escapeHTML(
                                        month.label
                                    )}
                                </strong>

                                <span>
                                    ${formatMoney(
                                        month.amount
                                    )}
                                </span>

                            </div>


                            <div class="report-progress">

                                <span
                                    style="width:${percent}%"
                                ></span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   CATEGORY REPORT
========================================================= */

function renderCategoryReport() {

    const container =
        document.getElementById(
            "categoryReport"
        );


    if (!container) {
        return;
    }


    const categories = {};


    transactions.forEach(
        function (t) {

            if (
                t.type !==
                "expense"
            ) {

                return;

            }


            const category =
                t.category ||
                "other";


            categories[category] =
                (
                    categories[category] ||
                    0
                ) +
                Number(
                    t.amount || 0
                );

        }
    );


    const values =
        Object.entries(
            categories
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        );


    if (
        values.length ===
        0
    ) {

        container.innerHTML =
            emptyStateHTML(
                "fa-chart-pie",
                "No categories yet",
                "Your expense categories will appear here."
            );

        return;

    }


    const max =
        values[0][1];


    container.innerHTML =
        values
            .slice(0, 8)
            .map(
                function (item) {

                    const category =
                        item[0];

                    const amount =
                        item[1];


                    const percent =
                        (
                            amount /
                            max
                        ) * 100;


                    return `

                        <div class="category-row">

                            <div class="category-name">

                                ${escapeHTML(
                                    getCategoryName(
                                        category
                                    )
                                )}

                            </div>


                            <div class="category-bar">

                                <span
                                    style="width:${percent}%"
                                ></span>

                            </div>


                            <div class="category-value">

                                ${formatMoney(
                                    amount
                                )}

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   REMINDER MODAL
========================================================= */

function openReminderModal() {

    const modal =
        document.getElementById(
            "reminderModal"
        );


    if (!modal) {
        return;
    }


    editingReminderId =
        null;


    const form =
        document.getElementById(
            "reminderForm"
        );


    if (form) {
        form.reset();
    }


    const date =
        document.getElementById(
            "reminderDate"
        );


    if (date) {

        date.value =
            getToday();

    }


    const title =
        modal.querySelector(
            ".modal-header h2"
        );


    const button =
        modal.querySelector(
            ".save-btn"
        );


    if (title) {

        title.textContent =
            "Add Reminder";

    }


    if (button) {

        button.innerHTML =
            '<i class="fa-solid fa-bell"></i> Save Reminder';

    }


    modal.classList.add(
        "show"
    );

    document.body.classList.add(
        "modal-open"
    );

}


function closeReminderModal() {

    const modal =
        document.getElementById(
            "reminderModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "modal-open"
    );


    editingReminderId =
        null;

}


/* =========================================================
   SAVE REMINDER
========================================================= */

function saveReminder(event) {

    event.preventDefault();


    const titleInput =
        document.getElementById(
            "reminderTitle"
        );


    const amountInput =
        document.getElementById(
            "reminderAmount"
        );


    const dateInput =
        document.getElementById(
            "reminderDate"
        );


    const noteInput =
        document.getElementById(
            "reminderNote"
        );


    const title =
        titleInput
            ? titleInput.value.trim()
            : "";


    const amount =
        Number(
            amountInput
                ? amountInput.value
                : 0
        );


    const date =
        dateInput
            ? dateInput.value
            : "";


    const note =
        noteInput
            ? noteInput.value.trim()
            : "";


    if (!title) {

        showMessage(
            "Please enter a reminder.",
            "error"
        );

        return;

    }


    if (!date) {

        showMessage(
            "Please select a due date.",
            "error"
        );

        return;

    }


    if (editingReminderId) {

        const reminder =
            reminders.find(
                r =>
                    r.id ===
                    editingReminderId
            );


        if (reminder) {

            reminder.title =
                title;

            reminder.amount =
                amount;

            reminder.date =
                date;

            reminder.note =
                note;

        }


        showMessage(
            "Reminder updated successfully."
        );

    }


    else {

        reminders.push({

            id:
                generateId(),

            title:
                title,

            amount:
                amount,

            date:
                date,

            note:
                note,

            completed:
                false

        });


        showMessage(
            "Reminder added successfully."
        );

    }


    saveReminders();


    closeReminderModal();


    updateEverything();

}


/* =========================================================
   REMINDER TABS
========================================================= */

function setupReminderTabs() {

    const tabs =
        document.querySelectorAll(
            ".reminder-tab"
        );


    tabs.forEach(
        function (tab) {

            tab.addEventListener(
                "click",
                function () {

                    tabs.forEach(
                        t =>
                            t.classList.remove(
                                "active"
                            )
                    );


                    this.classList.add(
                        "active"
                    );


                    reminderFilter =
                        this.dataset.filter ||
                        "all";


                    renderReminders();

                }
            );

        }
    );

}


/* =========================================================
   REMINDER STATUS
========================================================= */

function isReminderToday(
    reminder
) {

    return (
        !reminder.completed &&
        reminder.date ===
        getToday()
    );

}


function isReminderOverdue(
    reminder
) {

    return (
        !reminder.completed &&
        reminder.date <
        getToday()
    );

}


function isReminderUpcoming(
    reminder
) {

    return (
        !reminder.completed &&
        reminder.date >
        getToday()
    );

}


/* =========================================================
   RENDER REMINDERS
========================================================= */

function renderReminders() {

    const list =
        document.getElementById(
            "reminderList"
        );


    if (!list) {
        return;
    }


    let filtered =
        [...reminders];


    switch (
        reminderFilter
    ) {

        case "today":

            filtered =
                filtered.filter(
                    isReminderToday
                );

            break;


        case "upcoming":

            filtered =
                filtered.filter(
                    isReminderUpcoming
                );

            break;


        case "overdue":

            filtered =
                filtered.filter(
                    isReminderOverdue
                );

            break;

    }


    filtered.sort(
        function (a, b) {

            return (
                new Date(a.date) -
                new Date(b.date)
            );

        }
    );


    if (
        filtered.length ===
        0
    ) {

        list.innerHTML =
            emptyStateHTML(
                "fa-bell",
                "No reminders",
                "Create a reminder to stay on track."
            );

        return;

    }


    list.innerHTML =
        filtered
            .map(
                createReminderHTML
            )
            .join("");

}


/* =========================================================
   REMINDER HTML
========================================================= */

function createReminderHTML(
    reminder
) {

    let status =
        "Upcoming";

    let className =
        "upcoming";


    if (
        reminder.completed
    ) {

        status =
            "Completed";

        className =
            "completed";

    }

    else if (
        isReminderToday(
            reminder
        )
    ) {

        status =
            "Due Today";

        className =
            "due";

    }

    else if (
        isReminderOverdue(
            reminder
        )
    ) {

        status =
            "Overdue";

        className =
            "due";

    }


    return `

        <div class="reminder-page-card ${className}">

            <div class="reminder-page-icon">

                <i class="fa-solid fa-bell"></i>

            </div>


            <div class="reminder-page-info">

                <strong>
                    ${escapeHTML(
                        reminder.title
                    )}
                </strong>

                <span>
                    ${
                        reminder.amount > 0
                            ? formatMoney(
                                reminder.amount
                            )
                            : "No amount"
                    }
                </span>

                <small>

                    ${status}

                    •

                    ${formatDate(
                        reminder.date
                    )}

                    ${
                        reminder.note
                            ? " • " +
                              escapeHTML(
                                  reminder.note
                              )
                            : ""
                    }

                </small>

            </div>


            <div class="reminder-page-actions">

                <button
                    class="reminder-action"
                    onclick="toggleReminder(${reminder.id})"
                    title="${
                        reminder.completed
                            ? "Mark incomplete"
                            : "Mark completed"
                    }"
                >

                    <i class="fa-solid ${
                        reminder.completed
                            ? "fa-rotate-left"
                            : "fa-check"
                    }"></i>

                </button>


                <button
                    class="reminder-action delete"
                    onclick="deleteReminder(${reminder.id})"
                    title="Delete"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   TOGGLE REMINDER
========================================================= */

function toggleReminder(id) {

    const reminder =
        reminders.find(
            r =>
                r.id === id
        );


    if (!reminder) {
        return;
    }


    reminder.completed =
        !reminder.completed;


    saveReminders();


    updateEverything();


    showMessage(
        reminder.completed
            ? "Reminder completed."
            : "Reminder reopened."
    );

}


/* =========================================================
   DELETE REMINDER
========================================================= */

function deleteReminder(id) {

    const reminder =
        reminders.find(
            r =>
                r.id === id
        );


    if (!reminder) {
        return;
    }


    if (
        !confirm(
            `Delete "${reminder.title}"?`
        )
    ) {

        return;

    }


    reminders =
        reminders.filter(
            r =>
                r.id !== id
        );


    saveReminders();


    updateEverything();


    showMessage(
        "Reminder deleted."
    );

}


/* =========================================================
   DASHBOARD REMINDERS
========================================================= */

function renderDashboardReminders() {

    const container =
        document.getElementById(
            "dashboardReminders"
        );


    if (!container) {
        return;
    }


    const active =
        reminders
            .filter(
                r =>
                    !r.completed
            )
            .sort(
                (a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
            )
            .slice(0, 3);


    if (
        active.length ===
        0
    ) {

        container.innerHTML =
            emptyStateHTML(
                "fa-bell",
                "No active reminders",
                "You're all caught up."
            );

        return;

    }


    container.innerHTML =
        active
            .map(
                createDashboardReminderHTML
            )
            .join("");

}


function createDashboardReminderHTML(
    reminder
) {

    let label =
        "Due " +
        formatShortDate(
            reminder.date
        );


    let className =
        "upcoming";


    if (
        isReminderToday(
            reminder
        )
    ) {

        label =
            "Due Today";

        className =
            "urgent";

    }

    else if (
        isReminderOverdue(
            reminder
        )
    ) {

        label =
            "Overdue";

        className =
            "urgent";

    }


    return `

        <div class="reminder ${className}">

            <div class="reminder-icon">

                <i class="fa-solid fa-bell"></i>

            </div>


            <div class="reminder-info">

                <strong>
                    ${escapeHTML(
                        reminder.title
                    )}
                </strong>

                <span>
                    ${
                        reminder.amount > 0
                            ? formatMoney(
                                reminder.amount
                            )
                            : "No amount"
                    }
                </span>

                <small>
                    ${label}
                </small>

            </div>

        </div>

    `;

}


/* =========================================================
   REMINDER COUNT
========================================================= */

function updateReminderCount() {

    const count =
        reminders.filter(
            function (r) {

                return (
                    !r.completed &&
                    (
                        isReminderToday(r) ||
                        isReminderOverdue(r)
                    )
                );

            }
        ).length;


    const elements =
        document.querySelectorAll(
            ".notification-count"
        );


    elements.forEach(
        function (element) {

            element.textContent =
                count;

            element.style.display =
                count > 0
                    ? "flex"
                    : "none";

        }
    );


    /*
       Bell dot
    */

    const dot =
        document.getElementById(
            "notificationDot"
        );


    if (dot) {

        dot.style.display =
            count > 0
                ? "block"
                : "none";

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const links =
        document.querySelectorAll(
            ".menu-item, .mobile-nav-item"
        );


    links.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    const page =
                        this.dataset.page;


                    if (!page) {
                        return;
                    }


                    event.preventDefault();


                    goToPage(
                        page
                    );

                }
            );

        }
    );

}


/* =========================================================
   GO TO PAGE
========================================================= */

function goToPage(
    pageName
) {

    const pageId =
        pageName.endsWith(
            "Page"
        )
            ? pageName
            : pageName + "Page";


    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(
        function (page) {

            page.classList.remove(
                "active-page"
            );

        }
    );


    const target =
        document.getElementById(
            pageId
        );


    if (target) {

        target.classList.add(
            "active-page"
        );

    }


    const navItems =
        document.querySelectorAll(
            ".menu-item, .mobile-nav-item"
        );


    navItems.forEach(
        function (item) {

            item.classList.toggle(
                "active",
                item.dataset.page ===
                pageName
            );

        }
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    /*
       Refresh page-specific content
    */

    switch (
        pageName
    ) {

        case "expenses":

            renderExpenses();

            break;


        case "friends":

            renderFriends();

            break;


        case "debts":

            renderDebts();

            break;


        case "reports":

            renderReports();

            break;


        case "reminders":

            renderReminders();

            break;

    }

}


/* =========================================================
   QUICK ACTION HELPERS
========================================================= */

function quickAdd(
    type
) {

    openTransactionModal(
        type
    );

}


function quickAddFriend() {

    openFriendModal();

}


function quickAddDebt() {

    openDebtModal();

}


function quickAddReminder() {

    openReminderModal();

}


/* =========================================================
   MODAL OUTSIDE CLICK
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const modals =
            document.querySelectorAll(
                ".modal-overlay"
            );


        modals.forEach(
            function (modal) {

                if (
                    event.target ===
                    modal
                ) {

                    modal.classList.remove(
                        "show"
                    );

                    document.body.classList.remove(
                        "modal-open"
                    );

                }

            }
        );

    }
);


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        const modals =
            document.querySelectorAll(
                ".modal-overlay.show"
            );


        modals.forEach(
            function (modal) {

                modal.classList.remove(
                    "show"
                );

            }
        );


        document.body.classList.remove(
            "modal-open"
        );


        editingTransactionId =
            null;

        editingFriendId =
            null;

        editingDebtId =
            null;

        editingReminderId =
            null;

    }
);


/* =========================================================
   EMPTY STATE
========================================================= */

function emptyStateHTML(
    icon,
    title,
    description
) {

    return `

        <div class="empty-state">

            <i class="fa-solid ${icon}"></i>

            <p>
                ${escapeHTML(title)}
            </p>

            <span>
                ${escapeHTML(
                    description
                )}
            </span>

        </div>

    `;

}


/* =========================================================
   TOAST MESSAGE
========================================================= */

function showMessage(
    message,
    type = "success"
) {

    const old =
        document.querySelector(
            ".success-message"
        );


    if (old) {
        old.remove();
    }


    const element =
        document.createElement(
            "div"
        );


    element.className =
        "success-message" +
        (
            type === "error"
                ? " error-message"
                : ""
        );


    element.innerHTML = `

        <i class="fa-solid ${
            type === "error"
                ? "fa-circle-exclamation"
                : "fa-circle-check"
        }"></i>

        <span>
            ${escapeHTML(message)}
        </span>

    `;


    document.body.appendChild(
        element
    );


    setTimeout(
        function () {

            element.classList.add(
                "hide"
            );


            setTimeout(
                function () {

                    element.remove();

                },
                300
            );

        },
        2500
    );

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
    name
) {

    if (!name) {
        return "?";
    }


    const words =
        name
            .trim()
            .split(
                /\s+/
            );


    if (
        words.length ===
        1
    ) {

        return words[0]
            .substring(
                0,
                2
            )
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[
            words.length - 1
        ][0]
    ).toUpperCase();

}


/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    )
    .replace(
        /`/g,
        "&#096;"
    );

}


/* =========================================================
   CONSOLE
========================================================= */

console.log(
    "My Money Manager loaded successfully."
);