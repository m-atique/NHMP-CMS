const express = require('express');
const router = express.Router();
const db = require('../dbconfig');

const API_KEY = 'A3166'; // ✅ use your global key

// 🔒 Middleware to check API key
function verifyApiKey(req, res, next) {
  const key = req.headers['api_key'];
  if (!key || key !== API_KEY) {
    return res.status(403).send({ success: false, message: 'Invalid or missing API key' });
  }
  next();
}

// ✅ CREATE leave
router.post('/addleave', verifyApiKey, (req, res) => {
  const {
    staffId, startDate, endDate, days, reason, leaveType,
    remarks, approvedBy, addedBy, addedDate, baranch,
    recStatus, startTime, endTime
  } = req.body;

  const sql = `
    INSERT INTO staff_leave
    (staffId, startDate, endDate, days, reason, leaveType, remarks,
     approvedBy, addedBy, addedDate, baranch, recStatus, startTime, endTime)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    staffId, startDate, endDate, days, reason, leaveType, remarks,
    approvedBy, addedBy, addedDate, baranch, recStatus || 'saved', startTime, endTime
  ], (err, result) => {
    if (err) {
      console.log('❌ Error inserting leave:', err);
      res.status(500).send({ success: false, message: 'Database error' });
    } else {
      res.send({ success: true, message: 'Leave added successfully', id: result.insertId });
    }
  });
});


// ✅ READ — All leaves
router.get('/getAll', verifyApiKey, (req, res) => {
  const sql = `SELECT * FROM staff_leave ORDER BY id DESC`;
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).send({ success: false, message: 'Database error' });
    } else {
      res.send(result);
    }
  });
});


// ✅ READ — ID wise
router.get('/getleave/:id', verifyApiKey, (req, res) => {
const id = req.params.id
  const sql = `SELECT * FROM staff_leave WHERE id = ${id}`;
  db.query(sql, (err, result) => {
    if (err) res.status(500).send({ success: false });
    else res.send(result.recordset || {});
  });
})


// ✅ READ — Staff ID wise
router.get('/get/staff/:staffId', verifyApiKey, (req, res) => {
    const id = req.params.id
  const sql = `SELECT * FROM staff_leave WHERE staffId = '${req.params.staffId} ' ORDER BY startDate DESC`;
  db.query(sql,  (err, result) => {
    if (err) res.status(500).send({ success: false });
    else res.send(result);
  });
});


// ✅ READ — Type wise
router.get('/get/type/:type', verifyApiKey, (req, res) => {
  const sql = `SELECT * FROM staff_leave WHERE leaveType = '${req.params.type}' ORDER BY startDate DESC`;
  db.query(sql,  (err, result) => {
    if (err) res.status(500).send({ success: false });
    else res.send(result);
  });
});


// ✅ READ — Date range
router.get('/get/date', verifyApiKey, (req, res) => {
  const { startDate, endDate } = req.query;

  const sql = `
    SELECT * FROM staff_leave
    WHERE startDate >= ? AND endDate <= ?
    ORDER BY startDate ASC
  `;
  db.query(sql, [startDate, endDate], (err, result) => {
    if (err) res.status(500).send({ success: false });
    else res.send(result);
  });
});


// ✅ UPDATE leave
router.put('/update/:id', verifyApiKey, (req, res) => {
  const { startDate, endDate, days, reason, leaveType, remarks, approvedBy, recStatus } = req.body;

  const sql = `
    UPDATE staff_leave
    SET startDate=?, endDate=?, days=?, reason=?, leaveType=?,
        remarks=?, approvedBy=?, recStatus=?
    WHERE id=?
  `;

  db.query(sql, [startDate, endDate, days, reason, leaveType, remarks, approvedBy, recStatus, req.params.id],
    (err, result) => {
      if (err) res.status(500).send({ success: false });
      else res.send({ success: true, message: 'Leave updated successfully' });
    });
});


// ✅ DELETE leave
router.delete('/delete/:id', verifyApiKey, (req, res) => {
  const sql = `DELETE FROM staff_leave WHERE id = ?`;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) res.status(500).send({ success: false });
    else res.send({ success: true, message: 'Leave deleted successfully' });
  });
});

module.exports = router;
