const { rejects } = require("assert");
const fs = require("fs"); 
const { resolve } = require("path");

let posts = new Array();
let categories = new Array();

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
    fs.readFile('./data/posts.json', 'utf8', (err, data) => {
        if (err) {
            reject("Could not open the first file");
        }
        else{
            posts = JSON.parse(data);
            fs.readFile('./data/categories.json', 'utf8', (err, cat) =>{
                if (err) {
                    reject("Could not open the second file");
                }
                else{
                    categories = JSON.parse(cat);
                    resolve(data, cat);
                }
            });
        }
    });
})
}

module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        if (posts.length > 0) { resolve(posts); }
        else reject("No results returned");
    });
}

module.exports.getPublishedPosts = () => {
    let publishedPosts = new Array();
    return new Promise((resolve, reject) => {
        posts.forEach(element => {
            if (element.published == true) publishedPosts.push(element);})
        if (publishedPosts.length > 0) { resolve(publishedPosts); }
        else reject("No results returned");
    });
}

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) { resolve(categories); }
        else reject("No results returned");
    });
}

module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        postData.published = postData.published === undefined ? false : true;
        postData.id = posts.length + 1;
        postData.postDate = new Date().getFullYear()+'-'+("0"+(new Date().getMonth()+1)).slice(-2)+'-'+("0"+ new Date().getDate()).slice(-2);
        posts.push(postData);
        resolve(postData);
    });
}

module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve,reject) => {
        let sortedByCategory = new Array();
        posts.forEach(element => {
            if (element.category == category) sortedByCategory.push(element);})
        sortedByCategory.length === 0 ? reject("No results returned") : resolve(sortedByCategory);
    });
}

module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve,reject) => {
        let sortedPublishedByCategory = new Array();
        posts.forEach(element => {
            if (element.category == category && element.published == true) sortedPublishedByCategory.push(element);})
        sortedPublishedByCategory.length === 0 ? reject("No results returned") : resolve(sortedPublishedByCategory);
    });
}

module.exports.getPostsByMinDate = function(minDateStr){
    return new Promise((resolve,reject) => {
        let sortedByDate = new Array();
        posts.forEach(element => {
            if(new Date(element.postDate) >= new Date(minDateStr)) sortedByDate.push(element);})
        sortedByDate.length === 0 ? reject("No results returned") : resolve(sortedByDate);
    });
}

module.exports.getPostById = (id) => {
    return new Promise((resolve,reject) => {
        let sortedById = {};
        posts.forEach(element => {
            if (element.id == id) sortedById = element;})
        Object.keys(sortedById).length === 0 ? reject("No results returned") : resolve(sortedById);
    });
}