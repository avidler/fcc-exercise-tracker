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
  let username = req.body.username
 console.log(username)
  const newUser = new User({username})
console.log(newUser)
  newUser.save()
  .then(() => res.json(newUser))
  .catch(err => res.status(400).json('Error: ' + err))
  
});

app.post('/api/exercise/add', (req, res, done) => {
  let userId = req.body.userId
  let description = req.body.description
  let duration = req.body.duration
  if (req.body.date) {var date = req.body.date} else {var date = new Date()}
 
  const exercise = ({description, duration, date})
  
  User.findByIdAndUpdate(
    {_id:userId},
    {$push: {exercise}},
    {safe: true, new: true, upsert: true}
    )

  .then((result) => {
    console.log(result)
    res.json(result) })
  .catch(err => res.status(400).json('Error: ' + err))
})

app.get('/api/exercise/log/:id/:from?/:to?/:limit?', (req, res) => {
  let userId = req.params.id
  let fromDate = req.query.from ? new Date(req.query.from) : 0
  let toDate = req.query.to ? new Date(req.query.to) : new Date()
  let limit = req.query.limit ? parseInt(req.query.limit) : 0
  
  User.findOne({_id:userId})
  .then((user) => {
    let username = user.username
    let results = user.exercise
    results = results.filter((item) => item.date > fromDate && item.date < toDate)
    if (limit > 0) {results = results.slice(0, limit)}
    console.log("results.length: ", results.length)
    res.json({
      _id: userId, 
      username,
      count: results.length,
      results
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
