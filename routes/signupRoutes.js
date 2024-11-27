const express = require("express");
const db = require('../dbconfig');
const router = express.Router();

lmskey = process.env.KEY

router.post("/saveRequest", (req, res) => {
  const data = req.body;
   
  
  const insertquery  = `INSERT INTO requestedAccounts (  
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
(   
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
  

console.log(insertquery)

  try{
      db.query(insertquery,(err, result) => {
        if (err) {
          console.log(err)
          res.sendStatus(500); // Internal Server Error
        } else {
          res.sendStatus(200)// OK
        }
      });
    } catch (error) {
      console.log("ALERT",error) 
     }
    });


  //==========================================UPDATE 
  router.patch("/updateSignup/:userId",  (req, res) => {
    const data = req.body;
    const id =  req.params.userId
    let update_Qry
    if(data.tablename=='requestedAccounts'){
      update_Qry = `UPDATE requestedAccounts set 
      traineeId = '${data.traineeId}' ,
      status ='${data.status}'
      where tCnic =  '${id}'`;
    }
    if(data.tablename=='trainees'){
      update_Qry = `UPDATE trainees set 
      traineeId = '${data.traineeId}' , 
      status ='${data.status}'
      where tCnic =  '${id}'`;
    }

try{
  console.log(update_Qry)
    db.query(update_Qry,(err, result) => {
      if (err) {
        res.sendStatus(500); // Internal Server Error
      } else {

       if(result.rowsAffected[0] >0){
         res.sendStatus(200)// OK
       }else{
        res.send(`⚠️Request not found`);
       }
      }
    });
  } catch (error) {
    console.log("<====⚠️ERROR⚠️===>",error) 
   }
  });


  //====================================== updat eprofile 
  

  //==========================================GETTING SIGN UP  REQUEST 
    router.get('/accountReq',(req,res)=>{
     
    
    //     const qry = `select  'requestedAccounts' AS table_name,  req.*,ofc.region,ofc.zone,ofc.sector,ofc.beat from requestedAccounts as req
    //     inner join
    //     offices as ofc 
    //     on req.tposting = ofc.officeId where req.status = 'Approval Pending'

		// UNION ALL

		// select  'trainees' AS table_name,  t.*,ofc.region,ofc.zone,ofc.sector,ofc.beat from trainees as t
    //     inner join
    //     offices as ofc 
    //     on t.tposting = ofc.officeId where t.status = 'Approval Pending' order by tCourse `;



    const qry = `select  'requestedAccounts' AS table_name,  req.* from requestedAccounts as req
    where req.status = 'Approval Pending'

UNION ALL

select  'trainees' AS table_name,  t.* from trainees as t
     where t.status = 'Approval Pending' order by tCourse `;

        try{
          db.query(qry,(err, result) => {
            if (err) {
              res.sendStatus(500); // Internal Server Error
            } else {
              if(result){
                res.send(result.recordset)
              }else{
                res.send("No Record Found")
              }
            }
          });
        } catch (error) {
          console.log("ALERT------->>>",error) 
         }
    
    })
  
  //======================================get accounts request sectorwise 




   
module.exports = router;