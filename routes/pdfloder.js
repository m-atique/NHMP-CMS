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
  
// API to fetch uploaded files by course
router.get('/getfiles/:course/:type', async (req, res) => {
  try {
    const { course,type } = req.params;

    // Fetch files for the specified course
    const query = `
    SELECT *
FROM uploads
WHERE type = '${type}' and ',' + courses + ',' LIKE '%,${course},%';
    `;

    const result = await db.query(query);

    if (result.length === 0) {
      return res.status(404).json({ message: 'No files found for the given course' });
    }

    // res.status(200).json(result.recordset );

    const pdfs = result.recordset 
    const pdfDAta = pdfs.map(item=>{ 
      

      //==============================converting to base64
      const relativePath = item.path; // This will capture "uploads/Book/1733117156377-Abc.pdf"
  const filePath = path.join(__dirname, '../', relativePath); // Adjust the path based on your folder structure

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Read the file and encode it as base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');

    // Create the Data URL format
    const fileType = 'application/pdf'; // Adjust this if serving other file types
    const dataUrl = `data:${fileType};base64,${base64Data}`; 
      
      
      
      
      
      return{id:item.id,
        endDate:item.date,
        title: path.basename(item.path).split("-")[1].split(".")[0],
        pdf:dataUrl
      }})


    res.status(200).json(pdfDAta );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching files', error });
  }
});


// Serve the file by path
router.get('/openfile/*', (req, res) => {
  // Extract the relative path from the URL
  try{
  const relativePath = req.params[0]; // This will capture "uploads/Book/1733117156377-Abc.pdf"
  const filePath = path.join(__dirname, '../', relativePath); // Adjust the path based on your folder structure

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Read the file and encode it as base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');

    // Create the Data URL format
    const fileType = 'application/pdf'; // Adjust this if serving other file types
    const dataUrl = `data:${fileType};base64,${base64Data}`;

    res.status(200).json({ pdf: dataUrl });
  } catch (error) {
    console.error('Error serving file as base64:', error);
    res.status(500).json({ message: 'Error processing file', error });
  }
});





// router.get('/getbooks', async (req, res) => {
//   try {
//     // Fetch the books from the database
//     const query = `SELECT * FROM uploads WHERE type = 'Book'`;
//     const result = await db.query(query);

//     if (result.recordset.length === 0) {
//       return res.status(404).json({ message: 'No books found' });
//     }

//     // Process each book entry to generate the thumbnail if it doesn't exist
//     const books = await Promise.all(
//       result.recordset.map(async (item) => {
//         const filePath = path.join(__dirname, '../..', item.path);
//         const thumbnailPath = path.join(__dirname, '../..', 'uploads', 'BookCovers', `${path.basename(item.path)}.jpg`);

//         // Generate thumbnail if it doesn't exist
//         if (!fs.existsSync(thumbnailPath)) {
//           await generateThumbnail(filePath, thumbnailPath); // Generate and save thumbnail
//         }

//         // Return metadata along with thumbnail URL
//         return {
//           id: item.id,
//           title: path.basename(item.path).split('-')[1].split('.')[0],
//           courses: item.courses,
//           thumbnail: `/covers/${path.basename(item.path)}.jpg`, // Thumbnail URL
//         };
//       })
//     );

//     res.status(200).json(books);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error fetching books', error });
//   }
// });

// // Function to generate a thumbnail from the PDF
// const generateThumbnail = async (pdfPath, thumbnailPath) => {
//   try {
//     const pdfBuffer = fs.readFileSync(pdfPath);
//     const pdfDoc = await PDFDocument.load(pdfBuffer);
//     const page = pdfDoc.getPage(0); // Get the first page

//     // Render first page as image (this requires PDF-to-image conversion)
//     const imageBuffer = await page.renderToImage(); // Implement using your PDF library
//     await sharp(imageBuffer).resize(200, 200).toFile(thumbnailPath); // Resize and save thumbnail
//   } catch (error) {
//     console.error('Error generating thumbnail:', error);
//   }
// };

module.exports = router;
