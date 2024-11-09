const express = require("express");
const {authMiddleware} = require("../middleware/authmiddleware.js");
const {Account} = require("../database/db.js");
const {default: mongoose} = require("mongoose");

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
  
    const account = await Account.findOne({userId: req.userId});
    
    if(account){
        res.json({balance: account.balance});
    }
    else{
        res.status(400).json({error: "Account not found"});
    }
})

router.post("/transfer" , authMiddleware , async (req , res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const {to , amount} = req.body;
    const account = await Account.findOne({userId: req.userId}).session(session);

    if(!account || account.balance < amount){
        await session.abortTransaction();
        res.status(400).json({error: "Insufficient balance"});
        return;
    }

  const toAccount = await Account.findOne({userId: to}).session(session);
    if(!toAccount){
        await session.abortTransaction();
        res.status(400).json({error: "Account not found"});
        return;
    }

    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);


    await session.commitTransaction();
    res.json({message: "Success"});


})
module.exports = router;