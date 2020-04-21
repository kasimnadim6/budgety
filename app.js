// ------------------------------------------------------BUDGET CONTROLLER------------------------------------------------------
var budgetController = (function () {
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(item => {
            sum += item.value;
        });
        data.totals[type] = sum;
    }
    // Constructor for Expense
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.floor((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    // Constructor for Expense
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    return {
        addItem: (type, desc, val) => {
            var newItem, ID;

            // Create new ID
            ID = data.allItems[type].length > 0 ? data.allItems[type][data.allItems[type].length - 1].id + 1 : 0;

            // Create new item based on 'inc' or 'exp' types
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteListItem: (type, id) => {
            var ids, index;
            ids = data.allItems[type].map(item => {
                return item.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: () => {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.floor((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentages: () => {
            data.allItems.exp.forEach(item => {
                item.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: () => {
            var allPercentage = data.allItems.exp.map(item => {
                return item.getPercentage();
            });
            return allPercentage;
        },
        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: () => {
            console.log(data)
        }
    }
})();

// ----------------------------------------------------------UI CONTROLLER-------------------------------------------------------
var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.transaction',
        expensePercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNUmber = function (num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = `${int.substr(0, int.length - 3)},${int.substr(int.length - 3, 3)}`;
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    }

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    return {
        getInput: () => {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        addListItem: (obj, type) => {
            if (type === 'inc') {
                document.querySelector(DOMStrings.incomeContainer).insertAdjacentHTML('beforeend', `<div class="item" id="inc-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                    <div class="item__value">${formatNUmber(obj.value, type)}</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>`);
            } else if (type === 'exp') {
                document.querySelector(DOMStrings.expenseContainer).insertAdjacentHTML('beforeend', `<div class="item" id="exp-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                    <div class="item__value">${formatNUmber(obj.value, type)}</div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>`);
            }
        },
        deleteListItem: (id) => {
            var el = document.getElementById(id);
            el.classList.add('delete-animation');

            setTimeout(() => {
                el.parentNode.removeChild(el);
            }, 1000)
        },
        clearFields: () => {
            var fields, fieldsArr;
            fields = document.querySelectorAll(`${DOMStrings.inputDescription},${DOMStrings.inputValue}`);

            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(current => {
                current.value = '';
            });
            document.querySelector(DOMStrings.inputType).focus();
        },
        displayBudget: (obj) => {
            var type;
            obj.budget > 0 ? type = 'inc' : typ = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNUmber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNUmber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNUmber(obj.totalExp, 'exp');
            obj.percentage > 0 ? document.querySelector(DOMStrings.percentageLabel).textContent = `${obj.percentage}%` :
                document.querySelector(DOMStrings.percentageLabel).textContent = '---'

        },
        displayPercentages: (percentages) => {
            var fields = document.querySelectorAll(DOMStrings.expensePercentageLabel);

            nodeListForEach(fields, (current, index) => {
                percentages[index] > 0 ? current.textContent = `${percentages[index]}%` : current.textContent = '---';
            });
        },
        displayMonth: () => {
            var now, year;
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            now = new Date();
            year = now.getFullYear();
            month = months[now.getUTCMonth()];

            document.querySelector(DOMStrings.dateLabel).textContent = `${month} ${year}`;
        },
        changedType: () => {
            var fields = document.querySelectorAll(`${DOMStrings.inputType},${DOMStrings.inputDescription},${DOMStrings.inputValue}`);
            nodeListForEach(fields, (current) => {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
        },
        getDOMStrings: () => {
            return DOMStrings;
        }
    }
})();

//----------------------------------------------------GLOBAL APP CONTROLLER--------------------------------------------------------
var controller = (function (budgetCtrl, UICtrl) {

    var setUpEventListeners = function () {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', (event) => {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    var ctrlAddItem = function () {
        var input, newItem;
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    }

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteListItem(type, ID);
            UICtrl.deleteListItem(itemID);
            updateBudget();
            updatePercentages();
        }
    }

    var updateBudget = function () {
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function () {
        budgetCtrl.calculatePercentages();
        var percentages = budgetCtrl.getPercentages();
        UICtrl.displayPercentages(percentages);
    }

    return {
        init: function () {
            setUpEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    }
})(budgetController, UIController);


controller.init();