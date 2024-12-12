import mysql from 'mysql';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import fs from "fs";
import path from "path";



const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));

// const upload = multer({ dest: "uploads/" });

// Create MySQL connection
const con = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bitewise_db',
});

// Connect to the database
con.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

app.post('/Signup', async (req, res) => {
  try {
    const { password } = req.body;
    const pass = password.join('');
    const pas = await bcrypt.hash(pass, 10);

    console.error(pas);

    const sql = "INSERT INTO user_table (email, firstName, lastName, password) VALUES (?, ?, ?, ?)";
    const values = [
      req.body.email,
      req.body.firstName,
      req.body.lastName,
      pas,
    ];

    con.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error inserting data into the database:', err);
        return res.status(500).json({ error: 'Error inserting data', details: err });
      }

      return res.status(200).json({ message: 'User data inserted successfully', result });
    });

  } catch (err) {
    console.error('Error processing request:', err);
    return res.status(500).json({ error: 'Error processing request', details: err });
  }
});

app.post('/Login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const sql = "SELECT * FROM user_table WHERE email = ?";
    const values = [email];

    con.query(sql, values, async (err, result) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({ error: 'Error querying the database', details: err });
      }

      // If no user is found with the given email
      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Retrieve the hashed password from the database
      const hashedPassword = result[0].password;

      // Ensure both the password and hashedPassword are strings
      const isPasswordValid = await bcrypt.compare(String(password), String(hashedPassword));

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Return user data if login is successful
      return res.status(200).json({
        message: 'Login successful',
        user: {
          email: result[0].email,
          firstName: result[0].firstName,
          lastName: result[0].lastName,
        },
      });
    });

  } catch (err) {
    console.error('Error processing request:', err);
    return res.status(500).json({ error: 'Error processing request', details: err });
  }
});

app.get('/Restaurants', (req, res) => {
  const query = 'SELECT restaurant_name, location, cuisine, starting_time, ending_time, minprice, maxprice, restaurant_images FROM restaurant_table';
  con.query(query, (error, results) => {
      if (error) {
          console.error('Error fetching data:', error.stack);
          return res.status(500).send('Error fetching data');
      }
      const processedResults = results.map((restaurant) => ({
          ...restaurant,
          restaurant_images: restaurant.restaurant_images||null,
              
      }));

      res.json(processedResults);
  });
});


// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});





// Folder containing the images
const imageFolder = "./src/assets/restaurant_images";
app.get("/Restaurants", (req, res) => {
  const query = "SELECT restaurant_id, restaurant_name, location, cuisine, starting_time, ending_time, minprice, maxprice FROM restaurant_table";
  con.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching data:", error);
      return res.status(500).send("Error fetching data");
    }
    res.json(results);
    console.log(res.json(results))
  });
});

// Serve image for a specific restaurant
app.get("/Restaurants/:id/image", (req, res) => {
  const restaurantId = req.params.id;
  const query = "SELECT restaurant_images FROM restaurant_table WHERE restaurant_id = ?";
  con.query(query, [restaurantId], (error, results) => {
    if (error) {
      console.error("Error fetching image:", error);
      return res.status(500).send("Error fetching image");
    }
    if (results.length > 0 && results[0].restaurant_images) {
      res.setHeader("Content-Type", "image/png");
      res.send(results[0].restaurant_images);
    } else {
      res.status(404).send("Image not found");
    }
  });
});
