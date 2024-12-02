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
  
    const getTrainee = `select  tCnic, tName,tCourse,tCourseId,tRank , message from  trainees   where tCnic= ${username}`;
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
                    courseId:data2.tCourseId,
                    cnic:data2.tCnic,
                    message:data2.message
                  }  


                 console.log("user",data2)
                
                const token = jwt.sign({user},api_key,{expiresIn:'8h'})
             
                 res.json({token:token,role:data.role})
}}})

          }

    } catch (error) {
        res.status(500).send('Internal server error');
    }
}
});


router.get('/getpwd', async (req, res) => {

const data = [{"id":1620257782045, "pwd":	"123"},
  {"id":2150762373955, "pwd":	"123"},
  {"id":3450277818265, "pwd":	"1234"},
  {"id":3450277845123, "pwd":	"Abv123"},
  {"id":3520225957405, "pwd":	"Mumtazali"},
  {"id":3630390835596, "pwd":	"123"},
  {"id":4340204722623, "pwd":	"123"},
  {"id":7120141496305, "pwd":	"sh03555205"},
  {"id":7120176723113, "pwd":	"03554101549"},
  {"id":7120177590945, "pwd":	"251985"},
  {"id":7120253117377, "pwd":	"Yasir227@"},
  {"id":7120342834417, "pwd":	"1986"},
  {"id":7120380600023, "pwd":	"alam313"},
  {"id":714011101387,  "pwd": "yasir"},
  {"id":7140111542331, "pwd":	"55663421"},
  {"id":7140123054629, "pwd":	"maqsadwali"},
  {"id":7140140976791, "pwd":	"22334455"},
  {"id":7140150623887, "pwd":	"25803"},
  {"id":7140150853375, "pwd":	"112233"},
  {"id":714017960100,  "pwd":"Sher1234"},
  {"id":7140208740899, "pwd":	"204493"},
  {"id":7140303419215, "pwd":	"basima"},
  {"id":7150102135703, "pwd":	"Yahya@cms"},
  {"id":7150111501069, "pwd":	"S102650"},
  {"id":7150114526135, "pwd":	"14526135"},
  {"id":7150121589001, "pwd":	"1234"},
  {"id":7150131104353, "pwd":	"samiubaig"},
  {"id":7150133973153, "pwd":	"1988"},
  {"id":7150136328059, "pwd":	"ali03555150382"},
  {"id":7150154593963, "pwd":	"Mehdi12@cms"},
  {"id":7150157424513, "pwd":	"Gilgitpakistan"},
  {"id":7150173626909, "pwd":	"4307690"},
  {"id":7150174118037, "pwd":	"Gh1234567"},
  {"id":7150177157955, "pwd":	"Hussain@6"},
  {"id":7150181530613, "pwd":	"121272"},
  {"id":7150187802905, "pwd":	"03554414689"},
  {"id":7150189527911, "pwd":	"amir1122"},
  {"id":7150192040473, "pwd":	"Waseem1991"},
  {"id":7150192517705, "pwd":	"03105598831"},
  {"id":750198637585,  "pwd":"Wajid1122"}]



  async function hashPasswords() {
    const salt = await bcrypt.genSalt(10); // Generate salt (10 rounds)
    
    for (const item of data) {
      const hashedPassword = await bcrypt.hash(item.pwd, salt); // Hash the password
      
      // Use parameterized query with `db.query`
      const query = `

      DECLARE @id BIGINT;
      DECLARE @PWD VARCHAR(100);
        UPDATE trainees
        SET pwd = @PWD
        WHERE tCnic = @id
      `;
      
      // Execute the query with parameters
      await db.query(query, {
        id: item.id,             // Bind the id
        PWD: hashedPassword      // Bind the hashed password
      });
    }
  }

  try {
    // Hash passwords and update the database
    await hashPasswords();

    // Send success response
    res.status(200).json({ message: 'Passwords updated successfully.' });
  } catch (err) {
    // Handle any errors during the process
    console.error('Error updating passwords:', err);
    res.status(500).json({ message: 'Error updating passwords.', error: err });
  }
});



module.exports = router