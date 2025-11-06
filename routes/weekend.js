const express = require("express");
const router = express.Router();
const db = require("../dbconfig");

// ✅ Secure API key (move to .env in production)
const API_KEY = "A3166";

// 🔐 Middleware to check API key
function verifyApiKey(req, res, next) {
  const apiKey = req.headers["api_key"];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(403).json({ message: "Invalid or missing API key" });
  }
  next();
}

// ------------------- CREATE -------------------
router.post("/add", verifyApiKey, (req, res) => {
  const data = req.body;

  const q = `
    INSERT INTO weekend_rec 
      (entry_type, 
      start_date, 
      end_date, 
      start_time, 
      end_time, 
      course, 
      trainees_going, 
      trainees_notGoing)
    VALUES
      ('${data.entry_type}', '${data.start_date}', '${data.end_date}', '${data.start_time}', '${data.end_time}', '${data.course}', '${data.trainees_going}', '${data.trainees_notGoing}');
  `;

  db.query(q, (err, result) => {
    if (err) {
      console.error("❌ Error inserting record:", err);
      return res.status(500).json({ message: "Failed to insert record" });
    }
    res.json({ message: "✅ Weekend record added successfully" });
  });
});

// ------------------- READ ALL -------------------
router.get("/getAll", verifyApiKey, (req, res) => {
  const q = "SELECT * FROM weekend_rec ORDER BY id DESC";
  db.query(q, (err, result) => {
    if (err) {
      console.error("❌ Error fetching data:", err);
      return res.status(500).json({ message: "Failed to fetch data" });
    }
    res.json(result.recordset);
  });
});

// ------------------- READ ONE -------------------
router.get("/get/:id", verifyApiKey, (req, res) => {
  const id = req.params.id;
  const q = `SELECT * FROM weekend_rec WHERE id = ${id}`;
  db.query(q, (err, result) => {
    if (err) {
      console.error("❌ Error fetching record:", err);
      return res.status(500).json({ message: "Failed to fetch record" });
    }
    res.json(result.recordset[0]);
  });
});
// ------------------- READ BY COURSE -------------------
router.get("/getByCourse/:id", verifyApiKey, (req, res) => {
  const id = req.params.id;
  const q = `SELECT * FROM weekend_rec WHERE COURSE = '${id}'`;
  db.query(q, (err, result) => {
    if (err) {
      console.error("❌ Error fetching record:", err);
      return res.status(500).json({ message: "Failed to fetch record" });
    }
    res.json(result.recordset[0]);
  });
});
// ------------------- UPDATE -------------------
router.put("/update/:id", verifyApiKey, (req, res) => {
  const id = req.params.id;
  const data = req.body;

  const q = `
    UPDATE weekend_rec
    SET 
      entry_type='${data.entry_type}',
      start_date='${data.start_date}',
      end_date='${data.end_date}',
      start_time='${data.start_time}',
      end_time='${data.end_time}',
      course='${data.course}',
      trainees_going='${data.trainees_going}',
      trainees_notGoing='${data.trainees_notGoing}'
    WHERE id=${id};
  `;

  db.query(q, (err, result) => {
    if (err) {
      console.error("❌ Error updating record:", err);
      return res.status(500).json({ message: "Failed to update record" });
    }
    res.json({ message: "✅ Weekend record updated successfully" });
  });
});

// ------------------- DELETE -------------------
router.delete("/delete/:id", verifyApiKey, (req, res) => {
  const id = req.params.id;
  const q = `DELETE FROM weekend_rec WHERE id=${id}`;

  db.query(q, (err, result) => {
    if (err) {
      console.error("❌ Error deleting record:", err);
      return res.status(500).json({ message: "Failed to delete record" });
    }
    res.json({ message: "🗑️ Weekend record deleted successfully" });
  });
});

module.exports = router;
