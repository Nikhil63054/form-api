const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'formSubmissions';
const COLLECTION = 'submissions';

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'API is running' });
});

// POST - Create new submission
app.post('/submissions', async (req, res) => {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const data = req.body;
    data.createdAt = new Date().toISOString();
    data.modifiedAt = new Date().toISOString();
    const result = await db.collection(COLLECTION).insertOne(data);
    await client.close();
    res.json({ success: true, submissionId: result.insertedId });
  } catch (err) {
    console.log('POST error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET - Fetch submission by ID
app.get('/submissions/:id', async (req, res) => {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const result = await db.collection(COLLECTION).findOne({
      _id: new ObjectId(req.params.id)
    });
    await client.close();
    res.json({ success: true, data: result });
  } catch (err) {
    console.log('GET error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT - Update existing submission
// PUT - Update existing submission
app.put('/submissions/:id', async (req, res) => {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const body = req.body;
    
    // Build dot notation for nested fields object
    const updateData = {};
    if (body.fields) {
      Object.keys(body.fields).forEach(key => {
        updateData[`fields.${key}`] = body.fields[key];
      });
    } else {
      Object.keys(body).forEach(key => {
        updateData[key] = body[key];
      });
    }
    updateData.modifiedAt = new Date().toISOString();

    console.log('Updating ID:', req.params.id);
    console.log('Update data:', JSON.stringify(updateData));

    const result = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    console.log('Update result:', JSON.stringify(result));
    await client.close();
    res.json({ 
      success: true, 
      matchedCount: result.matchedCount, 
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    console.log('PUT error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
