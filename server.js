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
    if(req.session.loggedin){
        console.log("Logged in '/'");
        let username = req.session.user;
        dbm.getBothLifttimes(pool, username)
        .then((lifttimes) => {
            let lift_time = lifttimes['lifttime'];
            let today_lifttime = lifttimes['today_lifttime'];
            console.log(`We are logged in, preferred lift time for ${username} is: ${lift_time}. Today's lifttime is ${today_lifttime}`);
            res.render("index", {
                message: `Welcome back, ${username}`,
                messageClass: "alert-success",
                userLifttime: lift_time,
                userTodayLifttime: today_lifttime
            });
        });
    }else{
        console.log("not logged in");
        res.render("landing");
    }
   
});

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
            let userData = data[0];
            let allTeammates = dbm.getAllUsersByTeam(pool, userData['team']);
            console.log("userData");
            console.dir(userData);
            console.dir(req.body);
            var formData = req.body;
            console.log(formData["roommates[]"]);
            // Update database with new values
            dbm.updateUser(pool, formData).then(() => {
                allTeammates.then((allTeammatesData) => {
                    res.render("profile", {
                        user: currentUser,
                        dataName: userData['username'],
                        dataPhoneNumber: userData['phone_number'],
                        dataYear: userData['year'],
                        dataTeam: userData['team'],
                        dataRoommates: userData['roommates'],
                        dataLifttime: userData['lifttime'],
                        dataAllTeammates: Object.values(allTeammatesData),
                        message: "Profile data updated",
                        messageClass: 'alert-success'
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
            req.cookies.loggedin = true;
            req.session.user = name;
            req.cookies.user = name;
            console.log("Cookies and session variables set");
            console.log(`Session loggedin : ${req.session.loggedin}\nCookies loggedin : ${req.cookies.loggedin}\nSession user: ${req.session.user}\nCookies user: ${req.cookies.user}`);
            res.redirect("/");
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

app.post("/toggle_user_awake", urlencodedParser, async (req, res) => {
    let currentUser = req.session.user;
    if (typeof currentUser === undefined) {
        res.render("signin", {
            message: "No active user. Please login",
            messageClass: "alert-danger"
        })
    } else {
        dbm.toggleAwake(pool, currentUser)
        .then((queryData) => {
            console.log("In Server");
            let isAwake = queryData[0]['awake'];
            res.send({'query_success':true, 'isAwake':isAwake});
        })
        .catch(err => console.error(err.message))
        .finally(() => {console.log("this is a test")});  
    }
});

app.post("/set_today_lifttime", urlencodedParser, async (req, res) => {
    let currentUser = req.session.user;
    if (typeof currentUser === undefined){
        res.render("signin", {
            message: "No active user, please login.",
            messageClass: "alert-danger"
        })
    } else {
        let todayLifttime = req.body['today_time'];
        dbm.setTodayLifttime(pool, currentUser, todayLifttime)
        .then(res => {console.dir(res)})
    }
})
let port = 3000;
console.log(`listening on port ${port}`);
app.listen(port);