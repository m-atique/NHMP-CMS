const express = require("express");
const db = require('../dbconfig');
const router = express.Router();
lmskey = process.env.KEY;

router.post('/stafflogin', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const apiKey = req.headers['cms-api-key'];
        if (!apiKey || apiKey !== lmskey) {
            return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
        }

        const user = await db.query(`select sa.username,sa.password,si.branch,si.role,si.name, si.rank from staff_info as si inner join staff_accounts as sa on si.id = sa.ref_table_key WHERE sa.username = ${username}`);

        if (user.recordset.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }
        const validPassword = password === user.recordset[0].password; // Replace with proper password hashing in production
        console.log(validPassword)
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const userData = user.recordset[0]

        const user_info = {
            name: userData.name,
            branch: userData.branch,
            role: userData.role,
            rank: userData.rank
        };
        res.status(200).json({ message: 'Login successful', user: user.recordset[0] });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/access', (req, res) => {
    res.status(200).json({ message: 'Access staff  route successful' });
});

module.exports = router;