const {Client} = require('pg');

const cxnString = "postgres://vzpbkpzoizddac:57103db78a0a64eb7a95e2a487ca3c89a50b4299a3543a001f2ed5aa3bd93b2a@ec2-18-215-41-121.compute-1.amazonaws.com:5432/d6mvlt9or7jqgp";

const client = new Client({
    connectionString: cxnString,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

console.log("connected");

client.query(
    "SELECT table_schema,table_name FROM information_schema.tables WHERE table_schema = 'public';", (err, res) => {
        if(err) throw err;
        for (let row of res.rows){
            console.log(
                JSON.stringify(row)
            );
        }
    }
)
console.log("Done printing all public tables");
client.query(
    "SELECT * FROM users;", (err, res) => {
        if(err) throw err;
        for (let row of res.rows){
            console.log(
                JSON.stringify(row)
            );
        }
        client.end();
    }
);
console.log("done printing all data in Users table");