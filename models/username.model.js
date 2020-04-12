const mongoose = require('mongoose')
const Schema = mongoose.Schema

const usernameSchema = new Schema({
    username: { type: String, required: true },
    exercise: [{
        description: {type: String, required: true},
        duration: {type: Number, required: true},
        date: {type: Date}
    }]

},{ collection: 'Users'})

const User = mongoose.model('User', usernameSchema)

module.exports = User


