import React, { useState } from "react";
import { Snackbar, Alert, Button, TextField, CircularProgress, Box, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showAlert, setShowAlert] = useState(false);
 
  const nav = useNavigate();

  const handleResetPassword = (e) => {
    e.preventDefault();
    const requestData = { email, newPassword };
    setLoading(true);

    axios
      .put("http://localhost:8080/api/auth/forgetPassword", requestData)
      .then(() => {
        setAlertType("success");
        setAlertMsg("Password reset successful!");
        setShowAlert(true);
        setTimeout(() => {
          nav("/SignIn"); // Redirect to login page after reset
        }, 2000);
      })
      .catch(() => {
        setAlertType("error");
        setAlertMsg("Password reset failed! Please try again.");
        setShowAlert(true);
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      });
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "100vh", backgroundColor: "#f4f4f4", paddingTop: "50px" }}>
      <Box sx={{ width: 600, bgcolor: "white", borderRadius: 2, boxShadow: 6, padding: 4, border: "1px solid #003366" }}>
        <Typography variant="h4" component="h1" sx={{ textAlign: "center", color: "#003366", marginBottom: 4 }}>Forgot Password</Typography>
        {showAlert && (
          <Snackbar open={showAlert} autoHideDuration={3000}>
            <Alert severity={alertType}>{alertMsg}</Alert>
          </Snackbar>
        )}
        <form onSubmit={handleResetPassword}>
          <TextField sx={{ width: "100%", marginBottom: 2 }} label="Email" type="email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} color="primary" />
          <TextField sx={{ width: "100%", marginBottom: 2 }} label="New Password" type="password" variant="outlined" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} color="primary" />
          <Button type="submit" sx={{ backgroundColor: "#003366", color: "white", padding: "10px 20px", fontSize: "16px", borderRadius: 5, "&:hover": { backgroundColor: "#002244" }, width: "100%", marginBottom: 2, textTransform: "none" }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default ForgotPassword;

