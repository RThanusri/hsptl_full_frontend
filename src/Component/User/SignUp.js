import React, { useState } from 'react';
import { Snackbar, Alert, Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Box, Typography } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
 
const SignUp = ({ handleOpenSignIn }) => {
  const roleOptions = [
    { key: 'STAFF', text: 'Staff', value: 'STAFF' },
    { key: 'ADMIN', text: 'Admin', value: 'ADMIN' },
  ];
 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
 
  // Alert state
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('');
  const [showAlert, setShowAlert] = useState(false);
 
  // Form validation state
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });
 
  const validateForm = () => {
    const errors = {};
    let isValid = true;
 
    if (!name.trim()) {
errors.name = 'Name is required';
      isValid = false;
    }
 
    // Simple email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
errors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(email)) {
errors.email = 'Invalid email format';
      isValid = false;
    }
 
    // Password validation (min length 8, must contain a number and a letter)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!password.trim()) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      errors.password = 'Password must be at least 8 characters long and contain both letters and numbers';
      isValid = false;
    }
 
    if (!role) {
      errors.role = 'Role is required';
      isValid = false;
    }
 
    setFormErrors(errors);
    return isValid;
  };
 
  const handleSignUp = (e) => {
    e.preventDefault();
 
    if (!validateForm()) return; // Stop form submission if validation fails
 
    const user = { name, email, password, role };
    setLoading(true);
    axios
.post('http://localhost:8080/api/auth/signup', user)
      .then((response) => {
        console.log('response', response);
        setAlertType('success');
        setAlertMsg('Sign Up Successful! You can login now.');
        setShowAlert(true);
      })
      .catch((error) => {
        console.error(error);
        const errorMessage =
          error.response && error.response.data ? error.response.data : 'Signup failed! Please try again.';
        setAlertType('error');
        setAlertMsg(errorMessage);
        setShowAlert(true);
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => {
          setShowAlert(false); // Hide alert after 3 seconds
        }, 3000);
      });
  };
 
  return (
    <>
      {showAlert && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, width: '320px' }}>
          <Snackbar open={showAlert} autoHideDuration={3000}>
            <Alert severity={alertType}>{alertMsg}</Alert>
          </Snackbar>
        </div>
      )}
      {/* Fullscreen Container with Flexbox */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center', // Keep horizontal centering
          alignItems: 'flex-start', // Align the box to the top
          minHeight: '100vh', // Full viewport height
          backgroundColor: '#f4f4f4', // Optional background color for the full screen
          paddingTop: '50px', // Optional padding to create some space from the top
        }}
      >
        <Box
          sx={{
            width: 600,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 6,
            padding: 4,
            border: '1px solid #003366',
          }}
        >
          <Typography variant="h4" component="h1" sx={{ textAlign: 'center', color: '#003366', marginBottom: 4 }}>
            Sign Up
          </Typography>
          <form onSubmit={handleSignUp}>
            <TextField
              sx={{ width: '100%', marginBottom: 2 }}
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              color="primary"
error={!!formErrors.name}
helperText={formErrors.name}
            />
            <TextField
              sx={{ width: '100%', marginBottom: 2 }}
              label="Email"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              color="primary"
error={!!formErrors.email}
helperText={formErrors.email}
            />
            <TextField
              sx={{ width: '100%', marginBottom: 2 }}
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              color="primary"
              error={!!formErrors.password}
              helperText={formErrors.password}
            />
            <FormControl sx={{ width: '100%', marginBottom: 2 }} variant="outlined" error={!!formErrors.role}>
              <InputLabel>Role</InputLabel>
              <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)} color="primary">
                {roleOptions.map((option) => (
                  <MenuItem key={option.key} value={option.value}>
                    {option.text}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.role && <Typography variant="body2" color="error">{formErrors.role}</Typography>}
            </FormControl>
            <Button
              type="submit"
              sx={{
                backgroundColor: '#003366',
                color: 'white',
                padding: '10px 20px',
                fontSize: '16px',
                borderRadius: 5,
                '&:hover': { backgroundColor: '#002244' },
                width: '100%',
                marginBottom: 2,
                textTransform: 'none', // Prevent uppercase
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
            </Button>
            <div style={{ textAlign: 'center', marginTop: 15 }}>
              <span style={{ fontSize: '1.1rem', color: '#333' }}>Already have an account? </span>
              <Link
                to="/SignIn"
                style={{
                  color: '#003366',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '1.2rem',
                }}
              >
                Login
              </Link>
            </div>
          </form>
        </Box>
      </Box>
    </>
  );
};
 
export default SignUp;