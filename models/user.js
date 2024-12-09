import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import dotenv from "dotenv"

dotenv.config();

const userSchema = new mongoose.Schema({

  email : {
    type : String,
  } ,
  password : {
    type : String,
    required : [true,"A password is required"]
  } 
})

// let secret = process.env.SECRET ;

// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

//userSchema.plugin(encrypt,{secret : secret , encryptedFieds : ["password"]});

export const User = new mongoose.model("User",userSchema) ;