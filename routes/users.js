if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const LocalStrategy=require('passport-local').Strategy
const express=require('express')
const user = require('../models/user')
const router =express.Router()
const User=require('../models/user')
const jwt=require('jsonwebtoken')
const { verify } = require('jsonwebtoken')
const session = require("express-session");
const passport = require("passport");
const bcrypt=require('bcrypt')
const initializePassport=require('./passport-config')
const flash=require('express-flash')

/*
initializePassport(
    passport,
    async function email(){
    const users = await User.find()
    console.log('Initializing passport....')
    return users.find(user=>user.email===email)
})
*/
const authenticateUser=async(email,password,done)=>{
    const user = await User.findOne({ email: email });
    console.log("Before If")
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
            console.log("Wrong password.")
            return done(null,false,{message:"password incorrect"})
        }
    } catch (error) {
        return done(error)
    }

}
passport.use(new LocalStrategy({usernameField:'email' },authenticateUser))
passport.serializeUser((user,done)=> {
    console.log(user.id)
    done(null,user.id)
    }
)
passport.deserializeUser((id,done)=>{
    console.log("Deserializing user...")
    console.log(id)
    try {
        User.findById(id, function(err, user) {
            done(err, user);
          }); 
    } catch (error) {
        console.log(error)
    }
})


router.use(express.urlencoded({extended:false}))
router.use(flash())
router.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))
router.use(passport.initialize())
router.use(passport.session())

router.get('/logout',checkAuthenticated,(req,res)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
})

router.post('/login',passport.authenticate('local',{
    successRedirect:'/users',
    failureRedirect:'/login',
    //failureFlash:true
}))


router.get('/' , checkAuthenticated,async (req,res)=>{

    let account=req.user.email;
    console.log("Logged in as: "+account)
    try {
        const users= await User.find()
        res.json(users)
    } catch (err) {
        res.status(500).json({message : err.message})
    }

})
//GET ALL USERS
router.get('/:id',checkAuthenticated,getUser,(req,res)=>{
    res.json(res.user)
})
//GET SPECIFIC USER
router.get('/:id/posts',getUser,(req,res)=>{
    res.json(res.user.posts)
})
//GET ALL POSTS FROM A USER
router.get('/:id/posts/:postIndex',checkAuthenticated,getUser,(req,res)=>{
    let postID=req.params.postIndex
    console.log(postID)
    res.json(res.user.posts[postID])
})
//GET SPECIFIC POST
router.patch('/:id/posts/:postIndex/newComment',checkAuthenticated, getUser,async(req,res)=>{
    
    let postID=req.params.postIndex
    console.log(res.user.posts)
    
    const newComment={
        name:req.body.name,
        date:req.body.date,
        content:req.body.content
    }
   
    let currentPosts=res.user.posts;
    console.log(currentPosts[postID].comments)
    currentPosts[postID].comments.unshift(newComment)
    console.log(currentPosts[postID].comments)
    console.log("---------------------------------")
    console.log(currentPosts)
    
    res.user.posts=currentPosts;

    try {
        res.user.markModified('posts')
        const updatedUser = await res.user.save()
        res.json(updatedUser)
        console.log(res.user.posts[postID].comments)
    } catch (err) {
        res.status(400).json({message: err.message})
    }
    
})
//WRITE NEW COMMENT
router.post('/register', async (req,res)=>{

    try {
        let hashedPassword = await bcrypt.hash(req.body.password,10)
        const user=new User({
            firstName:req.body.firstName,
            lastName: req.body.lastName,
            email:req.body.email,
            password: hashedPassword,
            birthDay:req.body.birthDay,
            defaultProfile: "https://as1.ftcdn.net/v2/jpg/03/46/83/96/1000_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg",
            bio:"Add Bio",
            friends: [],
            friendRequests:[],
            posts: []
        })
        try {
            const newUser =await user.save()
            res.status(201).json(newUser)
        } catch (err) {
            res.status(400).json({message: err.message})
        }
        
    } catch (error) {
        res.send('Error on saving password.')
    }
})
//CREATE NEW USER/SIGN-UP

router.patch('/:id', checkAuthenticated,getUser, async (req,res)=>{
    if(req.body.email!=null){
        res.user.email=req.body.email
    }
    if(req.body.password!=null){
        res.user.password=req.body.password
    }

    try {
        const updatedUser = await res.user.save()
        res.json(updatedUser)
    } catch (err) {
        res.status(400).json({message: err.message})
    }
})
//UPDATE USER CREDENTIALS
router.patch('/:id/newPost',checkAuthenticated,getUser, async (req,res)=>{
    
    console.log("----------------------------------")
    console.log("PATCHING "+req.params.id)
    console.log(req.body.author)
    console.log(req.body.date)
    console.log(req.body.caption)
    console.log(req.body.comments)
    console.log(req.body.likes)
    console.log(req.body.picture)
    console.log("-----------------------------------")
    
    const newPost = {
        author: req.body.author,
        date: req.body.date,
        caption: req.body.caption,
        comments: req.body.comments,
        likes: req.body.likes,
        picture: req.body.picture
    }
    console.log(res.user.posts)
    let currentPosts=res.user.posts;
    currentPosts.push(newPost);
    
    console.log("New Post "+currentPosts)
    res.user.posts=currentPosts;

    try {
        const updatedUser = await res.user.save()
        res.json(updatedUser)
    } catch (err) {
        res.status(400).json({message: err.message})
    }
})
//ADD POST
router.delete('/:id/posts/:postIndex',checkAuthenticated,getUser, async (req,res)=>{
    
    let postID=req.params.postIndex
    
    console.log(res.user.posts)
    let currentPosts=res.user.posts;
    currentPosts.splice(postID, 1); 
    
    res.user.posts=currentPosts;

    try {
        const updatedUser = await res.user.save()
        res.json(updatedUser)
    } catch (err) {
        res.status(400).json({message: err.message})
    }
})
//DELETE POST
router.delete('/:id',checkAuthenticated,getUser, async(req,res)=>{
   try {
       await res.user.remove()
       res.json({message: 'Deleted User'})
   } catch (error) {
       res.status(500).json({message: err.message})
   }
})
//DELETE USER

async function getUser(req,res,next){
    let user
    try {
        user= await User.findById(req.params.id)
    
        if(user==null){
            return res.status(404).json({message: "Cannot find"})
        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }

    res.user=user
    next()
}

function verifyToken(req,res,next){
    const bearerHeader=req.headers['authorization'];
    if(typeof bearerHeader!=='undefined'){
        const bearer=bearerHeader.split(" ");
        const bearerToken=bearer[1]
        req.token=bearerToken
        next()
    }else{
        res.sendStatus(403);
    }
}

function checkAuthenticated(req,res,next){
  
    if(req.isAuthenticated()){
        return next()
    }
    res.json({message: 'Please log in'})
}
function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        res.send('log out first')
    }
    next()
}

//PASSPORT
module.exports =router