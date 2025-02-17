import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [menu, setMenu] = useState(""); // State to track the active menu
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to check if user is logged in
  const nav = useNavigate();

  // Checking login status on every render
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); 
  };

  useEffect(() => {
    checkLoginStatus(); 
  }, []); 

  const handleLogout = () => {
    // Clear localStorage and navigate to the SignIn page
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("loginTime");
    setIsLoggedIn(false); // Update login state
    nav("/SignIn"); // Navigate to the SignIn page
  };

  // Handle state updates when page is refreshed
  useEffect(() => {
    const interval = setInterval(checkLoginStatus, 1000); // Check login status every 1 second
    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  return (
    <div className="Navbar">
      <div className="logo-container">
        <img src="/logo.png" alt="logo" className="logo" />
        <h1 className="hospital-name">Lifeline Health Clinic</h1>
      </div>

      <div className="menu-container">
        <ul className="navbar-menu">
          {!isLoggedIn ? (
            <>
              <li className={menu === "sign-up" ? "active" : ""}>
                <Link to="/SignUp" onClick={() => setMenu("sign-up")}>
                  Register
                </Link>
              </li>
              <li className={menu === "sign-in" ? "active" : ""}>
                <Link to="/SignIn" onClick={() => setMenu("sign-in")}>
                  Login
                </Link>
              </li>
            </>
          ) : (
            <li className="logout-menu">
              <button
                className="logout-button"
                onClick={() => {
                  setMenu("log-out");
                  handleLogout();
                }}
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
