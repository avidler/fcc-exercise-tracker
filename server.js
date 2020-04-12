'user strict';

const express = require('express')

const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')

let User = require('./models/username.model')

require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

const bodyParser = require('body-parser')
const shortid = require('shortid')
var router = express.Router();

const uri = process.env.ATLAS_URI

mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true})


const connection = mongoose.connection
connection.once('open', () => {
    console.log("MongoDB database connection established successfully")
})


app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.get('/api/exercise/users', (req, res) => {
  User.find()
  .then((result) => res.json(result))
  .catch(err => res.status(400).json('Error: ' + err))

});


app.post('/api/exercise/new-user', (req, res) => {
  const username = req.body.username
  
  const newUser = new User({username})
  newUser.save()
  .then(() => res.json(newUser))
  .catch(err => res.status(400).json('Error: ' + err))
  
});

app.post('/api/exercise/add', (req, res) => {
  let userId = req.body.userId
  let description = req.body.description
  let duration = req.body.duration
  if (req.body.date) {var date = new Date(req.body.date)} else {var date = new Date()}
 
  User.findOne({_id:userId}, function(err, data) {

    if (data) {
      const newExercise = {
        username: data.username,
        description,
        duration: +duration,
        _id: userId,    
        date: date.toDateString()

      
      }
    
      console.log(newExercise)

      const newExerciseDetails = {
        description,
        duration: +duration,
        date: date.toDateString()
      }
      
      User.findByIdAndUpdate(
        {_id:userId},
        {$push: {newExerciseDetails}},
        {safe: true, new: true, upsert: true}
        )
    
      res.json(newExercise);
    }

  })

  
 

  

})




app.get('/api/exercise/log/', (req, res) => {
  let userId = req.query.userId
  let fromDate = new Date(req.query.from)
  let toDate = new Date(req.query.to)
  let limit = req.query.limit ? parseInt(req.query.limit) : 0
  
  User.findOne({_id:userId})
  .then((user) => {
    let username = user.username
    let log = user.exercise
    if (fromDate) {results.filter((item) => item.date >= fromDate)}
    if (toDate) {results.filter((item) => item.date <= toDate)}
    if (limit > 0) {results = results.slice(0, +limit)}
    console.log("results.length: ", results.length)
    res.json({
      _id: userId, 
      username,
      count: log.length,
      log
    })
  })
   
  
})


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
