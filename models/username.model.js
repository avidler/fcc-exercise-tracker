const mongoose = require('mongoose')
const Schema = mongoose.Schema

const usernameSchema = new Schema({
    username: { type: String, required: true },

},{ collection: 'Users'})

const User = mongoose.model('User', usernameSchema)

module.exports = User


