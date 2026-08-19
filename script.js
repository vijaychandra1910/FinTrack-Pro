

const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");
const app = document.getElementById("app");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

const usernameDisplay = document.getElementById("usernameDisplay");
const logoutBtn = document.getElementById("logoutBtn");


showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    loginPage.classList.add("hidden");
    registerPage.classList.remove("hidden");
});

showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registerPage.classList.add("hidden");
    loginPage.classList.remove("hidden");
});


registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (!username || !password) {
        alert("Please fill all fields");
        return;
    }

    const user = { username, password };
    localStorage.setItem("user", JSON.stringify(user));

    alert("Registration Successful!");

    registerForm.reset();
    registerPage.classList.add("hidden");
    loginPage.classList.remove("hidden");
});


loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser) {
        alert("Please Register First");
        return;
    }

    if (username === savedUser.username && password === savedUser.password) {
        localStorage.setItem("isLoggedIn", "true");

        usernameDisplay.textContent = savedUser.username;

        loginPage.classList.add("hidden");
        app.classList.remove("hidden");

        loginForm.reset();
    } else {
        alert("Invalid Username or Password");
    }
});


logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    app.classList.add("hidden");
    loginPage.classList.remove("hidden");
});

window.addEventListener("DOMContentLoaded", () => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const user = JSON.parse(localStorage.getItem("user"));

    if (loggedIn === "true" && user) {
        loginPage.classList.add("hidden");
        app.classList.remove("hidden");
    }

    loadSettings();
    applySettings();   // 🔥 ADD THIS

    initChart();
    renderTransactions();
    updateDashboard();
    updateChart();
});

const dashboardBtn = document.getElementById("dashboardBtn");
const settingsBtn = document.getElementById("settingsBtn");

const dashboardPage = document.getElementById("dashboardPage");
const settingsPage = document.getElementById("settingsPage");

dashboardBtn.addEventListener("click", () => {
    dashboardPage.classList.remove("hidden");
    settingsPage.classList.add("hidden");

    dashboardBtn.classList.add("active");
    settingsBtn.classList.remove("active");
});

settingsBtn.addEventListener("click", () => {
    dashboardPage.classList.add("hidden");
    settingsPage.classList.remove("hidden");

    settingsBtn.classList.add("active");
    dashboardBtn.classList.remove("active");
});



const transactionModal = document.querySelector("#transactionModal");
const addTransactionBtn = document.querySelector("#addTransactionBtn");
const closeModal = document.querySelector("#closeModal");

addTransactionBtn.addEventListener("click", () => {
    editIndex = null;
    form.reset();
    transactionModal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
    transactionModal.classList.add("hidden");
});



const form = document.querySelector("#transactionForm");
const type = document.querySelector("#type");
const description = document.querySelector("#description");
const amount = document.querySelector("#amount");
const date = document.querySelector("#date");
const category = document.querySelector("#category");

const tbody = document.querySelector("#transactionTable");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editIndex = null;


function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}


