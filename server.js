require('dotenv').config()
const express=require('express')
const app =express()
const mongoose=require('mongoose')

mongoose.connect("mongodb+srv://admin:admin@cluster0.3hfbcxb.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser:true,dbName:'odin-book'})
const db=mongoose.connection
db.on('error', (error)=>console.error(error))
db.once('open', ()=>console.error("Connected to database"))

app.use(express.json())

const usersRouter = require('./routes/users')
app.use('/users',usersRouter)


app.listen(3000, ()=>console.log("Server Started"))