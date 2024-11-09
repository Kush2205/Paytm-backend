const express = require("express");
const router = express.Router();
const zod = require("zod");
const env = require("dotenv");
const jwt = require("jsonwebtoken");
const { User, Account } = require("..//database/db.js");
const { authMiddleware } = require("../middleware/authmiddleware.js");

const userschema = zod.object({
  username: zod.string().email(),
  firstname: zod.string(),
  lastname: zod.string(),
  password: zod.string(),
});

const signSchemma = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});
let token;
env.config();
const secret = String(process.env.JWT_SECRET);

router.post("/signup", async (req, res) => {
  const { success } = userschema.safeParse(req.body);

  if (success) {
    try {
      const { username, firstname, lastname, password } = req.body;

      async function checkUser() {
        try {
          const data = await User.findOne({
            username: username,
            password: password, 
          });
          return data ? false : true;
        } catch (err) {
          return false;
        }
      }

      if (await checkUser()) {
        const user = new User({ username, firstname, lastname, password });
        await user.save();
        const userid = user._id;

         token = jwt.sign({ userid: userid }, secret);
          await Account.create({ userId: userid, balance: 1+Math.floor(Math.random() * 1000) });
        res.json({ msg: "Success", token: token });
      } else {
       
        res.status(400).json({ error: "User already exists", token: token });
      }
    } catch (error) {
      res.status(400).json({ error: error });
    }
  } else {
    res.status(400).json({ error: "Invalid data" });
  }
});

router.post("/signin", async (req, res) => {
  const { success } = signSchemma.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: "Invalid data" });
  }
  const { username, password } = req.body;
  try {
    const data = await User.findOne({ username, password });
    if (data) {
      const token = jwt.sign({userid : data._id}, secret);
      res.status(200).json({ msg: "Success" , token : token});
    } else {
      res.status(400).json({ error: "Invalid username or password" });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
});


const updateSchema = zod.object({
  password : zod.string().optional(),
  firstname : zod.string().optional(),
  lastname : zod.string().optional()
})

router.put("/update" ,authMiddleware, async (req , res) => {
  const {success} = updateSchema.safeParse(req.body);
  if(!success){
    return res.status(400).json({error : "Invalid data 1"});
  }
  const {password , firstname , lastname} = req.body;
  const userid = req.userId;
  try {
     await User.updateOne({_id: userid }, req.body)
  
    res.json({msg : "Updated"});
  } catch (error) {
    res.status(400).json({error : error});
  }
})

router.get("/bulk" , async (req , res) => {
  const filter = req.query.filter || "";
  
  const users = await User.find({
    $or : [{
      firstname : {
        $regex : filter,
        $options : "i"
      }
    },{
      lastname : {
        $regex : filter,
        $options : "i"
      }
    },]
  })

  res.json({user: users.map(user => {
    return {
      id : user._id,
      firstname : user.firstname,
      lastname : user.lastname,
      username : user.username
    }
  })})
})





module.exports = router;