function renderTransactions() {
    tbody.innerHTML = "";

    transactions.forEach((transaction, index) => {
        const tr = document.createElement("tr");

        const tdDate = document.createElement("td");
        tdDate.textContent = transaction.date;

        const tdDesc = document.createElement("td");
        tdDesc.textContent = transaction.description;

        const tdCat = document.createElement("td");
        tdCat.textContent = transaction.category;

        const tdAmount = document.createElement("td");
      const amt = Number(transaction.amount);

tdAmount.textContent =
    transaction.type === "expense"
        ? `-${formatMoney(amt)}`
        : `+${formatMoney(amt)}`;

        tdAmount.style.color =
            transaction.type === "expense" ? "red" : "green";

        const tdActions = document.createElement("td");

        const editBtn = document.createElement("button");
        editBtn.innerHTML = `<i class="fa-solid fa-pen"></i>`;
        editBtn.classList.add("edit-btn");

        editBtn.addEventListener("click", () => {
            type.value = transaction.type;
            description.value = transaction.description;
            amount.value = transaction.amount;
            date.value = transaction.date;
            category.value = transaction.category;

            editIndex = index;
            transactionModal.classList.remove("hidden");
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        deleteBtn.classList.add("delete-btn");

        deleteBtn.addEventListener("click", () => {
            transactions.splice(index, 1);
            saveTransactions();
            renderTransactions();
            updateDashboard();
            updateChart();
        });

        tdActions.appendChild(editBtn);
        tdActions.appendChild(deleteBtn);

        tr.appendChild(tdDate);
        tr.appendChild(tdDesc);
        tr.appendChild(tdCat);
        tr.appendChild(tdAmount);
        tr.appendChild(tdActions);

        tbody.appendChild(tr);
    });
}



form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!type.value || !description.value || !amount.value || !date.value || !category.value) {
        alert("Please fill all fields");
        return;
    }

    const transaction = {
        id: Date.now(),
        type: type.value,
        description: description.value,
        amount: Number(amount.value),
        date: date.value,
        category: category.value,
    };

    if (editIndex !== null) {
        transactions[editIndex] = transaction;
        editIndex = null;
    } else {
        transactions.push(transaction);
    }

    saveTransactions();

    renderTransactions();
    updateDashboard();
    updateChart();

    form.reset();
    transactionModal.classList.add("hidden");
});



function updateDashboard() {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        const amt = Number(t.amount);
        if (t.type === "income") income += amt;
        else expense += amt;
    });

    const balance = income - expense;

  document.getElementById("income").textContent = `+${formatMoney(income)}`;
document.getElementById("expense").textContent = `-${formatMoney(expense)}`;
document.getElementById("balance").textContent = `${formatMoney(balance)}`;
    document.getElementById("transactionsCount").textContent = transactions.length;
}



let cashFlowChart;

function initChart() {
    const ctx = document.getElementById("cashFlowChart").getContext("2d");

    cashFlowChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                label: "Cash Flow",
                data: [0, 0],
                backgroundColor: ["#22c55e", "#ef4444"],
                borderRadius: 10,
            }],
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
        },
    });
}

function updateChart() {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        const amt = Number(t.amount);
        if (t.type === "income") income += amt;
        else expense += amt;
    });

    cashFlowChart.data.datasets[0].data = [income, expense];
    cashFlowChart.update();
}




const darkModeToggle = document.getElementById("darkMode");

darkModeToggle.addEventListener("change", () => {
    if (darkModeToggle.checked) {
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }
});



const resetDataBtn = document.getElementById("resetData");

resetDataBtn.addEventListener("click", () => {
    if (!confirm("Are you sure you want to reset all transaction data?")) return;

    // Remove ONLY transaction data
    localStorage.removeItem("transactions");

    // Reset array
    transactions = [];

    // Refresh UI
    renderTransactions();
    updateDashboard();
    updateChart();

    alert("Transaction data has been reset successfully.");
});

const fullNameInput = document.getElementById("fullName");
const currencySelect = document.getElementById("currency");
const saveSettingsBtn = document.getElementById("saveSettings");

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem("settings"));

    if (!settings) return;

    if (settings.fullName) {
        fullNameInput.value = settings.fullName;
    }

    if (settings.currency) {
        currencySelect.value = settings.currency;
    }
}
window.addEventListener("DOMContentLoaded", () => {
    initChart();
    loadSettings();
});

function getCurrency() {
    const settings = JSON.parse(localStorage.getItem("settings"));
    return settings?.currency || "$";
}

function formatMoney(amount) {
    return `${getCurrency()}${Number(amount).toFixed(2)}`;
}

saveSettingsBtn.addEventListener("click", () => {
    const settings = {
        fullName: fullNameInput.value.trim(),
        currency: currencySelect.value
    };

    localStorage.setItem("settings", JSON.stringify(settings));

    applySettings(); // update UI immediately
});

function applySettings() {
    const settings = JSON.parse(localStorage.getItem("settings"));

    if (!settings) return;

    // 1. Update header username
    if (settings.fullName) {
        usernameDisplay.textContent = settings.fullName;
    }

    // 2. Update currency globally
    updateDashboard();
    renderTransactions();
    updateChart();
}