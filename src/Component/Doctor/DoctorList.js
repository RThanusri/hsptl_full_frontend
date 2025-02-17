import React, { useState, useEffect } from "react";
import { Grid, Card, Typography, Box } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // For navigating between pages

const DoctorList = () => {
  const [staff, setStaff] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all staff members on component mount
    const fetchStaff = async () => {
      const token = localStorage.getItem("token");
      const role="DOCTOR";
      try {
        const response = await axios.get(`http://localhost:8080/api/admin/getAllStaffByStaffRole/${role}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setStaff(response.data);  // Save the fetched staff to state
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };

    fetchStaff();
  }, []);

  return (
    <Box sx={{ padding: "40px 10%", backgroundColor: "#f5f5f5" }}>
      <Typography variant="h4" sx={{ textAlign: "center", color: "#003366", marginBottom: "20px", fontWeight: "bold" }}>
        All Doctors
      </Typography>

      {/* Grid layout to display staff cards */}
      <Grid container spacing={4}>
        {staff.map((staffMember) => (
          <Grid item xs={12} sm={6} md={4} key={staffMember.id}>
            <Card sx={{ padding: "20px", boxShadow: 3, backgroundColor: "#ffffff" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "8px" }}>
                {staffMember.name}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "4px" }}>
                <strong>Staff Id:</strong> {staffMember.id}
              </Typography>
              
              <Typography variant="body1" sx={{ marginBottom: "4px" }}>
                <strong>Contact:</strong> {staffMember.contactInfo}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "4px" }}>
                <strong>Salary:</strong> {staffMember.salaryAmount}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "4px" }}>
                <strong>Start Date:</strong> {staffMember.employmentStartDate}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "4px" }}>
                <strong>Specialization:</strong> {staffMember.specialization}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DoctorList;
