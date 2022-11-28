const {Client} = require('pg');

const cxnString = "postgres://vzpbkpzoizddac:57103db78a0a64eb7a95e2a487ca3c89a50b4299a3543a001f2ed5aa3bd93b2a@ec2-18-215-41-121.compute-1.amazonaws.com:5432/d6mvlt9or7jqgp";

const client = new Client({
    connectionString: cxnString,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

let getTablesString = "SELECT * FROM Users;";
client.query(
    getTablesString
).then(res => {
    for(let row in res.rows){
        console.log(JSON.stringify(row));
    }
})