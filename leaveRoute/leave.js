const express = require('express');
const router = express.Router();

const db = require('../dbconfig');

router.post("/addleave", (req, res)=>{
    const data = req.body;
    console.log(data);
    

    const q = `INSERT INTO leave( traineeID,startDate,endDate,days,reason,leaveType,remarks,approvedBy,addedBy, addedDate,courseName)
VALUES
    (
        '${data.traineeId}', 
        '${data.startDate}',
        '${data.endDate}',
        '${data.days}',
        '${data.reason}',
        '${data.leaveType}',
        '${data.remarks}',
        '${data.approvedBy}',
        '${data.addedBy}',
        '${data.addedDate}',
        '${data.courseName}'
        )`

    try {
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


//========================update leave

router.post("/updateLeave/:id", (req, res) => {
    const id = req.params.id
    const data = req.body;
    console.log(data);

    const q = `UPDATE leave 
               SET 
                   startDate = '${data.startDate}', 
                   endDate = '${data.endDate}', 
                   days = '${data.days}', 
                   reason = '${data.reason}', 
                   leaveType = '${data.leaveType}', 
                   remarks = '${data.remarks}', 
                   approvedBy = '${data.approvedBy}', 
                   addedBy = '${data.addedBy}', 
                   addedDate = '${data.addedDate}', 
                   courseName = '${data.courseName}'
               WHERE 
                   id = '${id}'`;

    try {
        db.query(q, (err, result) => {
            if (result.rowsAffected>0) {
                res.send('Updated');
            } else {
                console.log("Data not updated", err);
            }
        });
    } catch (err) {
        console.log("Query not working", err);
    }
});

//====================================================
router.get("/getTraineeLeave/:cnic", (req, res)=>{
   const  cnic = req.params.cnic
    const q = `SELECT * from leave where traineeId = '${cnic}' and recStatus= 'saved' `

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