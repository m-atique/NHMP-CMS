const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../dbconfig');

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadFolder = path.join(__dirname, '../uploads');
    cb(null, uploadFolder); // Save files in the uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix); // Append unique timestamp to filename
  }
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
      const filePath = `/uploads/${file.filename}`;
      
      // Insert into the uploads table
      const query = `
        INSERT INTO uploads (type, courses, path, added_by)
        VALUES (
       '${type}',
         '${ JSON.stringify(courses)}',
          '${filePath}',
           '${addedBy}'

        )
      `;

      console.log(query)
      
      // Execute the query
      await db.query(query);
  
      res.status(200).json({ message: 'File uploaded successfully', filePath });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'File upload failed', error });
    }
  });
  

module.exports = router;
