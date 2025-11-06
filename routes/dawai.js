const express = require('express');
const router = express.Router();

const db = require('../dbconfig');

// ✅ Add a new medicine
router.post("/medicine", async (req, res) => {
  try {
    const { MedicineName, Brand, Description, Unit } = req.body;

    const result = await db
      .query(`
        INSERT INTO Medicines (
        MedicineName, 
        Brand, 
        Description, 
        Unit)
        VALUES (
        ${MedicineName?MedicineName:""},
        ${Brand?Brand:""}
        ${Description?Description:""}
        ${Unit?Unit:""}
        );
        SELECT SCOPE_IDENTITY() AS MedicineId;
      `);

    res.json({ success: true, medicineId: result.recordset[0].MedicineId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error adding medicine" });
  }
});


router.get("/", async (req, res) => {
  try {
   

    const result = await db
     
      .query(`
       select * from Medicines;
      `);

    res.json( result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error adding medicine" });
  }
});

// ✅ Stock In
router.post("/stock/in", async (req, res) => {
  try {
    const { MedicineId, Quantity, Remarks } = req.body;

    await db.request()
      .input("MedicineId", sql.Int, MedicineId)
      .input("TransactionType", sql.NVarChar, "IN")
      .input("Quantity", sql.Int, Quantity)
      .input("Remarks", sql.NVarChar, Remarks)
      .query(`
        INSERT INTO MedicineStock (MedicineId, TransactionType, Quantity, Remarks)
        VALUES (@MedicineId, @TransactionType, @Quantity, @Remarks)
      `);

    res.json({ success: true, message: "Stock added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error in stock in" });
  }
});


// ✅ Stock Out
router.post("/stock/out", async (req, res) => {
  try {
    const { MedicineId, Quantity, Remarks } = req.body;

    // optional: check current balance first
    const balanceResult = await db.request()
      .input("MedicineId", sql.Int, MedicineId)
      .query(`
        SELECT ISNULL(SUM(CASE WHEN TransactionType='IN' THEN Quantity ELSE -Quantity END),0) AS Balance
        FROM MedicineStock WHERE MedicineId = @MedicineId
      `);

    const balance = balanceResult.recordset[0].Balance;

    if (balance < Quantity) {
      return res.status(400).json({ success: false, message: "Not enough stock" });
    }

    await db.request()
      .input("MedicineId", sql.Int, MedicineId)
      .input("TransactionType", sql.NVarChar, "OUT")
      .input("Quantity", sql.Int, Quantity)
      .input("Remarks", sql.NVarChar, Remarks)
      .query(`
        INSERT INTO MedicineStock (MedicineId, TransactionType, Quantity, Remarks)
        VALUES (@MedicineId, @TransactionType, @Quantity, @Remarks)
      `);

    res.json({ success: true, message: "Stock issued successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error in stock out" });
  }
});


// ✅ Get Medicine Balance
router.get("/balance/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db
      .query(`select * from MedicineBalance where MedicineId = ${id}
        
      `);

    res.json(result.recordset[0] || { message: "Medicine not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching balance" });
  }
});
// ✅ Get Medicine Balance
router.get("/stock/balance", async (req, res) => {
  try {
   

    const result = await db
      .query(`select medicineName,sum(balance) as balance from MedicineBalance group by MedicineName`);

    res.json(result.recordset|| { message: "Medicine not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching balance" });
  }
});

// ✅ Get total stock IN between dates
router.get("/stock/total-in/:startDate/:endDate", async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    const result = await db
      .query(`
   
        SELECT m.MedicineId, m.MedicineName , s.TransactionDate,
               ISNULL(SUM(s.Quantity),0) AS TotalIn
        FROM Medicines m
        LEFT JOIN MedicineStock s ON m.MedicineId = s.MedicineId
        WHERE s.TransactionType = 'IN'
           AND s.TransactionDate  >= '${startDate}' AND s.TransactionDate <='${endDate}'
   
        GROUP BY m.MedicineId, m.MedicineName, s.TransactionDate
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching total stock in" });
  }
});


// ✅ Get total stock OUT between dates
router.get("/stock/total-out/:startDate/:endDate", async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    const result = await db
      .query(`
         SELECT m.MedicineId, m.MedicineName , s.TransactionDate as IssueDate,
               ISNULL(SUM(s.Quantity),0) AS TotalOut
        FROM Medicines m
        LEFT JOIN MedicineStock s ON m.MedicineId = s.MedicineId
        WHERE s.TransactionType = 'OUT'
           AND s.TransactionDate  >= '${startDate}' AND s.TransactionDate < DATEADD(DAY, 1, '${endDate}')
   
        GROUP BY m.MedicineId, m.MedicineName, s.TransactionDate
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching total stock out" });
  }
});

// ✅ Get total stock IN between dates
router.get("/productstock/total-in/:id/:startDate/:endDate", async (req, res) => {
  try {
    const { startDate, endDate ,id} = req.params;

    const result = await db
      .query(`
   
        SELECT m.MedicineId, m.MedicineName , s.TransactionDate,
               ISNULL(SUM(s.Quantity),0) AS TotalIn
        FROM Medicines m
        LEFT JOIN MedicineStock s ON m.MedicineId = s.MedicineId
        WHERE s.TransactionType = 'IN'
           AND s.TransactionDate  >= '${startDate}' AND s.TransactionDate <='${endDate}' AND m.MedicineId = '${id}'
   
        GROUP BY m.MedicineId, m.MedicineName, s.TransactionDate
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching total stock in" });
  }
});


// ✅ Get total stock OUT between dates
router.get("/productstock/total-out/:id/:startDate/:endDate", async (req, res) => {
  try {
    const { startDate, endDate, id} = req.params;

    const result = await db
      .query(`
         SELECT m.MedicineId, m.MedicineName , s.TransactionDate,
               ISNULL(SUM(s.Quantity),0) AS TotalOut
        FROM Medicines m
        LEFT JOIN MedicineStock s ON m.MedicineId = s.MedicineId
        WHERE s.TransactionType = 'OUT'
           AND s.TransactionDate  >= '${startDate}' AND s.TransactionDate <='${endDate}' AND m.MedicineId = '${id}'
   
        GROUP BY m.MedicineId, m.MedicineName, s.TransactionDate
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching total stock out" });
  }
});



module.exports = router