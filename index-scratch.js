import express from "express";
import multer from "multer";
import { create } from "@web3-storage/w3up-client";
import fs from "fs";
import path from "path";
import formidable from "formidable";
import md5 from "md5";
const app = express();
const port = 3000;

app.use(express.json());
const upload = multer({ dest: "uploads/" });
(async () => {
  const client = await create();

  // ... rest of your code ...

  app.post("/upload", upload.single("file"), async (req, res, next) => {
    let useFor = "files";
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, "..", "uploads");

    form.on("file", function (field, file) {
      let newFileName = [useFor, Math.random(), Math.random(), Math.random()];
      newFileName = `${md5(newFileName.join(""))}.${file.originalFilename
        .split(".")
        .pop()}`;
      const newPath = path.join(form.uploadDir, newFileName);
      fs.rename(file.filepath, newPath, async () => {
        const newFile = {
          ...file,
          filepath: newPath,
        };
        const directoryCid = await client.uploadDirectory([newFile]);
      });
    });

    // ... rest of your code ...

    form.parse(req, async (err, fields, files) => {
      let returnMe = [];
      returnMe.push([fields, files]);
      if (err) {
        next(err);
        return;
      }
      return await res.json({
        success: true,
        message: "Files uploaded successfully ",
        data: returnMe,
      });
    });
  });

  // ... rest of your code ...
})();
