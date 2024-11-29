const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../dbconfig');
const fs = require('fs');
const router = express.Router();
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
      const { type, courses, addedBy } = req.body; // Assuming you pass type, courses, and addedBy in the body
  
      if (!file) return res.status(400).json({ message: 'No file uploaded' });
      
      // Validate that courses and addedBy are provided
      if (!courses || !addedBy) {
        return res.status(400).json({ message: 'Courses and addedBy are required' });
      }
  
      // Save file path to database
      const filePath = `/uploads/${type}/${file.filename}`;
      
      // Insert into the uploads table
      const query = `
        INSERT INTO uploads (type, courses, path, added_by)
        VALUES (
       '${type}',
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
  

module.exports = router;
