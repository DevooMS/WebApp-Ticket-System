import axios from 'axios';

const APIURL = 'http://localhost:3001';
const APIURL2 = 'http://localhost:3002';
// Configurazione di Axios con le opzioni globali
const API = axios.create({
  baseURL: APIURL,
  withCredentials: true, // Per inviare i cookie durante le richieste (importante per l'autenticazione)
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // Header consigliato per prevenire CSRF
  }
});
const API2 = axios.create({
  baseURL: APIURL2,
  withCredentials: true, // Per inviare i cookie durante le richieste (importante per l'autenticazione)
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // Header consigliato per prevenire CSRF
  }
});

// Funzioni per chiamate API

const logIn = async (credentials) => {
  try {
    const response = await API.post('/api/sessions', credentials);
    return response.data;
  } catch (error) {
    throw new Error(`An error occurred during login: ${error.message}`, { cause: error });
  }
};

const createTicket = async (createTicketINFO) => {
  try {
    const response = await API.post('/api/createtickets', createTicketINFO);
    return response.data;
  } catch (error) {
    throw new Error(`An error occurred during ticket creation: ${error.message}`, { cause: error });
  }
};

const fetchInitialData = async () => {
  try {
    const response = await API.get('/api/normalData');
    return response.data;
  } catch (error) {
    throw new Error(`An error occurred while fetching initial data: ${error.message}`, { cause: error });
  }
};

const fetchUserData = async () => {
  try {
    const response = await API.get('/api/fetchUserData');
    return response.data;
  } catch (error) {
    throw new Error(`An error occurred while fetching user data: ${error.message}`, { cause: error });
  }
};


const createBlock = async (sendBlock) => {
  try {
    const response = await API.post('/api/createblock', sendBlock);
    return response.data;
  } catch (error) {
    throw new Error(`An error occurred during block creation: ${error.message}`, { cause: error });
  }
};

const handleManage = async (updatedTicket) => {
  try {
    const response = await API.post('/api/manageblock', updatedTicket);
    return response.data;
  } catch (error) {
    throw new Error(`An error occurred during ticket management: ${error.message}`, { cause: error });
  }
};


const retrieveAuthToken = async (processedData) => {
  console.log("processedData", processedData);
  try {
    const response = await API.post('/api/auth-token', processedData);
    return response.data;
  } catch (error) {
    throw new Error(`An error occurred during ticket creation: ${error.message}`, { cause: error });
  }
};
const retrieveEstimation = async (authToken) => {

  try {
    const response = await API2.post('/api/get-estimation', {}, {
      headers: {
        "Authorization": `Bearer ${authToken.token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`An error occurred while fetching user data: ${error.message}`);
    throw new Error(`An error occurred while fetching user data: ${error.message}`, { cause: error });
  }
};


const LogOut = async () => {
  try {
    const response = await API.delete('/api/sessions/current');
    return response.status === 200; // Ritorna true se il logout è stato eseguito con successo
  } catch (error) {
    throw new Error(`An error occurred during logout: ${error.message}`, { cause: error });
  }
};

// Esportazione delle funzioni API
const APIFunctions = {
  logIn,
  LogOut,
  createTicket,
  fetchInitialData,
  fetchUserData,
  createBlock,
  handleManage,
  retrieveAuthToken,
  retrieveEstimation
};

export default APIFunctions;
