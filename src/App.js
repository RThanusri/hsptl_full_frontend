import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import SRoutes from "./SRoutes";
import { Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";

function App() {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showSessionAlert, setShowSessionAlert] = useState(false);

  useEffect(() => {
    const sessionAlertTimer = setTimeout(() => {
      setShowSessionAlert(true);
    }, 1 * 60 * 1000); 

    const autoLogoutTimer = setTimeout(() => {
      handleLogout();
    }, 2 * 60 * 1000); 

    return () => {
      clearTimeout(sessionAlertTimer);
      clearTimeout(autoLogoutTimer);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("loginTime");

    window.location.href = "/SignIn"; 
  };

  const handleCloseSessionAlert = () => {
    setShowSessionAlert(false);
  };

  return (
    <Router>
      <Navbar />
      <SRoutes
        setShowAlert={setShowAlert}
        setAlertMsg={setAlertMsg}
        setAlertType={setAlertType}
      />

      {showAlert && (
        <Snackbar open={showAlert} autoHideDuration={3000} onClose={() => setShowAlert(false)}>
          <Alert severity={alertType}>{alertMsg}</Alert>
        </Snackbar>
      )}

      {showSessionAlert && (
        <Dialog
          open={showSessionAlert}
          onClose={handleCloseSessionAlert}
          aria-labelledby="session-alert-title"
          aria-describedby="session-alert-description"
        >
          <DialogTitle id="session-alert-title">Session Expiration</DialogTitle>
          <DialogContent>
            <DialogContentText id="session-alert-description">
              Your session is about to expire. Do you want to login again?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSessionAlert} color="primary">
              Cancel
            </Button>
            <Button onClick={handleLogout} color="primary" autoFocus>
              Login Again
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Router>
  );
}

export default App;
