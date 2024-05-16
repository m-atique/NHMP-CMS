const express = require('express');
const router = express.Router();

const db = require('../dbconfig');

router.post("/addleave", (req, res)=>{
    const data = req.body;
    console.log(data);
    

    const q = `INSERT INTO leave( traineeID,startDate,endDate,days,reason,leaveType,remarks,approvedBy,addedBy, addedDate)
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
        '${data.addedDate}'
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



// router.post("/saveuser", (req, res)=>{
//     const data = req.body;
//     const q = `INSERT INTO login (name, password) values( ${data}, ${data} )`

//     try {
//         db.query(q,(err, result)=>{
//             if(result) { res.send(result.recordset)}
//             else {
//                 console.log("errrrrrrrr",err)
//             }
//         })

//     } catch (err) {
//         console.log("query not working", err)
//     }
// })

module.exports = router