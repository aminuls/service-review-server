const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
   res.send("Wild Photo Server is Running");
});
// Database
const uri = process.env.DB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
   const authHeader = req.headers.authorization;
   if (!authHeader) {
      return res.status(401).send({ message: "Unauthorized Access" });
   }
   const token = authHeader.split(" ")[1];
   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
         return res.status(401).send({ message: "Unauthorized Access" });
      }
      req.decoded = decoded;
      next();
   });
}

async function run() {
   try {
      const serviceCollection = client.db("wild-photo").collection("services");
      const allReviewCollection = client.db("wild-photo").collection("all-review");
      app.get("/servehome", async (req, res) => {
         const query = {};
         const serviceHome = await serviceCollection.find(query).sort({ _id: -1 }).limit(3).toArray();
         res.send(serviceHome);
      });
      app.get("/services", async (req, res) => {
         const query = {};
         const serviceHome = await serviceCollection.find(query).toArray();
         res.send(serviceHome);
      });
      app.post("/services", verifyJWT, async (req, res) => {
         const addServiceBody = req.body;
         const addService = await serviceCollection.insertOne(addServiceBody);
         res.send(addService);
      });
      app.get("/services/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const serviceOne = await serviceCollection.findOne(query);
         res.send(serviceOne);
      });
      app.post("/insreview", async (req, res) => {
         const review = req.body;
         review.date = new Date().toLocaleDateString("bn-BD");
         review.time = new Date().toLocaleTimeString("bn-BD");
         review.timeInMili = new Date().getTime();
         console.log(review);
         const addedReview = await allReviewCollection.insertOne(review);
         res.send(addedReview);
      });
      app.get("/insmyreview/:email", verifyJWT, async (req, res) => {
         const email = req.params.email;
         const query = { email: email };
         const myReview = await allReviewCollection.find(query).toArray();
         res.send(myReview);
      });
      app.get("/insreview/:id", async (req, res) => {
         const id = req.params.id;
         // console.log(id);
         const query = { service_id: id };
         const serviceReview = await allReviewCollection.find(query).sort({ timeInMili: -1 }).toArray();
         res.send(serviceReview);
         // console.log(serviceReview);
      });
      app.delete("/delete/:id", verifyJWT, async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const deleted = await allReviewCollection.deleteOne(query);
         res.send(deleted);
      });
      app.patch("/update/:id", verifyJWT, async (req, res) => {
         const id = req.params.id;
         const updatedData = req.body;
         const query = { _id: ObjectId(id) };
         const updated = await allReviewCollection.updateOne(query, { $set: updatedData }, { upsert: false });
         // console.log(updatedData);
         // console.log(updated);
         res.send(updated);
      });
      app.get("/modal/:id", verifyJWT, async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const modalData = await allReviewCollection.findOne(query);
         res.send(modalData);
      });
   } finally {
   }
}

run().catch((err) => console.error(err));

app.listen(port, () => {
   console.log(`Wild Photo server is running on Port ${port}`);
});
