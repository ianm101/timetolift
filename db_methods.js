const Pool = require('pg').Pool;

const pool = new Pool({
    host: "ttl-free.cynfno9kq8qj.us-east-1.rds.amazonaws.com",
    port: 5432,
    user: "postgres",
    password: "TimeToLift",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});


/* ------------------ CONSTRUCTION FUNCTIONS ------------------ */
function createTables(pool) {

    pool.query("DROP TABLE IF EXISTS users; CREATE TABLE IF NOT EXISTS users(username text, phone_number text, year text, team text, awake boolean, roommates text[], lifttime text, today_lifttime text);")
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

    let createUserTemplateString = `INSERT INTO users(username, phone_number, year, team, awake, roommates, lifttime, today_lifttime) VALUES($1, $2, $3, $4, $5, $6, $7, $8);`;
    let createUserValues = [name, phone_number, year, team, status, roommates, lifttime, lifttime];

    console.log(createUserValues);
    client.query(
        createUserTemplateString,
        createUserValues
    ).then(res => {
        console.log(`New user ${name} created in table.`);
    })
        .catch(e => {
            console.error(`[createNewUser] Error ${e.message}`)
        });

}

/* ---------------------- QUERY FUNCTIONS -------------------- */
function getAllUsers(pool) {
    let query = {
        text: "SELECT * FROM users;",
    };
    return pool.query(query).then(
        (res) => {
            const data = res.rows;
            return data
        }
    )
        .catch(e => {
            console.log("Error");
            console.error(`[getAllUsers] Error: ${e.message}`);
        });
}

function getPreferredLifttimeByName(pool, name) {
    let query = {
        text: "SELECT lifttime FROM users WHERE username = $1;"
    }
    let values = [name];
    return pool.query(query, values)
        .then(res => {
            return res.rows[0]
        })
        .catch(err => console.error(`[getPreferredLifttime] ${err.message}`));

}

function getUserByNameAndNumber(pool, name, phone_number) {
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
            console.error(`[getUserByNameAndNumber] Error: ${err.message}`);
            retData = null;
        });
    // .finally(() => {
    //     console.log("Done with getUserByNameAndNumber query");
    // });
}
function getUserByName(pool, name) {
    let query = {
        text: "SELECT * FROM users WHERE username = $1",
    }
    let values = [name];
    let retData;
    return pool.query(query, values)
        .then(res => {
            const data = res.rows;
            return data;
        })
        .catch(e => {
            console.error(`[getUserByName] - ${e.stack}`);
        })
        .finally(() => {
            console.log("Done with getUserByName query");
        });
}

