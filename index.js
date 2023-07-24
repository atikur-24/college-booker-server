const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_SECRET}@cluster0.28gkq0d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const database = client.db("collegeBooker");
    const collegeCollection = database.collection("colleges");
    const candidateDataCollection = database.collection("candidatesData");
    const feedbackCollection = database.collection("feedback");

    // Creating index on college name
    const indexKeys = { name: 1 };
    const indexOptions = { name: "name" };
    const result = await collegeCollection.createIndex(indexKeys, indexOptions);
    console.log(result);
    app.get("/getByName/:text", async (req, res) => {
      const name = req.params.text;
      const result = await collegeCollection
        .find({ college_name: { $regex: name, $options: "i" } })
        .toArray();
      res.send(result);
    });

    app.get("/colleges", async (req, res) => {
      const result = await collegeCollection.find().toArray();
      res.send(result);
    });

    app.get("/feedback", async (req, res) => {
      const result = await feedbackCollection.find().toArray();
      res.send(result);
    });

    app.get("/colleges/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await collegeCollection.findOne(query);
      res.send(result);
    });

    app.get("/candidatesInfo/:email", async (req, res) => {
      const email = req.params.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await candidateDataCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/candidatesInfo", async (req, res) => {
      const result = await candidateDataCollection.find().toArray();
      res.send(result);
    });

    app.post("/candidatesInfo", async (req, res) => {
      const data = req.body;
      const result = await candidateDataCollection.insertOne(data);
      res.send(result);
    });

    app.post("/feedback", async (req, res) => {
      const feedback = req.body;
      const result = await feedbackCollection.insertOne(feedback);
      res.send(result);
    });

    app.put("/candidatesInfo/:email", async (req, res) => {
      const email = req.params.email;
      const updatedData = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateCandidate = {
        $set: {
          candidate_name: updatedData.candidate_name,
          candidate_email: updatedData.candidate_email,
          college_name: updatedData.college_name,
          address: updatedData.address,
        },
      };
      const result = await candidateDataCollection.updateOne(filter, updateCandidate, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("College Booker Server is Running....");
});

app.listen(port, () => {
  console.log(`college booker server is running on port ${port}`);
});
