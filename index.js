const express = require("express");
const cors = require("cors");
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

async function run() {
   try {
      const serviceCollection = client.db("wild-photo").collection("services");
      const allReviewCollection = client.db("wild-photo").collection("all-review");
      app.get("/servehome", async (req, res) => {
         const query = {};
         const serviceHome = await serviceCollection.find(query).limit(3).toArray();
         res.send(serviceHome);
      });
      app.get("/services", async (req, res) => {
         const query = {};
         const serviceHome = await serviceCollection.find(query).toArray();
         res.send(serviceHome);
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
      app.get("/insmyreview/:email", async (req, res) => {
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
      app.delete("/delete/:id", async(req, res)=>{
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const deleted = await allReviewCollection.deleteOne(query);
         console.log("dakdakk");
         res.send(deleted);
      })
   } finally {
   }
}

run().catch((err) => console.error(err));

app.listen(port, () => {
   console.log(`Wild Photo server is running on Port ${port}`);
});
