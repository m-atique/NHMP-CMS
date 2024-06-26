const express = require('express');
const router = express.Router();
const db = require('../dbconfig');
const jwt = require('jsonwebtoken') 
const {verifyToken} = require("../spy/auth")


lmskey = process.env.KEY




router.post("/ctgReport", (req, res)=>{
  const data = req.body
  const q = `SELECT * from requestedAccounts where ${data.field} = '${data.value}'`

  try {
      db.query(q,(err, result)=>{
          if(result) { res.send(result.recordset)}
          else {
              console.log("errrrrrrrr",err)
          }
      })

  } catch (err) {
      console.log("query not working", err)
  }
})






module.exports = router