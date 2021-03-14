const inquirer = require("inquirer");
const cTable = require("console.table");
const helperFunctions = require("./helper_function/queries");

let connectionVar;

const init = (connection) => {
    connectionVar = connection;

    // promptQuestions
    mainFunction();
}

const mainFunction = async () => {
    // Get user choice
    const answer = await promptQuestions();
    // Get function dependent on user choice
    const selectedFunction = await getFunction(answer);

    mainFunction();
}

const promptQuestions = () => {
    return inquirer.prompt([
        {
            name: "options",
            type: "rawlist",
            choices: ["Get All Employees", "Add Department", "Add Roles", "Add Employee", "Update Employee Role", "View Departments", "View Roles"]
        }
    ]);
}

const getFunction = async (answer) => {
    switch (answer.options) {
        case "Get All Employees":
            await helperFunctions.getAllEmployees(connectionVar);
            break;
        case "Add Department":
            await helperFunctions.addDepartment(connectionVar);
            break;
        case "Add Roles":
            await helperFunctions.addRoles(connectionVar);
            break;
        case "Add Employee":
            await helperFunctions.addEmployee(connectionVar);
            break;
        case "Update Employee Role":
            await helperFunctions.updateEmployee(connectionVar);
            break;
        case "View Departments":
            await helperFunctions.viewDepartments(connectionVar);
            break;
        case "View Roles":
            await helperFunctions.viewRoles(connectionVar);
            break;
    }
}

module.exports = init;