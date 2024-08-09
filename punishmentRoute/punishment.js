const express = require('express');
const router = express.Router();

const db = require('../dbconfig');

router.post("/addPunishment", (req, res)=>{
    const data = req.body;
    // console.log(data);
    

    const q = `INSERT INTO punishment( traineeID,punishment,days,reason,remarks, orderBy, addedBy, addedDate,courseName)
VALUES
    (
        '${data.traineeId}', 
        '${data.punishment}',
        '${data.days}',
        '${data.reason}',
        '${data.remarks}',
        '${data.orderBy}',
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

router.post("/updatePunishment/:id", (req, res) => {
    const id = req.params.id
    const data = req.body;


    const q = `UPDATE punishment 
    SET 
        punishment = '${data.punishment}', 
        days = '${data.days}', 
        reason = '${data.reason}', 
        remarks = '${data.remarks}', 
        orderBy = '${data.orderBy}', 
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