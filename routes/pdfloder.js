const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../dbconfig');
const fs = require('fs');
const router = express.Router();
const sharp = require('sharp')
router.use(express.urlencoded({ extended: true })); // Ensure body parsing for form-data


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
const type = req.body.type
    const uploadDir = path.join(path.dirname(__dirname), 'uploads',type);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {

    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});



const upload = multer({ storage });

// API endpoint to upload PDF
router.post('/upload', upload.single('pdf'), async (req, res) => {
    try {

     
      const file = req.file;
      const { type,startDate,endDate,subjectId, courses, addedBy } = req.body; // Assuming you pass type, courses, and addedBy in the body
  
      if (!file) return res.status(400).json({ message: 'No file uploaded' });
      
      // Validate that courses and addedBy are provided
      if (!courses || !addedBy) {
        return res.status(400).json({ message: 'Courses and addedBy are required' });
      }
  
      // Save file path to database
      const filePath = `/uploads/${type}/${file.filename}`;
      
      // Insert into the uploads table
      const query = `
        INSERT INTO uploads (type,startDate, endDate,subjectId, status, courses, path, added_by)
        VALUES (
       '${type}',
  ${startDate ? `'${startDate}'` : 'NULL'}, 
  ${endDate ? `'${endDate}'` : 'NULL'}, 
  ${subjectId ? `'${subjectId}'` : 'NULL'}, 
'Active',
         '${ courses}',
          '${filePath}',
           '${addedBy}'
        )
      `;

    
      
      // Execute the query
      await db.query(query);
  
      res.status(200).json({ message: 'File uploaded successfully', filePath });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'File upload failed', error });
    }
  });
  
// API to fetch uploaded files by course
router.get('/getfiles/:course', async (req, res) => {
  try {
    const { course, type } = req.params;

    // Fetch files for the specified course
    const query = `
      SELECT *
      FROM uploads
      WHERE ',' + courses + ',' LIKE '%,${course},%';
    `;
    // type = '${type}' AND 
    
    const result = await db.query(query);

    // Check if any files were found
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No files found for the given course' });
    }

    const pdfs = result.recordset;
    const pdfData = pdfs.map((item) => {
      const relativePath = item.path; // e.g., "uploads/Book/1733117156377-Abc.pdf"
      const folder =item.path.split("/")[2]
      const type = item.path.split(".")[1]
      const filePath = path.join(__dirname, '../', relativePath);

     




 const fileUri = `${process.env.BASE_URL}${relativePath.replace(/\\/g,'/')}`
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        // Return error for missing file (optional: log it for debugging)
        console.error(`File not found: ${filePath}`);
        return null; // Filter out missing files
      }

      //Read the file and encode it as base64
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');

      // Create the Data URL format
      const fileType = 'application/pdf';
      const dataUrl = `data:${fileType};base64,${base64Data}`;

      return {
        id: item.id,
        folder:folder,
        type:type,
        endDate: item.date,
        title: path.basename(item.path).split("-")[1].split(".")[0],
        filepath:fileUri,
        // pdf: dataUrl,
      };
    }).filter(item => item !== null) // Filter out null entries for missing files

    // Send the response
    res.status(200).json(pdfData)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching files', error });
  }
});


router.get('/getfilesByType/:course/:type', async (req, res) => {
  try {
    const { course, type } = req.params;

    // Fetch files for the specified course
    const query = `
      SELECT *
      FROM uploads
      WHERE ',' + courses + ',' LIKE '%,${course},%' and type = '${type}' and endDate >= getdate();
    `;
    //  AND 
    
    const result = await db.query(query);

    // Check if any files were found
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No files found for the given course' });
    }

    const pdfs = result.recordset;
    const pdfData = pdfs.map((item) => {
      const relativePath = item.path; // e.g., "uploads/Book/1733117156377-Abc.pdf"
      const folder =item.path.split("/")[2]
      const type = item.path.split(".")[1]
      const filePath = path.join(__dirname, '../', relativePath);

     




 const fileUri = `${process.env.BASE_URL}${relativePath.replace(/\\/g,'/')}`
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        // Return error for missing file (optional: log it for debugging)
        console.error(`File not found: ${filePath}`);
        return null; // Filter out missing files
      }

      //Read the file and encode it as base64
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');

      // Create the Data URL format
      const fileType = 'application/pdf';
      const dataUrl = `data:${fileType};base64,${base64Data}`;

      return {
        id: item.id,
        folder:folder,
        type:type,
        endDate: item.date,
        title: path.basename(item.path).split("-")[1].split(".")[0],
        filepath:fileUri,
        // pdf: dataUrl,
      };
    }).filter(item => item !== null) // Filter out null entries for missing files

    // Send the response
    res.status(200).json(pdfData)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching files', error });
  }
});
module.exports = router;
