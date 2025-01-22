const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const app = express();
require('dotenv').config();
app.use(bodyParser.json({limit:'50mb'}));
app.use(cors({origin:'*'}));
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
  });
const path = require('path');
const fs = require('fs');


//------------------------------------------------------------multur and path middleware 
// const uploadFolder = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadFolder)) {
//   fs.mkdirSync(uploadFolder);
// }

// // Middleware to serve uploaded files
// app.use('/uploads', express.static(uploadFolder));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads', 'BookCovers')))
app.use('/public', express.static(path.join(__dirname, 'uploads')));
// router.use('/covers', express.static(path.join(__dirname, '..', 'uploads', 'BookCovers')));

//---------------------------

app.use('/users',require('./user/getuser'))
app.use('/leave',require('./leaveRoute/leave'))
app.use('/results',require('./resultsRoute/results'))
app.use('/absence',require('./absenceRoute/absence'))
app.use('/punishment',require('./punishmentRoute/punishment'))
app.use('/osd',require('./routes/osd'))
app.use('/posting',require('./postingRoute/posting'))
app.use('/register',require('./registerRoute/register'))
app.use('/outdoor',require('./routes/outdoor'))


app.use('/course',require('./courseRoute/course'))
app.use('/reports',require('./reports/dashboard_reports'))
app.use('/gen',require('./routes/genRoutes'))
app.use('/ofc',require('./routes/officeRoutes'))
app.use('/signUp',require('./routes/signupRoutes'))
app.use('/bk',require('./routes/getbooks'))
app.use('/trainee',require('./routes/trainees'))
app.use('/traineeRpt',require('./reports/traineeReports'))
app.use('/weight',require('./routes/weight'))
app.use('/medical',require('./routes/medical'))
app.use('/userauth',require('./routes/users'))
app.use('/subjects',require('./routes/subjects'))
//====================reporting 

app.use('/rpt',require('./routes/reports'))

//====================================
app.use('/pdf',require('./routes/pdfloder'))
//========================staff
app.use('/staff',require('./routes/staff'))


app.get("/", (req, res)=>{
    res.send("Welcome to CMS")
})

app.listen('5002', ()=>{console.log("server started at http://localhost:"+5002)})