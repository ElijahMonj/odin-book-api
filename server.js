require('dotenv').config()
const express=require('express')
const app =express()
const mongoose=require('mongoose')


const cors = require('cors');

mongoose.connect("mongodb+srv://admin:admin@cluster0.3hfbcxb.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser:true,dbName:'odin-book'})
const db=mongoose.connection
db.on('error', (error)=>console.error(error))
db.once('open', ()=>console.error("Connected to database"))
app.use(cors());
app.use(express.json())

const usersRouter = require('./routes/users')
app.use('/users',usersRouter)
app.set("views", __dirname);


app.use(express.urlencoded({ extended: false }));
const port=process.env.PORT || 3002
app.listen(port, ()=>console.log("Server Started at port "+port))