const express = require('express');
const router = express.Router();

const db = require('../dbconfig');

router.post("/TraineeRegisteration", (req, res)=>{
    const data = req.body;
    // console.log(data);
    

    const q = `INSERT INTO registeration( traineeId, tName, tFName, tCnic, tBg, tDob, tQualification,
    tDomicile, tPA, tCA, tContact, tEmgcontact, tRelation, tBeltno, tRank, tDL, tDLno, tDLissuedBy,
    tHeight, tMedical, tJoinService, tJoinNHMP, tArrivalCollege, tExp, tReligion, tPosting, remarks,
    addedBy,addedDate)
VALUES
    (
        '${data.traineeId}',
        '${data.tName}', 
        '${data.tFName}',
        '${data.tCnic}',
        '${data.tBg}',
        '${data.tDob}',
        '${data.tQualification}',
        '${data.tDomicile}',
        '${data.tPA}',
        '${data.tCA}',
        '${data.tContact}',
        '${data.tEmgcontact}',
        '${data.tRelation}',
        '${data.tBeltno}',
        '${data.tRank}',
        '${data.tDL}',
        '${data.tDLno}',
        '${data.tDLissuedBy}',
        '${data.tHeight}',
        '${data.tMedical}',
        '${data.tJoinService}',
        '${data.tJoinNHMP}',
        '${data.tArrivalCollege}',
        '${data.tExp}',
        '${data.tReligion}',
        '${data.tPosting}',
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


router.get("/getRegAccounts", (req, res)=>{
   // const data = req.body;
    
    

    const q = `SELECT * FROM registeration`

    try {
        db.query(q,(err, result)=>{
            console.log(result)
            if(result) {  res.send(result.recordset)
               
            }
            else {
                console.log("data not inserted",err)
            }
        })

    } catch (err) {
        console.log("query not working", err)
    }
})


module.exports = router