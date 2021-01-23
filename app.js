const express = require("express");
const app = express();
// reads and creates files
const fs = require("fs");
// multer allows us to upload files to server
const multer = require("multer");
const { TesseractWorker } = require("tesseract.js");
// worker analyzes images
const worker = new TesseractWorker();

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
          // res.send(result.text);
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
// app.get("/uploads", (req, res) => {
//   console.log("hey");
// });

// start up our server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`Hey, I'm running on port ${PORT}`));
