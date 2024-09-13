const express = require('express');
const router = express.Router();

const db = require('../dbconfig');

router.post("/addResult", (req, res)=>{
    const data = req.body;
    console.log(data);
    

    const q = `INSERT INTO results( traineeId,status,obMarks,totalMarks,position,remarks,addedBy, addedDate,courseName)
VALUES
    (
        '${data.traineeId}', 
        '${data.status}',
        '${data.obMarks}',
        '${data.totalMarks}',
        '${data.position}',
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

//========================update punishment

router.post("/updateResult/:id", (req, res) => {
    const id = req.params.id
    const data = req.body;


    const q = `UPDATE results 
           SET 
               status = '${data.status}', 
               obMarks = '${data.obMarks}', 
               totalMarks = '${data.totalMarks}', 
               position = '${data.position}', 
               remarks = '${data.remarks}', 
               addedBy = '${data.addedBy}', 
               addedDate = '${data.addedDate}'
               
    WHERE 
        id = '${id}'`;

        console.log(q)
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