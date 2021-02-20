let editControl
let position

const Modal = {
    //adicionar ou remover a class active
    toggle () {
        Form.clearFields()
        document.querySelector('.modal-overlay').classList.toggle('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transaction')) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transaction", JSON.stringify(transactions))
    },
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;

        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;

        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    },

    total() {
        let total = 0;
        total = Transaction.incomes() + Transaction.expenses();
        return total
    },

    editTransaction(index) {
        editControl = true
        Modal.toggle()
        const transaction = Storage.get()
        document.querySelector('.newTransaction').innerHTML = 'Editar Transação'
        Form.description.value = transaction[index].description
        Form.amount.value = (transaction[index].amount/100)
        const dateDDMMYY = transaction[index].date.split('/')
        position = index
        Form.date.value = String(dateDDMMYY[2]+'-'+dateDDMMYY[1]+'-'+dateDDMMYY[0])
    },

    edit(transaction) {
        const finalTransaction = {
            'description': transaction.description,
            'amount': transaction.amount,
            'date': transaction.date
        }
        Transaction.all.splice(position, 1, finalTransaction)
        App.reload()
    },

    extract() {
        const transactions = Transaction.all
        const incomes = Transaction.incomes(transactions)
        const expenses = Transaction.expenses(transactions)

        const currentDate = new Date()

        const date = {
            day: currentDate.getDate(),
            month: currentDate.getMonth(),
            year: currentDate.getFullYear(),
            hours: currentDate.getHours(),
            minutes: currentDate.getMinutes(),
            seconds: currentDate.getSeconds()
        }
        
        let mes = (date.month+1).toString()
        let mesFormatado = mes.length === 1 ? '0'+mes : mes
        
        let text = 'Relatorio'

        let titulo = `<div> <h1> Relatório de Balanço de Finanças </h1> </div>`
        let data  = `<div> \nData: ${date.day}/${mesFormatado}/${date.year} - ${date.hours}:${date.minutes}:${date.seconds}\n </div>`
        let itens = ''

        itens += transactions.reduce(
            (itens, transaction) => 
                (itens += `<tr> <td class="data">${transaction.date}</td> <td class="descricao">${
                    transaction.description
                }</td> <td class="valor">${Utils.formatCurrency(transaction.amount)}</td></tr>`), ""
        )
      
        let tabela = `<table> 
                      <th class="data"> Data </th>
                      <th class="descricao"> Transação </th>
                      <th class="valor"> Valor </th>
                     ${itens} 
                      <tr>
                          <td colspan="2"> Total </td>
                          <td class="valor"> ${Utils.formatCurrency(incomes + expenses)} </td>
                      </tr>
                     </table>`

        Utils.downloadFile(titulo, data, tabela)
    }
}

//transformando as transações do objeto transactions e colocar no html

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const cssClass = transaction.amount > 0 ? 'income' : 'expense'
      
        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${cssClass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick = "Transaction.editTransaction(${index})"src="./assets/edit-solid.svg" style= "cursor: pointer" alt="Editar Transação">
        </td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" style="cursor:pointer" alt="Remover Transação">
        </td>
        `
        return html
    },
    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions() {
        DOM.transactionContainer.innerHTML = ""
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : '' // precisa ser numero

        value = String(value).replace(/\D/g,'')  //achar tudo que não é numero RegX, garante string

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        
        return signal + value
    },

    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100
        
        return value
    },

    formatDate(value) {
        const splittedDate = date.split('-')
    
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatPositiveNegative() {
        const positiveNegative = Transaction.total()/100

        const cardTotalBG = document.querySelector('.card.total')
        if (positiveNegative > 0) {
            cardTotalBG.classList.remove('negativo')
            cardTotalBG.classList.remove('neutro')
            cardTotalBG.classList.add('positivo')
            
        } else if (positiveNegative < 0) {
            cardTotalBG.classList.remove('positivo')
            cardTotalBG.classList.remove('neutro')
            cardTotalBG.classList.add('negativo')
        } else {
            cardTotalBG.classList.remove('positivo')
            cardTotalBG.classList.remove('negativo')
            cardTotalBG.classList.add('neutro')
        }
    },

    // downloadFile(data, name, type) {
    //     const blob = new Blob([data], {
    //         type: type
    //     })

    //     const link = window.document.createElement("a")
    //     link.href = window.URL.createObjectURL(blob)
    //     link.download = `${name.trim().replace(/ +/g, "-")}`
    //     link.click()
    //     window.URL.revokeObjectURL(link.href)
    //     return
    // }

    downloadFile(titulo, data, tabela) {
        let win = window.open("", "", "height=700, width=700")
        let style = `<style>
                   * {margin: 0;}

                   ul {margin: 20px 0px;}

                   table, th, td {border: solid 1px #DDD; border-collapse: collapse; padding: 2px 3px;text-align: center; margin-top: 10px; margin-bottom: 10px; width: 90%;}

                   table .data {
                       text-align: left;
                       width: 25%;
                   }

                   table .descricao {
                    text-align: left;
                    width: 50%;
                   }

                   table .valor {
                    text-align: right;
                    width: 25%;
                   }

                   table th {
                       color: #444;
                   }

               </style>`
        win.document.write('<html> <head>')
        win.document.write('<title> Extrato </title>')
        win.document.write(style)
        win.document.write('</head>')
        win.document.write(`<body>`)
        win.document.write(`${titulo}`)
        win.document.write(`${data}`)
        win.document.write(`${tabela}`)
        win.document.write('</body> </html>')
        win.document.close()
        win.print()
        
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields () {
        //destructuring, criando tres variaveis pra receber as tres propriedades do objeto (tudo em uma unica linha)

        const { description, amount, date } = Form.getValues()

        if(description.trim() === "" ||
           amount.trim() === "" || 
           date.trim() === "") {
               throw new Error('Por favor! Preencha todos os campos')
           }
    },

    formatValues() {
        let = { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        
        return {
            description, 
            amount, 
            date
        }
    },

    clearFields() {
        document.querySelector('.newTransaction').innerHTML = 'Nova Transação'
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    
    submit(event) {
        event.preventDefault()
        try {
            Form.validateFields()
            const transaction = Form.formatValues()   
            if (editControl) {
                Transaction.edit(transaction)
                editControl = false
            } else {
                Transaction.add(transaction)
            }
            Form.clearFields()
            Modal.toggle() //fechando formulário
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index) 
        })

        DOM.updateBalance()
        Utils.formatPositiveNegative()
        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions();
        App.init()
        Storage.set(Transaction.all)
    },
}

App.init()
