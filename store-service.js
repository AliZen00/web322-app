const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];


function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
            if (err) {
                reject("unable to read file");
                return;
            }
            items = JSON.parse(data);

            fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
                if (err) {
                    reject("unable to read file");
                    return;
                }
                categories = JSON.parse(data);
                resolve();
            });
        });
    });
}


function addItem(itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published ? true : false;
        itemData.id = items.length + 1;
        items.push(itemData);
        resolve(itemData);
    });
}


function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            reject("no results returned");
        } else {
            resolve(items);
        }
    });
}


function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length === 0) {
            reject("no results returned");
        } else {
            resolve(publishedItems);
        }
    });
}


function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject("no results returned");
        } else {
            resolve(categories);
        }
    });
}


function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category === category);
        filteredItems.length > 0 ? resolve(filteredItems) : reject("no results returned");
    });
}


function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const minDate = new Date(minDateStr);
        const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
        filteredItems.length > 0 ? resolve(filteredItems) : reject("no results returned");
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id == id);
        item ? resolve(item) : reject("no result returned");
    });
}


module.exports = {
    initialize,
    addItem,
    getAllItems,
    getPublishedItems,
    getCategories,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById
};
