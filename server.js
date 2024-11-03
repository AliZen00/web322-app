/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Ali Khorram
Student ID: 145533196
Date: 2024-11-03
Vercel Web App URL: https://vercel.com/ali-khorrams-projects/web322-app/BoDfq4FwMmpXTuDzW6wcLGNsCVk7
GitHub Repository URL: https://github.com/AliZen00/web322-app.git

********************************************************************************/

const express = require('express');
const path = require('path');
const storeService = require('./store-service'); 

const app = express();
const PORT = process.env.PORT || 8080;


app.use(express.static('public'));


app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});


app.get('/', (req, res) => {
    res.redirect('/about');
});


app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
        .then(data => res.json(data))
        .catch(err => res.status(404).json({ message: err }));
});


app.get('/items', (req, res) => {
    storeService.getAllItems()
        .then(data => res.json(data))
        .catch(err => res.status(404).json({ message: err }));
});


app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(data => res.json(data))
        .catch(err => res.status(404).json({ message: err }));
});


app.use((req, res) => {
    res.status(404).send("Page Not Found");
});


storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("Failed to initialize the data: ", err);
    });
