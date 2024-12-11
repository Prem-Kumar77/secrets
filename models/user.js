import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose"
//import encrypt from "mongoose-encryption";
//import dotenv from "dotenv" 
//dotenv.config();

const userSchema = new mongoose.Schema({

  email : {
    type : String,
  } ,
  password : {
    type : String,
  } 
})

// let secret = process.env.SECRET ;
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });
//userSchema.plugin(encrypt,{secret : secret , encryptedFieds : ["password"]});

userSchema.plugin(passportLocalMongoose);

export const User = new mongoose.model("User",userSchema) ;