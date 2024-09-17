'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');

const jwtSecret = '47e5edcecab2e23c8545f66fca6f3aec8796aee5d830567cc362bb7fb31adafc';

// init express
const app = express();
const port = 3002;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

// Check token validity
app.use(jwt({
  secret: jwtSecret,
  algorithms: ["HS256"],
  // token from HTTP Authorization: header
})
);

// To return a better object in case of errors
app.use(function (err, req, res, next) {
  console.log("Token: ", req.headers.authorization);
  console.log("err: ", err);
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ errors: [{ 'param': 'Server', 'msg': 'Authorization error', 'path': err.code }] });
  } else {
    next();
  }
});
// Funzione per calcolare un numero casuale tra min e max inclusi
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Funzione per calcolare l'estimazione in base al numero di caratteri e al ruolo dell'utente
function calculateEstimation(characters_count, role) {
  const random_number = getRandomNumber(1, 240);
  const estimationInHours = (characters_count * 10) + random_number;
  
  if (role === 0) {
    // Utente normale: arrotonda l'estimazione in giorni
    const estimationInDays = Math.round(estimationInHours / 24);
    return `${estimationInDays} Days`;
  } else {
    // Amministratore o altri ruoli: mostra l'estimazione in ore con la precisione
    return `${estimationInHours.toFixed(1)} Hours`;
  }
}

// API per gestire la richiesta di estimazione
app.post('/api/get-estimation', (req, res) => {
  console.log("Received request to get estimation");

  // Estrarre i dati necessari dalla richiesta
  const tickets = Array.isArray(req.auth.fullData) ? req.auth.fullData : [req.auth.fullData];
  const role = req.auth.role;
  console.log(tickets, role);

  // Array per memorizzare i risultati delle stime
  const estimations = [];

  // Calcolo dell'estimazione per ogni ticket
  tickets.forEach(ticket => {
    const characters_count = ticket.charCount;
    const estimation = calculateEstimation(characters_count, role);

    // Aggiungi l'estimazione al risultato
    estimations.push({
      ticket_id: ticket.ticket_id,
      estimation: estimation
    });
  });

  console.log("Estimations: ", estimations);

  // Rispondi con i dati delle stime
  res.status(200).json({ estimations });
});

/*** Other express-related instructions ***/
app.listen(port, () => {
  console.log(`qa-server listening at http://localhost:${port}`);
});
