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

  // ✅ Step 1: Check if same leave already exists
  const checkSql = `
    SELECT * FROM staff_leave 
    WHERE staffId = '${staffId}' 
      AND startDate = '${startDate}' 
      AND endDate = '${endDate}' 
      AND leaveType = '${leaveType}'
  `;

  db.query(checkSql, (err, result) => {
    if (err) {
      console.log('❌ Error checking leave:', err);
      return res.status(500).send({ success: false, message: 'Database error while checking leave' });
    }

    // ✅ If already exists
    if (result.recordset && result.recordset.length > 0) {
      return res.send({ success: false, message: 'Leave already added for this period' });
    }

    // ✅ Step 2: Insert new leave
    const insertSql = `
      INSERT INTO staff_leave
      (staffId, startDate, endDate, days, reason, leaveType, remarks,
       approvedBy, addedBy, addedDate, baranch, recStatus, startTime, endTime)
      VALUES (
        '${staffId}', '${startDate}', '${endDate}', '${days}', '${reason}', '${leaveType}',
        '${remarks}', '${approvedBy}', '${addedBy}', '${addedDate}', '${baranch}',
        '${recStatus || 'saved'}', '${startTime}', '${endTime}'
      )
    `;

    db.query(insertSql, (insertErr, insertResult) => {
      if (insertErr) {
        console.log('❌ Error inserting leave:', insertErr);
        return res.status(500).send({ success: false, message: 'Database error while inserting leave' });
      }

      res.send({ success: true, message: 'Leave added successfully' });
    });
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
    else res.send(result.recordset);
  });
});


// ✅ READ — Type wise
router.get('/get/type/:type', verifyApiKey, (req, res) => {
  const sql = `SELECT * FROM staff_leave WHERE leaveType = '${req.params.type}' ORDER BY startDate DESC`;
  db.query(sql,  (err, result) => {
    if (err) res.status(500).send({ success: false });
    else res.send(result.recordset);
  });
});


// ✅ READ — Date range
router.get('/get/date', verifyApiKey, (req, res) => {
  const { startDate, endDate } = req.query;

  const sql = `
    SELECT * FROM staff_leave
    WHERE startDate >= '${startDate}' AND endDate <= '${endDate}'
    ORDER BY startDate ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log('❌ Error fetching leaves:', err);
      res.status(500).send({ success: false, message: 'Database error' });
    } else {
      res.send(result.recordset || []);
    }
  });
});



// ✅ UPDATE leave
router.put('/update/:id', verifyApiKey, (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, days, reason, leaveType, remarks, approvedBy, recStatus } = req.body;

  const sql = `
    UPDATE staff_leave
    SET 
      startDate='${startDate}',
      endDate='${endDate}',
      days='${days}',
      reason='${reason}',
      leaveType='${leaveType}',
      remarks='${remarks}',
      approvedBy='${approvedBy}',
      recStatus='${recStatus}'
    WHERE id='${id}'
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log('❌ Error updating leave:', err);
      res.status(500).send({ success: false, message: 'Database error' });
    } else {
      res.send({ success: true, message: 'Leave updated successfully' });
    }
  });
});


// ✅ DELETE leave
router.delete('/delete/:id', verifyApiKey, (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM staff_leave WHERE id='${id}'`;

  db.query(sql, (err, result) => {
    if (err) {
      console.log('❌ Error deleting leave:', err);
      res.status(500).send({ success: false, message: 'Database error' });
    } else {
      res.send({ success: true, message: 'Leave deleted successfully' });
    }
  });
});


module.exports = router;
