const express = require('express');
const router = express.Router();

const db = require('../dbconfig');

router.post("/TraineeRegisteration", (req, res)=>{
    const data = req.body;
    // console.log(data);
    

    const q = `INSERT INTO registeration(
        id,
        traineeId,
        tName,
        tFName,
        maritalState,
        gender,
        pwd,
        email,
        tCnic,
        tBg,
        tDob,
        tQualification,
        degreeName,
        institute,
        province,
        tDomicile,
        localPs,
        tPA,
        tCA,
        tContact,
        tEmgcontact,
        tRelation,
        emgpesrson,
        tRank,
        tPic,
        tCourse,
        tBeltno,
        tDL,
        tDLno,
        tDLissuedBy,
        tMedical,
        tHeight,
        tJoinService,
        tJoinNHMP,
        tArrivalCollege,
        tExp,
        tReligion,
        tPosting,
        remarks,
        addedBy,
        addedDate,
        status,
        employment,
        deparment,
        deputation,
        induction)
VALUES
    (   '${data.id}',
        '${data.traineeId}',
        '${data.tName}',
        '${data.tFName}',
        '${data.maritalState}',
        '${data.gender}',
        '${data.pwd}',
        '${data.email}',
        '${data.tCnic}',
        '${data.tBg}',
        '${data.tDob}',
        '${data.tQualification}',
        '${data.degreeName}',
        '${data.institute}',
        '${data.province}',
        '${data.tDomicile}',
        '${data.localPs}',
        '${data.tPA}',
        '${data.tCA}',
        '${data.tContact}',
        '${data.tEmgcontact}',
        '${data.tRelation}',
        '${data.emgpesrson}',
        '${data.tRank}',
        '${data.tPic}',
        '${data.tCourse}',
        '${data.tBeltno}',
        '${data.tDL}',
        '${data.tDLno}',
        '${data.tDLissuedBy}',
        '${data.tMedical}',
        '${data.tHeight}',
        '${data.tJoinService}',
        '${data.tJoinNHMP}',
        '${data.tArrivalCollege}',
        '${data.tExp}',
        '${data.tReligion}',
        '${data.tPosting}',
        '${data.remarks}',
        '${data.addedBy}',
        '${data.addedDate}',
        '${data.status}',
        '${data.employment}',
        '${data.deparment}',
        '${data.deputation}',
        '${data.induction}')`

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



