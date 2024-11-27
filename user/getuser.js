const express = require('express');
const router = express.Router();
const db = require('../dbconfig');
const jwt = require('jsonwebtoken') 
const {verifyToken} = require("../spy/auth")


lmskey = process.env.KEY

router.get("/getuser/:id", (req, res)=>{
    const userid = req.params.id
    const q = `SELECT * from trainees where tCnic = '${userid}'`

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



router.get("/getStaffuser/:id", (req, res)=>{
  const userid = req.params.id
  const q = `SELECT * from users where userId = '${userid}'`

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

router.get("/getTrainee/:cnic", (req, res)=>{
  const cnic = req.params.cnic
  const q = `SELECT * from requestedAccounts where tCnic = '${cnic}'`

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



router.post('/login',(req,res)=>{

 
  const {api_key} =req.headers
  const userId = req.body.id
  const pwd  = req.body.pwd

   
if( api_key !=lmskey){
  res.send("Invalid api key")
}else{

  // const getTrainee = `select u.id ,t.tCnic,u.pwd,u.role,t.tName,t.tCourse,t.tRank from users as u inner join trainees as t on u.userId = t.tCnic  where userId= ${userId}`;
  const getTrainee = `select tCnic, tName,tCourse,tRank , message from  trainees   where tCnic= ${userId}`;


  const getuserById = `select id, pwd,role from users  where userId= '${userId}'`;

  try{
      db.query(getuserById ,(err, result) => {
        if (err) {
          console.log(err);
          res.sendStatus(500) //Internal Server Error
        } else {
          if (result){
       
            const data = result.recordset[0]
            
            if (data){
              if (pwd == data.pwd){

                if(data.role == 'drill' || data.role == 'hrm' ){
                  const user = {
                    id:data.id,
                    // name: data.tName,
                    role:data.role
                    // rank:data.tRank,
                    // course:data.tCourse,
                    // cnic:data.tCnic
                  }  
                  
                 
                const token = jwt.sign({user},api_key,{expiresIn:'8h'})
                res.json({token})
                }
                else if(data.role == 'user') {


                  db.query(getTrainee ,(err, result) => {
                    if (err) {
                      console.log(err);
                      res.sendStatus(500) //Internal Server Error
                    } else {
                      if (result){
                   
                        const data2 = result.recordset[0]

                        
                        const user = {
                          id:data.id,
                          name: data2.tName,
                          role:data.role,
                          rank:data2.tRank,
                          course:data2.tCourse,
                          cnic:data2.tCnic,
                          message:data2.message
                        }  
     
                      
                      const token = jwt.sign({user},api_key,{expiresIn:'8h'})
                      res.json({token})
 }}})

                }
          
          }
          else{
            res.send("Incorrect Password")
          }
        }
        else{
          res.send("No User Found")
        }
      } 
  
        }
      });
    } catch (error) {
      console.log("ALERT",error) 
     }
   
}
})



router.post('/updatePwd',(req,res)=>{

 
  const {api_key} =req.headers
  const userId = req.body.cnic
  const pwd  = req.body.pwd
  const dob  = req.body.dob
   
if( api_key !=lmskey){
  res.send("Invalid api key")
}
else{
  const getuserById = `select tDob from trainees  where tCnic= ${userId}`;
  const update_pwd  = `update users set pwd = ${pwd}   where userId= ${userId}`;



  try{
      db.query(getuserById ,(err, result) => {
        if (err) {
          console.log(err);
          res.sendStatus(500) //Internal Server Error
        } 
        else {
         
          if (result.recordset.length>0){
           
            const data = result.recordset[0]
          
           
            if (data != undefined){
   
              if (dob == (data.tDob).toISOString().split("T")[0]){
           
                try{
                  db.query(update_pwd ,(err, result) => {
                    if (err) {
                      console.log(err);
                      res.sendStatus(500) //Internal Server Error
                    }else{
                      if(result.rowsAffected[0]>0){
                       
                        res.send("Success")
                      }
                    }
                  })}catch (error) {
                      console.log("ALERT",error) 
                     }


         
          }
          else{
            res.send("Wrong Date of Birth")
          }
        }
        else{
          res.send("No Data of Birth Found")
        }
      }else{
      
        res.send("No User Found")
      } 
  
        }
      });
    } catch (error) {
      console.log("ALERT",error) 
     }
   
}
})


router.post("/verifyUser", verifyToken, (req, res) => {
  const data = req.body


  jwt.verify(data.token, lmskey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Unautherized : Invalid Token" });
      }
      
      req.user = decoded.user;
    res.json(req.user)
    });
});


module.exports = router




