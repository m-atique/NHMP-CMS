const express = require('express');
const router = express.Router();
const db = require('../dbconfig');
const jwt = require('jsonwebtoken') 
const {verifyToken} = require("../spy/auth")


lmskey = process.env.KEY

router.get("/getbook/:id", (req, res)=>{
    const id = req.params.id
    const q = `SELECT * from books where id = '${id}'`

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

router.get("/getbooks", (req, res)=>{
   
    const q = `SELECT * from books `

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



router.get("/getschdule", (req, res)=>{
   
    const q = `SELECT * from shedules `

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