import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { Routes, Route, BrowserRouter, useNavigate, Navigate } from 'react-router-dom';
import Home_page from './views/home';
import Login_page from './views/login';
import Main_page from './views/landing';
import API from './viewmodel/ApiServices';
import Profile from './views/profile';

// Create the Contexts
const AuthContext = createContext();
const DataContext = createContext();

// Custom hook to use the Auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Custom hook to use the Data context
export function useData() {
  return useContext(DataContext);
}

// AuthProvider component to manage authentication state
function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);  // State to track if the user is logged in
  const [username, setUsername] = useState('');     // State to store the username of the logged-in user
  const [notification, setNotification] = useState(''); // State to store notifications (e.g., login errors or success messages)
  const [role, setRole] = useState(0);// State to store the role of the logged-in user (e.g., admin, regular user)
  const [authToken, setAuthToken] = useState(undefined);  // State to store the authentication token
  const navigate = useNavigate();  // Hook to handle navigation within the application

  // Function to handle user login
  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true); // Update login state
      setRole(user.role); // Set the user role
      setNotification('Authenticated!'); // Set success notification
      setUsername(credentials.username); // Set the username
      navigate('/'); // Navigate to Home page after login
    } catch (err) {
      console.error("Error:", err.message);
      if (err.message.includes("Network Error")) {
        setNotification('Network Error!'); // Handle network error
      } else if (err.message.includes("401")) {
        setNotification('Username or password incorrect!'); // Handle authentication error
      }
    }
  };

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await API.LogOut();
      setLoggedIn(false); // Update login state
      setUsername(''); // Clear username
      setNotification(''); // Clear notifications
      navigate('/Main'); // Navigate to Main page after logout
    } catch (err) {
      console.error(err);
    }
  };

  // Function to handle authentication token retrieval
  const handleAuth = useCallback(async (role) => {
    try {
      const token = await API.retrieveAuthToken(role);
      setAuthToken(token);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ loggedIn, username, role, notification, authToken, login: handleLogin, logout: handleLogout, auth: handleAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// DataProvider component to manage data state
function DataProvider({ children }) {
  const { loggedIn, role, auth, authToken } = useAuth(); // Use authentication context
  const [estimationsData, setEstimationsData] = useState(''); // State to store estimation data
  const [estimationsCRTData, setEstimationsCRTData] = useState(''); // State to store CRT estimation data
  const [startData, setStartData] = useState([]); // State to store initial data

  // Function to fetch initial data based on login state
  const fetchData = useCallback(async () => {
    try {
      const initialData = loggedIn ? await API.fetchUserData() : await API.fetchInitialData();
      console.log("Initial data fetched:", initialData);
      setStartData(initialData);

      if (loggedIn && role === 1) { // Check if the role is administrator
        await auth({ role });
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  }, [loggedIn, role, auth]);

  // Function to handle ticket submission
  const handleSubmit = async (createTicketINFO) => {
    try {
      await API.createTicket(createTicketINFO);
      console.log("Ticket created successfully", createTicketINFO)
      await fetchData(); // Fetch updated data after creating a ticket
    } catch (err) {
      console.error(err);
    }
  };

  // Function to handle block creation
  const handleBlock = async (sendBlock) => {
    try {
      await API.createBlock(sendBlock);
      await fetchData(); // Fetch updated data after creating a block
    } catch (err) {
      console.error(err);
    }
  };

  // Function to handle ticket management
  const handleManage = async (updatedTicket) => {
    try {
      await API.handleManage(updatedTicket);
      await fetchData(); // Fetch updated data after managing a ticket
    } catch (err) {
      console.error(err);
    }
  };

  // Function to handle estimation retrieval using auth token
  const handleEstimation = useCallback(async (token) => {
    try {
      const time = await API.retrieveEstimation(token);
      setEstimationsData(time);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Function to handle CRT estimation retrieval
  const handlecrtEstimation = useCallback(async (data) => {
    try {
      const token = await API.retrieveAuthToken(data);
      const time = await API.retrieveEstimation(token);
      setEstimationsCRTData(time);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Effect to retrieve estimations when authToken changes
  useEffect(() => {
    if (authToken) {
      handleEstimation(authToken);
    }
  }, [authToken, handleEstimation]);

  // Effect to fetch initial data based on login state
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DataContext.Provider value={{ startData, estimationsData, estimationsCRTData, handleSubmit, handleBlock, handleManage, handleEstimation, handlecrtEstimation }}>
      {children}
    </DataContext.Provider>
  );
}

// Main App component
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path='/' element={<Home_page />} />
            <Route path='/Main' element={<Main_page />} />
            <Route path='/Login' element={<Login_page />} />
            <Route path='*' element={<Navigate to="/Main" />} /> {/* Redirect unknown routes to Main page */}
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
