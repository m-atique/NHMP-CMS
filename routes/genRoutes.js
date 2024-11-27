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


router.post("/getLPR/", async(req, res)=>{
  const  cnic = req.body.traineeId
  const  table = req.body.tableName
  

  if (table == "All"){
   
    const l = `SELECT * from leave where traineeId = '${cnic}'   `
    const a = `SELECT * from absence where traineeId = '${cnic}'   `
     const r = `SELECT * from results where traineeId = '${cnic}'   `
      const p = `SELECT * from punishment where traineeId = '${cnic}'   `
      const o = `SELECT * from osd where traineeId = '${cnic}'   `
      const m = `SELECT * from medical where traineeId = '${cnic}'   `


   try {


    const leaves = await db.query(l)
    const absence = await db.query(a)
    const result = await db.query(r)
    const punishments = await db.query(p)
    const osd = await db.query(o)
    const medical = await db.query(m)


    res.send({
      leave:leaves.recordset,
      absence:absence.recordset,
      punishments:punishments.recordset,
      results:result.recordset,
      osd:osd.recordset,
      medical:medical.recordset
    })
   } catch (err) {
       console.log("query not working", err)
   }
  }
  else{

 
   const q = `SELECT * from ${table} where traineeId = '${cnic}'`

   try {
       db.query(q,(err, result)=>{
           if(result) { res.send({tableName:table,value:result.recordset})}
           else {
               console.log("eror",err)
           }
       })

   } catch (err) {
       console.log("query not working", err)
   }
}
})


router.post("/recordStatus/:id", (req, res)=>{
  const  id = req.params.id
  const status = req.body.status
  const table = req.body.table
  const q = `update ${table} set recStatus ='${status}' where id = '${id}' `
  


   try {
       db.query(q,(err, result)=>{
           if(result.rowsAffected>0) { res.send(`updated`)}
           else {
               console.log("errrrrrrrr",err)
           }
       })

   } catch (err) {
       console.log("query not working", err)
   }
})

router.post("/delRecord/:id", (req, res)=>{
 try {

    const  id = req.params.id
  const table = req.body.table

   const q = `delete from  ${table}  where id = '${id}' `

       db.query(q,(err, result)=>{
           if(result && result.rowsAffected>0) { res.send(`deleted`)}
           else {
               console.log("errrrrrrrr",err)
           }
       })

   } catch (err) {
       console.log("query not working", err)
   }
})


router.post("/getRecord/:id", (req, res)=>{
  try {
 
     const  id = req.params.id
     const table = req.body.table
 
    const q = `select * from  ${table}  where id = '${id}' `
 
        db.query(q,(err, result)=>{
            if(result ) { res.send(result.recordset)}
            else {
                console.log("errrrrrrrr",err)
            }
        })
 
    } catch (err) {
        console.log("query not working", err)
    }
 })
 


module.exports = router;
