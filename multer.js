const multer = require("multer");
const dotenv = require("dotenv"); 
const path = require("path");


dotenv.config();   

const injectFileName = function(originalname){

    var extname = path.extname(originalname);
    originalname.replace(extname,'')+"-" + Date.now();
    console.log(originalname);
    return originalname;

}
const multerConfig = {

    storage: multer.memoryStorage({
        destination:"uploads/",
        filename: function(req,file,cb){
            cb(null,injectFileName(file.originalname))
        }
    }),
    limits:{
        fileSize: 1024 *1024 *2
    
    },
    fileFilter: function(req,file,cb){

        console.log("hello");
        if(file.mimetype === "image/jpeg" || file.mimetype ==="image/png" || file.mimetype ==="image/jpg")
        {
            cb(null,true);
        }
        else{
            var newError = new Error("File Type is in correct");
            newError.name="MulterError";
            cb(newError,false);
        }
    }
}


const upload = multer(multerConfig);
module.exports = upload;