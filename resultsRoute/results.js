const express = require('express');
const router = express.Router();

const db = require('../dbconfig');

router.post("/addResult", (req, res)=>{
    const data = req.body;
    console.log(data);
    

    const q = `INSERT INTO results( traineeId,status,obMarks,totalMarks,position,remarks,addedBy, addedDate)
VALUES
    (
        '${data.traineeId}', 
        '${data.status}',
        '${data.obMarks}',
        '${data.totalMarks}',
        '${data.position}',
        '${data.remarks}',
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