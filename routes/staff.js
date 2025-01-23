const express = require("express");
const db = require("../dbconfig");
const router = express.Router();
lmskey = process.env.KEY;

router.post("/stafflogin", async (req, res) => {
  const { username, password } = req.body;

  try {
    const apiKey = req.headers["cms-api-key"];
    if (!apiKey || apiKey !== lmskey) {
      return res.status(403).json({ message: "Forbidden: Invalid API Key" });
    }

    const user = await db.query(
      `select sa.username,sa.password,si.branch,si.role,si.name, si.rank from staff_info as si inner join staff_accounts as sa on si.id = sa.ref_table_key WHERE sa.username = ${username}`
    );

    if (user.recordset.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }
    const validPassword = password === user.recordset[0].password; // Replace with proper password hashing in production
    console.log(validPassword);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const userData = user.recordset[0];

    const user_info = {
      name: userData.name,
      branch: userData.branch,
      role: userData.role,
      rank: userData.rank,
    };
    res
      .status(200)
      .json({ message: "Login successful", user: user.recordset[0] });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//============================================save data

router.post("/saveStaff", (req, res) => {
  const data = req.body;
    let qry = '';

if (data.dl === 'N/A') {
    qry = `INSERT INTO staff_info (
        name, fname, dob, gender, bgroup, cnic, email, pic, maritalState, contact, emgcontact, relation, emgpesrson, province, domicile, localPs, pa, ca, qualification, degreeName, institute, dl, rank, beltno, doj_gov, doj_nhmp, doj_clg, employment
        ) VALUES ('${data.name}', '${data.fname}', '${data.dob}', '${data.gender}', '${data.bgroup}', '${data.cnic}', '${data.email}', '${data.pic}', '${data.maritalState}', '${data.contact}', '${data.emgcontact}', '${data.relation}', '${data.emgpesrson}', '${data.province}', '${data.domicile}', '${data.localPs}', '${data.pa}', '${data.ca}', '${data.qualification}', '${data.degreeName}', '${data.institute}', '${data.dl}', '${data.rank}', '${data.beltno}', '${data.doj_gov}', '${data.doj_nhmp}', '${data.doj_clg}', '${data.employment}'
        )`;
}

else if (data.employment === 'recruited') {
    qry = `INSERT INTO staff_info (
        name, fname, dob, gender, bgroup, cnic, email, pic, maritalState, contact, emgcontact, relation, emgpesrson, province, domicile, localPs, pa, ca, qualification, degreeName, institute, dl, dlno, dlissuedBy, rank, beltno, doj_gov, doj_nhmp, doj_clg, employment
        ) VALUES ('${data.name}', '${data.fname}', '${data.dob}', '${data.gender}', '${data.bgroup}', '${data.cnic}', '${data.email}', '${data.pic}', '${data.maritalState}', '${data.contact}', '${data.emgcontact}', '${data.relation}', '${data.emgpesrson}', '${data.province}', '${data.domicile}', '${data.localPs}', '${data.pa}', '${data.ca}', '${data.qualification}', '${data.degreeName}', '${data.institute}', '${data.dl}', '${data.dlno}', '${data.dlissuedBy}', '${data.rank}', '${data.beltno}', '${data.doj_gov}', '${data.doj_nhmp}', '${data.doj_clg}', '${data.employment}'
        )`;
}

else if (data.dl === 'N/A' && data.employment === 'recruited') {
    qry = `INSERT INTO staff_info (
        name, fname, dob, gender, bgroup, cnic, email, pic, maritalState, contact, emgcontact, relation, emgpesrson, province, domicile, localPs, pa, ca, qualification, degreeName, institute, dl, rank, beltno, doj_gov, doj_nhmp, doj_clg, employment
        ) VALUES ('${data.name}', '${data.fname}', '${data.dob}', '${data.gender}', '${data.bgroup}', '${data.cnic}', '${data.email}', '${data.pic}', '${data.maritalState}', '${data.contact}', '${data.emgcontact}', '${data.relation}', '${data.emgpesrson}', '${data.province}', '${data.domicile}', '${data.localPs}', '${data.pa}', '${data.ca}', '${data.qualification}', '${data.degreeName}', '${data.institute}', '${data.dl}', '${data.rank}', '${data.beltno}', '${data.doj_gov}', '${data.doj_nhmp}', '${data.doj_clg}', '${data.employment}'
        )`;
}else{
    qry = `INSERT INTO staff_info (
        name, fname, dob, gender, bgroup, cnic, email, pic, maritalState, contact, emgcontact, relation, emgpesrson, province, domicile, localPs, pa, ca, qualification, degreeName, institute, dl, dlno, dlissuedBy, rank, beltno, doj_gov, doj_nhmp, doj_clg, employment, deparment, deputation, induction
        ) VALUES ('${data.name}', '${data.fname}', '${data.dob}', '${data.gender}', '${data.bgroup}', '${data.cnic}', '${data.email}', '${data.pic}', '${data.maritalState}', '${data.contact}', '${data.emgcontact}', '${data.relation}', '${data.emgpesrson}', '${data.province}', '${data.domicile}', '${data.localPs}', '${data.pa}', '${data.ca}', '${data.qualification}', '${data.degreeName}', '${data.institute}', '${data.dl}', '${data.dl === 'N/A' ? '' : data.dlno}', '${data.dl === 'N/A' ? '' : data.dlissuedBy}', '${data.rank}', '${data.beltno}', '${data.doj_gov}', '${data.doj_nhmp}', '${data.doj_clg}', '${data.employment}', '${data.employment !== 'recruited' ? data.deparment : ''}', '${data.employment !== 'recruited' ? data.deputation : ''}', '${data.employment !== 'recruited' ? data.induction : ''}'
        )`;
}
const testData1 = {
    name: "John Doe",
    fname: "Jane Doe",
    dob: "1990-01-01",
    gender: "Male",
    bgroup: "A+",
    cnic: "12345-6789012-3",
    email: "john.doe@example.com",
    pic: "path/to/pic.jpg",
    maritalState: "Single",
    contact: "1234567890",
    emgcontact: "0987654321",
    relation: "Brother",
    emgpesrson: "Jake Doe",
    province: "Province1",
    domicile: "City1",
    localPs: "LocalPS1",
    pa: "Permanent Address",
    ca: "Current Address",
    qualification: "Masters",
    degreeName: "MSc Computer Science",
    institute: "University1",
    dl: "N/A",
    rank: "Rank1",
    beltno: "Belt1",
    doj_gov: "2020-01-01",
    doj_nhmp: "2020-02-01",
    doj_clg: "2020-03-01",
    employment: "employed"
};

const testData2 = {
    name: "Alice Smith",
    fname: "Bob Smith",
    dob: "1985-05-05",
    gender: "Female",
    bgroup: "B+",
    cnic: "98765-4321098-7",
    email: "alice.smith@example.com",
    pic: "path/to/pic2.jpg",
    maritalState: "Married",
    contact: "0987654321",
    emgcontact: "1234567890",
    relation: "Husband",
    emgpesrson: "Bob Smith",
    province: "Province2",
    domicile: "City2",
    localPs: "LocalPS2",
    pa: "Permanent Address2",
    ca: "Current Address2",
    qualification: "PhD",
    degreeName: "PhD Computer Science",
    institute: "University2",
    dl: "DL123456",
    dlno: "DL123456",
    dlissuedBy: "Authority1",
    rank: "Rank2",
    beltno: "Belt2",
    doj_gov: "2015-01-01",
    doj_nhmp: "2015-02-01",
    doj_clg: "2015-03-01",
    employment: "recruited"
};

const testData3 = {
    name: "Charlie Brown",
    fname: "Lucy Brown",
    dob: "1975-10-10",
    gender: "Male",
    bgroup: "O+",
    cnic: "54321-0987654-3",
    email: "charlie.brown@example.com",
    pic: "path/to/pic3.jpg",
    maritalState: "Divorced",
    contact: "1122334455",
    emgcontact: "5566778899",
    relation: "Sister",
    emgpesrson: "Lucy Brown",
    province: "Province3",
    domicile: "City3",
    localPs: "LocalPS3",
    pa: "Permanent Address3",
    ca: "Current Address3",
    qualification: "Bachelors",
    degreeName: "BSc Computer Science",
    institute: "University3",
    dl: "N/A",
    rank: "Rank3",
    beltno: "Belt3",
    doj_gov: "2010-01-01",
    doj_nhmp: "2010-02-01",
    doj_clg: "2010-03-01",
    employment: "recruited"
};

const testData4 = {
    name: "David Johnson",
    fname: "Emma Johnson",
    dob: "1980-12-12",
    gender: "Male",
    bgroup: "AB+",
    cnic: "67890-1234567-8",
    email: "david.johnson@example.com",
    pic: "path/to/pic4.jpg",
    maritalState: "Widowed",
    contact: "2233445566",
    emgcontact: "6677889900",
    relation: "Mother",
    emgpesrson: "Emma Johnson",
    province: "Province4",
    domicile: "City4",
    localPs: "LocalPS4",
    pa: "Permanent Address4",
    ca: "Current Address4",
    qualification: "Diploma",
    degreeName: "Diploma in IT",
    institute: "Institute1",
    dl: "DL654321",
    dlno: "DL654321",
    dlissuedBy: "Authority2",
    rank: "Rank4",
    beltno: "Belt4",
    doj_gov: "2005-01-01",
    doj_nhmp: "2005-02-01",
    doj_clg: "2005-03-01",
    employment: "employed",
    deparment: "IT",
    deputation: "Yes",
    induction: "No"
};
  try {
    db.query(qry, (err, result) => {
      if (err) {
        res.sendStatus(500); // Internal Server Error
      } else {
        res.send(result); // OK
      }
    });
  } catch (error) {
    console.log("ALERT", error);
  }
});

router.get("/access", (req, res) => {
  res.status(200).json({ message: "Access staff  route successful" });
});

module.exports = router;
