import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,Typography } from "@mui/material";
import axios from "axios";

const DoctorAppointments = () => {
  const { doctorId } = useParams();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`http://localhost:8080/api/admin/getAllAppointmentByDoctorId/${doctorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAppointments(response.data);
      } catch (error) {
        console.error("Error fetching appointments", error);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  return (
    <div style={{ padding: "20px", backgroundColor: "white", minHeight: "100vh" }}>

    <Typography variant="h4" sx={{ marginBottom: "30px", textAlign: "center" ,color:"#003366",fontWeight:"bold"}}>
        Appointments
      </Typography>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            
            <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Date</TableCell>
            <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Time</TableCell>
            <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Chief Complaint</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.appointmentId}>

              <TableCell sx={{ fontSize: '1.2rem'}}>{appointment.appointmentDate}</TableCell>
              <TableCell sx={{ fontSize: '1.2rem'}}>{appointment.appointmentTime}</TableCell>
              <TableCell sx={{ fontSize: '1.2rem'}}>{appointment.chiefComplaint}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </div>
  );
};

export default DoctorAppointments;
