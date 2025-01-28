const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const PORT = 5175;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


// Mock database to store users and verification codes
let users = [];
let verificationCodes = {};

// Predefined list of allergies
const allergiesList = [
    'Peanuts', 
    'Shellfish', 
    'Gluten', 
    'Lactose', 
    'Soy', 
    'Eggs', 
    'Fish', 
    'Tree nuts',
    'Milk',
    'Wheat',
    'Sesame seeds',
    'Sulfites',
    'Mustard',
    'Corn',
    'Red meat',
    'Caffeine',
    'Alcohol',
    'Latex',
    'Nickel',
    'Pollen',
    'Dust mites',
    'Pet dander',
    'Mold',
    'Insect stings',
    'Medication (Penicillin)',
    'Medication (Aspirin)',
    'Medication (Ibuprofen)',
    'Medication (Sulfa drugs)',
    'Medication (Chemotherapy)',
    'Medication (Insulin)',
    'Medication (Codeine)',
    'Medication (Local anesthetics)'
];

// Route to add a user
app.post('/addUser', (req, res) => {
    const { name, email, phone, allergies } = req.body;
    
    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Please provide name, email, and phone number' });
    }
    
    const newUser = {
        id: users.length + 1,
        name,
        email,
        phone,
        allergies: allergies || []
    };
    
    users.push(newUser);
    
    res.status(201).json(newUser);
});

// Route to update user email
app.put('/updateUserEmail/:id', (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    
    const user = users.find(user => user.id === parseInt(id));
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const verificationCode = generateVerificationCode();
    verificationCodes[id] = { code: verificationCode, type: 'email' };
    console.log("TZ", verificationCodes)
    
    // Simulate sending verification code back to the user
    return res.json({ verificationCode });
});

// Route to update user phone
app.put('/updateUserPhone/:id', (req, res) => {
    const { id } = req.params;
    const { phone } = req.body;
    
    const user = users.find(user => user.id === parseInt(id));
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const verificationCode = generateVerificationCode();
    verificationCodes[id] = { code: verificationCode, type: 'phone' };
    
    // Simulate sending verification code back to the user
    return res.json({ verificationCode });
});

// Route to verify the code and update user email
app.put('/verifyAndUpdateEmail/:id', (req, res) => {
    const { id } = req.params;
    const { email, verificationCode } = req.body;
    
    const user = users.find(user => user.id === parseInt(id));
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const storedVerificationCode = verificationCodes[id];
    console.log("WHAT WE HAVE",storedVerificationCode, storedVerificationCode.code, storedVerificationCode.type, verificationCode)
    if (!storedVerificationCode || storedVerificationCode.code != verificationCode || storedVerificationCode.type != 'email') {
        return res.status(403).json({ error: 'Invalid verification code' });
    }
    
    // Clear the verification code
    delete verificationCodes[id];
    
    user.email = email;
    res.json(user);
});

// Route to verify the code and update user phone
app.put('/verifyAndUpdatePhone/:id', (req, res) => {
    const { id } = req.params;
    const { phone, verificationCode } = req.body;
    
    const user = users.find(user => user.id === parseInt(id));
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const storedVerificationCode = verificationCodes[id];
    if (!storedVerificationCode || storedVerificationCode.code != verificationCode || storedVerificationCode.type != 'phone') {
        return res.status(403).json({ error: 'Invalid verification code' });
    }
    
    // Clear the verification code
    delete verificationCodes[id];
    
    user.phone = phone;
    res.json(user);
});

// Route to get all users
app.get('/users', (req, res) => {
    res.json(users);
});

app.put('/updateUserAllergies/:id', (req, res) => {
  const userId = req.params.id;
  const { allergies } = req.body;

  // Find the user by ID
  const user = users.find(user => user.id === parseInt(userId));

  if (!user) {
      return res.status(404).json({ message: 'User not found' });
  }

  // Update user allergies
  user.allergies = allergies;

  res.json({ message: 'User allergies updated successfully', user });
});

// Route to get list of allergies
app.get('/allergies', (req, res) => {
    const { search } = req.query;
    if (search) {
        const filteredAllergies = allergiesList.filter(allergy =>
            allergy.toLowerCase().includes(search.toLowerCase())
        );
        res.json(filteredAllergies);
    } else {
        res.json(allergiesList);
    }
});

// Helper function to generate random 6-digit code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
