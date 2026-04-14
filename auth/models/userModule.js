import mongoose from "mongoose";

const userShcema= new mongoose.Schema({
    name: {type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    role:{type:String, enum:["user","admin"], default:"user"},
    verifyOtp:{type:String, default:''},
    verifyOtpExpireAt:{type:Number, default:0},
    isAccountVerify:{type:Boolean, default:false},
    resetOtp:{type:String, default:''},
    resetOtpExpiredAt:{type:Number, default:0},
}) 

const userModule=mongoose.model.user || mongoose.model('user',userShcema)
export default userModule