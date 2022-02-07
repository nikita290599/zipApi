const path = require('path');
const express = require('express');
// const ejs = require('ejs');
const bodyParser = require('body-parser');
const multer = require('multer');
const AdmZip = require("adm-zip");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var fs = require('fs');
const res = require('express/lib/response');

// For Multer Storage
var multerStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, 'my_uploads'));
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '_' + file.originalname);
    }
});

// For Single File upload
var multerSigleUpload = multer({ storage: multerStorage });

// For Multiple File upload
var multerMultipleUpload = multer({ storage: multerStorage }).array("multipleImage", 3);






// Route for zip file upload
app.post("/api/v1/zip_file", multerSigleUpload.single('zip'), function (req, response) {
    const files = req.file;
    const fileName = req.file.filename;
    console.log("FILENAME: ", fileName);

    const outputDir = path.join(__dirname, 'my_uploads', fileName.slice(0, -4));
    // UNZIPPING FILE
    async function extractArchive(filepath) {
        try {
            const zip = new AdmZip(filepath);

            zip.extractAllTo(outputDir, true);

            console.log(`Extracted to "${outputDir}" successfully`);
        } catch (e) {
            console.log(`Something went wrong. ${e}`);
        }
    }

    extractArchive(__dirname + "/my_uploads/" + fileName).then(() => {
        try{
            res.setHeader('Content-Type', 'application/json');
            let filenames = fs.readdirSync(outputDir);
            var temp = [];
            console.log("\nFilenames in directory:");
    
            for (let i = 0; i < filenames.length; i++) {
                const data = fs.readFileSync(outputDir + "/" + filenames[i],
                    { encoding: 'utf8', flag: 'r' });
    
                temp.push({
                    name: filenames[i],
                    content: data
                });
                if (i === filenames.length - 1) {
                    let finaldata = JSON.stringify(temp);
                    fs.writeFileSync('data.json', data);
                }
            }
    
        }
        catch(err){
            res.send(err);
        }
       

    }).then(()=>{
        res.send({ok});
    })



    // res.redirect('/');
});


// Server Listening
app.listen(3000, () => {
    console.log('Server is running at port 3000');
});