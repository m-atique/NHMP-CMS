const express = require('express');
const router = express.Router();
const db = require('../dbconfig');
const jwt = require('jsonwebtoken') 
const bcrypt = require('bcryptjs');
const {verifyToken} = require("../spy/auth")



lmskey = process.env.KEY

router.post("/getAllTrainee", (req, res)=>{
const status = req.body.status
    const q = `SELECT tCnic, tname,tRank ,tBeltno,tcourse from trainees where status = '${status}' `

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
        const q = `SELECT  tname,tRank ,tBeltno,tcourse from trainees where tCnic =  status = '${id}'  `
    
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
 
router.patch("/updateProfile/:userId", (req, res) => {
    const data = req.body;
    const id = req.params.userId;
  
    // Start building the update query
    let update_Qry = `UPDATE test_trainees SET `;
  
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
  
    // Join all the update fields with commas and add to the query
    update_Qry += updateFields.join(', ');
  
    // Finalize the query with the WHERE clause
    update_Qry += ` WHERE tCnic = '${id}'`;
  
    try {
      console.log(update_Qry);
  
      db.query(update_Qry, (err, result) => {
        if (err) {
          console.error("<====⚠️ SQL ERROR ⚠️===>", err);
          return res.sendStatus(500); // Internal Server Error
        }
  
       console.log(result)

        if (result.rowsAffected > 0) {
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
  


module.exports = router





