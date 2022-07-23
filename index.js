const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
    const orderCollection = client.db("Car_ware_Tools").collection("orders");
    const userCollection = client.db("Car_ware_Tools").collection("users");
    const paymentCollection = client
      .db("Car_ware_Tools")
      .collection("payments");
    const myProfileCollection = client
      .db("Car_ware_Tools")
      .collection("myProfile");

    //   _________Services_Collection_________
    app.get("/service", async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });

    //   _________serviceCollection_POST_________
    app.post("/service", async (req, res) => {
      const result = await serviceCollection.insertOne(req.body);
      res.send(result);
    });

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const result = await serviceCollection
        .find({ _id: ObjectId(id) })
        .toArray();
      res.send(result);
    });

    // _______user_Get________
    app.get("/user", async (req, res) => {
      const result = await userCollection.find({}).toArray();
      console.log("res", result);
      res.send(result);
    });

    //   _________Orders_Collection_POST_________
    app.post("/order", async (req, res) => {
      const result = await orderCollection.insertOne(req.body);
      res.send(result);
    });
    //   _________Orders_Collection_GET_________
    app.get("/order", async (req, res) => {
      const email = req.query.email;
      const result = await orderCollection.find({ userEmail: email }).toArray();
      res.send(result);
    });

    //   _________Orders_Collection_Deleted_id_________
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const result = await orderCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });

    //  ____userCollection___Put__
    app.put("/user", async (req, res) => {
      const email = req.query.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // -------------------UpdateProfile____________
    app.put("/myProfile", async (req, res) => {
      const email = req.query.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await myProfileCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    //  __myProfileGet__
    app.get("/myProfile", async (req, res) => {
      const result = await myProfileCollection.find().toArray();
      res.send(result);
    });

    //   _________Orders_id_________
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const result = await orderCollection.findOne({ _id: ObjectId(id) });
      res.send(result);
    });

    // _____________Payment__________
    app.post("/create-payment-intent", async (req, res) => {
      const service = req.body;
      const price = service.price;
      const amount = price * 100;
      console.log(price);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // _________________patch_______________
    app.patch("/payment/:id", async (req, res) => {
      const id = req.params.id;
      const payment = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };
      const result = await paymentCollection.insertOne(payment);
      const updatedBooking = await orderCollection.updateOne(filter, updateDoc);
      res.send(updateDoc);
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
