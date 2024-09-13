const express = require('express');
const router = express.Router();
const db = require('../dbconfig');
const jwt = require('jsonwebtoken') 
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



//==========================  get trainees by course
router.post("/getTraineesByCourse", (req, res)=>{
    const status = req.body.status
    const course = req.body.course
        const q = `SELECT tCnic, tname,tRank ,tBeltno ,tHeight from trainees where status = '${status}' and tcourse =  '${course}' `
    
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
    


module.exports = router


