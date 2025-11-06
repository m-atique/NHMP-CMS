const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../dbconfig");
const fs = require("fs");
const router = express.Router();
const sharp = require("sharp");
router.use(express.urlencoded({ extended: true })); // Ensure body parsing for form-data

lmskey = process.env.KEY;

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {

//     console.log("file",file,req.body);
//     const uploadDir = path.join(path.dirname(__dirname), 'profilePic');

//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {

//     const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//     if (allowedTypes.includes(file.mimetype)) {
//       const filename = `${Date.now()}-staff-${file.originalname}`;
//       cb(null, filename);
//     } else {
//       cb(new Error("Only JPG, PNG, and JPEG files are allowed"));
//     }

//   },
// });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("File Info:", file);
    console.log("Request Body:", req.body);

    // Extract the folder name from the request
    const folderIndex = Object.keys(req.body).find(
      (key) => req.body[key] == file.originalname.split("_")[0]
    );
    const folderName =
      req.body[`folder_${folderIndex.split("_")[1]}`] || "default";

    const uploadDir = path.join(__dirname, `uploads/${folderName}`);

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      const filename = `${Date.now()}-${file.originalname}`;
      cb(null, filename);
    } else {
      cb(new Error("Only JPG, PNG, and JPEG files are allowed"));
    }
  },
});

const upload = multer({ storage });

