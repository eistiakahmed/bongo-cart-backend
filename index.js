const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB URL
const uri = process.env.Secret_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

async function run() {
  try {
    // await client.connect();

    const db = client.db('bongoCart_DB');
    const fashionCollection = db.collection('fashionCollection');
    const orderCollection = db.collection('orderCollection');

    // Latest 6 products
    app.get('/latest_fashion', async (req, res) => {
      const result = await fashionCollection
        .find()
        .limit(6)
        .sort({ dateAdded: 'desc' })
        .toArray();
      res.send(result);
    });

    // Product Get Method
    app.get('/fashion', async (req, res) => {
      const result = await fashionCollection.find().toArray();
      res.send(result);
    });

    // Single Product Apis
    app.get('/fashion/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await fashionCollection.findOne(query);
      res.send(result);
    });

    // Post Apis
    app.post('/fashion', async (req, res) => {
      const newProduct = req.body;
      const result = await fashionCollection.insertOne(newProduct);
      res.send(result);
    });

    // Search by Title
    app.get('/searchName', async (req, res) => {
      const search_text = req.query.search;
      const query = search_text
        ? { title: { $regex: search_text, $options: 'i' } }
        : {};

      const result = await fashionCollection.find(query).toArray();
      res.send(result);
    });

    // Order Collection APis
    app.post('/fashionOrders', async (req, res) => {
      const newOrder = req.body;
      const result = await orderCollection.insertOne(newOrder);
      res.send(result);
    });

    // Personal Order Get Apis
    app.get('/fashionOrders', async (req, res) => {
      const email = req.query.email;
      const result = await orderCollection.find({ email: email }).toArray();
      res.send(result);
    });

    // add Products Track Apis

    app.get('/addProducts', async (req, res) => {
      try {
        const email = req.query.email;
        if (!email)
          return res.status(400).send({ message: 'Email query is required' });

        const result = await fashionCollection.find({ email }).toArray();
        res.status(200).send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Failed to fetch products' });
      }
    });

    // update APis
    app.put('/product/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const result = await fashionCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );
      res.send(result);
    });

    //  Delete APIs
    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const result = await fashionCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`BongoCart Server is running: ${port}`);
});
