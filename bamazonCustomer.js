var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require("cli-table");
// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 8889,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});
// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    console.log("Welcome to BAMAZON")
    displayProducts();
});

function displayProducts() {
    connection.query("SELECT * FROM bamazon.products", function (err, results) {
        if (err) throw err;
        //console.log(results);
        inquirer.prompt([
            {
            name: "choice",
            type: "list",
            choices: function() {
            var choiceArray = [];
          
          
            for (var i = 0; i < results.length; i++) {
            var items = results[i].product_name;
            var itemPrices = JSON.stringify(results[i].price)
            
            choiceArray.push(results[i].product_name);
            
            
            }
           return choiceArray;
          },
          message: "What product would you like to buy?"
        },
        {
            name:"quantity",
            type: "input",
            message: "How many units would you like to buy?"
        }
    ]).then(function(answer){
        //console.log(answer)
        var chosenItem;
        for(var i = 0; i < results.length; i++){
            if(results[i].product_name === answer.choice){
                chosenItem = results[i];
                //console.log(answer.quantity);
                //console.log(chosenItem)
            }
        }
        if (answer.quantity <= chosenItem.stock_quantity){
            //console.log("true")
            var updateStock = chosenItem.stock_quantity - answer.quantity;
            
           // console.log("Stock " + chosenItem.stock_quantity);
            //console.log("Buy amount " + answer.quantity);
            //console.log("new stock " +updateStock);

            console.log("chosenItem " + chosenItem.product_name);

            connection.query(
               "UPDATE products SET ? WHERE ? ",
               [
                   {    
                      
                       stock_quantity: updateStock
                       
                   },
                   {
                       product_name: chosenItem.product_name
                    }
               ],
               function(err){
                   if (err) throw err;
                   //console.log(answer.quantity);
                   //console.log(chosenItem.stock_quantity)
                   var total = answer.quantity * chosenItem.price;
                   console.log("Order has been placed. Your total is $" + total);
                   inquirer.prompt([{
                    name:"redo", 
                    type:"confirm",
                    message:"Would you like to place another order?"
                }
                ]).then(function(confirm){
                    //console.log(confirm.redo)
                    if(confirm.redo === true){
                        displayProducts();
                    }
                    else {
                        console.log("Thank you, come again!");
                        connection.end();
                    }
                })
                   
               }
               
            );
        }
        else{
            console.log("Not enough in stock! Order cannot be processed");
            inquirer.prompt([{
                name:"redo", 
                type:"confirm",
                message:"Would you like to place another order?"
            }
            ]).then(function(confirm){
                //console.log(confirm)
                if (confirm.redo===false){
                    displayProducts();
                }
                else {
                    console.log("Thank you, come again!");
                    connection.end();
                }
            })
        }
    })

    })
}