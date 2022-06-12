/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Elena Bechmanis     Student ID: 165090218      Date: 02.06.2022
*
*  Online (Heroku) URL: https://still-woodland-36555.herokuapp.com/
*
*  GitHub Repository URL: https://github.com/e-bechmanis/web322-app
*
********************************************************************************/ 

const express = require('express');
const app = express();

const path = require('path');
const blog = require('./blog-service.js');

var HTTP_PORT = process.env.PORT || 8080;

// this function will be called after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

// Redirects '/' route to '/about' route
app.get('/', (req,res) => {
    res.redirect('/about');
});

// Returns HTML "About" form
app.get('/about', (req,res) => {
    res.sendFile(path.join(__dirname, '/views/addPost.html'));
});

// Returns HTML "Add post" form
app.get('/posts/add', (req,res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

// Returns a JSON formatted string containing all of the posts where published == true
app.get('/blog', (req,res) => {
    blog.getPublishedPosts()
    .then((data)=>res.json(data))
    .catch((error) => console.log("message: " + error));
});

// Returns a JSON formatted string containing all the posts within the posts.json file
app.get('/posts', (req,res) => {
    blog.getAllPosts()
    .then((data)=>res.json(data))
    .catch((error) => console.log("message: " + error));
});

// Returns a JSON formatted string containing all of the categories within the categories.json file
app.get('/categories', (req,res) => {
    blog.getCategories()
    .then((data)=>res.json(data))
    .catch((error) => console.log("message: " + error));
});

//The 404 Route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/404.html'));
  });

// setup http server to listen on HTTP_PORT
blog.initialize()
.then(()=> app.listen(HTTP_PORT, onHttpStart))
.catch((error)=>console.log(error));
