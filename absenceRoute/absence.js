const express = require('express');
const router = express.Router();

const db = require('../dbconfig');

router.post("/addAbsence", (req, res)=>{
    const data = req.body;
    console.log(data);
    

    const q = `INSERT INTO absence( traineeID,startDate,endDate,days,reason,remarks,addedBy, addedDate,courseName)
VALUES
    (
        '${data.traineeId}', 
        '${data.startDate}',
        '${data.endDate}',
        '${data.days}',
        '${data.reason}',
        '${data.remarks}',
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



// router.get("/getAbsence", (req, res)=>{
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