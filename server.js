const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const app = express();
require('dotenv').config();
app.use(bodyParser.json({limit:'50mb'}));
app.use(cors({origin:'*'}));

app.use('/users',require('./user/getuser'))
app.use('/leave',require('./leaveRoute/leave'))
app.use('/results',require('./resultsRoute/results'))
app.use('/absence',require('./absenceRoute/absence'))
app.use('/punishment',require('./punishmentRoute/punishment'))
app.use('/posting',require('./postingRoute/posting'))
app.use('/register',require('./registerRoute/register'))

app.use('/course',require('./courseRoute/course'))
app.use('/reports',require('./reports/dashboard_reports'))
app.use('/gen',require('./routes/genRoutes'))
app.use('/ofc',require('./routes/officeRoutes'))
app.use('/signUp',require('./routes/signupRoutes'))
app.use('/bk',require('./routes/getbooks'))
app.use('/trainee',require('./routes/trainees'))
app.use('/traineeRpt',require('./reports/traineeReports'))
app.get("/", (req, res)=>{
    res.send("Welcome to CMS")
})

app.listen('5002', ()=>{console.log("server started at http://localhost:"+5002)})