const { Client } = require('pg');




/* ------------------ CONSTRUCTION FUNCTIONS ------------------ */
function createNewUser(client, userData) {
    let name = userData['name'];
    let status = userData['status'];
    let year = userData['year'];
    let lifttime = userData['lifttime'];
    let phone_number = userData['phone_number'];
    let roommates = userData['roommates'];
    let team = userData['team'];

    let createUserTemplateString = `INSERT INTO users(name, status, year, lifttime, phone_number, roommates, team) VALUES($1, $2, $3, $4, $5, $6, $7);`;
    let createUserValues = [name, status, year, lifttime, phone_number, roommates, team];

    console.log(createUserValues);
    client.query(
        createUserTemplateString,
        createUserValues
    ).then(res => {
        console.log(`New user ${name} created in table.`);
    })
        .catch(e => {
            console.error(e.stack)
        });

}

/* ---------------------- QUERY FUNCTIONS -------------------- */
function getAllUsers(client) {
    let query = {
        text: "SELECT * FROM users;",
        rowMode: 'array'
    };
    client.query(query).then(
        res => {
            const data = res.rows;
            console.log("All users.");
            data.forEach(row => {
                console.log(row);
            });
        }
    )
        .catch(e => {
            console.error(e.stack);
        })
        .finally(() => {
            client.end();
        });
}

function getUserByName(client, name) {
    let query = {
        text: "SELECT * FROM users WHERE name = $1",
    }
    let values = [name];
    client.query(query, values).then(res => {
        const data = res.rows;
        console.log(`Data: ${JSON.stringify(data[0])}`);
    })
        .catch(e => {
            console.error(e.stack);
        })
        .finally(() => {
            console.log("Done with getUserByName query");
        });
}

function getUserByPhoneNumber(client, phone_number){
    let query = {
        text: "SELECT * FROM users WHERE phone_number = $1",
    }
    let values = [phone_number];
    client.query(query, values).then(res => {
        const data = res.rows;
        console.log(`Data: ${JSON.stringify(data[0])}`);
    })
    .catch(e => {
        console.error(e.stack);
    })
    .finally(() => {
        console.log("Done with getUserByPhoneNumber query");
    });
}

function getUsersByClassYear(client, classYear) {
    let query = {
        text: "SELECT * FROM users WHERE year = $1",
    }
    let values = [classYear];
    client.query(query, values).then(res => {
        const data = res.rows;
        data.forEach(row => console.log(row));
    })
        .catch(e => {
            console.error(e.stack);
        })
        .finally(() => {
            console.log("Done with getUsersByClassYear query");
        });
}

if (require.main === module) {
    // var teamData = require("./teamdata.json");
    // for(let row in teamData){
    //     createNewUser(teamData[row]);
    // }
    const cxnString = "postgres://vzpbkpzoizddac:57103db78a0a64eb7a95e2a487ca3c89a50b4299a3543a001f2ed5aa3bd93b2a@ec2-18-215-41-121.compute-1.amazonaws.com:5432/d6mvlt9or7jqgp";

    const client = new Client({
        connectionString: cxnString,
        ssl: {
            rejectUnauthorized: false
        }
    });
    client.connect();

    getUserByName(client, "Ian Murray");
    getUsersByClassYear(client, "Freshman");
    getUserByPhoneNumber(client, "2036958874");
}