const express = require('express');
const router = express.Router();
const db = require('../dbconfig');
const jwt = require('jsonwebtoken') 
const bcrypt = require('bcryptjs');
const {verifyToken} = require("../spy/auth")
const apiKeyAuth = require('../middlewares/apikey');
const multer = require("multer");
const fs = require("fs");
const path = require("path");


lmskey = process.env.KEY
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../trainee_photos");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const cnic = req.params.tCnic?.replace(/-/g, "");
    if (!cnic) return cb(new Error("CNIC is required in URL parameter"));

    const ext = path.extname(file.originalname);
    const filePath = path.join(__dirname, "../trainee_photos", `${cnic}${ext}`);

    // Remove old file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    cb(null, `${cnic}${ext}`);
  },
});

const upload = multer({ storage });


// ===== Standalone API: Upload/Replace Profile Picture =====
// Example: PATCH /uploadPhoto/3520212345671
router.patch("/uploadPhoto/:tCnic", upload.single("photo"), async (req, res) => {
    try {
        const cnic = req.params.tCnic;
        const file = req.file;
        console.log("Uploaded file info:",cnic);


    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileName = file.filename;

    // Update only the tPic field in trainees table
    const updateQry = `UPDATE trainees SET tPic = '${fileName}' WHERE tCnic = '${cnic}'`;

    db.query(updateQry, (err, result) => {
      if (err) {
        console.error("<===⚠️ SQL ERROR ⚠️===>", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.rowsAffected > 0) {
        res.status(200).json({
          message: "Profile picture updated successfully",
          fileName,
        });
      } else {
        res.status(404).json({ message: "⚠️ Trainee not found" });
      }
    });
  } catch (error) {
    console.error("<===⚠️ ERROR ⚠️===>", error);
    res.status(500).json({ message: "Internal server error" });
  }
});




router.get("/photo/:tCnic", (req, res) => {
  const cnic = req.params.tCnic.replace(/-/g, ""); // remove dashes if any
  const photoDir = path.join(__dirname, "../trainee_photos");

  // Try both .jpg and .jpeg (optional)
  const possibleFiles = [
    path.join(photoDir, `${cnic}.jpg`),
    path.join(photoDir, `${cnic}.jpeg`),
    path.join(photoDir, `${cnic}.png`)
  ];

  const existingFile = possibleFiles.find((file) => fs.existsSync(file));

  if (!existingFile) {
    return res.status(404).json({ message: "Photo not found" });
  }

  res.sendFile(existingFile);
});

//---------------------------------------------------previous code 

router.post("/getAllTrainee", (req, res)=>{
const status = req.body.status
    const q = `SELECT traineeId, t.tCnic, t.tname,t.tRank ,t.tBeltno,t.tcourse,tcourseId from trainees as t INNER JOIN COURSE AS CR ON t.tcourseId = cr.id where t.status = '${status}'  and cr.status = 'current' order by t.tCourse`


    try {
        db.query(q,(err, result)=>{
            if(result) { res.send(result.recordset)}
            else {
                console.log("errrrrrrrr",err)
            }
        })

    } catch (err) {
        console.log("query not working", err)
    }
})

//============================get trainee detail 
router.post("/getTraineeDetail", (req, res)=>{
    const id = req.body.id
        const q = `SELECT  tname,tRank ,tBeltno,tcourse from trainees where tCnic  = '${id}'  `
    
        try {
            db.query(q,(err, result)=>{
                if(result) { res.send(result.recordset)}
                else {
                    console.log("errrrrrrrr",err)
                }
            })
    
        } catch (err) {
            console.log("query not working", err)
        }
    })

//==========================  get trainees by course
router.post("/getTraineesByCourse", (req, res)=>{
    const status = req.body.status
    const course = req.body.course
        const q = `SELECT traineeId,tCnic, tname,tRank ,tBeltno ,tHeight from trainees where status = '${status}' and tcourse =  '${course}' `
    
        try {
            db.query(q,(err, result)=>{
                if(result) { res.send(result.recordset)}
                else {
                    console.log("errrrrrrrr",err)
                }
            })
    
        } catch (err) {
            console.log("query not working", err)
        }
    })
//\\================================================


router.post("/getCourseStats", (req, res)=>{
    const data = req.body
        const q = `SELECT 
    courseName,
    SUM(leave_days) AS total_leave_days,
    COUNT(punishment_id) AS total_punishments,
    SUM(absence_days) AS total_absence_days
FROM (
    SELECT 
        courseName, 
        SUM(days) AS leave_days, 
        NULL AS punishment_id, 
        NULL AS absence_days
    FROM leave
    WHERE traineeID = '${data.traineeId}' 
    GROUP BY courseName

    UNION ALL

    SELECT 
        courseName, 
        NULL AS leave_days, 
        COUNT(*) AS punishment_id, 
        NULL AS absence_days
    FROM punishment
    WHERE traineeID = '${data.traineeId}' 
    GROUP BY courseName

    UNION ALL

    SELECT 
        courseName, 
        NULL AS leave_days, 
        NULL AS punishment_id, 
        SUM(days) AS absence_days
    FROM absence
    WHERE traineeID = '${data.traineeId}'
    GROUP BY courseName
) AS combined_data
GROUP BY courseName;
`
    
        try {
            db.query(q,(err, result)=>{
                if(result) { res.send(result.recordset)}
                else {
                    console.log("errrrrrrrr",err)
                }
            })
    
        } catch (err) {
            console.log("query not working", err)
        }
    })
//------------------------------------
router.post("/getWeightbyId", (req, res)=>{
    const data = req.body
        const q = `
    SELECT  LEFT(DATENAME(month, date), 3) + '-' + RIGHT('0' + CAST(DAY(date) AS VARCHAR(2)), 2)  AS month,CONCAT_WS('.', kgs, grams) as weight from trainee_weight where traineeid ='${data.traineeId}'
`
    
        try {
            db.query(q,(err, result)=>{
                if(result) { res.send(result.recordset)}
                else {
                    console.log("errrrrrrrr",err)
                }
            })
    
        } catch (err) {
            console.log("query not working", err)
        }
    })
//\\\\\====================================
router.post('/register',async(req,res)=>{
    const data = req.body

    const salt = await bcrypt.genSalt(10); // Generate salt (10 rounds is a good default)
  const hashedPassword = await bcrypt.hash(data.pwd,salt); // Hash the password

 
    const q = `insert into trainees (tCnic,tCourseId,tcourse,pwd ) 
    values
     ( '${data.cnic}',
        '${data.courseid}',
         '${data.course}',
        '${hashedPassword}'
        )`
    
        try {
            db.query(q, (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                return res.status(201).json({ message: 'Trainee registered successfully', traineeId: result.insertId });
            });
        } catch (error) {
            console.error('Query execution error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
})


//======================================profile Update 
 
//======================================profile Update 
 
router.patch("/updateProfile/:userId", (req, res) => {
    const data = req.body;
    const id = req.params.userId;
  
    console.log("xxx------",data.id)
    // Start building the update query
    let update_Qry = `UPDATE trainees SET `;
  
    // Store the fields that are present in req.body
    let updateFields = [];
  
    if (data.traineeId) updateFields.push(`traineeId = '${data.traineeId}'`);
    if (data.tName) updateFields.push(`tName = '${data.tName}'`);
    if (data.tFName) updateFields.push(`tFName = '${data.tFName}'`);
    if (data.maritalState) updateFields.push(`maritalState = '${data.maritalState}'`);
    if (data.gender) updateFields.push(`gender = '${data.gender}'`);
    if (data.pwd) updateFields.push(`pwd = '${data.pwd}'`);
    if (data.email) updateFields.push(`email = '${data.email}'`);
    if (data.tCnic) updateFields.push(`tCnic = '${data.tCnic}'`);
    if (data.tBg) updateFields.push(`tBg = '${data.tBg}'`);
    if (data.tDob) updateFields.push(`tDob = '${data.tDob}'`);
    if (data.tQualification) updateFields.push(`tQualification = '${data.tQualification}'`);
    if (data.degreeName) updateFields.push(`degreeName = '${data.degreeName}'`);
    if (data.institute) updateFields.push(`institute = '${data.institute}'`);
    if (data.province) updateFields.push(`province = '${data.province}'`);
    if (data.tDomicile) updateFields.push(`tDomicile = '${data.tDomicile}'`);
    if (data.localPs) updateFields.push(`localPs = '${data.localPs}'`);
    if (data.tPA) updateFields.push(`tPA = '${data.tPA}'`);
    if (data.tCA) updateFields.push(`tCA = '${data.tCA}'`);
    if (data.tContact) updateFields.push(`tContact = '${data.tContact}'`);
    if (data.tEmgcontact) updateFields.push(`tEmgcontact = '${data.tEmgcontact}'`);
    if (data.tRelation) updateFields.push(`tRelation = '${data.tRelation}'`);
    if (data.emgpesrson) updateFields.push(`emgpesrson = '${data.emgpesrson}'`);
    if (data.tRank) updateFields.push(`tRank = '${data.tRank}'`);
    if (data.tPic) updateFields.push(`tPic = '${data.tPic}'`);
    if (data.tCourseId) updateFields.push(`tCourseId = '${data.tCourseId}'`);
    if (data.tCourse) updateFields.push(`tCourse = '${data.tCourse}'`);
    if (data.tBeltno) updateFields.push(`tBeltno = '${data.tBeltno}'`);
    if (data.tDL) updateFields.push(`tDL = '${data.tDL}'`);
    if (data.tDLno) updateFields.push(`tDLno = '${data.tDLno}'`);
    if (data.tDLissuedBy) updateFields.push(`tDLissuedBy = '${data.tDLissuedBy}'`);
    if (data.tMedical) updateFields.push(`tMedical = '${data.tMedical}'`);
    if (data.tHeight) updateFields.push(`tHeight = '${data.tHeight}'`);
    if (data.tJoinService) updateFields.push(`tJoinService = '${data.tJoinService}'`);
    if (data.tJoinNHMP) updateFields.push(`tJoinNHMP = '${data.tJoinNHMP}'`);
    if (data.tArrivalCollege) updateFields.push(`tArrivalCollege = '${data.tArrivalCollege}'`);
    if (data.tExp) updateFields.push(`tExp = '${data.tExp}'`);
    if (data.tReligion) updateFields.push(`tReligion = '${data.tReligion}'`);
    if (data.tPosting) updateFields.push(`tPosting = '${data.tPosting}'`);
    if (data.remarks) updateFields.push(`remarks = '${data.remarks}'`);
    if (data.addedBy) updateFields.push(`addedBy = '${data.addedBy}'`);
    if (data.addedDate) updateFields.push(`addedDate = '${data.addedDate}'`);
    if (data.status) updateFields.push(`status = '${data.status}'`);
    if (data.employment) updateFields.push(`employment = '${data.employment}'`);
    if (data.deparment) updateFields.push(`deparment = '${data.deparment}'`);
    if (data.deputation) updateFields.push(`deputation = '${data.deputation}'`);
    if (data.induction) updateFields.push(`induction = '${data.induction}'`);
    
    if (data.fb) updateFields.push(`fb = '${data.fb}'`);
    if (data.twiter) updateFields.push(`twiter = '${data.twiter}'`);
    if (data.linkendIn) updateFields.push(`linkendIn = '${data.linkendIn}'`);
    if (data.insta) updateFields.push(`insta = '${data.insta}'`);
    if (data.bps) updateFields.push(`bps = '${data.bps}'`);
    if (data.sport) updateFields.push(`sport = '${data.sport}'`);
    if (data.message) updateFields.push(`message = '${data.message}'`);
    // Join all the update fields with commas and add to the query
    update_Qry += updateFields.join(', ');
  
    // Finalize the query with the WHERE clause
    update_Qry += ` WHERE tCnic = '${id}'`;
 
    try {
      
  
      db.query(update_Qry, (err, result) => {
        if (err) {
          console.error("<====⚠️ SQL ERROR ⚠️===>", err);
          return res.sendStatus(500); // Internal Server Error
        }
  
       console.log(result)

        if (result.rowsAffected.includes(1)) {
          res.sendStatus(200); // OK
        } else {
          res.status(404).send(`⚠️ Request not found`); // Not Found
        }
      });
    } catch (error) {
      console.error("<====⚠️ ERROR ⚠️===>", error);
      res.sendStatus(500); // Internal Server Error
    }
  });
  
  

  router.post("/attendenceStatus", apiKeyAuth,async (req, res) => {

    const {date} = req.body
  try {
   

    const result = await db
     
      .query(`
       DECLARE @givenDate DATE = '${date}'; 

SELECT
    t.traineeId,
    CASE
		WHEN a.traineeId IS NOT NULL THEN 'Absent'
        WHEN l.traineeId IS NOT NULL THEN l.leaveType
        WHEN m.traineeId IS NOT NULL THEN 'Medical'
        WHEN o.traineeId IS NOT NULL THEN 'Outdoor'
        WHEN os.traineeId IS NOT NULL THEN 'OSD'
    END AS Status
FROM trainees t

INNER JOIN course c 
    ON t.tCourseId = c.id
LEFT JOIN absence as a
    ON t.tCnic = a.traineeId 
   AND @givenDate BETWEEN CAST(a.startDate AS DATE) AND CAST(a.endDate AS DATE)
LEFT JOIN leave l 
    ON t.tCnic = l.traineeId 
   AND @givenDate BETWEEN CAST(l.startDate AS DATE) AND CAST(l.endDate AS DATE)
LEFT JOIN medical m 
    ON t.tCnic = m.traineeId 
   AND @givenDate BETWEEN CAST(m.startDate AS DATE) AND CAST(m.endDate AS DATE)
LEFT JOIN outdoor o 
    ON t.tCnic = o.traineeId 
   AND CAST(o.date AS DATE) = @givenDate
   LEFT JOIN osd as os
    ON t.tCnic = os.traineeId 
   AND @givenDate BETWEEN CAST(os.startDate AS DATE) AND CAST(os.endDate AS DATE)
WHERE c.status = 'current'
  AND (
		a.traineeId IS NOT NULL
     OR l.traineeId IS NOT NULL 
     OR m.traineeId IS NOT NULL 
     OR o.traineeId IS NOT NULL
	 OR os.traineeId IS NOT NULL
      );

      `);

    res.json( result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error Getting details by two dates" });
  }
});

router.post("/StatusReport", apiKeyAuth,async (req, res) => {
    const {startDate, endDate} = req.body
  try {
  // console.log(startDate, endDate);

    const result = await db.query(`DECLARE @startDate DATE = '${startDate}';
DECLARE @endDate DATE = '${endDate}'




SELECT 
    t.traineeId,
    t.tName,
    t.tRank,
    t.tBeltNo,
    t.tCourseId,
	c.courseName,
    'OSD' AS Status,
    o.startDate ,
	o.endDate
FROM osd AS o
INNER JOIN trainees AS t ON t.tCnic = o.traineeId
INNER JOIN course AS c ON c.id = t.tCourseId
WHERE o.startDate <= @startDate AND o.endDate >= @endDate and c.status ='current'

UNION ALL

SELECT 
    t.traineeId,
    t.tName,
    t.tRank,
    t.tBeltNo,
    t.tCourseId,
    c.courseName,
    'Absent' AS Status,
    a.startDate ,
	a.endDate
FROM absence AS a
INNER JOIN trainees AS t ON t.tCnic = a.traineeId
INNER JOIN course AS c ON c.id = t.tCourseId
WHERE a.startDate <= @startDate AND a.endDate >= @endDate and c.status ='current'

UNION ALL

SELECT 
    t.traineeId,
    t.tName,
    t.tRank,
    t.tBeltNo,
    t.tCourseId,
	c.courseName,
    'Leave' AS Status,
    l.startDate ,
	l.endDate
FROM leave AS l
INNER JOIN trainees AS t ON t.tCnic = l.traineeId
INNER JOIN course AS c ON c.id = t.tCourseId
WHERE l. startDate <= @endDate AND l.endDate >= @endDate  and c.status ='current'


UNION ALL

SELECT 
    t.traineeId,
    t.tName,
    t.tRank,
    t.tBeltNo,
    t.tcourseId,
	c.courseName,
    'Medical' AS Status,
    m.startDate ,
	m.endDate
FROM medical AS m
INNER JOIN trainees AS t ON t.tCnic = m.traineeId
INNER JOIN course AS c ON c.id = t.tCourseId
WHERE m.startDate <= @startDate AND m.endDate >= @endDate and c.status ='current'


UNION ALL

SELECT 
    t.traineeId,
    t.tName,
    t.tRank,
    t.tBeltNo,
    t.tcourseId,
	c.courseName,
    'Outdoor' AS Status,
    o.date as startDate,
	o.date as endDate
FROM outdoor AS o
INNER JOIN trainees AS t ON t.tCnic = o.traineeId
INNER JOIN course AS c ON c.id = t.tCourseId
WHERE o.date BETWEEN @startDate AND @endDate and c.status ='current'

ORDER BY  t.tCourseId;

`);



    res.json( Object.groupBy(result.recordset,(item)=>item.Status
));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error getting trainee attendance status" });
  }
});

router.delete("/:cnic", apiKeyAuth,async (req, res) => {
    const {cnic} = req.params.cnic
  try {
   
console.log(`DELETE FROM trainees WHERE tCnic = '${req.params.cnic}'`)
    const result = await db.query(`DELETE FROM trainees WHERE tCnic = '${req.params.cnic}';
`);



    res.json( result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error getting trainee attendance status" });
  }
});

router.post("/getTraineeById", (req, res)=>{
    const id = req.body.id
    const q = `select t.*,o.* from trainees t left join offices o on t.tPosting = o.officeId where tCnic =   '${id}'  `

    try {
        db.query(q,(err, result)=>{
            if(result) { res.send(result.recordset)}
            else {
                console.log("errrrrrrrr",err)
            }
        })

    } catch (err) {
        console.log("query not working", err)
    }
})
module.exports = router





