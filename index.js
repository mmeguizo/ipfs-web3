import express from "express";
import multer from "multer";
import { create } from "@web3-storage/w3up-client";
import fs from "fs";
import path from "path";
const app = express();
const port = 3000;
import { filesFromPaths } from "files-from-path";
import dotenv from "dotenv";
import { Upload } from "@web3-storage/upload-client";

dotenv.config();
app.use(express.json());

(async () => {
  const client = await create();

  const myAccount = await client.login(process.env.email);
  await client.setCurrentSpace(process.env.DID);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });

  const upload = multer({
    storage: storage,
    dest: "uploads/",
    limits: { fileSize: 1000000 },
  });

  app.post("/upload", upload.single("file"), async (req, res, next) => {
    const files = await filesFromPaths([req.file.path, req.file.destination]);
    const directoryCid = await client.uploadDirectory(files);
    let data = {
      cid: directoryCid,
      name: req.file.originalname,
      link: `${directoryCid}.ipfs.w3s.link/?filename=${req.file.originalname}`,
    };
    res.send({ data: data });
  });

  app.post("/deleteShard", async (req, res, next) => {
    console.log(req.body);

    const { contentCID } = req.body;
    console.log(contentCID);

    try {
      let results = await client.remove(contentCID);
      res.send({ data: results });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  });

  app.get("/getAllContent", async (req, res, next) => {
    let results = await client.capability.upload.list({ cursor: "", size: 25 });
    res.send({ data: results });
  });

  app.get("/getContent", async (req, res, next) => {
    console.log(req.query);
    const { contentCid } = req.query;
    console.log({ contentCID: contentCid });
    let results = await client.capability.upload.list(contentCid);
    res.send({ data: results });
  });

  app.get("/getRemoveContent", async (req, res, next) => {
    const { contentCid } = req.query;
    console.log(contentCid);
    let results = await client.capability.upload.remove(contentCid);
    res.send({ data: results });
  });

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
})();
