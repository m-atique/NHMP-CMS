const express = require('express');
const router = express.Router();

const db = require('../dbconfig');

router.post("/addCourse", (req, res)=>{
    const data = req.body;
    console.log(data);
    

    const q = `INSERT INTO course( courseName,startDate,endDate, totalTrainees, arrivalDate, status, remarks,addedBy, addedDate)
VALUES
    (
        '${data.courseName}', 
        '${data.startDate}',
        '${data.endDate}',
        '${data.nominatedTrainee}',
        '${data.arrivalDate}',
        '${data.courseStatus}',
        '${data.remarks}',
        '${data.addedBy}',
        '${data.addeddate}'
    )`

    try {
        console.log(q)
        db.query(q,(err, result)=>{
            if(result) { res.send(result.recordset)}
            else {
                console.log("data not inserted",err)
            }
        })

    } catch (err) {
        console.log("query not working", err)
    }
})

module.exports = router