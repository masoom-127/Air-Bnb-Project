const mongoose = require('mongoose');
const Schema=mongoose.Schema;
// import passportLocalMongoose from 'passport-local-mongoose'; this is latst way import any package to file 
const passportLocalMongoose = require('passport-local-mongoose').default;
 

const userSchema=new Schema({
    email:{
        type:String,
        required:true,
    },

});
console.log(typeof passportLocalMongoose);
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('User',userSchema)


 