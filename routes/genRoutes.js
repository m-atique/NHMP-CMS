const express = require("express");
const db = require('../dbconfig');
const router = express.Router();



lmskey = process.env.KEY;

////=================role
router.post("/getRoleId", (req, res) => {
  const data = req.body;

  const qry = `select id from roles where 
    roleType ='${data.type}'`;

  try {
    db.query(qry, (err, result) => {
      if (err) {
        res.sendStatus(500); // Internal Server Error
      } else {
        res.send(result.recordset[0]); // OK
      }


    });
  } catch (error) {
    console.log("ALERT", error);
  }
});

////===================================================================  ranks
router.get("/getRanks", (req, res) => {


  const qry = `SELECT * from ranks where type = 'uniform' and bps <17`;

  try {
    db.query(qry, (err, result) => {
      if (err) {
        res.sendStatus(500); // Internal Server Error
      } else {
        res.send(result.recordset); // OK
      }
    });
  } catch (error) {
    console.log("ALERT", error);
  }
});





//--------------------------------province and district 

router.get("/getpd", (req, res) => {


  const qry = `SELECT * from prv_dist`;

  try {
    db.query(qry, (err, result) => {
      if (err) {
        res.sendStatus(500); // Internal Server Error
      } else {
        res.send(result.recordset); // OK
      }
    });
  } catch (error) {
    console.log("ALERT", error);
  }
});

router.get("/getCourse", (req, res) => {


  const qry = `SELECT * from course where status = 'current'`;

  try {
    db.query(qry, (err, result) => {
      if (err) {
        res.sendStatus(500); // Internal Server Error
      } else {
        res.send(result.recordset); // OK
      }
    });
  } catch (error) {
    console.log("ALERT", error);
  }
});

router.get("/get_max_id/:table/:fld", (req, res) => {


  const qry = `select MAX(${req.params.fld}) AS maxId  from ${req.params.table}`;

  try {
    db.query(qry, (err, result) => {
      if (err) {
        res.sendStatus(500); // Internal Server Error
      } else {
        res.send(result.recordset[0]); // OK
      }
    });
  } catch (error) {
    console.log("ALERT", error);
  }
});


router.post("/getLPR/", (req, res)=>{
  const  cnic = req.body.traineeId
  const  table = req.body.tableName
  
   const q = `SELECT * from ${table} where traineeId = '${cnic}' `

   try {
       db.query(q,(err, result)=>{
           if(result) { res.send(result.recordset)}
           else {
               console.log("errrrrrrrr",err)
           }
       })

   } catch (err) {
       console.log("query not working", err)
   }
})


module.exports = router;
