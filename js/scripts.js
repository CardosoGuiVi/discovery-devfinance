const Modal = {
    toggle() {
        document
            .querySelector('.modal-overlay')
            .classList
            .toggle('active');
        
        App.reload();
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },

    set(transactions) {
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions));
    },
}

const Transactions = {
    all: Storage.get(),

    add(transaction) {
        Transactions.all.push(transaction);
    },

    remove(index) {
        Transactions.all.splice(index, 1);
    },

    incomes() {
        let income = 0;

        Transactions.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })

        return income;
    },

    expenses() {
        let expense = 0;

        Transactions.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })

        return expense;
    },

    total() {
        return Transactions.incomes() + Transactions.expenses();
    }
}

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');

        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        DOM.transactionContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const CCSclass = transaction.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transaction.amount);
        const html = `
        <td class="description">${transaction.description}</td>
        <td class=${CCSclass}>${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transactions.remove(${index})" src="./assets/minus.svg" alt="Symbol: Remove transaction">
        </td>
        `;

        return html;
    },

    updateBalance() {
        document
            .querySelector('#incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transactions.incomes());
        document
            .querySelector('#expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transactions.expenses());
        document
            .querySelector('#totalDisplay')
            .innerHTML = Utils.formatCurrency(Transactions.total());
    },

    clearTransactions() {
        DOM.transactionContainer.innerHTML = '';
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, '');
        value = Number(value) / 100;
        value = value.toLocaleString('pt-BR', {
            style: "currency",
            currency: "BRL"
        })

        return signal + value;
    },

    formatAmount(value) {
        value = value *100;
        
        return Math.round(value);
    },

    formatDate(date) {
        const splittedDate = date.split('-');
        
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    }
}

const Form = {
    date: document.querySelector('input#date'),
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),

    getValues() {
        return {
            date: Form.date.value,
            description: Form.description.value,
            amount: Form.amount.value,
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues();

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Please fill in all fields!");
        }
    },

    saveTransaction(transaction) {
        Transactions.add(transaction);
    },

    clearFields() {
        Form.description.value = '';
        Form.amount.value = '';
        Form.date.value = '';
    },

    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();
            const transaction = Form.formatValues();
            Form.saveTransaction(transaction);
            Form.clearFields();
            Modal.toggle();

        } catch (error) {
            alert(error.message);
        }

    }
}

const App = {
    init() {
        Transactions.all.forEach(DOM.addTransaction);
        DOM.updateBalance();
        Storage.set(Transactions.all);
    },

    reload() {
        DOM.clearTransactions();
        App.init(); 
    }
}

App.init()