const express=require('express')
const user = require('../models/user')
const router =express.Router()
const User=require('../models/user')


router.get('/', async (req,res)=>{
    try {
        const users= await User.find()
        res.json(users)
    } catch (err) {
        res.status(500).json({message : err.message})
    }
})

router.get('/:id', getUser,(req,res)=>{
    res.json(res.user)
})

router.get('/:id/posts', getUser,(req,res)=>{
    res.json(res.user.posts)
})
router.get('/:id/posts/:postIndex', getUser,(req,res)=>{
    let postID=req.params.postIndex
    console.log(postID)
    res.json(res.user.posts[postID])
})
router.patch('/:id/posts/:postIndex/newComment', getUser,async(req,res)=>{
    
    let postID=req.params.postIndex
    console.log(res.user.posts)
    
    const newComment={
        name:req.body.name,
        date:req.body.date,
        content:req.body.content
    }
    /*
    console.log(newComment)
    console.log("Post ID: "+postID)
    let overwriteComment= res.user.posts[postID].comments
    console.log("Previous comment: ")
    console.log(overwriteComment)
    overwriteComment.unshift(newComment)
    console.log("Updated comment: ")
    console.log(overwriteComment)

    res.user.posts[postID].comments=overwriteComment
    console.log("TO PUSH:")
    console.log(res.user.posts[postID].comments)
    */
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
router.post('/', async (req,res)=>{
    const user=new User({
        firstName:req.body.firstName,
        lastName: req.body.lastName,
        email:req.body.email,
        password: req.body.password,
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


})


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



module.exports =router