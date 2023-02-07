const LocalStrategy=require('passport-local').Strategy
const bcrypt=require('bcrypt')
//const user = require('../models/user')

function initialize(passport,getUserByEmail,getUserById){
    const authenticateUser=async(email,password,done)=>{
        const user = getUserByEmail(email)
        console.log("Before If")
        console.log(typeof user)
        console.log("")
        console.log("")
        if(user==null){
            console.log("No user with that email")
            return done(null, false, {message:"No user with that email"})
        }

        try {
            if(await bcrypt.compare(password,user.password)){
                console.log("---------THE SUCCESS----------")
                console.log(user)
                console.log(password)
                console.log(user.password)
                console.log("---------THE SUCCESS----------")
                return done(null,user)
            }else{
                return done(null,false,{message:"password incorrect"})
            }
        } catch (error) {
            console.log("---------THE ERROR----------")
            console.log(user)
            console.log(password)
            console.log(user.password)
            console.log("---------THE ERROR----------")
            return done(error)
        }

    }
    passport.use(new LocalStrategy({usernameField:'email' },authenticateUser))
    passport.serializeUser((user,done)=> {
        console.log()
        done(null,user.id)
        }
    )
    passport.deserializeUser((id,done)=>{
        //console.log("Passport config... deserializing user with the id of "+id)
        return done(null,getUserById(id))
    })

}

module.exports=initialize