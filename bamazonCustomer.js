var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "Ch1ll@x!",
    database: "bamazon"
  });
  
  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    listProducts();
  });

function listProducts() {
  connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products", function(err, results) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "item",
          type: "list",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name);
            }
            return choiceArray;
          },
          message: "What product would you like to buy?"
        },
        {
          name: "buy",
          type: "input",
          message: "How many of units of this product would you like to buy?"
        }
      ])
      .then(function(answer) {
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.item) {
            chosenItem = results[i];
            console.table(chosenItem)
          }
        }
        if (chosenItem.stock_quantity >= parseInt(answer.buy)) {
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: (chosenItem.stock_quantity - answer.buy),
                product_sales: (chosenItem.product_sales + (chosenItem.price * answer.buy)),
                units_sold: (chosenItem.units_sold + parseInt(answer.buy))
              },
              {
                item_id: chosenItem.item_id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("Congrats! You have purchased " + answer.buy + " units!");
              console.log("There are currently " + (chosenItem.stock_quantity - answer.buy) + " units remaining" );
              connection.end();
            }
          );
        }
        else {
          console.log("Sorry, there is not enough of this item in stock.");
          connection.end();
        }
      });
  });
}