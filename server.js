const express = require("express");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require('express-session');
const crypto = require("crypto");

const app = express();
const dbm = require("./db_methods");
const { url } = require("inspector");
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

app.use(jsonParser);
app.use(urlencodedParser);

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
    if (req.session.loggedin) {
        res.render("index");
    } else {
        res.render("signin", {
            message: "",
            messageClass: ""
        });
    }
})
app.get("/profile", (req, res) => {
    let currentUser = req.session.user;
    if (typeof currentUser === undefined) {
        res.render("signin", {
            message: "No active user. Please login",
            messageClass: "alert-danger"
        })
    } else {
        let queriedUser = dbm.getUserByName(pool, currentUser);
        queriedUser.then((data) => {
            console.log("Profile")
            let userData = data[0];
            let allTeammates = dbm.getAllUsersByTeam(pool, userData['team']);
            allTeammates.then((allTeammatesData) => {
                res.render("profile", {
                    user: currentUser,
                    dataName: userData['username'],
                    dataPhoneNumber: userData['phone_number'],
                    dataYear: userData['year'],
                    dataTeam: userData['team'],
                    dataRoommates: userData['roommates'],
                    dataLifttime: userData['lifttime'],
                    dataAllTeammates: Object.values(allTeammatesData)
                });
            });
        })

    }
})
app.post("/profile", urlencodedParser, (req, res) => {
    let currentUser = req.session.user;
    if (typeof currentUser === undefined) {
        res.render("signin", {
            message: "No active user. Please login",
            messageClass: "alert-danger"
        })
    } else {
        let queriedUser = dbm.getUserByName(pool, currentUser);
        queriedUser.then((data) => {
            console.log("Profile")
            let userData = data[0];
            let allTeammates = dbm.getAllUsersByTeam(pool, userData['team']);

            // Update database with new values
            dbm.updateUser(pool, userData).then(() => {
                allTeammates.then((allTeammatesData) => {
                    res.render("profile", {
                        user: currentUser,
                        dataName: userData['username'],
                        dataPhoneNumber: userData['phone_number'],
                        dataYear: userData['year'],
                        dataTeam: userData['team'],
                        dataRoommates: userData['roommates'],
                        dataLifttime: userData['lifttime'],
                        dataAllTeammates: Object.values(allTeammatesData)
                    });
                });
            })
            .catch((err) => console.error(err.message));

        })

    }
});
// AJAX
app.post("/signin", urlencodedParser, (req, res) => {
    const name = req.body['signin-name'];
    const phone_number = req.body['signin-phone_number'];

    // Check that entered credentials match one in system
    let queriedUser = dbm.getUserByNameAndNumber(pool, name, phone_number);
    queriedUser.then((data) => {
        if (data.length === 0) {
            res.render('signin', {
                message: "Invalid credentials. Please try again",
                messageClass: "alert-danger"
            });
        } else {
            req.session.loggedin = true;
            req.session.user = name;
            res.render("index", {
                message: `Welcome back, ${name}`,
                messageClass: 'alert-info'
            });
        }
    })


});

app.get("/register", (req, res) => {
    res.render("register", {
        message: undefined,
        messageClass: undefined
    });
})

app.post("/register", urlencodedParser, (req, res) => {


    const name = req.body['reg-name'];
    const phone_number = req.body['reg-phone_number'];
    const team = req.body['reg-team'];
    const year = req.body['reg-year'];

    // Check for existing user
    let queriedUser = dbm.getUserByNameAndNumber(pool, name, phone_number);
    queriedUser.then((data) => {
        // if no existing user, then create a new user and redirect to login:
        if (data.length === 0) {
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
                message: "Registration complete. Please login",
                messageClass: "alert-success"
            });
        }
        // Otherwise, we already have a user with this information. Alert them
        else {
            res.render('signin', 200, {
                message: 'User with this information is already registered.',
                messageClass: 'alert-danger'
            });
        }
    })
        .catch((err) => console.error(err.message));

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