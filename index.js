const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

//___MiddleWare___\\
app.use(cors());
app.use(express.json());

/* ... */
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.izfe9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

/* -------------------------------------------------------------------------- */
async function run() {
  try {
    client.connect();
    const serviceCollection = client
      .db("Car_ware_Tools")
      .collection("services");

    const orderCollection = client
      .db("Car_ware_Tools")
      .collection("orders");

    //   _________Services_Collection_________
    app.get("/service", async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const result = await serviceCollection
        .find({ _id: ObjectId(id) })
        .toArray();
      res.send(result);
    });

    //   _________Orders_Collection_POST_________
    app.post("/order", async (req, res) => {
     const result = await orderCollection.insertOne(req.body)
     res.send(result) 
    });
    //   _________Orders_Collection_GET_________
    app.get("/order", async (req, res) => {
      const email = req.query.email 
     const result = await orderCollection.find({userEmail: email}).toArray()
     res.send(result) 
    });


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
/* -------------------------------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("Project is running");
});

app.listen(port, () => {
  console.log(`Project Running Braked port ${port}`);
});