router.post("/saveStaff", upload.any(), async (req, res) => {
  // console.log("Uploaded files:", req.files);
  // console.log("Received data:", req.body);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const data = req.body;
  let imagePaths = {};

  // Map uploaded files to corresponding categories
  req.files.forEach((file) => {
    const folder = req.body[`folder_${req.files.indexOf(file)}`] || "unknown";

    const filePath = `/uploads/${folder}/${file.filename}`;

    if (!imagePaths[folder]) {
      imagePaths[folder] = [];
    }
    imagePaths[folder].push(filePath);
    
  });

  let qry = `
    INSERT INTO staff_info (
      name, fname, dob, gender, bgroup, cnic, email, pic, cnicFront, cnicBack, 
      dlFront, dlBack, maritalState, contact, emgcontact, relation, emgpesrson,
      province, domicile, localPs, pa, ca, qualification,  institute,
      dl, dlno, dlissuedBy, rank, beltno, doj_gov, doj_nhmp, doj_clg, employment,
      deparment, deputation, dprank, induction, indrank, ibanSalary, ibanNbp,
      bank, payNo
    ) VALUES (
      '${data.name}', '${data.fname}', '${data.dob}', '${data.gender}', 
      ${data.bgroup ? `'${data.bgroup}'` : 'NULL'}, '${data.cnic}', '${data.email}', 
      ${imagePaths.profile ? `'${imagePaths.profile[0]}'` : 'NULL'},
      ${imagePaths.cnic ? `'${imagePaths.cnic[0]}'` : 'NULL'}, 
      ${imagePaths.cnic ? `'${imagePaths.cnic[1]}'` : 'NULL'},
      ${imagePaths.dl ? `'${imagePaths.dl[0]}'` : 'NULL'},
      ${imagePaths.dl ? `'${imagePaths.dl[1]}'` : 'NULL'},
      '${data.maritalState}', '${data.contact}',
      '${data.emgcontact}', '${data.relation}', '${data.emgpesrson}',
      '${data.province}', '${data.domicile}', '${data.localPs}', '${data.pa}',
      '${data.ca}', '${data.qualification}', '${data.institute}',
      '${data.dl}', '${data.dlno}', '${data.dlissuedBy}', '${data.rank}',
      '${data.beltno}', '${data.doj_gov}', '${data.doj_nhmp}', '${data.doj_clg}',
      '${data.employment}', '${data.deparment}', 
      ${data.deputation ? `'${data.deputation}'` : 'NULL'}, 
      ${data.dprank ? `'${data.dprank}'` : 'NULL'},
      ${data.induction ? `'${data.induction}'` : 'NULL'}, 
      ${data.indrank ? `'${data.indrank}'` : 'NULL'}, 
      ${data.salaryIban ? `'${data.salaryIban}'` : 'NULL'}, 
      ${data.nbpIban ? `'${data.nbpIban}'` : 'NULL'},
      '${data.bank}', 
      ${data.payNo ? `'${data.payNo}'` : 'NULL'}
    )
  `;


  try {
    db.query(qry, (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.json({
          success: true,
          message: "Staff saved successfully",
          result,
        });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// const upload = multer({ storage });

router.post("/stafflogin", async (req, res) => {
  const { username, password } = req.body;

  try {
    const apiKey = req.headers["cms-api-key"];
    if (!apiKey || apiKey !== lmskey) {
      return res.status(403).json({ message: "Forbidden: Invalid API Key" });
    }

    const user = await db.query(
      `select sa.username,sa.password,si.branch,si.role,si.name, si.rank from staff_info as si inner join staff_accounts as sa on si.id = sa.ref_table_key WHERE sa.username = '${username}'`
    );


    if (user.recordset.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }
    const validPassword = password === user.recordset[0].password; // Replace with proper password hashing in production
 
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const userData = user.recordset[0];

    const user_info = {
      name: userData.name,
      branch: userData.branch,
      role: userData.role,
      rank: userData.rank,
    };
    res
      .status(200)
      .json({ message: "Login successful", user: user.recordset[0] });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//============================================save data

// router.post("/saveStaff",upload.array("Images", 5), (req, res) => {

//   const files = req.files;
//   if (!files || files.length === 0) {
//     return res.status(400).json({ message: "No files uploaded" });
//   }

//   const filePaths = files.map(file => `/profiles/${file.filename}`);

//     const data = req.body;

//       let qry = '';

//       const filePath = filePaths[0];
//      const deputationValue = data.employment !== 'Recruited' ? `'${data.deputation}'` : null;
//      const inductionValue = data.employment === 'Inducted' ? `'${data.induction}'` : null;

//          qry = `INSERT INTO staff_info (
//              name, fname, dob, gender, bgroup, cnic, email, pic, maritalState, contact, emgcontact, relation, emgpesrson, province, domicile, localPs, pa, ca, qualification, degreeName, institute, dl, dlno, dlissuedBy, rank, beltno, doj_gov, doj_nhmp, doj_clg, employment, deparment, deputation, induction
//              ) VALUES ('${data.name}', '${data.fname}', '${data.dob}', '${data.gender}', '${data.bgroup}', '${data.cnic}', '${data.email}', '${filePath}', '${data.maritalState}', '${data.contact}', '${data.emgcontact}', '${data.relation}', '${data.emgpesrson}', '${data.province}', '${data.domicile}', '${data.localPs}', '${data.pa}', '${data.ca}', '${data.qualification}', '${data.degreeName}', '${data.institute}', '${data.dl}', '${data.dl === 'N/A' ? '' : data.dlno}', '${data.dl === 'N/A' ? '' : data.dlissuedBy}', '${data.rank}', '${data.beltno}', '${data.doj_gov}', '${data.doj_nhmp}', '${data.doj_clg}', '${data.employment}', '${data.employment !== 'recruited' ? data.deparment : 'nhmp'}', ${deputationValue}, ${inductionValue}
//              )`;

//         //  try {

//         //    db.query(qry, (err, result) => {
//         //      if (err) {
//         //          console.log(err)
//         //        res.sendStatus(500); // Internal Server Error
//         //      } else {
//         //          console.log(result)
//         //        res.send(result); // OK
//         //      }
//         //    });
//         //  } catch (error) {
//         //    console.log("ALERT", error);
//         //  }
//        });

router.get("/access", (req, res) => {
  res.status(200).json({ message: "Access staff  route successful" });
});

module.exports = router;
