import React, { useState, useEffect } from "react";
import { Grid, Card, Typography, Box } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // For navigating between pages

const StaffPerformanceList = () => {
  const [staffPerformance, setStaffPerformance] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all staff performance records on component mount
    const fetchStaffPerformance = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get('http://localhost:8080/api/admin/getAllStaffPerformance', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setStaffPerformance(response.data);  // Save the fetched performance data to state
      } catch (error) {
        console.error("Error fetching staff performance:", error);
      }
    };

    fetchStaffPerformance();
  }, []);

  return (
    <Box sx={{ padding: "40px 10%", backgroundColor: "#f5f5f5" }}>
      <Typography variant="h4" sx={{ textAlign: "center", color: "#003366", marginBottom: "20px", fontWeight: "bold" }}>
        All Staff Performance
      </Typography>

      {/* Grid layout to display staff performance cards */}
      <Grid container spacing={4}>
        {staffPerformance.map((performance) => (
          <Grid item xs={12} sm={6} md={4} key={performance.staffId}>
            <Card sx={{ padding: "20px", boxShadow: 3, backgroundColor: "#ffffff" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "8px" }}>Staff Id :
                {performance.staffId} - {performance.staffName}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "4px" }}>
                <strong>Patients Seen:</strong> {performance.patientsSeen}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "4px" }}>
                <strong>Feedback Score:</strong> {performance.feedbackScore}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "4px" }}>
                <strong>Work Hours:</strong> {performance.workHours}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "4px" }}>
                <strong>Efficiency Rating:</strong> {performance.efficiencyRating}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StaffPerformanceList;
