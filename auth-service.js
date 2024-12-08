const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


let User; 

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        const db = mongoose.createConnection(
            "mongodb+srv://alikhora00:00arohkila@cluster0.n81j5.mongodb.net/web322?retryWrites=true&w=majority&appName=Cluster0"
        );

        db.on("error", (err) => {
            reject(err); 
        });

        db.once("open", () => {
            const userSchema = new mongoose.Schema({
                userName: { type: String, unique: true }, 
                password: String, 
                email: String,
                loginHistory: [
                    {
                        dateTime: Date,
                        userAgent: String,
                    },
                ],
            });

            User = db.model("users", userSchema); 
            resolve(); 
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        } else {
            bcrypt
                .hash(userData.password, 10) 
                .then((hash) => {
                    userData.password = hash; 
                    const newUser = new User(userData);

                    newUser
                        .save()
                        .then(() => resolve()) 
                        .catch((err) => {
                            if (err.code === 11000) {
                                reject("User Name already taken");
                            } else {
                                reject(`There was an error creating the user: ${err}`);
                            }
                        });
                })
                .catch((err) => reject("There was an error encrypting the password"));
        }
    });
};



module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .then((users) => {
                if (users.length === 0) {
                    reject(`Unable to find user: ${userData.userName}`);
                } else {
                    bcrypt
                        .compare(userData.password, users[0].password) 
                        .then((result) => {
                            if (!result) {
                                reject(
                                    `Incorrect Password for user: ${userData.userName}`
                                );
                            } else {
                                
                                users[0].loginHistory.push({
                                    dateTime: new Date().toString(),
                                    userAgent: userData.userAgent,
                                });

                                User.updateOne(
                                    { userName: users[0].userName },
                                    { $set: { loginHistory: users[0].loginHistory } }
                                )
                                    .then(() => resolve(users[0]))
                                    .catch((err) => {
                                        reject(
                                            `There was an error verifying the user: ${err}`
                                        );
                                    });
                            }
                        })
                        .catch(() =>
                            reject(
                                `Unable to find user: ${userData.userName}`
                            )
                        );
                }
            })
            .catch(() =>
                reject(`Unable to find user: ${userData.userName}`)
            );
    });
};

