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

const addEmployee = async (connection) => {
    const depts = [];
    const roles = [];

    // Get dept choices
    const departments = await viewDepartments(connection, false);
    for (const department of departments) {
        depts.push(`${department.id}: ${department.name}`);
    }

    const employeeToAdd = await inquirer.prompt([
        {
            name: "firstName",
            message: "Enter first name of employee: "
        },
        {
            name: "lastName",
            message: "Enter last name of employee: "
        },
        {
            name: "department",
            type: "list",
            message: "Which department will they work in?",
            choices: depts
        }
    ]);

    // Get role choices
    const rolesChoices = await viewRolesByDept(connection, employeeToAdd.department);
    for (const role of rolesChoices) {
        roles.push(`${role.id}: ${role.title}`);
    }

    const roleAndManager = await inquirer.prompt([
        {
            name: "role",
            type: "list",
            message: "Select their role",
            choices: roles
        },
        {
            name: "manager",
            type: "list",
            message: "Do they have a manager? Select no if they are a manager",
            choices: ["Yes", "No"]
        }
    ])

    const managers = [];
    if (roleAndManager.manager === "Yes") {
        const managerAnswer = await getManagersForDept(connection, employeeToAdd.department);
        for (const manager of managerAnswer) {
            managers.push(`${manager.id}: ${manager.employee}`);
        }
    }

    const selectManager = await inquirer.prompt([
        {
            name: "manager",
            type: "list",
            choices: managers
        }
    ]);

    // Query portion
    return new Promise((resolve, reject) => {
        const queryString = `
        INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUES (?, ?, ?, ?);
        `

        // Deconstruct some objects
        const { firstName, lastName } = employeeToAdd;
        const { role } = roleAndManager;
        const { manager } = selectManager;

        connection.query(queryString, [firstName, lastName, parseInt(role.split(":")[0]), parseInt(manager.split(":")[0])], (err, res) => {
            if (err) reject(err);
            else {
                console.log(`Added ${firstName} ${lastName}`);
            }
        });
    })
}

const getManagersForDept = (connection, department) => {
    return new Promise((resolve, reject) => {
        const queryString = `
        SELECT employee.id, CONCAT(employee.first_name, ' ', employee.last_name) employee FROM employee
        INNER JOIN role ON employee.role_id = role.id
        AND role.title = "Manager"
        INNER JOIN department ON role.department_id = department.id
        AND department.name = ?;
        `

        connection.query(queryString, department.split(" ")[1], (err, res) => {
            if (err) reject(err);
            else {
                resolve(res);
            }
        })
    })
}

const viewRolesByDept = (connection, department) => {
    return new Promise((resolve, reject) => {
        const queryString = `
        SELECT role.id, role.title, role.salary FROM role
        LEFT JOIN department ON role.department_id = department.id
        WHERE department.name = ?;
        `

        connection.query(queryString, department.split(" ")[1], (err, res) => {
            if (err) reject(err);
            else {
                resolve(res);
            }
        })
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

const viewRoles = (connection, view = true) => {
    const viewBool = view

    return new Promise((resolve, reject) => {
        const queryString = `
        SELECT role.id, role.title, role.salary, department.name AS Department FROM role
        LEFT JOIN department ON role.department_id = department.id;
        `

        connection.query(queryString, (err, res) => {
            if (err) reject(err);
            else {
                if (viewBool) {
                    console.log("\nRoles: ");
                    console.table(res);
                }
                resolve(res);
            }
        })
    });
}

const viewDepartments = (connection, view = true) => {
    const viewBool = view;

    return new Promise((resolve, reject) => {
        const queryString = `
        SELECT * FROM department;
        `

        connection.query(queryString, (err, res) => {
            if (err) reject(err);
            else {
                if (viewBool) {
                    console.log("Departments: \n");
                    console.table(res);
                }
                resolve(res);
            }
        })
    });
}

module.exports = { getAllEmployees, addDepartment, addRoles, viewRoles, viewDepartments, addEmployee };