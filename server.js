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

const express = require("express");
const itemData = require("./store-service");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const exphbs = require("express-handlebars");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
const upload = multer();



// Handlebars Setup
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return `<li class="nav-item"><a class="nav-link${url === app.locals.activeRoute ? " active" : ""}" href="${url}">${options.fn(this)}</a></li>`;
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        let day = dateObj.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      },
    },
  })
);

app.set("view engine", ".hbs");

app.use((req, res, next) => {
  app.locals.activeRoute = req.path;
  next();
});

// Routes
app.get("/", (req, res) => res.redirect("/about"));

app.get("/about", (req, res) => res.render("about"));

app.get("/shop", async (req, res) => {
  let viewData = {};

  try {
      let items = req.query.category
          ? await itemData.getPublishedItemsByCategory(req.query.category)
          : await itemData.getPublishedItems();

      items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
      viewData.items = items;
      viewData.item = items[0]; 
  } catch {
      viewData.message = "No items available";
  }

  try {
      viewData.categories = await itemData.getCategories();
  } catch {
      viewData.categoriesMessage = "No categories available";
  }

  res.render("shop", { data: viewData });
});


app.get("/categories", (req, res) => {
  itemData
    .getCategories()
    .then((data) => {
      if (data.length > 0) res.render("categories", { categories: data });
      else res.render("categories", { message: "No Categories Available" });
    })
    .catch(() => res.render("categories", { message: "No Categories Available" }));
});

app.get("/categories/add", (req, res) => res.render("addCategory"));

app.post("/categories/add", (req, res) => {
  itemData
    .addCategory(req.body)
    .then(() => res.redirect("/categories"))
    .catch(() => res.status(500).send("Unable to Add Category"));
});

app.get("/categories/delete/:id", (req, res) => {
  itemData
    .deleteCategoryById(req.params.id)
    .then(() => res.redirect("/categories"))
    .catch(() => res.status(500).send("Unable to Remove Category"));
});

app.get("/items", (req, res) => {
  let queryPromise;
  if (req.query.category) queryPromise = itemData.getItemsByCategory(req.query.category);
  else if (req.query.minDate) queryPromise = itemData.getItemsByMinDate(req.query.minDate);
  else queryPromise = itemData.getAllItems();

  queryPromise
    .then((data) => {
      if (data.length > 0) res.render("items", { items: data });
      else res.render("items", { message: "No Items Available" });
    })
    .catch(() => res.render("items", { message: "No Items Available" }));
});

app.get("/items/add", (req, res) => {
  itemData
    .getCategories()
    .then((data) => res.render("addItem", { categories: data }))
    .catch(() => res.render("addItem", { categories: [] }));
});

app.post("/items/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    streamUpload(req)
      .then((uploaded) => {
        req.body.featureImage = uploaded.url;
        processItem(req.body);
      })
      .catch(() => res.status(500).send("Image Upload Failed"));
  } else {
    req.body.featureImage = null;
    processItem(req.body);
  }

  function processItem(itemData) {
    itemData.featureImage = itemData.featureImage || "";
    itemData.published = itemData.published === "on";
    itemData.itemDate = new Date();
    itemData.category = itemData.category || null;

    itemData
      .addItem(itemData)
      .then(() => res.redirect("/items"))
      .catch(() => res.status(500).send("Unable to Add Item"));
  }
});

app.get("/items/delete/:id", (req, res) => {
  itemData
    .deleteItemById(req.params.id)
    .then(() => res.redirect("/items"))
    .catch(() => res.status(500).send("Unable to Remove Item"));
});

app.use((req, res) => res.status(404).render("404"));

// Initialize Database and Start Server
itemData
  .initialize()
  .then(() => app.listen(HTTP_PORT, () => console.log(`Server running on port ${HTTP_PORT}`)))
  .catch((err) => console.error(`Unable to start server: ${err}`));
