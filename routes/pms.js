const express = require('express');
const router = express.Router();

const db = require('../dbconfig');

// CREATE (Add new entry)
router.post("/addpms", (req, res) => {
    try {
        const data = req.body;


   

        const q = `
            INSERT INTO pms (
                visit_date,visitor_type, course_id, tCnic,name, entry_type, disease, medicine, ref_hospital, start_date, end_date, remarks
            ) VALUES (
                ${data.visit_date ? `'${data.visit_date}'` : 'NULL'},
                ${data.visitor_type ? `'${data.visitor_type}'` : 'NULL'},
                ${data.course_id ? `'${data.course_id}'` : 'NULL'},
                '${data.tCnic}',
                ${data.name ? `'${data.name}'` : 'NULL'},
                '${data.entry_type}',
                ${data.disease ? `'${data.disease}'` : 'NULL'},
                ${data.medicine ? `'${data.medicine}'` : 'NULL'},
                ${data.ref_hospital ? `'${data.ref_hospital}'` : 'NULL'},
                ${data.start_date ? `'${data.start_date}'` : 'NULL'},
                ${data.end_date ? `'${data.end_date}'` : 'NULL'},
                ${data.remarks ? `'${data.remarks}'` : 'NULL'}
            )
        `;

        db.query(q, (err, result) => {
            if (err) {
                console.error("Error saving PMS record:", err);
                return res.status(500).send({ error: "Failed to save record" });
            }


                let recId 
                db.query(`select top 1 * from pms order by id desc`, (err, result) => {
                      recId=result.recordset[0].id

                    if (err) {
                        console.error("Error saving Medicine record:", err);
                        return res.status(500).send({ error: "Error saving Medicine record" });
                    }
                })

            

if(data.medicine.length>0){
    const mData = data.medicine.split("--").map(item=>{
        const med = item.split(",")[0]
        const qty = item.split(",")[1].trim()

        return {medName:med,qty:qty}
    })

     mData.map(async(item) => {
        const result = await db.query(`select MedicineId from Medicines where MedicineName = '${item.medName}' `)

    const id =result.recordset[0].MedicineId 
        db.query(`
            INSERT INTO MedicineStock (MedicineId, TransactionType, Quantity, Remarks,pms_entry_id)
            VALUES (${id}, 'OUT', ${item.qty}, 'Medicine STOCKED OUD BY pms',${recId})
            `);
    }
    )

}


            res.status(201).send({ message: "Record saved successfully", result });
        });
    } catch (err) {
        console.error("Query execution error:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});


// READ (Get all entries)
router.get("/getpms", (req, res) => {
    try {
        const q = `SELECT 
    p.id,
	p.visit_date,
	p.visitor_type,
    t.traineeId,
	p.tcnic,
	
    CASE 
        WHEN p.visitor_type = 'trainee' 
            THEN CONCAT(t.tRank, ' ', t.tName, ' (', t.tBeltNo, ')')
        ELSE p.name 
    END AS name,
	p.entry_type,
	p.disease,
	p.medicine,
	p.ref_hospital,p.start_date,p.end_date,p.remarks,
    CASE 
        WHEN p.visitor_type = 'trainee' THEN t.tClass 
        ELSE '' 
    END AS class_name,
    CASE 
        WHEN p.visitor_type = 'trainee' THEN c.courseName 
        ELSE ''
    END AS course_name
FROM pms AS p
LEFT JOIN trainees AS t 
    ON p.tCnic = t.tCnic 
    AND p.visitor_type = 'trainee'
LEFT JOIN course AS c 
    ON p.course_id = c.id 
    AND p.visitor_type = 'trainee'
ORDER BY p.visit_date;`;
        db.query(q, (err, result) => {
            if (err) {
                console.error("Error fetching records:", err);
                return res.status(500).send({ error: "Failed to fetch records" });
            }
            res.send(result.recordset);
        });
    } catch (err) {
        console.error("Execution error:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});


// READ by ID
router.get("/getpms/:id", (req, res) => {
    try {
        const q = `SELECT * FROM pms WHERE id = ${req.params.id}`;
        db.query(q, (err, result) => {
            if (err) {
                console.error("Error fetching record:", err);
                return res.status(500).send({ error: "Failed to fetch record" });
            }
            res.send(result.recordset || {});
        });
    } catch (err) {
        console.error("Execution error:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});


// UPDATE
router.put("/updatepms/:id", (req, res) => {
    try {
        const data = req.body;
        const q = `
            UPDATE pms SET
                visit_date = ${data.visit_date ? `'${data.visit_date}'` : 'NULL'},
                visitor_type = ${data.visitor_type ? `'${data.visitor_type}'` : 'NULL'},
                course_id = ${data.course_id ? `'${data.course_id}'` : 'NULL'},
                tCnic = '${data.tCnic}',
                  name = ${data.name ? `'${data.name}'` : 'NULL'},
                entry_type = '${data.entry_type}',
                disease = ${data.disease ? `'${data.disease}'` : 'NULL'},
                medicine = ${data.medicine ? `'${data.medicine}'` : 'NULL'},
                ref_hospital = ${data.ref_hospital ? `'${data.ref_hospital}'` : 'NULL'},
                start_date = ${data.start_date ? `'${data.start_date}'` : 'NULL'},
                end_date = ${data.end_date ? `'${data.end_date}'` : 'NULL'},
                remarks = ${data.remarks ? `'${data.remarks}'` : 'NULL'}
            WHERE id = ${req.params.id}
        `;

        db.query(q, (err, result) => {
            if (err) {
                console.error("Error updating record:", err);
                return res.status(500).send({ error: "Failed to update record" });
            }
            res.send({ message: "Record updated successfully", result });
        });
    } catch (err) {
        console.error("Execution error:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});


// DELETE
router.delete("/deletepms/:id", (req, res) => {
    try {

 const q = `DELETE FROM pms WHERE id = ${req.params.id}`;
        db.query(q, (err, result) => {
            if (err) {
                console.error("Error deleting record:", err);
                return res.status(500).send({ error: "Failed to delete record" });
            }
            res.send({ message: "Record deleted successfully", result });
           
        });

 const delMedicine = `delete from  medicineStock where StockId in  (select StockId from MedicineStock where pms_entry_id = ${req.params.id} )`

             db.query(delMedicine, (err, result) => {
            if (err) {
                console.error("Error deleting record:", err);
                return res.status(500).send({ error: "Failed to delete Medicine Stock" });
            }
        })

    } catch (err) {
        console.error("Execution error:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});


// 🔎 FILTERS

// 1. Records between two dates (visit_date)
router.get("/getpmsByDate/:startDate/:endDate",  (req, res) => {

   
    try {
        const { startDate, endDate } = req.params;

        const q = `SELECT 
    p.id,
	p.visit_date,
	p.visitor_type,
    t.traineeId,
	p.tcnic,
	
    CASE 
        WHEN p.visitor_type = 'trainee' 
            THEN CONCAT(t.tRank, ' ', t.tName, ' (', t.tBeltNo, ')')
        ELSE p.name 
    END AS name,
	p.entry_type,
	p.disease,
	p.medicine,
	p.ref_hospital,p.start_date,p.end_date,p.remarks,
    CASE 
        WHEN p.visitor_type = 'trainee' THEN t.tClass 
        ELSE '' 
    END AS class_name,
    CASE 
        WHEN p.visitor_type = 'trainee' THEN c.courseName 
        ELSE ''
    END AS course_name
FROM pms AS p
LEFT JOIN trainees AS t 
    ON p.tCnic = t.tCnic 
    AND p.visitor_type = 'trainee'
LEFT JOIN course AS c 
    ON p.course_id = c.id 
    AND p.visitor_type = 'trainee'
 WHERE p.visit_date>='${startDate}' AND p.visit_date <='${endDate}'
 ORDER BY p.visit_date`;

         db.query(q, (err, result) => {
            if (err) {
                console.error("Error fetching records:", err);
                return res.status(500).send({ error: "Failed to fetch records" });
            }

             
            res.send(result.recordset);
        });
    } catch (err) {
        console.error("Execution error:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});

// 2. Records between two dates + entry_type
router.get("/getpmsByEntryType/:start/:end/:entry_type", (req, res) => {
    try {
        const { start, end, entry_type } = req.params;
        const q = `SELECT * FROM pms 
                   WHERE visit_date BETWEEN '${start}' AND '${end}' 
                   AND entry_type = '${entry_type}' 
                   ORDER BY visit_date`;

        db.query(q, (err, result) => {
            if (err) {
                console.error("Error fetching records:", err);
                return res.status(500).send({ error: "Failed to fetch records" });
            }
            res.send(result.recordset);
        });
    } catch (err) {
        console.error("Execution error:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});

// 3. Records by tCnic between two dates
router.get("/getpmsByCnicDate/:tCnic/:start/:end", (req, res) => {
    try {
        const { tCnic, start, end } = req.params;
        const q = `SELECT * FROM pms 
                   WHERE tCnic = '${tCnic}' 
                   AND visit_date BETWEEN '${start}' AND '${end}' 
                   ORDER BY visit_date`;

        db.query(q, (err, result) => {
            if (err) {
                console.error("Error fetching records:", err);
                return res.status(500).send({ error: "Failed to fetch records" });
            }
            res.send(result);
        });
    } catch (err) {
        console.error("Execution error:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});

router.get("/getpmsByCnic/:cnic", (req, res) => {
    try {
        const cnic = req.params.cnic;
        const q = `SELECT 
    p.id,
	p.visit_date,
	p.visitor_type,
    t.traineeId,
	p.tcnic,
	
    CASE 
        WHEN p.visitor_type = 'trainee' 
            THEN CONCAT(t.tRank, ' ', t.tName, ' (', t.tBeltNo, ')')
        ELSE p.name 
    END AS name,
	p.entry_type,
	p.disease,
	p.medicine,
	p.ref_hospital,p.start_date,p.end_date,p.remarks,
    CASE 
        WHEN p.visitor_type = 'trainee' THEN t.tClass 
        ELSE '' 
    END AS class_name,
    CASE 
        WHEN p.visitor_type = 'trainee' THEN c.courseName 
        ELSE ''
    END AS course_name
FROM pms AS p
LEFT JOIN trainees AS t 
    ON p.tCnic = t.tCnic 
    AND p.visitor_type = 'trainee'
LEFT JOIN course AS c 
    ON p.course_id = c.id 
    AND p.visitor_type = 'trainee'
 WHERE p.tCnic = '${cnic}'
 ORDER BY p.visit_date
`;

        db.query(q, (err, result) => {
            if (err) {
                console.error("Error fetching records:", err);
                return res.status(500).send({ error: "Failed to fetch records" });
            }
            res.send(result.recordset);
        });
    } catch (err) {
        console.error("Execution error:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});


router.get("/getpmsByCourse/:course_id", (req, res) => {
    try {

     
        const { course_id} = req.params;
        const q = `SELECT 
    p.id,
	p.visit_date,
	p.visitor_type,
    t.traineeId,
	p.tcnic,
	
    CASE 
        WHEN p.visitor_type = 'trainee' 
            THEN CONCAT(t.tRank, ' ', t.tName, ' (', t.tBeltNo, ')')
        ELSE p.name 
    END AS name,
	p.entry_type,
	p.disease,
	p.medicine,
	p.ref_hospital,p.start_date,p.end_date,p.remarks,
    CASE 
        WHEN p.visitor_type = 'trainee' THEN t.tClass 
        ELSE '' 
    END AS class_name,
    CASE 
        WHEN p.visitor_type = 'trainee' THEN c.courseName 
        ELSE ''
    END AS course_name
FROM pms AS p
LEFT JOIN trainees AS t 
    ON p.tCnic = t.tCnic 
    AND p.visitor_type = 'trainee'
LEFT JOIN course AS c 
    ON p.course_id = c.id 
    AND p.visitor_type = 'trainee'
 WHERE p.course_id = '${course_id}'
 ORDER BY p.visit_date;`

        db.query(q, (err, result) => {
            if (err) {
                console.error("Error fetching records:", err);
                return res.status(500).send({ error: "Failed to fetch records" });
            }
            res.send(result.recordset);
        });
    } catch (err) {
        console.error("Execution error:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});







module.exports = router