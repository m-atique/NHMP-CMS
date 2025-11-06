const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../dbconfig');

router.post("/saveCourse", (req, res) => {
    const data = req.body;
     
    
    const insertquery  = `INSERT INTO course (  
    courseName,
	startDate,
	endDate,
	totalTrainees,
	arrivalDate,
	status,
	remarks,
	addedBy
    )
  VALUES
  (   
'${data.courseName}',
'${data.startDate}',
'${data.endDate}',
'${data.nominatedTrainee}',
'${data.arrivalDate}',
'${data.courseStatus}',
'${data.remarks}',
'${data.addedBy}' 
  )`
    
    try{

        console.log(insertquery)
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
//================================update
router.patch("/updateCourse/:id", [
 
    body('startDate').isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').isISO8601().withMessage('End date must be a valid date'),
    body('nominatedTrainee').isInt().withMessage('Total trainees must be an integer'),
    body('arrivalDate').isISO8601().withMessage('Arrival date must be a valid date'),
    body('courseStatus').isString().notEmpty().withMessage('Course status is required'),
    body('remarks').isString().optional(),
    // body('addedBy').isInt().notEmpty().withMessage('Added by is required')
], (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const data = req.body;
    console.log("--------------"<data)
    const courseId = req.params.id;
    const updateQuery = `
    UPDATE course
    SET 
      
        startDate =  '${data.startDate}',
        endDate =  '${data.endDate}',
        totalTrainees =  '${data.nominatedTrainee}',
        arrivalDate =  '${data.arrivalDate}',
        status =  '${data.courseStatus}',
        remarks =  '${data.remarks}',
        addedBy = '${data.addedBy}'
    WHERE 
        id = '${courseId}'`;

    console.log("query",updateQuery)

    db.query(updateQuery, (err, result) => {
        if (err) {
            console.error(err);
            return res.sendStatus(500); // Internal Server Error
        }
        res.sendStatus(200); // OK
    });
});


//--------------------get Single course 

      router.get("/getCourse/:course", (req, res) => {
        const course = req.params.course

        console.log(course)
        const qry = `SELECT * from course where courseName = '${course}'`;
      
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
  //-----------------------------------get all course 
  router.get("/getAll", (req, res) => {
    const course = req.params.course

    const qry = `SELECT * from course`;
  
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

  ///---------------------------------active courses
    //-----------------------------------get all course 
    router.get("/getCurrentCourse", (req, res) => {
      const course = req.params.course
  
      const qry = `SELECT courseName from course where status = 'current'
 `;
    
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

module.exports = router