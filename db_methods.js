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

    let commands = [
        "DROP TABLE IF EXISTS users",
        `CREATE TABLE IF NOT EXISTS users
        (id SERIAL NOT NULL PRIMARY KEY, username text, phone_number text, year text, team text, awake boolean, room text, lifttime text, today_lifttime text)`,
        "DROP TABLE IF EXISTS rooms",
        "CREATE TABLE IF NOT EXISTS rooms(roomid SERIAL NOT NULL PRIMARY KEY, name TEXT UNIQUE);"
    ]
    console.log(commands.join(";"));
    pool.query(commands.join(";"))
        .then((res) => {
            console.log("Success");
        })
        .catch((err) => {
            console.error(err.message);
            console.dir(err.stack);
        });
}

function createNewUser(pool, userData) {
    let name = userData['name'];
    let status = userData['status'];
    let year = userData['year'];
    let lifttime = userData['lifttime'];
    let phone_number = userData['phone_number'];
    let room = userData['user_room'];
    let team = userData['team'];

    let createUserTemplateString = `INSERT INTO users(username, phone_number, year, team, awake, room, lifttime, today_lifttime) VALUES($1, $2, $3, $4, $5, $6, $7, $8);`;
    let createUserValues = [name, phone_number, year, team, status, room, lifttime, lifttime];

    console.log(createUserValues);
    pool.query(
        createUserTemplateString,
        createUserValues
    ).then(res => {
        console.log(`New user ${name} created in table.`);
    })
        .catch(e => {
            console.error(`[createNewUser] Error ${e.message}`)
        });

}
async function createNewRoom(pool, roomData){
    let query = {
        text: "INSERT INTO rooms(name) VALUES ($1);"
    }
    let values = [roomData['name']];
    return await pool.query(query, values).then(
        res => {
            console.log(`[createNewRoom] Successful room creation with name ${roomData['name']}`);
            return;
        }
    ).catch(e => {
        console.log("[createNewRoommate Error: ");
        console.error(e.message)
        console.error(e.stack);
    });
}

/* ---------------------- QUERY FUNCTIONS -------------------- */
async function getAllUsers(pool) {
    let query = {
        text: "SELECT * FROM users;",
    };
    return await pool.query(query).then(
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

async function getAllRooms(pool) {
    let query = {
        text: 'SELECT * FROM rooms;'
    }
    let results = await pool.query(query).then(res => res.rows);
    // console.log("[getAllRooms] Results: ");
    // console.dir(results.rows);
    return results;
}
async function deleteRoom(pool, id){
    let query = {
        text: "DELETE FROM rooms WHERE roomid = $1;"
    }
    let values = [id];
    let results = await pool.query(query, values).then(res => console.log(`[deleteRoom] Successfully deleted room with id ${id}`));
    return;
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

function getRoommatesByName(pool, name) {
    let query = {
        text: "SELECT roommates FROM users WHERE username = $1;"
    }
    let values = [name];

    return pool.query(query, values)
        .then(res => {
            console.log(`[getRoommatesByName] Successful query, ${res.rows.length} rows returned`);
            const data = res.rows;
            return data;
        })
        .catch(e => console.error(`[getRoommatesByName] Error: ${e.message}`));
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

function getTeamOfUser(pool, user) {
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
    console.log(`[updateUser] ${userData['roommates[]']}`)
    let query = {
        text: 'UPDATE users SET "username" = $1, "phone_number" = $2, "team" = $3, "year" = $4, "lifttime" = $5, "roommates" = $6 WHERE "username" = $1;',
    }
    let values = [userData['name'], userData['phone_number'], userData['team'], userData['year'], userData['lifttime'], [userData['roommates[]']]];
    console.log(`Valeus: ${values}`);
    let retData;
    return pool.query(query, values).then(res => {
        const data = res.rows;
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

function putAllAsleep(pool) {
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
            return { 'successful_query': true, 'updated_today_lifttime': updatedTodayLifttime }
        })
        .catch(err => {
            console.log(`[setTodaylifttime] - Query error`);
            console.error(err.message);
            return { 'successful_query': false }
        })
}

function setRoomOfUser(pool, user, roomname){
    let query = {
        text: "UPDATE users SET room = $1 WHERE username = $2 RETURNING room;"
    }
    let values = [roomname, user];
    return pool.query(query, values).then(res => console.log(`Successful room update for user ${user} to room ${roomname}`));
}

function dangerousResetUsers(pool) {
    let query = {
        text: "TRUNCATE users RESTART IDENTITY;"
    }
    pool.query(query)
        .then(res => console.log("Successfully deleted all records in users table."))
        .catch(e => console.error(e.message))
        .finally(() => {
            console.log("Done with dangerousResetUsers query");

        })
}

function dangerousDeleteUser(pool, user, phone_number = "") {
    let queryString;
    let values;
    if (phone_number !== "") {
        queryString = `DELETE FROM users WHERE username = $1 AND phone_number = $2;`
        values = [user, phone_number];
    } else {
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

async function dangerousResetAllRooms(pool){
    let query = {
        text: "TRUNCATE TABLE rooms RESTART IDENTITY;"
    }

    let status = await pool.query(query).then(res => console.log("Successful truncation of rooms table."));
    return;
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
async function main(){
    await dangerousResetAllRooms(pool).then(res => console.log("Done with delete"));
    await dangerousResetUsers(pool);
    // let name = userData['name'];
    // let status = userData['status'];
    // let year = userData['year'];
    // let lifttime = userData['lifttime'];
    // let phone_number = userData['phone_number'];
    // let room = userData['user_room'];
    // let team = userData['team'];
    let userData= {
        name: "Ian Murray",
        status: false,
        year: "junior",
        lifttime: "8:30",
        phone_number:"2036958874",
        room: "206 nassau",
        team: "mlx"
    }
    await createNewUser(pool, userData);
    let roomNames = ["206 nassau", "Murray", "Somewhere else"];
    for(let roomName in roomNames){
        await createNewRoom(pool, {name:roomNames[roomName]}).then(createdRoom => console.log("Done created."));
    }
    let all_rooms;
    await getAllRooms(pool).then(res => {
        console.log("getall rooms res: ");
        console.dir(res);
        all_rooms = res;
    });
    console.log("All Rooms: ");
    console.log(all_rooms);

    await setRoomOfUser(pool, "Ian Murray", "206 nassau").then(res => console.log(":)"));
    await getAllUsers(pool).then(res => console.log(res));
    await getUserByName(pool, "Ian Murray").then(res => console.log(res));
}
if (require.main === module) {
    main();
    // getAllRooms(pool).then(res => console.log(res));
    // deleteRoom(pool, 3).then(res => res);
    // getAllRooms(pool).then(res => console.log(res));
    // createNewRoom(pool, {name: 'Test Room #2'});
    // getAllRooms(pool).then(res => console.log(res));
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
module.exports.getRoommatesByName = getRoommatesByName;
module.exports.getAllRooms = getAllRooms;
module.exports.createNewRoom = createNewRoom;
module.exports.deleteRoom = deleteRoom;
