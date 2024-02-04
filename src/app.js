require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");


require("./db/conn");
const Register = require("./models/registers");

const port = process.env.PORT || 3000;


const static_path = path.join(__dirname, "../public" );
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);


console.log("secret Key is : " + process.env.SECRET_KEY);

app.get("/", (req, res) => {
    res.render("index")
});

app.get("/secret", auth ,(req,res) => {

    console.log(`the cookie is : ${req.cookies.jwt}`);
    res.render("secret");
});

app.get("/logout", auth, async(req,res) => {
    try {

        console.log(req.user);

        //for singe device logout:
        // req.user.tokens = req.user.tokens.filter((currElement) => {
        //     return currElement.token = !req.token
        // })

        //logout from All devices:
        res.user.tokens = [];

        res.clearCookie("jwt");
        console.log("logout successfully");

        await req.user.save();
        res.render("login");

    } catch (error) {
        res.status(500).send(error);
    }
})

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) =>{
    res.render("login");
})

// create a new user in our database
app.post("/register", async (req, res) =>{
    try {

      const password = req.body.password;
      const cpassword = req.body.confirmpassword;

      if(password === cpassword){
        
        const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                gender:req.body.gender,
                phone:req.body.phone,
                age:req.body.age,
                password:req.body.password,
                confirmpassword:req.body.confirmpassword    
        })

        console.log("The success part " + registerEmployee);

        const token = await registerEmployee.generateAuthToken();
        console.log("the token part " + token);


        /*
        The res.cookie() function is used to set the cookie name to value.
        The value parameter may be a string or object 
        */

        res.cookie("jwt", token, {
            expires:new Date(Date.now() + 800000),
            //client-side scripting language doesnt chnage the value of this cookies:
            httpOnly:true
        });
        console.log(cookie);

        const registered = await registerEmployee.save();
        console.log("the registered part" + registered);

        res.status(201).render("index");

      }else{
          res.send("password are not matching")
      }
        
    } catch (error) {
        res.status(400).send(error);
        console.log("the error part page ");
    }
})


// login check

app.post("/login", async(req, res) =>{
   try {
    
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email:email});

        const isMatch = bcrypt.compare(password, useremail.password);

            //GENERATING TOKENS DURING LOGIN:
        const token = await useremail.generateAuthToken();
        console.log("The Token Part is : " + token);

        //COOKIES DURING LOGIN TIME ON BROWSER SITE::
        res.cookie("jwt", token, {
            expires:new Date(Date.now() + 50000),
            httpOnly:true,
            secure:true
        })
        // console.log(`the cookie is : ${req.cookies.jwt}`);

        if(isMatch)
        {
            res.status(201).render("index");
        }else{
            res.send("Invalid login details");
        }

        // res.send(useremail);
        // console.log(useremail);
    
        // if(useremail === password)
        // {
        //     res.status(201).render("index");
        // }
        // else{
        //     res.send("invalid login details");
        // }

   } catch (error) {
       res.status(400).send("invalid login Details")
   }
})

    //password hashing using bcryptjs:

// const bcrypt = require("bcryptjs");

// const securePassword = async(password) =>{

//     //convert simple password into hash password:
//     const passwordHash = await bcrypt.hash(password,10);
//     console.log(passwordHash);

//     //if input password is match then return true else return false:
//     const passwordmatch = await bcrypt.compare("uday@1234",passwordHash);
//     console.log(passwordmatch);
// }
// securePassword("uday@123");
 

//JSON WEB TOKEN:
const jwt = require("jsonwebtoken");
const { Date } = require('mongoose');

const createToken = async() => {
    const token = await jwt.sign({id:"65ad354b561d25022c6b2ec2"}, "mynameisayushmanpoddarbihardarbhanga");
    console.log("token is : " + token);

    const userVerify = await jwt.verify(token,"mynameisayushmanpoddarbihardarbhanga");
    console.log(userVerify);
    
}
createToken();


app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})