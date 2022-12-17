// Perform tasks with a Heroku scheduler (like a cron job)
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

const dbm = require("./db_methods");

if (require.main === module) {
    dbm.putAllAsleep(pool);
    pool.end();
}