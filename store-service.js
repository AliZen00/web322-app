
/*********************************************************************************
WEB322 – Assignment 05
I declare that this assignment is my own work in accordance with Seneca Academic Policy.
No part of this assignment has been copied manually or electronically from any other source
(including 3rd party web sites) or distributed to other students.

Name: Ali Khorram
Student ID: 145533196
Date: 2024-11-29
Vercel Web App URL: https://web322-app-eight-peach.vercel.app/
GitHub Repository URL: https://github.com/AliKhorram/web322-app
********************************************************************************/


const Sequelize = require('sequelize');


const sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'uXFm0VCZeEf1', {
    host: 'ep-holy-shadow-a5j2s38v-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
});


const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    itemDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE,
});

const Category = sequelize.define('Category', {
    category: Sequelize.STRING,
});


Item.belongsTo(Category, { foreignKey: 'category' });

module.exports = {
    
    initialize: () => {
        return sequelize.sync().then(() => Promise.resolve()).catch(err => Promise.reject("unable to sync the database"));
    },

    
    getAllItems: () => {
        return Item.findAll()
            .then(data => Promise.resolve(data))
            .catch(() => Promise.reject("no results returned"));
    },

    
    getItemsByCategory: (category) => {
        return Item.findAll({ where: { category } })
            .then(data => Promise.resolve(data))
            .catch(() => Promise.reject("no results returned"));
    },

    
    getItemsByMinDate: (minDateStr) => {
        const { gte } = Sequelize.Op;
        return Item.findAll({
            where: {
                itemDate: {
                    [gte]: new Date(minDateStr),
                },
            },
        })
            .then(data => Promise.resolve(data))
            .catch(() => Promise.reject("no results returned"));
    },

    
    getItemById: (id) => {
        return Item.findAll({ where: { id } })
            .then(data => Promise.resolve(data[0]))
            .catch(() => Promise.reject("no results returned"));
    },

    
    addItem: (itemData) => {
        itemData.published = itemData.published ? true : false;
        for (let key in itemData) {
            if (itemData[key] === '') {
                itemData[key] = null;
            }
        }
        itemData.itemDate = new Date();
        return Item.create(itemData)
            .then(() => Promise.resolve())
            .catch(() => Promise.reject("unable to create item"));
    },

    
    getPublishedItems: () => {
        return Item.findAll({ where: { published: true } })
            .then(data => Promise.resolve(data))
            .catch(() => Promise.reject("no results returned"));
    },

    
    getPublishedItemsByCategory: (category) => {
        return Item.findAll({ where: { published: true, category } })
            .then(data => Promise.resolve(data))
            .catch(() => Promise.reject("no results returned"));
    },

    
    getCategories: () => {
        return Category.findAll()
            .then(data => Promise.resolve(data))
            .catch(() => Promise.reject("no results returned"));
    },

    
    addCategory: (categoryData) => {
        for (let key in categoryData) {
            if (categoryData[key] === '') {
                categoryData[key] = null;
            }
        }
        return Category.create(categoryData)
            .then(() => Promise.resolve())
            .catch(() => Promise.reject("unable to create category"));
    },

    
    deleteCategoryById: (id) => {
        return Category.destroy({ where: { id } })
            .then(() => Promise.resolve())
            .catch(() => Promise.reject("unable to remove category"));
    },

    
    deleteItemById: (id) => {
        return Item.destroy({ where: { id } })
            .then(() => Promise.resolve())
            .catch(() => Promise.reject("unable to remove item"));
    },
};
