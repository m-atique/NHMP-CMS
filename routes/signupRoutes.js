const express = require("express");
const db = require('../dbconfig');
const router = express.Router();

lmskey = process.env.KEY

router.post("/saveRequest", (req, res) => {
  const data = req.body;
   
  
  const insertquery  = `INSERT INTO requestedAccounts (  tName,
     tFName, tCnic, tBg, tDob, tQualification,
    tDomicile, tPA, tCA, tContact,tCourse, tEmgcontact,
     tRelation, tBeltno, tRank, tDL, tDLno, tDLissuedBy,
    tHeight, 
     tJoinService,
      tJoinNHMP,
       tArrivalCollege, tExp, tReligion, tPosting,addedDate,status)
VALUES
    (
       
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
        '${data.tCourse}',
        '${data.tEmgcontact}',
        '${data.tRelation}',
        '${data.tBeltno}',
        '${data.tRank}',
        '${data.tDL}',
        '${data.tDLno}',
        '${data.tDLissuedBy}',
        '${data.tHeight}',
        '${data.tJoinService}',
        '${data.tJoinNHMP}',
        '${data.tArrivalCollege}',
        '${data.tExp}',
        '${data.tReligion}',
        '${data.tPosting}',
        '${data.addedDate}',
        '${data.status}'

        )`
  
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

    const update_Qry = `UPDATE requestedAccounts set 
    status ='${data.status}'
    where id =  '${id}'`;

try{
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

  //==========================================GETTING SIGN UP  REQUEST 
    router.get('/accountReq',(req,res)=>{
     
    
        const qry = `select req.*,ofc.region,ofc.zone,ofc.sector,ofc.beat from requestedAccounts as req
        inner join
        offices as ofc 
        on req.tposting = ofc.officeId where req.status = 'Approval Pending' order by tCourse `;

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