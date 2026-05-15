const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'formSubmissions';
const COLLECTION = 'submissions';

let db;

// Connect to MongoDB
async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('Connected to MongoDB');
}

// POST - Create new submission
app.post('/submissions', async (req, res) => {
  try {
    const data = req.body;
    data.createdAt = new Date().toISOString();
    data.modifiedAt = new Date().toISOString();
    const result = await db.collection(COLLECTION).insertOne(data);
    res.json({ 
      success: true, 
      submissionId: result.insertedId 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET - Fetch submission by ID
app.get('/submissions/:id', async (req, res) => {
  try {
    const result = await db.collection(COLLECTION).findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT - Update existing submission
app.put('/submissions/:id', async (req, res) => {
  try {
    const data = req.body;
    data.modifiedAt = new Date().toISOString();
    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: data }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
connectDB().then(() => {
  app.listen(3000, () => console.log('API running on port 3000'));
});
