import React, { useState } from "react";
import {
  Snackbar,
  Alert,
  Button,
  TextField,
  CircularProgress,
  Box,
  Typography,

} from "@mui/material";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const SignIn = ({ openSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Alert state
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  

  const nav = useNavigate();


  const handleSignIn = (e) => {
    e.preventDefault();
    const login = { email, password };
    setLoading(true);

    axios
      .post("http://localhost:8080/api/auth/login", login)
      .then((response) => {
        const { jwt} = response.data;
        const currentTime = Date.now();

        localStorage.setItem("token", jwt);
        
        localStorage.setItem("loginTime", currentTime);

        setAlertType("success");
        setAlertMsg("Login Successful!");
        setShowAlert(true);
        setTimeout(() => {
          nav("/");
        }, 1000);
      })
      .catch((error) => {
        setAlertType("error");
        setAlertMsg("Login failed! Please check your credentials.");
        setShowAlert(true);
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
 
    localStorage.removeItem("loginTime");

    nav("/SignIn");
  };

 

  return (
    <>
      {showAlert && (
        <Snackbar open={showAlert} autoHideDuration={3000}>
          <Alert severity={alertType}>{alertMsg}</Alert>
        </Snackbar>
      )}


      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "100vh",
          backgroundColor: "#f4f4f4",
          paddingTop: "50px",
        }}
      >
        <Box
          sx={{
            width: 600,
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: 6,
            padding: 4,
            border: "1px solid #003366",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ textAlign: "center", color: "#003366", marginBottom: 4 }}
          >
            Login
          </Typography>

          <form onSubmit={handleSignIn}>
            <TextField
              sx={{ width: "100%", marginBottom: 2 }}
              label="Email"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              color="primary"
            />

            <TextField
              sx={{ width: "100%", marginBottom: 2 }}
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              color="primary"
            />

            <Button
              type="submit"
              sx={{
                backgroundColor: "#003366",
                color: "white",
                padding: "10px 20px",
                fontSize: "16px",
                borderRadius: 5,
                "&:hover": {
                  backgroundColor: "#002244",
                },
                width: "100%",
                marginBottom: 2,
                textTransform: "none",
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
            </Button>

            <div style={{ textAlign: "center", marginTop: 15 }}>
              <span style={{ fontSize: "1.1rem", color: "#333" }}>
                Don't have an account?{" "}
              </span>
              <Link
                to="/SignUp"
                style={{
                  color: "#003366",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "1.2rem",
                }}
              >
                Register Here
              </Link>
            </div>
          </form>
        </Box>
      </Box>
    </>
  );
};

export default SignIn;
