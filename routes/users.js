const express = require('express');
const router = express.Router();
const db = require('../dbconfig');
const jwt = require('jsonwebtoken') 
const bcrypt = require('bcryptjs');
const {verifyToken} = require("../spy/auth")



lmskey = process.env.KEY

router.post('/login', async (req, res) => {
    
    const { username, password } = req.body;
    const {api_key} =req.headers
 
  
     
  if( api_key !=lmskey){
    res.send("Invalid api key")
  }else{
  
    const getTrainee = `select tCnic, tName,tCourse,tRank , message from  trainees   where tCnic= ${username}`;
    try {
        const result = await db.query(`SELECT pwd,role,status FROM Users WHERE UserId = ${username}`);

        const data = result.recordset[0];
        
        
        if (!data) {
          
            return res.json('Invalid User');
        }
        
        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, data.pwd);

        
        if (!isMatch) {
            return res.json('Invalid Password');
        }
        
      
        // Generate JWT token
        if(data.role == 'drill' || data.role == 'hrm' ){
            const user = {
              id:data.id,
              // name: data.tName,
            //   role:data.role
              // rank:data.tRank,
              // course:data.tCourse,
              // cnic:data.tCnic
            }  

          const token = jwt.sign({user},api_key,{expiresIn:'8h'})
          
      res.json({token:token,role:data.role})
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
                    
                    name: data2.tName,
                    // role:data.role,
                    rank:data2.tRank,
                    course:data2.tCourse,
                    cnic:data2.tCnic,
                    message:data2.message
                  }  


                 
                
                const token = jwt.sign({user},api_key,{expiresIn:'8h'})
             
                 res.json({token:token,role:data.role})
}}})

          }

    } catch (error) {
        res.status(500).send('Internal server error');
    }
}
});

module.exports = router