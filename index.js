const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db('collegeBooker');
    const collegeCollection = database.collection('colleges');
    const candidateDataCollection = database.collection('candidatesData');

    app.get('/colleges', async(req, res) => {
        const result = await collegeCollection.find().toArray();
        res.send(result)
    })

    app.get('/colleges/:id', async(req, res) => {
        const id = req.params.id;
        const query = { id: new ObjectId(id) };
        const result = await collegeCollection.findOne(query).toArray();
        res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('College Booker Server is Running....')
})

app.listen(port, () => {
    console.log(`college booker server is running on port ${port}`);
})