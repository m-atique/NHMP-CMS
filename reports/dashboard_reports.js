const express = require('express');
const router = express.Router();


const db = require('../dbconfig');

router.get("/get", (req, res)=>{
    
    const q = `select count(tCourse) as total , tCourse from requestedAccounts group by tCourse`

    try {
        db.query(q,(err, result)=>{
            // console.log(result)
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