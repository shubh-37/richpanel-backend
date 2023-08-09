const mongoose = require("mongoose");
const util = require("util");
const fs = require("fs");
const pathLib = require("path");
const _ = require("lodash");
const location = pathLib.join(__dirname, ".", "models");
const fsReaddir = util.promisify(fs.readdir);

function beautifiedFileName(filename) {
  const newFileName = filename
    .replace(".js", "")
    .split("-")
    .map((fragment) => _.capitalize(fragment))
    .join("");
  return newFileName;
}

async function connect() {
  mongoose.set("strictQuery", false);
  const connection = await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  let Models = {};
  // fs.readdir takes a folder and returns a list of files without .. and .
  const allFiles = await fsReaddir(location, { withFileTypes: true });
  const files = allFiles.map((file) => file.name);
  try {
    if (!files || files.length === 0) {
      console.log("Files in DB not found, returning");
      return;
    }
    files.forEach((file) => {
      // convert to a Model friendly file name
      const ModelName = beautifiedFileName(file);
      const Model = require(`${location}/${file}`);
      Models[ModelName] = connection.model(ModelName, Model);
    });
    return { Models, connection };
  } catch (error) {
    console.error("Cant connect to the database", error);
  }
}

module.exports = connect;