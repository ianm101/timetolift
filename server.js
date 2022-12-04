const express = require("express");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require('express-session');
const crypto = require("crypto");

const app = express();
const dbm = require("./db_methods");
const pool = dbm.pool;


// HELPER FUNCTIONS
const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}


// Use the view engine EJS
app.set('view engine', 'ejs');

// Create application/json parser
var jsonParser = bodyParser.json();
// create applicaiton/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var authTokens = {};

// Session
app.use(session({
    secret: 'mySecret',
    resave: true,
    saveUninitialized: true
}));

// Cookie parser
app.use(cookieParser());

// Pass authentication per request/response step
app.use((req, res, next) => {
    const authToken = req.cookies['AuthToken'];
    req.user = authTokens[authToken];
    next();
})

// Declare static directory for files
console.log(`Dirname: ${__dirname}`);
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    // Send JSON
    //res.json({message: "Error"});

    // Render HTML using render() method
    // res.render("index");

    // Pass data into views (html/ejs files) with render()'s second parameter
    res.render("landing");
});

// User authentication
app.post('/auth', urlencodedParser, (req, res) => {
    console.log(Object.keys(req.body));
    let username = req.body['signin-name'];
    let phone_number = req.body['signin-phone_number'];

    console.log(`Username: ${username}`);
    if (username && phone_number) {
        try {
            var existingUsers = dbm.getUserByNameAndNumber(pool, username, phone_number);
            console.log(existingUsers);
            existingUsers
                .then((data) => {
                    console.log("THEN Promise");
                    console.log(data[0]);
                    console.log(data.length);

                    // Existing user with these credentials case
                    if (data.length > 0) {
                        req.session.loggedin = true;
                        req.session.username = username;
                        console.log("Pre redirect");
                        console.log("post redirect");
                        return { "authStatus": "ok" };
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        } catch (e) {
            console.error(e);
        }
    } else {
        res.send("Please enter a username and phone number");
        res.end();
    }
})

app.get("/landing", (req, res) => {
    res.render("landing");
});

app.get("/signin", (req, res) => {
    res.render("signin");
})

// AJAX
app.post("/signin", urlencodedParser, (req, res) => {
    let data = req.body;
    let name = data['signin-name'];
    let phone_number = data['signin-phone_number'];

    app.post("/auth", jsonParser, (req, res) => {

    });
});

app.get("/register", (req, res) => {
    res.render("register", {
        message: undefined,
        messageClass: undefined
    });
})

app.post("/register", urlencodedParser, (req, res) => {
    const { name, phone_number, team, year } = req.body;
    console.log(`Name: ${name}`);
    console.log(`Phone Number: ${phone_number}`);
    console.log(`Team: ${team}`);
    console.log(`Year: ${year}`);

    // Check for existing user
    let queriedUser = dbm.getUserByNameAndNumber(pool, name, phone_number);
    console.log("Pre then")
    queriedUser.then((data) => {
        console.log("Within then");
        // if no existing user, then create a new user and redirect to login:
        if (data.length === 0) {
            console.log("within if");
            // Create new user
            let userData = {
                name: name,
                status: false,
                year: year,
                phone_number: phone_number,
                lifttime: "7:30",
                roommates: [],
                team: team
            }
            dbm.createNewUser(pool, userData);

            res.render("signin", {
                message: "New user created. Please login",
                messageClass: "alert-success"
            });
        }
        // Otherwise, we already have a user with this information. Alert them
        else {
            console.log("within elese");
            res.redirect(301, 'signin', {
                message: 'User with this information is already registered.',
                messageClass: 'alert-danger'
            });
            console.log("after render");
        }
    })
    .catch((err) => console.error(err.message));
    console.log("GOT HERE");

    // add new user to database

    // render login page

})

app.get("/team", async (req, res) => {
    res.render("teamview");
});

// AJAX
app.post("/registration_ajax", urlencodedParser, async (req, res) => {
    let name = req.body.name;
    let phone_number = req.body.phone_number;
    let team = req.body.team;
    let awake = false;
    let qString = "INSERT INTO users VALUES($1, $2, $3, $4, ARRAY[''], null)";
    let qValues = [name, phone_number, team, awake];
    pool.query(qString, qValues)
        .then(res => {
            console.log(`Successfully added user ${name}.`);
        })
        .catch(err => {
            console.error(err.message);
        });
    return { "Nice": "One" };

});

app.get("/get_all_by_team", async (req, res) => {
    let data = req.query;
    let team = data.team;

    dbm.getAllUsersByTeam(pool, team);
})
let port = 3000;
console.log(`listening on port ${port}`);
app.listen(port);