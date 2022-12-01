const Pool = require('pg').Pool;

const pool = new Pool({
    host: "ttl-free.cynfno9kq8qj.us-east-1.rds.amazonaws.com",
    port: 5432,
    user: "postgres",
    password:"TimeToLift",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis:2000
});


/* ------------------ CONSTRUCTION FUNCTIONS ------------------ */
function createTables(pool){

    pool.query("DROP TABLE IF EXISTS users; CREATE TABLE IF NOT EXISTS users(username text, phone_number text, team text, awake boolean, roommates text[], lifttime text);")
    .then((res) => {
        console.log("Success");
    })
    .catch((err) => {
        console.error(err.message);
    });
}

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
    console.log("LORDY!");
    let query = {
        text: "SELECT * FROM users;",
        rowMode: 'array'
    };
    let retData;
    client.query(query).then(
        (res) => {
            const data = res.rows;
            console.log("All users.");
            retData = data;
        }
    )
        .catch(e => {
            console.log("Error");
            console.error(e.stack);
        })
        .finally(() => {
            console.log("CLIENT END");
        });
    console.log("ANOTHER ONE");
    console.log(`retdata: ${retData}`);
    return retData;
}

function getUserByNameAndNumber(pool, name, phone_number){
    let query = {
        text: "SELECT * FROM users WHERE username = $1 AND phone_number = $2;",
        rowMode: "array"
    }
    let values = [name, phone_number];
    let retData;
    return pool.query(query, values)
    .then((res) => {
        const data = res;
        retData = data.rows;
        return retData;
    })
    .catch((err) => {
        console.error(err);
        retData = null;
    });
    // .finally(() => {
    //     console.log("Done with getUserByNameAndNumber query");
    // });
}
function getUserByName(client, name) {
    let query = {
        text: "SELECT * FROM users WHERE name = $1",
    }
    let values = [name];
    let retData;
    client.query(query, values).then(res => {
        const data = res.rows;
        retData = data;
    })
        .catch(e => {
            console.error(e.stack);
        })
        .finally(() => {
            console.log("Done with getUserByName query");
        });
    return retData;
}

function getUserByPhoneNumber(client, phone_number){
    let query = {
        text: "SELECT * FROM users WHERE phone_number = $1",
    }
    let values = [phone_number];
    client.query(query, values).then(res => {
        const data = res.rows;
        return data;
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
    let retData;
    client.query(query, values).then(res => {
        const data = res.rows;
        retData = data;
    })
        .catch(e => {
            console.error(e.stack);
        })
        .finally(() => {
            console.log("Done with getUsersByClassYear query");
        });
}

function getAllUsersByTeam(pool, team){
    let query = {
        text: 'SELECT * FROM users WHERE team = $1',
    }
    let values = [team];
    let retData;
    pool.query(query, values).then(res => {
        const data = res.rows;
        console.log(`Data: ${data}`);
        retData = data;
    })
    .catch(e => {
        console.error(`[getAllUsersByTeam] ${e.message}`);
    })
    .finally(() => {
        console.log("Done with getAllUsersByTeam Query");
    });
    return retData;
}


function createClient(){
    const cxnString = process.env.PG_CXN_STR;

    const client = new Client({
        connectionString: cxnString,
        ssl: {
            rejectUnauthorized: false
        }
    });
    return client;
}

if (require.main === module) {
    createTables(pool);
    // // var teamData = require("./teamdata.json");
    // // for(let row in teamData){
    // //     createNewUser(teamData[row]);
    // // }
    // console.log("START OF SCRIPT");
    // const cxnString = process.env.PG_CXN_STR;

    // const client = new Client({
    //     connectionString: cxnString,
    //     ssl: {
    //         rejectUnauthorized: false
    //     }
    // });

    // console.log("Pre CONNECTION");
    // client.connect();
    // console.log("post connection");

    // console.log("Pre getUserByName query");
    // getUserByName(client, "Ian Murray");
    // console.log("Post getUserByName query");

    // console.log("Pre getUsersByClassYear query");
    // getUsersByClassYear(client, "Freshman");
    // console.log("Post getUsersByClassYear query");

    // console.log("Pre getUserByPhoneNumber query");
    // getUserByPhoneNumber(client, "2036958874");
    // console.log("Post getUserByPhoneNumber query");

    // process.on('uncaughtException', function (err) {
    //     console.log("---------ERROR-----------");
    //     console.error(err.stack);
    // })
}


module.exports.pool = pool;
module.exports.getAllUsersByTeam = getAllUsersByTeam;
module.exports.getUserByNameAndNumber = getUserByNameAndNumber;