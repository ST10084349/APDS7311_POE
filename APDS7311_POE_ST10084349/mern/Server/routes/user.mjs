import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import bcrypt  from "bcrypt"
import jwt from "jsonwebtoken";
import ExpressBrute  from "express-brute";
const router = express.Router();
var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store);//store state locally, dont use this

router.get("/", async (req, res) => {
  let collection = await db.collection("users");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});


router.get("/:id", async (req, res) => {
  let collection = await db.collection("users");
  let query = {_id: new ObjectId(req.params.id)};
  let result = await collection.findOne(query); 

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

router.post("/", async (req, res) => {
  let newDocument = {
    username: req.body.username,
    password: req.body.password,

  };
  let collection = await db.collection("users");
  let result = await collection.insertOne(newDocument);
  res.send(result).status(204);
});
 
router.patch("/:id", async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };
  const updates =  {
    $set: {
      username: req.body.username,
      password: req.body.password,
    }
  };

  let collection = await db.collection("users");
  let result = await collection.updateOne(query, updates);

  res.send(result).status(200);
});

router.delete("/:id", async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };

  const collection = db.collection("users");
  let result = await collection.deleteOne(query);

  if (result.deletedCount === 1) {
    res.status(200).send({ message: "The user was successfully deleted " });
  } else {
    res.status(404).send({ message: "Did not find the user with that is matched with that Id." });
  }
}); 

router.post("/signup",async(req,res) => {
  const password = bcrypt.hash(req.body.password,10)
  let newDocument = {
    username: req.body.username,
    password: (await password).toString()
  };
  let collection = await db.collection("users");
  let result = await collection.insertOne(newDocument);
  console.log(password);
  res.send(result).status(204);
});


router.post("/login",bruteforce.prevent,async(req,res)=>{ 
  const{username,password} = req.body; 
  try{ 
    const collection = await db.collection("users"); 
    const user = await collection. findOne({username}); 
    if(!user){ return res.status(401).json ({message:"Authentication has failed"}); 
  } 
const passwordMatch = await bcrypt.compare(password,user.password);
if(!passwordMatch){ 
    return res.status(401).json({message:"Authentication  failed"}); 
} 
res.status(200).json({message:"Authenitcation was successful"});

const token = jwt.sign({username:req.body.username,password : req.body.password},"this_secret_should_be_longer_than_it_is",{expiresIn:"1h"})
console.log("your new token is", token) 
}catch(error) 
{ 
    console.error("login error:", error); res.status(500).json({message: "Login failed"}); 
} 
});

export default router;