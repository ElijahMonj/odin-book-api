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
    if(req.body.firstName!=null){
        res.user.firstName=req.body.firstName
    }
    if(req.body.lastName!=null){
        res.user.lastName=req.body.lastName
    }

    try {
        const updatedUser = await res.user.save()
        res.json(updatedUser)
    } catch (err) {
        res.status(400).json({message: err.message})
    }
})

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