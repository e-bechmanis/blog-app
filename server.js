var express = require("express");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

// this function will be called after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

// Redirects '/' route to '/about' route
app.get('/', (req,res) => {
    res.redirect(301, '/about');
})

// Returns HTML "About" form
app.get('/about', (req,res) => {
    res.sendFile(path.join(__dirname,'/views/about.html'));
});

//const server = await app.listen(3000);
//const res = await axios.get('http://localhost:3000/');
//res.data;

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);