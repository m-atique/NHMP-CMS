const express = require('express');
const router = express.Router();

const db = require('../dbconfig');

const { body, validationResult } = require("express-validator");

router.post("/addSubjects", (req, res) => {
    const data = req.body;

    const q = `
    INSERT INTO subjects (courseId, subjectName,addedBy)
    VALUES (
        '${data.courseId}',
        '${data.subjectName}',
        '${data.addedBy}'
    )`;

    try {
        db.query(q, (err, result) => {
            if (result) {
                res.status(201).send({ message: "Record saved successfully", result });
            } else {
                console.error("Error saving record:", err);
                res.status(500).send({ error: "Failed to save record" });
            }
        });
    } catch (err) {
        console.error("Query execution error:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});


router.get("/getSubjects", (req, res) => {
    const q = `SELECT * FROM subjects`;

    try {
        db.query(q, (err, result) => {
            if (result) {
                res.status(200).send(result.recordset);
            } else {
                console.error("Error fetching records:", err);
                res.status(500).send({ error: "Failed to fetch records" });
            }
        });
    } catch (err) {
        console.error("Query execution error:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});


router.put("/updateSubjects/:id", (req, res) => {
    const id = req.params.id;
    const data = req.body;

    // Dynamically construct the SET clause
    const updates = Object.keys(data)
        .map(key => `${key} = ${data[key] === null ? 'NULL' : `'${data[key]}'`}`)
        .join(", ");

    // Check if there's anything to update
    if (!updates) {
        return res.status(400).send({ error: "No fields provided to update" });
    }

    const q = `
        UPDATE subjects
        SET ${updates}
        WHERE id = ${id}`;

       
    try {
        db.query(q, (err, result) => {
         
            if (result && result.rowsAffected > 0) {
                res.status(200).send({ message: "Record updated successfully" });
            } else if (result && result.rowsAffected === 0) {
                res.status(404).send({ error: "Record not found" });
            } else {
                console.error("Error updating record:", err);
                res.status(500).send({ error: "Failed to update record" });
            }
        });
    } catch (err) {
        console.error("Query execution error:", err);
        res.status(500).send({ error: "Internal server error" });
    }
});


module.exports = router