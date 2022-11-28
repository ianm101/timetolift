const {Client} = require('pg');

const cxnString = "postgres://vzpbkpzoizddac:57103db78a0a64eb7a95e2a487ca3c89a50b4299a3543a001f2ed5aa3bd93b2a@ec2-18-215-41-121.compute-1.amazonaws.com:5432/d6mvlt9or7jqgp";

// Connect
const client = new Client({
    connectionString: cxnString,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

// Create Users table
let userTableCreateQueryString = "CREATE TABLE Users(id SERIAL PRIMARY KEY, name TEXT, status BOOLEAN, year TEXT, lifttime TEXT, phone_number TEXT, roommates TEXT[], team TEXT)";
let userTableDropQueryString = "DROP TABLE IF EXISTS Users;";
// Drop if exists: 
client.query(
    userTableDropQueryString, 
    (err, res) => {
        if(err) throw err;
        console.log("Users table dropped successfully");
    }
)
client.query(
    userTableCreateQueryString, 
    (err, res) => {
        if(err) throw err;
        console.log("Users table successfully created");
        
        client.end();
    }
)

