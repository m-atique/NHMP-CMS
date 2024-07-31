const express = require("express");
const db = require('../dbconfig');
const router = express.Router();

lmskey = process.env.KEY

router.post("/saveShedule", (req, res) => {
  const data = req.body;
   
  
  const insertquery  = `INSERT INTO shedules (  
   title,pdf
   )
VALUES
(   
    '${data.title}',
    '${data.pdf}',
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
  router.patch("/updateShedule/:id",  (req, res) => {
    const data = req.body;
    const id =  req.params.id

    const update_Qry = `UPDATE shedules set 
    title ='${data.title}',
    pdf ='${data.pdf}'
    where id =  '${id}'`;

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


  module.exports = router;