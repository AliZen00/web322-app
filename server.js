/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Ali Khorram
Student ID: 145533196
Date: 2024-11-03
Vercel Web App URL: [Your Vercel URL]
GitHub Repository URL: [Your GitHub URL]

********************************************************************************/ 

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;


app.use(express.static('public'));


app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});


app.get('/', (req, res) => {
    res.redirect('/about');
});


app.listen(PORT, () => {
    console.log(`Express http server listening on port ${PORT}`);
});
