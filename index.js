import express from "express";
import multer from "multer";
import { create } from "@web3-storage/w3up-client";
import fs from "fs";
import path from "path";
const app = express();
const port = 3000;
import { filesFromPaths } from "files-from-path";
import { log } from "console";

app.use(express.json());

(async () => {
  const client = await create();

  const space = await client.createSpace("mitsunn");

  const myAccount = await client.login("mark.meguizo@gmail.com");
  await client.setCurrentSpace(
    "did:key:z6MkeYPCtS63hQ2DaknZ4vTcb63F8izkupgXKy8DdhvXdq8k"
  );
  // await myAccount.provision(space.did());

  // await space.save();

  // const recovery = await space.createRecovery(myAccount.did());
  // await client.capability.access.delegate({
  //   space: space.did(),
  //   delegations: [recovery],
  // });

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
    console.log({ filepath: req.file });

    const files = await filesFromPaths([req.file.path, req.file.destination]);
    console.log(files);
    // console.log({ filepath: req.file });
    // const fileData = fs.readFileSync(path.resolve(req.file.path));
    // console.log(fileData);
    // const files = [new File([fileData], req.file.originalname)];
    // console.log(files);
    const directoryCid = await client.uploadDirectory(files);
    console.log(directoryCid);
    let data = `${directoryCid}.ipfs.w3s.link/?filename=${req.file.originalname}`;
    res.send({ data: data });
    // res.send({ directoryCid });
  });

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
})();
