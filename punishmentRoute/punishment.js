const express = require('express');
const router = express.Router();

const db = require('../dbconfig');

router.post("/addPunishment", (req, res)=>{
    const data = req.body;
    // console.log(data);
    

    const q = `INSERT INTO punishment( traineeID,punishment,days,reason,remarks, orderBy, addedBy, addedDate)
VALUES
    (
        '${data.traineeId}', 
        '${data.punishment}',
        '${data.days}',
        '${data.reason}',
        '${data.remarks}',
        '${data.orderBy}',
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