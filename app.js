const express = require("express");
const app = express();
// reads and creates files
const fs = require("fs");
// multer allows us to upload files to server
const multer = require("multer");
const { TesseractWorker } = require("tesseract.js");
// worker analyzes images
const worker = new TesseractWorker();
const { db, Copy } = require("./db");

// storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
// upload will check the storage to find the file by the filenmae
const upload = multer({ storage: storage }).single("avatar");

app.set("view engine", "ejs");
app.use(express.static("public"));

// ROUTES
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/copies", async (req, res, next) => {
  const copies = await Copy.findAll({
    attributes: ["text", "language"],
  });
  const tagline = "Here are your searchable converted texts.";
  res.render("copies", {
    copies: copies,
    tagline: tagline,
  });
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log("This is your error", err);

      worker
        .recognize(data, "eng", { tessjs_create_pdf: "1" })
        .progress((progress) => {
          console.log(progress);
        })
        .then((result) => {
          // res.send(result.text) would show result in browser
          Copy.create({
            text: result.text,
            language: "English",
          });
          res.redirect("/download");
        })
        .finally(() => worker.terminate());
    });
  });
});

app.post("/upload-spanish", (req, res) => {
  upload(req, res, (err) => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log("This is your error", err);

      worker
        .recognize(data, "spa", { tessjs_create_pdf: "1" })
        .progress((progress) => {
          console.log(progress);
        })
        .then((result) => {
          Copy.create({
            text: result.text,
            language: "Spanish",
          });
          res.redirect("/download");
        })
        .finally(() => worker.terminate());
    });
  });
});

app.post("/upload-Persian", (req, res) => {
  upload(req, res, (err) => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log("This is your error", err);

      worker
        .recognize(data, "fas", { tessjs_create_pdf: "1" })
        .progress((progress) => {
          console.log(progress);
        })
        .then((result) => {
          Copy.create({
            text: result.text,
            language: "Persian",
          });
          res.redirect("/download");
        })
        .finally(() => worker.terminate());
    });
  });
});

// downloads latest file that was uploaded
app.get("/download", (req, res) => {
  const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
  res.download(file);
});

// start up our server
const PORT = process.env.PORT || 5000;

db.sync() // if you update your db schemas, make sure you drop the tables first and then recreate them
  .then(() => {
    console.log("db synced");
    app.listen(PORT, () =>
      console.log(`studiously serving silly sounds on port ${PORT}`)
    );
  });
