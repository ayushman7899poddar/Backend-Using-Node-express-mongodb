const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({ 
    firstname : {
        type:String,
        required:true
    },
    lastname: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true,
        unique:true
    },
    gender: {
        type:String,
        required:true
    },  
    phone: {
        type:Number,
        required:true,
        unique:true
    },
    age: {
        type:Number,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    confirmpassword: {
        type:String,
        required:true
    },
    tokens : [{
        token:{
            type:String,
            required:true
        }
    }]
})


//generating tokens:
employeeSchema.methods.generateAuthToken = async function(){
    try {
        const tokenValue = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:tokenValue});
        //for display token on database:
        await this.save();

        // console.log(tokenValue);
        return tokenValue;

    } catch (error) {
        res.send("The error part " + error);
        console.log("The error part " + error);
    }
}


//secure Registration password with bcryptjs using middleware in node.js:
//converting password into hash:
employeeSchema.pre("save", async function(next) {

    if(this.isModified("password"))
    {
        // const passwordHash = await bcrypt.hash(password,10);
        // console.log(`the current password is ${this.password}`);
            //PASSWORD IS HASH:
        this.password = await bcrypt.hash(this.password,10);
        // console.log(`after hashing password is ${this.password}`);
            //  CONFIRM PASSWORD ALSO HASH:
        this.confirmpassword = await bcrypt.hash(this.confirmpassword,10);
        // this.confirmpassword = undefined;
    }
    
    next();
})


// now we need to create a collections:
const Register = new mongoose.model("Register", employeeSchema);
module.exports = Register;