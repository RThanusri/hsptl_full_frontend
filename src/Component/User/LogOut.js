import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const LogOut = () => {
  const nav = useNavigate();

  const handleLogout = () => {
    
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("loginTime");

    nav("/SignIn");
  };

  return (
    <Button
      onClick={handleLogout}
      variant="contained"
      color="error"
      style={{
        textTransform: "none",
        backgroundColor: "#cc0000",
        color: "white",
        fontSize: "16px",
        borderRadius: "5px",
      }}
    >
      Logout
    </Button>
  );
};

export default LogOut;
