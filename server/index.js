'use strict';

// imports
const express = require('express'); // web server
const morgan = require('morgan');   // logging middleware
const { check, validationResult } = require('express-validator');
const cors = require('cors');
const contentDao = require('./src/daos/contentDao');
const userDao = require('./src/daos/access');
//jwt token
const jsonwebtoken = require('jsonwebtoken');
const jwtSecret = '47e5edcecab2e23c8545f66fca6f3aec8796aee5d830567cc362bb7fb31adafc';
const expireTime = 25; //seconds

/*** Initialize express and set up middlewares ***/
const app = express();
app.use(morgan('dev'));
app.use(express.json());

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

/*** Passport ***/

/** Authentication-related imports **/
const passport = require('passport'); // authentication middleware
const LocalStrategy = require('passport-local'); // authentication strategy (username and password)

/** Set up authentication strategy to find a user with matching credentials in the DB **/
passport.use(new LocalStrategy(async function(username, password, callback) {
  const user = await userDao.getLogin(username, password);
  if (!user)
    return callback(null, false, 'Incorrect username or password');

  return callback(null, user); // user info stored in the session (fields returned by userDao.getUser, e.g., id, username, name)
}));

// Serialize user object into the session
passport.serializeUser(function(user, callback) {
  callback(null, user);
});

// Deserialize user object from session data
passport.deserializeUser(function(user, callback) {
  callback(null, user); // makes user available in req.user
});

/** Create session **/
const session = require('express-session');

app.use(session({
  secret: "586e60fdeb6f34186ae165a0cea7ee1dfa4105354e8c74610671de0ef9662191",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: app.get('env') === 'production' // use secure: true only in production with HTTPS
  }
}));

app.use(passport.authenticate('session'));

/** Define authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authorized' });
};

/*** Utility Functions ***/

const maxTitleLength = 160;

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};

/*** APIs CALL ***/

// Get token API endpoint
/*I used POST instead of GET because when the user creates a ticket and sends it here, the token is generated and then sent to the client. 
To ensure that the token expires after 25 seconds in case it is intercepted by a hacker and used beyond that timeframe, a new token request must be made.*/
app.post('/api/auth-token', isLoggedIn, async (req, res) => {  
  const role = req.user.role;
  const verifiedRole = req.body.role;
  let fullData = req.body;
  console.log("role", fullData)
  // Verify that the role received matches the user's role
  if (role !== verifiedRole) {
    return res.status(403).json({ error: 'Role mismatch' });
  }
  // Check if fullData is not empty
  if (!fullData || Object.keys(fullData).length === 0) {
    return res.status(400).json({ error: 'Request body is empty' });
  }
  if (role === 1) { // Assuming role 1 is admin
    try {
      const normalData = await contentDao.getPublicData();

      // Process the normalData
      fullData = normalData.map(ticket => {
        console.log("normalData", ticket.title, ticket.category);
        const titleLength = ticket.title.replace(/\s/g, '').length;
        const categoryLength = ticket.category.replace(/\s/g, '').length;
        return {
          ticket_id: ticket.ticket_id,
          charCount: titleLength + categoryLength
        };
      });

      // Include the processedData in the payload
      const payloadToSign = { fullData, role };
      const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, { expiresIn: expireTime });
      return res.json({ token: jwtToken });

    } catch (err) {
      return res.status(500).json({ error: 'Error fetching normal data' });
    }
  } else {
    const payloadToSign = { fullData, role };
    const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, { expiresIn: expireTime });
    return res.json({ token: jwtToken });
  }
});




// Create ticket API endpoint
app.post('/api/createtickets', isLoggedIn, (req, res) => {  
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const createTicketInfo = req.body;

  contentDao.createTicket(createTicketInfo, req.user.user_id)
    .then(() => {
      res.status(200).json({ message: "Ticket created successfully" });
    })
    .catch(err => {
      res.status(500).json({ error: "Error creating ticket" });
    });
});


// Create block API endpoint
app.post('/api/createblock', isLoggedIn, (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { newBlock } = req.body;
  
  contentDao.createBlock(newBlock, req.body.ticketId, req.user.user_id)
    .then(() => {
      res.status(200).json({ message: "Block created successfully" });
    })
    .catch(err => {
      res.status(500).json({ error: "Error creating block" });
    });
});

// Manage block API endpoint
app.post('/api/manageblock', isLoggedIn, (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const updatedTicket = req.body;
  
  contentDao.manageBlock(req.user.role, updatedTicket.ticket_id, updatedTicket.category, updatedTicket.status)
    .then(() => {
      res.status(200).json({ message: "Block updated successfully" });
    })
    .catch(err => {
      res.status(500).json({ error: "Error updating block" });
    });
});

// Get public data API endpoint
app.get('/api/normalData', (req, res) => {
  contentDao.getPublicData()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

// Get user data API endpoint
app.get('/api/fetchUserData', isLoggedIn, (req, res) => {
  contentDao.getUserData()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

// POST /api/sessions - login route
app.post('/api/sessions', [
  check('username').notEmpty().withMessage('Username is required'),
  check('password').notEmpty().withMessage('Password is required')
], (req, res, next) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      return res.status(401).json({ error: info });
    }
    req.login(user, (err) => {
      if (err)
        return next(err);
      return res.json(req.user);
    });
  })(req, res, next);
});

// GET /api/sessions/current - check current session
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// DELETE /api/session/current - logout route
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));
