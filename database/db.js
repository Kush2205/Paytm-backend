const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const url = process.env.MONGO_URL;
mongoose.connect(url);

const userSchema = mongoose.Schema({username : String , firstname : String , lastname : String , password : String
})

const accountSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance :{
        type : Number,
        required : true
    }
})
const User = mongoose.model("User" , userSchema)
const Account = mongoose.model("Account" , accountSchema)
module.exports = {User , Account}