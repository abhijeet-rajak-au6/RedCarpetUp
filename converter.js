// const DataUri = require("datauri");
const path = require("path");
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();





module.exports= function(originalName, buffer){

    let extension = path.extname(originalName);
//    console.log("content",parser.format(extension,buffer).content)
    return parser.format(extension,buffer).content;
}