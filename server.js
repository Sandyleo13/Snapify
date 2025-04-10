import 'dotenv/config'; // Load environment variables
import express from 'express';
import supabase from './config/supabaseClient.js'; // Use ES module import
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Parse JSON requests

console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.SUPABASE_ANON_KEY);
console.log('JWT Secret:', process.env.JWT_SECRET);

// Test route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Test Supabase connection
app.get('/test-supabase', async (req, res) => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        console.error('Error fetching data:', error);
        return res.status(500).send('Error connecting to Supabase');
    }
    res.json(data);
});

app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const { data, error } = await supabase.from('users').insert([{ email, password: hashedPassword }]);
        if (error) throw error;

        res.status(201).json({ message: 'User registered successfully', user: data });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Login request received:', { email, password }); // Log the request body

        const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
        console.log('Supabase response:', { data, error }); // Log the response from Supabase

        if (error || !data) {
            console.log('User not found or error occurred');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, data.password);
        console.log('Password comparison result:', isPasswordValid); // Log the password comparison result

        if (!isPasswordValid) {
            console.log('Password mismatch');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: data.id, email: data.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('JWT token generated:', token); // Log the generated token

        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in user:', error.message); // Log the error message
        console.error('Error stack trace:', error.stack); // Log the error stack trace
        res.status(500).json({ error: 'Error logging in user' });
    }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user; // Attach the user info to the request object
        next();
    });
};

app.post('/api/cameras', authenticateToken, async (req, res) => {
    const { name, location } = req.body;

    try {
        const { data, error } = await supabase.from('cameras').insert([{ name, location }]);
        if (error) throw error;

        res.status(201).json({ message: 'Camera added successfully', camera: data });
    } catch (error) {
        console.error('Error adding camera:', error);
        res.status(500).json({ error: 'Error adding camera' });
    }
});

app.get('/api/cameras', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase.from('cameras').select('*');
        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching cameras:', error);
        res.status(500).json({ error: 'Error fetching cameras' });
    }
});

app.post('/api/photos', authenticateToken, async (req, res) => {
    const { camera_id, url } = req.body;

    try {
        const { data, error } = await supabase.from('photos').insert([{ camera_id, url }]);
        if (error) throw error;

        res.status(201).json({ message: 'Photo uploaded successfully', photo: data });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ error: 'Error uploading photo' });
    }
});

app.get('/api/photos', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase.from('photos').select('*');
        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: 'Error fetching photos' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});