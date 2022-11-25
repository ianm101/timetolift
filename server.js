const express = require("express");

const app = express();

// Use the view engine EJS
app.set('view engine', 'ejs');

// Declare static directory for files
app.use(express.static(__dirname))

app.get("/", (req, res) => {
    console.log("Here");
    // Send JSON
    //res.json({message: "Error"});

    // Render HTML using render() method
    // res.render("index");

    // Pass data into views (html/ejs files) with render()'s second parameter
    res.render("index", {text: "World!"});
});

app.get("/team", (req, res) => {
    console.log("Team Page");

    res.json({msg:"Team page"});
});


app.listen(3000);