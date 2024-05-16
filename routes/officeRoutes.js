const express = require("express");
const db = require('../dbconfig');
const router = express.Router();


lmskey = process.env.KEY

router.post("/getOfficeId",  (req, res) => {
    const data = req.body;
   
  
const qry = `select officeId from offices where 
officeType ='${data.officeType}' and 
region = '${data.region}' and
zone = '${data.zone}' and
sector = '${data.sector}' and
beat = '${data.beat}'`;

try{
    db.query(qry,(err, result) => {
      if (err) {
        res.sendStatus(500); // Internal Server Error
      } else {
        res.send(result.recordset[0])// OK
      }
    });
  } catch (error) {
    console.log("ALERT",error) 
   }
  });


  //------------------get all office 

  router.get("/getOffices",  (req, res) => {
    const data = req.body;
   
  
const qry = `select * from offices`

try{
    db.query(qry,(err, result) => {
      if (err) {
        res.sendStatus(500); // Internal Server Error
      } else {
        res.send(result.recordset)// OK
      }
    });
  } catch (error) {
    console.log("ALERT",error) 
   }
  });









  module.exports = router;