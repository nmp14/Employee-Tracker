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
    const selectedFunction = await userChoices(answer);
    // After deciding which category to access, get query function
    const queryFunction = await getFunction(selectedFunction)

    mainFunction();
}

const promptQuestions = () => {
    return inquirer.prompt([
        {
            name: "options",
            type: "rawlist",
            choices: ["View/Edit Employees", "View/Edit Roles", "View/Edit Departments", "Quit"]
        }
    ]);
}

const userChoices = async (answer) => {
    let newAnswer;

    switch (answer.options) {
        case "View/Edit Employees":
            newAnswer = await promptEmployeeQuestions();
            break;
        case "View/Edit Roles":
            newAnswer = await promptRoleQuestions();
            break;
        case "View/Edit Departments":
            newAnswer = await promptDeptQuestions();
            break
        default:
            quit();
            break;
    }
    return newAnswer;
}
// Prompt user for what do with employees
const promptEmployeeQuestions = () => {
    return inquirer.prompt([
        {
            name: "options",
            type: "rawlist",
            choices: ["Get All Employees", "Add Employee", "Update Employee Role", "Go Back"]
        }
    ])
}
// Prompt user for what to do with roles
const promptRoleQuestions = () => {
    return inquirer.prompt([
        {
            name: "options",
            type: "rawlist",
            choices: ["View Roles", "Add Roles", "Go Back"]
        }
    ])
}

// Prompt use for what to do with departments
const promptDeptQuestions = () => {
    return inquirer.prompt([
        {
            name: "options",
            type: "rawlist",
            choices: ["View Departments", "Add Department", "Go Back"]
        }
    ])
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
        default:
            console.log("\nWent back\n");
            break;
    }
}

const quit = () => {
    process.exit();
}

module.exports = init;