function getUserByPhoneNumber(client, phone_number) {
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

function getTeamOfUser(pool, user){
    let query = {
        text: "SELECT team FROM users WHERE username = $1;"
    }
    let values = [user];
    return pool.query(query, values)
    .then(res => {
        const data = res.rows;
        return data;
    })
    .catch(e => console.error(`[getTeamOfUser] Query error: ${e.message}`));
}

function getAllUsersByTeam(pool, team) {
    let query = {
        text: 'SELECT * FROM users WHERE team = $1',
    }
    let values = [team];
    let retData;
    return pool.query(query, values).then(res => {
        const data = res.rows;
        return data;
    })
        .catch(e => {
            console.error(`[getAllUsersByTeam] ${e.message}`);
        })
        .finally(() => {
            console.log("Done with getAllUsersByTeam Query");
        });
}


function createClient() {
    const cxnString = process.env.PG_CXN_STR;

    const client = new Client({
        connectionString: cxnString,
        ssl: {
            rejectUnauthorized: false
        }
    });
    return client;
}

// -------------------------- UPDATE FUNCTIONS ----------------------------
function updateUser(pool, userData) {
    let query = {
        text: 'UPDATE users SET "username" = $1, "phone_number" = $2, "team" = $3, "year" = $4, "lifttime" = $5, "roommates" = $6 WHERE "username" = $1;',
    }
    let values = [userData['name'], userData['phone_number'], userData['team'], userData['year'], userData['lifttime'], userData['roommates[]']];
    console.log(`Valeus: ${values}`);
    let retData;
    return pool.query(query, values).then(res => {
        const data = res.rows;
        pool.query("SELECT * FROM users WHERE username='Wes Carp';").then((res) => {
            console.log(res.rows);
        });
        return data;
    })
        .catch(e => {
            console.error(`[updateUser] ${e.message}`);
        })
        .finally(() => {
            console.log("Done with updateUser Query");
        });
}

function toggleAwake(pool, user) {
    let query = {
        text: 'UPDATE users SET awake = NOT awake WHERE username = $1 RETURNING awake;'
    }
    let values = [user];
    return pool.query(query, values)
        .then(res => {
            console.log("Successful toggle awake");
            return res.rows
        })
        .catch(err => console.error(`[toggleAwake] ${err.message}`))
}

function putAllAsleep(pool){
    let query = {
        text: 'UPDATE users SET awake = false;'
    }
    return pool.query(query)
    .then(res => {
        console.log(`[putAllAsleep] Successful reset awake.`);
        return res.rows;
    })
    .catch(err => console.error(`[putAllAsleep] Error: ${err.message}`))
}

function getBothLifttimes(pool, user) {
    let query = {
        text: "SELECT lifttime, today_lifttime FROM users WHERE username = $1;"
    }
    let values = [user]
    return pool.query(query, values)
        .then((res) => {
            var firstResult = res.rows[0];
            console.log(`[getBothLifttime] Results: ${res.rows}`)
            console.dir(res.rows[0]);
            return firstResult;
        })
        .catch(err => console.error(`[getBothlfittimes] Error: ${err.message}`))
}

function setTodayLifttime(pool, user, today_lifttime) {
    let query = {
        text: 'UPDATE users SET today_lifttime = $1 WHERE username = $2 RETURNING today_lifttime;'
    }
    let values = [today_lifttime, user]
    return pool.query(query, values)
        .then(res => {
            console.log(`[setTodayLifttime] - Successful update.`);
            let updatedTodayLifttime = res.rows[0]['today_lifttime']
            return {'successful_query':true, 'updated_today_lifttime':updatedTodayLifttime}
        })
        .catch(err => {
            console.log(`[setTodaylifttime] - Query error`);
            console.error(err.message);
            return {'successful_query':false}
        })
}

function dangerousResetUsers(pool) {
    let query = {
        text: "DELETE FROM ONLY users;"
    }
    pool.query(query)
        .then(res => console.log("Successfully deleted all records in users table."))
        .catch(e => console.error(e.message))
        .finally(() => {
            console.log("Done with dangerousResetUsers query");
            pool.end();
        })
}

function dangerousDeleteUser(pool, user, phone_number=""){
    let queryString;
    let values;
    if(phone_number !== ""){
        queryString = `DELETE FROM users WHERE username = $1 AND phone_number = $2;`
        values = [user, phone_number];
    }else{
        queryString = `DELETE FROM users WHERE username = $1;`;
        values = [user];
    }
    pool.query(queryString, values)
    .then(res => {
        console.log("Deleted user from database");
    }).catch(e => {
        console.error(`[dangerousDeleteUser] Error: ${e.message}`);
    })
}

function sandbox(pool) {
    let query = {
        text: 'SELECT * FROM users;'
    }
    pool.query(query)
        .then((res) => {
            res.rows.map(x => console.log(x));
        })
        .catch((e) => console.error(e.message));
}

if (require.main === module) {
    putAllAsleep(pool);
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
module.exports.createNewUser = createNewUser;
module.exports.getUserByName = getUserByName;
module.exports.updateUser = updateUser;
module.exports.toggleAwake = toggleAwake;
module.exports.getPreferredLifttimeByName = getPreferredLifttimeByName;
module.exports.getBothLifttimes = getBothLifttimes;
module.exports.setTodayLifttime = setTodayLifttime;
module.exports.getTeamOfUser = getTeamOfUser;
module.exports.putAllAsleep = putAllAsleep;
