import React from "react";
import { Grid, Card, CardContent, Box, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People"; // Patients icon
import GroupIcon from "@mui/icons-material/Group";
import EventIcon from "@mui/icons-material/Event";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Patients",
      description: "Access patient records, treatments, and health history.",
      icon: <PeopleIcon sx={{ fontSize: 150, color: "#003366" }} />,
      onClick: () => navigate("/patients"), // Navigate to the patients page
    },
    {
      title: "Staff",
      description: "Manage staff profiles, roles, and schedules efficiently.",
      icon: <GroupIcon sx={{ fontSize: 150, color: "#003366" }} />,
      onClick:()=> navigate("/staff"),
    },
    {
      title: "Appointments",
      description: "Plan and oversee appointments seamlessly and effectively.",
      icon: <EventIcon sx={{ fontSize: 150, color: "#003366" }} />,
      onClick:()=> navigate("/appointment"),
    },
    {
      title: "Doctors",
      description: "View and manage doctor profiles and schedules.",
      icon: <MedicalServicesIcon sx={{ fontSize: 150, color: "#003366" }} />,
      onClick: () => navigate("/doctors"), // Navigate to the doctors page
    },
   
  ];

  return (
    <Box
      sx={{
        backgroundColor: "#f9f9f9",
        padding: "40px 20px",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Typography
        variant="h4"
        align="center"
        sx={{
          color: "#003366",
          fontWeight: "bold",
          marginBottom: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Welcome to Lifeline Health Clinic
      </Typography>

      {/* Slogan */}
      <Typography
        variant="h5"
        align="center"
        sx={{
          fontSize: "44px",
          fontWeight: "600",
          marginBottom: "40px",
          fontFamily: "Georgia, serif",
          letterSpacing: "1px",
          background: "linear-gradient(90deg, #003366, #00509E)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontStyle: "italic",
        }}
      >
        We're here when you need us — for every care in the world.
      </Typography>

      {/* Cards */}
      <Grid
        container
        spacing={4}
        justifyContent="center"
        sx={{
          flexWrap: "nowrap",
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ccc",
            borderRadius: "10px",
          },
        }}
      >
        {cards.map((card, index) => (
          <Grid item key={index} sx={{ flex: "0 0 auto" }}>
            <Card
              sx={{
                border: "2px solid #003366",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                borderRadius: "12px",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
                },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px",
                width: "320px",
                height:"400px"
              }}
              onClick={card.onClick} // Trigger navigation when card is clicked
            >
              <Box sx={{ marginBottom: "20px" }}>{card.icon}</Box>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#003366",
                    fontWeight: "bold",
                    fontFamily: "Arial, sans-serif",
                    marginBottom: "10px",
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#555555",
                    fontSize: "18px",
                    lineHeight: 1.8,
                  }}
                >
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HomePage;
