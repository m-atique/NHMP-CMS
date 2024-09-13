const express = require("express");
const db = require('../dbconfig');
const router = express.Router();



lmskey = process.env.KEY;


////===================================================================  ranks
router.get("/dsrReport", (req, res) => {


    const qry = `SELECT c.id,
    c.courseName,c.totalTrainees as nominated ,
	
	COALESCE(t.reported, 0) AS reported,
	(totalTrainees - COALESCE(t.reported, 0)) as not_reported,
	  COALESCE(t.male, 0) AS male,
    COALESCE(t.female, 0) AS female,
    COALESCE(l.on_leave, 0) AS on_leave,
    COALESCE(a.absent, 0) AS absent,
    (COALESCE(t.reported, 0) - COALESCE(a.absent, 0) - COALESCE(l.on_leave, 0)) as present
FROM 
    course c

LEFT JOIN 
    (SELECT tCourse, COUNT(*) AS reported,
	SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) AS male,
        SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) AS female
     FROM trainees 
     GROUP BY tCourse) t ON c.courseName = t.tCourse
LEFT JOIN 
    (SELECT courseName, COUNT(*) AS on_leave 
     FROM leave  where  cast( getDate() as Date) >=startDate  and cast( getDate() as Date) <= endDate 
     GROUP BY courseName) l ON c.courseName = l.courseName
LEFT JOIN 
    (SELECT courseName, COUNT(*) AS absent 
     FROM absence 
     GROUP BY courseName) a ON c.courseName = a.courseName
WHERE 
    c.status = 'current'
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






module.exports = router;
