/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Elena Bechmanis     Student ID: 165090218      Date: 16.07.2022
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
const stripJs = require('strip-js');

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
  defaultLayout: 'main',
  helpers: {
    //automatically renders the correct <li> element adding the class "active" if app.locals.activeRoute matches the provided url
    navLink: function(url, options){
        return '<li' + 
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    //evaluates conditions for equality
    equal: function (lvalue, rvalue, options) {
        if (arguments.length< 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    },
    safeHTML: function(context){
        return stripJs(context);
    },
    formatDate: function(dateObj){
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
    }    
  }
}))
app.set('view engine', '.hbs')

// this function will be called after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

//adds the property "activeRoute" to "app.locals" whenever the route changes
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Redirects '/' route to '/about' route
app.get('/', (req,res) => {
    res.redirect('/blog');
});

// Renders "About" view
app.get('/about', (req,res) => {
    res.render('about');
});

// Renders "Add post" view
app.get('/posts/add', (req,res) => {
    blog.getCategories().then((data)=> res.render('addPost', {categories: data}))
    .catch((error) => res.render("addPost", {categories: []}));
});

// Renders "Add category" view
app.get('/categories/add', (req,res) => {
    res.render('addCategory');
});

app.get('/blog', async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
    try{
        // declare empty array to hold "post" objects
        let posts = [];
        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }
        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 
        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }
    try{
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

//Returns a single post by ID
app.get('/post/:value', (req,res) => {
   blog.getPostById(req.params.value).then((data) =>{
        res.json(data)
    }).catch((error) => {
        res.json({message: error})
    });
});

app.get('/blog/:id', async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
    try{
        // declare empty array to hold "post" objects
        let posts = [];
        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
           
        }
        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
    }catch(err){
        viewData.message = "no results";
    }
    try{
        // Obtain the post by "id"
        viewData.post = await blog.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }
    try{
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

//Returns blog posts in JSON format with optional filters by date and category
app.get('/posts', (req,res) => {
    if(req.query.category){ //optional filter, returns posts by category
        blog.getPostsByCategory(req.query.category).then((data) => 
        {if(data.length> 0) 
            res.render("posts", {posts: data})
        else
            res.render("posts",{ message: "no results" });}
            ).catch((error) => {
            res.render("posts", {message: error})
        });
    }
    else if (req.query.minDate){ //optional filter, returns posts newer than the date passed in a query
        blog.getPostsByMinDate(req.query.minDate).then((data) =>
        {if(data.length> 0) 
            res.render("posts", {posts: data})
        else
            res.render("posts",{ message: "no results" });});
    }
    else{
        blog.getAllPosts()
    .then((data)=> {if(data.length> 0) 
        res.render("posts", {posts: data})
    else
        res.render("posts",{ message: "no results" });})
    .catch((error) => res.render("posts", {message: error}));
    }
});

// Returns a JSON formatted string containing all of the categories within the categories.json file
app.get('/categories', (req,res) => {
    blog.getCategories()
    .then((data)=>{if(data.length> 0) 
        res.render("categories", {categories: data})
    else
        res.render("categories",{ message: "no results" });})
    .catch((error) => res.render("categories", {message: error}))
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

app.post('/categories/add', (req,res) => {
    // Process the req.body and add it as a new Category before redirecting to /categories
    blog.addCategory(req.body).then(()=>res.redirect('/categories'));
});
//Deletes category by ID
app.get('/categories/delete/:id', (req,res) => {
    blog.deleteCategoryById(req.params.id).then(()=>res.redirect('/categories'))
    .catch((error) => res.status(500).send('Unable to Remove Category / Category not found'));
});

//Deletes post by ID
app.get('/posts/delete/:id', (req,res) => {
    blog.deletePostById(req.params.id).then(()=>res.redirect('/posts'))
    .catch((error) => res.status(500).send('Unable to Remove Post / Post not found'));
});

//The 404 Route
app.get('*', (req, res) => {
    res.render("404.hbs");
  });

// setup http server to listen on HTTP_PORT
blog.initialize()
.then(()=> app.listen(HTTP_PORT, onHttpStart))
.catch((error)=>console.log(error));
