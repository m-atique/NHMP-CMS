const express = require('express');
const router = express.Router();
const db = require('../dbconfig');
const jwt = require('jsonwebtoken') 
const {verifyToken} = require("../spy/auth")


lmskey = process.env.KEY

router.post("/addWeight", (req, res) => {
    const { courseId, traineeId,waist, kgs, grams,height,catagory,underweight,overweight,  addedBy,date } = req.body;

    // Check if all required fields are provided
    if (!courseId || !traineeId || !kgs || !grams) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = `
        INSERT INTO trainee_weight (courseId, traineeId,waist, kgs, grams,catagory,underweight,overweight, addedBy,date,height)
        VALUES (
        '${courseId}',
        '${traineeId}',
        '${waist}',
        '${kgs}',
        '${grams}',
        '${catagory}',
        '${underweight}',
        '${overweight}',
        '${addedBy}',
        '${date}',
        '${height}'
        )
    `;


    try {
        db.query(query, (err, result) => {
            if (err) {
                console.error("Error inserting data", err);
                return res.status(500).json({ error: "Database error" });
            }

            try {
                db.query(`update trainees set theight = '${height}'  where tCnic = '${traineeId}'` )
            } catch (error) {
                console.log(error)
            }
            res.status(200).json({ message: "Weight added successfully", result });
        });
    } catch (err) {
        console.error("Query execution failed", err);
        return res.status(500).json({ error: "Server error" });
    }
});







router.delete("/deleteWeight", (req, res) => {
    const { sno } = req.body;

    // Check if 'sno' is provided
    if (!sno) {
        return res.status(400).json({ error: "Sno field is required" });
    }

    const query = `DELETE FROM trainee_weight WHERE sno = ${sno}`;

    db.query(query, (err, result) => {
        if (err) {
            console.error("Error deleting data", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json({ message: "Weight deleted successfully", result });
    });
});



router.post("/getLastWeight", (req, res) => {
    const { courseId, traineeId } = req.body;

   

    const query = `
        select top 1 * from trainee_weight  where courseid = '${courseId}' and traineeId = '${traineeId}' order by sno   desc 
    `;



    try {
        db.query(query, (err, result) => {
            if (err) {
                console.error("Error inserting data", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.status(200).json( result.recordset );
        });
    } catch (err) {
        console.error("Query execution failed", err);
        return res.status(500).json({ error: "Server error" });
    
}
});



router.post("/getWeightHistory", (req, res) => {
    const { courseId, traineeId } = req.body;

   

    const query = `
        select * from trainee_weight  where courseid = '${courseId}' and traineeId = '${traineeId}' order by sno   desc 
    `;



    try {
        db.query(query, (err, result) => {
            if (err) {
                console.error("Error inserting data", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.status(200).json( result.recordset );
        });
    } catch (err) {
        console.error("Query execution failed", err);
        return res.status(500).json({ error: "Server error" });
    
}
});

router.post("/getweightReport", (req, res) => {
    const { courseId} = req.body;

   

    const query = `
       SELECT  tw.sno,tw.date, tw.catagory,tw.waist, tw.traineeId, tw.kgs, tw.grams, tw.underweight, tw.overweight,trn.tName, trn.tRank,trn.tBeltno
FROM trainee_weight tw
INNER JOIN (
    SELECT traineeId, MAX(sno) AS latest_sno
    FROM trainee_weight
    WHERE courseId = '${courseId}'
    GROUP BY traineeId
) latest ON tw.traineeId = latest.traineeId AND tw.sno = latest.latest_sno

inner join trainees as trn on cast(tw.traineeId as varchar)= trn.tCnic
WHERE tw.courseId = '${courseId}'
ORDER BY tw.catagory, tw.traineeId`





    try {
        db.query(query, (err, result) => {
            if (err) {
                console.error("Error inserting data", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.status(200).json( result.recordset );
        });

//===============================================

       



    } catch (err) {
        console.error("Query execution failed", err);
        return res.status(500).json({ error: "Server error" });
    
}
});


router.post("/getCourseSummery", (req, res) => {
    const { courseId} = req.body;



const query2 = `SELECT catagory, COUNT(DISTINCT traineeId) AS total_trainees
FROM trainee_weight
WHERE courseId = '${courseId}'
GROUP BY catagory`


    try {

//===============================================

        db.query(query2, (err, result) => {
            if (err) {
                console.error("Error inserting data", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.status(200).json( result.recordset );
        });



    } catch (err) {
        console.error("Query execution failed", err);
        return res.status(500).json({ error: "Server error" });
    
}
});


//=================================comprihansive report 

router.post("/getpdfReport", (req, res) => {
    const { courseId} = req.body;



const query = `

DECLARE @cols NVARCHAR(MAX),
        @query NVARCHAR(MAX);

-- Build the list of columns (dates) ONLY for courseId = 5046 and where data is not null
SET @cols = STUFF(( 
    SELECT DISTINCT ',' + QUOTENAME(CONVERT(VARCHAR(10), tw.[date], 23))
    FROM trainee_weight tw
    WHERE tw.courseId = ${courseId}
      AND (tw.kgs IS NOT NULL OR tw.grams IS NOT NULL OR tw.waist IS NOT NULL)
    FOR XML PATH(''), TYPE
).value('.', 'NVARCHAR(MAX)'), 1, 1, '');

-- Build dynamic query
SET @query = '
SELECT traineeId, capNo, tName, height, ' + @cols + '
FROM
(
    SELECT 
        tw.traineeId,
        tr.traineeId AS capNo,
        tr.tName,
        tw.height,

        CONVERT(VARCHAR(10), tw.date, 23) AS [date],
        CONCAT(''Weight: '', tw.kgs, '' kg '', tw.grams, '' grams - Waist: '', tw.waist, '' inch'',''-'',''Category: '',tw.catagory) AS weight_info
    FROM trainee_weight tw
    INNER JOIN trainees tr ON tr.tCnic = CONVERT(VARCHAR, tw.traineeId)
    WHERE tw.courseId = ${courseId}
      AND (tw.kgs IS NOT NULL OR tw.grams IS NOT NULL OR tw.waist IS NOT NULL)
) AS SourceTable
PIVOT
(
    MAX(weight_info) FOR [date] IN (' + @cols + ')
) AS PivotTable
ORDER BY capNo,traineeId,  tName;
';

-- Execute
EXEC sp_executesql @query

 `


    try {



        db.query(query, (err, result) => {
            if (err) {
                console.error("Error inserting data", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.status(200).json( result.recordset );
        });



    } catch (err) {
        console.error("Query execution failed", err);
        return res.status(500).json({ error: "Server error" });
    
}
});

module.exports = router




