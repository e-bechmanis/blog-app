const Sequelize = require('sequelize');
var sequelize = new Sequelize('d8dmerf5gtk8d1', 'wcobxxvooxryhg', 'e1cced2532c37f64f4dc30637cd9835d8c4464bf4d3a3288d8fb96695c90fb11', {
    host: 'ec2-54-159-22-90.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define a "Post" model
var Post = sequelize.define('Post', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

// Define a "Category" model
var Category = sequelize.define('Category', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(resolve)
        .catch((err) => reject("Unable to sync the database"));
        });        
}

module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll().then((data) => {
            resolve(data)})
        .catch((err) => reject("No results returned"));
        });    
}

module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: { published: true }
        }).then((data) => {resolve(data)})
        .catch((err) => reject("No results returned"));
        });     
}

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll().then((data) => {resolve(data)})
        .catch((err) => reject("No results returned"));
        });
}

module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for (const prop in postData) {
            if (postData[prop] === ""){
                postData[prop] = null;
            }
        }
        postData.postDate = new Date();
        Post.create(postData).then(() => { resolve()})
        .catch((err) => reject("Unable to create post"));
        });    
}

module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: { category: category }
        }).then((data) => {resolve(data)})
        .catch((err) => reject("No results returned"));
        });    
}

module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:
            { $and: [ { published: true }, { category: category } ] } 
        }).then((data) => {resolve(data)})
        .catch((err) => reject("No results returned"));
        });    
}

module.exports.getPostsByMinDate = function(minDateStr){
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        Post.findAll({
            where: {
                postDate: {
                [gte]: new Date(minDateStr)
            }
        }
        }).then((data) => {resolve(data)})
        .catch((err) => reject("No results returned"));
        });       
}

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: { id: id }
        }).then((data) => {resolve(data[0])})
        .catch((err) => reject("No results returned"));
        });      
}

module.exports.addCategory = (categoryData) =>{
    return new Promise((resolve, reject) => {
        for (const prop in categoryData) {
            if (categoryData[prop] === ""){
                categoryData[prop] = null;
            }
        }
        Category.create(categoryData).then(() => { resolve()})
        .catch((err) => reject("Unable to create category"));
        });    
}

module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: { id: id }
        }).then(() => { resolve()})
        .catch((err) => reject("Error while trying to delete category"));
        });
}

module.exports.deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: { id: id }
        }).then(() => {resolve()})
        .catch((err) => reject("Error while trying to delete post"));
        });
}