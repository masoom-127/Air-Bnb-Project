const mongoose=require('mongoose')
const data=require('./data')
 
const Listing = require('../models/listing');

const monogosh_url='mongodb://127.0.0.1:27017/wonderful'
async function main() {
    mongoose.connect( monogosh_url)
    
}
main().then(()=>{
    console.log('connect to db')
}).catch((err)=>{
    console.log(err)
})

async function initDB() {
    await Listing.deleteMany({});

    const modifiedData = data.data.map(obj => ({
        ...obj,
        owner: "6974b1db78a6327adb1b0c0d"
    }));

    await Listing.insertMany(modifiedData);

    console.log("Data was saved");
}


initDB();
