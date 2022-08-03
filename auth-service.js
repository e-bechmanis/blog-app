var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var userSchema = new Schema({
    "userName":  {
        "type": String,
        "unique": true
      },
    "password": String,
    "email": String,
    "loginHistory": [{
      "dateTime": Date,
      "userAgent": String
    }]
  });
  
  let User; // to be defined on new connection (see initialize)

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection("mongodb+srv://dbUser:WEB322-Elena@senecaweb.i4mq2qu.mongodb.net/?retryWrites=true&w=majority");

db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
db.once('open', ()=>{
           User = db.model("users", userSchema);
resolve();
        });
    });
};

module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        } 
        else {
            let newUser = new User(userData);
            newUser.save((err) => {
                if (err) {
                    if(err.code == 11000) {
                        reject("Username already taken");
                    } 
                    else {
                        reject("There was an error creating the user: " + err)
                    }
                } else {
                    resolve()
                }
            })
        }
    });
}

module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName})
        .exec()
        .then((users) => { // users will be an array of objects.
            if (users.length === 0){
                reject ("Unable to find user: " + userData.userName);
            }
            else if (users[0].password !== userData.password) {
                reject("Incorrect Password for user: " + userData.userName);
            }
            else {
                users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                User.updateOne(
                    { userName : users[0].userName },
                    { $set : { loginHistory : users[0].loginHistory} }
                ).exec()
                .then(() => { resolve(users[0]) })
                .catch((err) => {
                    reject("There was an error verifying the user: " + err);
                });
            }
        })
        .catch((err) => {
            reject("Unable to find user: " + userData.userName);
        });
    });
}