const mysql = require("mysql");
require("dotenv").config();


const connection = mysql.createConnection({
    host: 'localhost',

    port: 3306,

    user: 'root',

    // Create a .env file on your root and add a password and database.
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
});

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    promptQuestions();

    connection.end();
});