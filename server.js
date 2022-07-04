/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Elena Bechmanis     Student ID: 165090218      Date: 19.06.2022
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
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const upload = multer();

var HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'e-bechmanis',
    api_key: '123182823811362',
    api_secret: 'YZ1Nu29YsqoRmPnfWYH3h7ayYB8',
    secure: true
});

const exphbs = require('express-handlebars')
app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs',
  defaultLayout: 'main'
  // layoutsDir: 'views/layouts',
  // partialsDir: 'views/partials'
}))
app.set('view engine', '.hbs')

// this function will be called after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

// Redirects '/' route to '/about' route
app.get('/', (req,res) => {
    res.redirect('/about');
});

// Renders "About" view
app.get('/about', (req,res) => {
    res.render('about');
});

// Renders "Add post" view
app.get('/posts/add', (req,res) => {
    res.render('addPost');
});

// Returns a JSON formatted string containing all of the posts where published == true
app.get('/blog', (req,res) => {
    blog.getPublishedPosts()
    .then((data)=>res.json(data))
    .catch((error) => res.json({message: error}));
});

//Returns a single post by ID
app.get('/post/:value', (req,res) => {
   blog.getPostById(req.params.value).then((data) =>{
        res.json(data)
    }).catch((error) => {
        res.json({message: error})
    });
});

//Returns blog posts in JSON format with optional filters by date and category
app.get('/posts', (req,res) => {
    if(req.query.category){ //optional filter, returns posts by category
        blog.getPostsByCategory(req.query.category).then((data) => {
            res.json(data)
        }).catch((error) => {
            res.json({message: error})
        });
    }
    else if (req.query.minDate){ //optional filter, returns posts newer than the date passed in a query
        blog.getPostsByMinDate(req.query.minDate).then((data) =>{
            res.json(data)
        }).catch((error) => {
            res.json({message: error})
        });
    }
    else{
        blog.getAllPosts()
    .then((data)=>res.json(data))
    .catch((error) => res.json({message: error}));
    }
});

// Returns a JSON formatted string containing all of the categories within the categories.json file
app.get('/categories', (req,res) => {
    blog.getCategories()
    .then((data)=>res.json(data))
    .catch((error) => res.json({message: error}));
});

app.post('/posts/add', upload.single("featureImage"), (req,res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
    streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
    processPost(uploaded.url);
        });
    }else{
    processPost("");
    }
    
    function processPost(imageUrl){
    req.body.featureImage = imageUrl;

    // Process the req.body and add it as a new Blog Post before redirecting to /posts
    blog.addPost(req.body).then(()=>res.redirect('/posts'));
    }     
});

//The 404 Route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/404.html'));
  });

// setup http server to listen on HTTP_PORT
blog.initialize()
.then(()=> app.listen(HTTP_PORT, onHttpStart))
.catch((error)=>res.json({message: error}));
