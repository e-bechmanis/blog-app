const { rejects } = require("assert");
const fs = require("fs"); 
const { resolve } = require("path");

let posts = new Array();
let categories = new Array();

module.exports.initialize = function(){
    return new Promise(function(resolve, reject){
    fs.readFile('./data/posts.json', 'utf8', (err, data) => {
        if (err) {
            reject("Could not open the first file");
        }
        else{
            console.log("First JSON file opened successfully");
            posts = JSON.parse(data);
            fs.readFile('./data/categories.json', 'utf8', (err, cat) =>{
                if (err) {
                    reject("Could not open the second file");
                }
                else{
                    console.log("Second JSON file opened successfully");
                    categories = JSON.parse(cat);
                    resolve(data, cat);
                }
            });
        }
    });
})
}

module.exports.getAllPosts = function(){
    return new Promise(function(resolve, reject){
        if (posts.length > 0) { resolve(posts); }
        else reject("No results returned");
    });
}

module.exports.getPublishedPosts = function(){
    let publishedPosts = new Array();
    return new Promise(function(resolve, reject){
        posts.forEach(element => {
            if (element.published == true) publishedPosts.push(element);})
        if (publishedPosts.length > 0) { resolve(publishedPosts); }
        else reject("No results returned");
    });
}

module.exports.getCategories = function(){
    return new Promise(function(resolve, reject){
        if (categories.length > 0) { resolve(categories); }
        else reject("No results returned");
    });
}
