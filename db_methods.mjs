const { Client } = require('pg');




/* ------------------ CONSTRUCTION FUNCTIONS ------------------ */
export function createNewUser(client, userData) {
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
export function getAllUsers(client) {
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

export function getUserByName(client, name) {
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

export function getUserByPhoneNumber(client, phone_number){
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

export function getUsersByClassYear(client, classYear) {
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

export function createClient(){
    const cxnString = process.env.PG_CXN_STR;

    const client = new Client({
        connectionString: cxnString,
        ssl: {
            rejectUnauthorized: false
        }
    });
    return client();
}

if (require.main === module) {
    // var teamData = require("./teamdata.json");
    // for(let row in teamData){
    //     createNewUser(teamData[row]);
    // }
    const cxnString = process.env.PG_CXN_STR;

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

module.exports = {getAllUsers, createClient, getUserByName, getUsersByClassYear, getUserByPhoneNumber};