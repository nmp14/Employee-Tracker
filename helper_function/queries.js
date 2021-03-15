const inquirer = require("inquirer");

const getAllEmployees = async (connection) => {
    // Create promise so we can await the function back in main.js
    return new Promise((resolve, reject) => {
        const queryString = `
        SELECT e.id, 
            CONCAT(e.first_name, ' ', e.last_name) employee, 
            role.title, role.salary,
            department.name AS department, 
            CONCAT(m.first_name, ' ', m.last_name) manager
        FROM employee e
        INNER JOIN role ON e.role_id = role.id
        INNER JOIN department ON role.department_id = department.id
        LEFT JOIN employee m ON m.id = e.manager_id;
        `

        connection.query(queryString, (err, res) => {
            if (err) reject(err);
            else {
                console.log("\n");
                console.table(res);
                resolve(true);
            }
        });

        return;
    })
}

const addDepartment = async (connection) => {
    const deptName = await inquirer.prompt([
        {
            name: "departmentName",
            message: "Enter name of department"
        }
    ]);

    const queryString = `
    INSERT INTO department (name)
    VALUES (?)
    `

    connection.query(queryString, [deptName.departmentName], (err, res) => {
        if (err) throw err;

        console.log("\nYou have successfully added the department\n");
    });

    return
}

const addRoles = async (connection) => {
    const deptChoices = [];
    const departments = await viewDepartments(connection);

    for (const department of departments) {
        deptChoices.push(`${department.id}: ${department.name}`);
    }

    const roleAnswer = await inquirer.prompt([
        {
            name: "department",
            type: "list",
            message: "Which department would you like to add the role to?",
            choices: deptChoices
        },
        {
            name: "role",
            messag: "Enter the role to be added"
        },
        {
            name: "salary",
            type: "number",
            message: "Enter salary for role"
        }
    ])

    return new Promise((resolve, reject) => {
        const queryString = `
        INSERT INTO role (title, salary, department_id)
        VALUES (?, ?, ?)
        `

        connection.query(queryString, [roleAnswer.role, roleAnswer.salary, parseInt(roleAnswer.department.split(":")[0])], (err, res) => {
            if (err) reject(err);

            else {
                console.log(`\nSuccessfully created ${roleAnswer.role} for department${roleAnswer.department.split(":")[1]}\n`);
                resolve(res);
            }
        })
    });
}

const viewRoles = (connection) => {
    return new Promise((resolve, reject) => {
        const queryString = `
        SELECT role.title, role.salary, department.name AS Department FROM role
        LEFT JOIN department ON role.department_id = department.id;
        `

        connection.query(queryString, (err, res) => {
            if (err) reject(err);
            else {
                console.table(res);
                resolve(res);
            }
        })
    });
}

const viewDepartments = (connection) => {
    return new Promise((resolve, reject) => {
        const queryString = `
        SELECT * FROM department;
        `

        connection.query(queryString, (err, res) => {
            if (err) reject(err);
            else {
                console.log("Departments: ");
                console.table(res);
                resolve(res);
            }
        })
    });
}

module.exports = { getAllEmployees, addDepartment, addRoles, viewRoles, viewDepartments };