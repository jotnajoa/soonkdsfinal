const express = require('express');
const dotenv = require('dotenv')
const path = require('path')
const axios = require('axios')
const {Client} = require('pg')
const { response } = require('express');
var db_credentials;

const app = express();




// landing page wasn't made yet

dotenv.config();

app.use('/aapjt',express.static('./AApjt'));
app.use('/ptcpjt',express.static('./Particlepjt'))
app.use('/blgpjt',express.static('./Blogpjt'))

db_credentials = {
    host: 'ds-20.crrxaw2b5hr1.us-east-1.rds.amazonaws.com',
    database: 'aa',
    user: 'jotnajoa',
    password: process.env.AWSRDS_PW,
    port: 5432,
}

//  Creating api for aa project
app.use('/aaapi',async function (request,response){

    // db_credentials = {
    //     host: 'ds-20.crrxaw2b5hr1.us-east-1.rds.amazonaws.com',
    //     database: 'aa',
    //     user: 'jotnajoa',
    //     password: process.env.AWSRDS_PW,
    //     port: 5432,
    // }


    var client = new Client(db_credentials);
    await client.connect();
    let query = "SELECT * FROM locationtable;"

    client.query(query, (err, res) => {
        if (err){ throw err; }
        let tempdata = res.rows;

        let data = tempdata.map(d=>({...d,
        lat:parseFloat(d.lat),
        lon:parseFloat(d.lon)
        }))

        // console.log(data);
        response.json(data)

        client.end();
    });

})


app.use('/ptcapi',async function (request,response){

    const client = new Client(db_credentials);
    await client.connect();
    
    var thisQuery = "SELECT * FROM blogTable;"; // print all values
    
    client.query(thisQuery, (err, res) => {
        if (err) {throw err}
        else {
        console.log(res.rows[0].geometry.split('coordinates":')[1]);
        response.json(res.rows);
  
        }
         client.end();
    });
})

//creating api for temperature project


app.listen(8000,()=>{console.log('running')})

