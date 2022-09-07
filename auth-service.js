const env = require("dotenv");
env.config();

const bcrypt = require('bcryptjs');
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
        let db = mongoose.createConnection(process.env.MONGO_URI_STRING);

    db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
    db.once('open', ()=>{
           User = db.model("users", userSchema);
           console.log("Mongo DB successfully connected");
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
            bcrypt.hash(userData.password, 10).then((hash) => {
                userData.password = hash;
                let newUser = new User(userData);
                newUser.save((err) => {
                    if (err) {
                        if(err.code == 11000) {
                            reject("Username already taken");
                        } 
                        else {
                            reject("There was an error creating the user: " + err);
                        }
                    } else {
                        resolve();
                    }
                })
            }).catch((error) => {
                reject("There was an error encrypting the password: " + error);
            })
        }
    });
}

module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userData.userName})
        .exec()
        .then((user) => { // users will be an array of objects.
            if (!user){
                reject ("Unable to find user: " + userData.userName);
            }
            else {
                bcrypt.compare(userData.password, user.password).then((result) => {
                    if (result === true){
                        //save session
                        console.log(user);
                        user.loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                        // update user login history
                        User.updateOne(
                            { userName : user.userName },
                            { $set : { loginHistory : user.loginHistory} }
                        ).exec()
                        .then(() => { resolve(user) })
                        .catch((err) => {
                            reject("There was an error verifying the user: " + err);
                        });
                    }
                }).catch((error) => {
                    reject("Incorrect Password for user: " + userData.userName);
                })
            }
        });
    });
}