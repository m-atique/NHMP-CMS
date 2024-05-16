const mssql = require('mssql')

const config = {
    server: '192.168.1.103', //ip address of the mssql database
    user: 'ATEEQ', //username to login to the database
    password: '123456', //password to login to the database
    database: 'cms', //the name of the database to connect to
    port: 1414, //OPTIONAL, port of the database on the server
    // timeout: 5, //OPTIONAL, login timeout for the server
    options: {
        trustedconnection: true,
        trustServerCertificate:true
        
    },
}



async function connection (){
    try {
    await mssql.connect(config);
    console.log("SQL connection is working")
    } catch (error) {
        console.log(error+ "-------not working sad")
    }
}

connection();

module.exports = mssql;