const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB setup
mongoose.connect('mongodb+srv://ante:anteante@cluster0.7xpar.mongodb.net/notifications?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB', err));

// Define the schema for the 'alert' collection
const alertSchema = new mongoose.Schema({
  fallDetected: Boolean,
  timestamp: { type: Date, default: Date.now },
  location: String, // You can add more details like location, user info, etc.
});

// Create the 'alert' model based on the schema
const Alert = mongoose.model('Alert', alertSchema);

// API endpoint for receiving fall events from ESP32
app.post('/api/fall-detected', async (req, res) => {
  const { fallDetected, location } = req.body;
  
  if (fallDetected !== undefined) {
    try {
      // Save fall event to MongoDB in the 'alert' collection
      const newAlert = new Alert({ fallDetected, location });
      await newAlert.save();

      // Here, send a push notification or any other alert method
      console.log('Fall detected, notification triggered');
      res.status(200).json({ message: 'Fall detected and saved!' });

      // Trigger notification to mobile app (this will be done using an HTTP request in the mobile app)
      // You can use a library or API like OneSignal, Pusher, etc., for push notifications here.

    } catch (error) {
      console.error('Error saving fall event:', error);
      res.status(500).json({ error: 'Error saving fall event' });
    }
  } else {
    res.status(400).json({ error: 'Invalid data, fallDetected is required' });
  }
});

// Endpoint to fetch notifications (alerts)
app.get('/api/notifications', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 }); // Sort by most recent alert
    res.status(200).json({ alerts });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
