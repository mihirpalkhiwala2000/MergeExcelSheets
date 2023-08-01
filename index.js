const path = require("path");
const multer = require("multer");
const express = require("express");
const xlsx = require("xlsx");

const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.get("/", (req, res) => {
  return res.render("homepage");
});

app.post("/merge", upload.array("files", 5), async (req, res) => {
  try {
    const mergedWorkbook = xlsx.utils.book_new();
    if (req.files.length === 1) {
      throw Error("Only 1 file provided, please provide more files");
    }
    for (let i = 0; i < req.files.length; i++) {
      const workbook = xlsx.readFile(req.files[i].path);
      console.log(
        "🚀 ~ file: index.js:41 ~ app.post ~ workbook:",
        workbook.Sheets[workbook.SheetNames[0]]
      );
      xlsx.utils.book_append_sheet(
        mergedWorkbook,
        workbook.Sheets[workbook.SheetNames[0]],
        `Sheet${i + 1}`
      );
    }

    const mergedBuffer = xlsx.write(mergedWorkbook, { type: "buffer" });

    res.setHeader("Content-Disposition", 'attachment; filename="merged.xlsx');
    res.send(mergedBuffer);
  } catch (e) {
    res.send(e.message);
  }
});

app.listen(PORT, () => console.log("Server started on port: 3000"));
