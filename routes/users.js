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


initializePassport(
    passport,
    async function email(){
    const users = await User.find()
    console.log('Initializing passport....')
    return users.find(user=>user.email===email)
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



router.post('/login',passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true
}))


router.get('/' , async (req,res)=>{

    let account="no account";
    console.log("Logged in as: "+account)
    try {
        const users= await User.find()
        res.json(users)
    } catch (err) {
        res.status(500).json({message : err.message})
    }

})
//GET ALL USERS
router.get('/:id', getUser,(req,res)=>{
    res.json(res.user)
})
//GET SPECIFIC USER
router.get('/:id/posts', getUser,(req,res)=>{
    res.json(res.user.posts)
})
//GET ALL POSTS FROM A USER
router.get('/:id/posts/:postIndex', getUser,(req,res)=>{
    let postID=req.params.postIndex
    console.log(postID)
    res.json(res.user.posts[postID])
})
//GET SPECIFIC POST
router.patch('/:id/posts/:postIndex/newComment', getUser,async(req,res)=>{
    
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

router.patch('/:id', getUser, async (req,res)=>{
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
router.patch('/:id/newPost', getUser, async (req,res)=>{
    
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
router.delete('/:id/posts/:postIndex', getUser, async (req,res)=>{
    
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
router.delete('/:id', getUser, async(req,res)=>{
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



//PASSPORT
module.exports =router