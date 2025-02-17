import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedAppointment, setSelectedAppointment] = useState({
    appointmentId: "",
    doctorId: "",
    patientId: "",
    appointmentDate: "",
    appointmentTime: "",
    chiefComplaint: "",
  });
  const [formErrors, setFormErrors] = useState({
    appointmentDate: "",
    appointmentTime: "",
    chiefComplaint: "",
  });
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  useEffect(() => {
    if (appointmentDate && appointmentTime) {
      fetchAvailableDoctors(appointmentDate, appointmentTime);
    }
  }, [appointmentDate, appointmentTime]);

  const fetchPatients = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:8080/api/admin/getAllPatient", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:8080/api/admin/getAllAppointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log( "appointments",response.data);
      const appointmentsData = response.data;
      const updatedAppointments = await Promise.all(
        appointmentsData.map(async (appointment) => {
          const patientResponse = await axios.get(
            `http://localhost:8080/api/admin/getPatientById/${appointment.patientId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const doctorResponse = await axios.get(
            `http://localhost:8080/api/admin/getStaffById/${appointment.doctorId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return {
            ...appointment,
            patientName: patientResponse.data.name,
            doctorName: doctorResponse.data.name,
          };
        })
      );
      setAppointments(updatedAppointments);
    } catch (error) {
      setAlertMsg("Error fetching appointments");
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedAppointment({ ...selectedAppointment, [name]: value });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errors = { ...formErrors };
    switch (name) {
      case "appointmentDate":
        errors.appointmentDate = value ? "" : "Date is required";
        break;
      case "appointmentTime":
        errors.appointmentTime = value ? "" : "Time is required";
        break;
      case "chiefComplaint":
        errors.chiefComplaint = value ? "" : "Chief Complaint cannot be empty";
        break;
      default:
        break;
    }
    setFormErrors(errors);
  };

  const handleRegister = () => {
    setOpenRegisterModal(true);
    setSelectedAppointment({
      appointmentId: "",
      doctorId: "",
      patientId: "",
      appointmentDate: "",
      appointmentTime: "",
      chiefComplaint: "",
    });
  };

  const handleUpdate = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDate(appointment.appointmentDate);
    setAppointmentTime(appointment.appointmentTime);
    setOpenUpdateModal(true);
  };

  const handleDelete = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDeleteModal(true);
  };

  const handleCloseModal = () => {
    setOpenRegisterModal(false);
    setOpenUpdateModal(false);
    setOpenDeleteModal(false);
    setOpenDetailsModal(false);
    setAppointmentDate("");
    setAppointmentTime("");
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const data = { ...selectedAppointment, appointmentDate, appointmentTime };
    console.log("Data being sent:", data);
    try {
      let response;
      if (openRegisterModal) {
        response = await axios.post(
          "http://localhost:8080/api/admin/scheduleAppointment",
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else if (openUpdateModal) {
        response = await axios.put(
          `http://localhost:8080/api/admin/updateAppointment/${selectedAppointment.appointmentId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      setAlertMsg(response.data);
      setAlertType("success");
      setShowAlert(true);
      fetchAppointments();
      handleCloseModal();
    } catch (error) {
      setAlertMsg(error.response.data);
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://localhost:8080/api/admin/cancelAppointment/${selectedAppointment.appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAlertMsg("Appointment deleted successfully");
      setAlertType("success");
      setShowAlert(true);
      fetchAppointments();
      handleCloseModal();
    } catch (error) {
      setAlertMsg(error.response?.data);
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const fetchAvailableDoctors = async (date, time) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:8080/api/admin/geAllAvailableDoctorsByDateAndTime/${date}/${time}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Available Doctors:", response.data); // Log the response data
      setAvailableDoctors(response.data);
    } catch (error) {
      console.error("Error fetching available doctors:", error);
      setAlertMsg("Error fetching available doctors");
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCheckboxChange = (appointmentId) => {
    setSelectedRows((prev) =>
      prev.includes(appointmentId)
        ? prev.filter((id) => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const handleDetailsOpen = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDetailsModal(true);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const searchTerm = searchText.toLowerCase();
    return (
      appointment.patientId.toString().includes(searchTerm) ||
      appointment.doctorId.toString().includes(searchTerm) ||
      (appointment.patientName && appointment.patientName.toLowerCase().includes(searchTerm)) ||
      (appointment.doctorName && appointment.doctorName.toLowerCase().includes(searchTerm)) ||
      (appointment.appointmentDate && appointment.appointmentDate.includes(searchTerm))
    );
  });

  return (
    <div style={{ padding: "20px", backgroundColor: "white", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ marginBottom: "30px", textAlign: "center", color: "#003366", fontWeight: "bold" }}>
        Appointment Management
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={6}>
          <TextField
            label="Search by Patient/Doctor Name/Date"
            fullWidth
            value={searchText}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: <SearchIcon />,
            }}
          />
        </Grid>
      </Grid>
      <Button
        variant="contained"
        sx={{ position: "absolute", top: 240, right: 20, backgroundColor: "#003366" }}
        onClick={handleRegister}
      >
        Register Appointment
      </Button>
      <TableContainer sx={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Select</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Doctor</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Patient</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Time</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Chief Complaint</TableCell>
             
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAppointments
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((appointment) => (
                <TableRow key={appointment.appointmentId}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(appointment.appointmentId)}
                      onChange={() => handleCheckboxChange(appointment.appointmentId)}
                      onClick={() => handleDetailsOpen(appointment)}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{appointment.doctorName}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{appointment.patientName}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{appointment.appointmentDate}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{appointment.appointmentTime}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{appointment.chiefComplaint}</TableCell>
                  
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredAppointments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Register Appointment Modal */}
      <Dialog open={openRegisterModal} onClose={handleCloseModal} sx={{ minHeight: "600px" }}>
        <DialogTitle>Register Appointment</DialogTitle>
        <DialogContent>
          <TextField
            label="Appointment Date *"
            type="date"
            fullWidth
            value={appointmentDate}
            onChange={(e) => {
              setAppointmentDate(e.target.value);
              validateField("appointmentDate", e.target.value);
            }}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ marginTop: "20px" }}
            inputProps={{
              min: new Date().toISOString().split("T")[0],
            }}
            helperText={formErrors.appointmentDate}
            error={!!formErrors.appointmentDate}
          />
          <TextField
            label="Appointment Time *"
            type="time"
            fullWidth
            value={appointmentTime}
            onChange={(e) => {
              setAppointmentTime(e.target.value);
              validateField("appointmentTime", e.target.value);
            }}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ marginTop: "20px" }}
            helperText={formErrors.appointmentTime}
            error={!!formErrors.appointmentTime}
            disabled={!appointmentDate}
            inputProps={{
              min: appointmentDate === new Date().toISOString().split("T")[0] ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "09:00",
            }}
          />
          <TextField
            label="Chief Complaint *"
            fullWidth
            value={selectedAppointment.chiefComplaint}
            onChange={(e) => {
              setSelectedAppointment({ ...selectedAppointment, chiefComplaint: e.target.value });
              validateField("chiefComplaint", e.target.value);
            }}
            sx={{ marginTop: "20px" }}
            helperText={formErrors.chiefComplaint}
            error={!!formErrors.chiefComplaint}
          />
       
          <FormControl fullWidth sx={{ marginTop: "10px" }}>
            <InputLabel>Doctor *</InputLabel>
            <Select  sx={{ marginTop: "13px" }}
              value={selectedAppointment.doctorId}
              onChange={(e) =>
                setSelectedAppointment({ ...selectedAppointment, doctorId: e.target.value })
              }
              disabled={!appointmentDate || !appointmentTime}
            >
              {availableDoctors && availableDoctors.length > 0 ? (
                availableDoctors.map((doctor) => {
                  if (!doctor) {
                    return null;
                  }
                  return (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.staffRole} - {doctor.specialization}
                    </MenuItem>
                  );
                })
              ) : (
                <MenuItem>No doctors available for the selected time</MenuItem>
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ marginTop: "10px" }}>
            <InputLabel>Patient *</InputLabel>
            <Select sx={{ marginTop: "13px" }}
              value={selectedAppointment.patientId}
              onChange={(e) =>
                setSelectedAppointment({ ...selectedAppointment, patientId: e.target.value })
              }
              disabled={!appointmentDate || !appointmentTime}
            >
              {patients.length === 0 ? (
                <MenuItem>No patients available</MenuItem>
              ) : (
                patients.map((patient) => (
                  <MenuItem key={patient.patientId} value={patient.patientId}>
                    {patient.name} - {patient.email} - {patient.patientId}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="outlined" color="primary">
            Register
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Appointment Modal */}
      <Dialog open={openUpdateModal} onClose={handleCloseModal}>
        <DialogTitle>Update Appointment</DialogTitle>
        <DialogContent>
          <TextField
            label="Appointment Date *"
            type="date"
            fullWidth
            value={appointmentDate}
            onChange={(e) => {
              setAppointmentDate(e.target.value);
              validateField("appointmentDate", e.target.value);
            }}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ marginTop: "20px" }}
            inputProps={{
              min: new Date().toISOString().split("T")[0],
            }}
            helperText={formErrors.appointmentDate}
            error={!!formErrors.appointmentDate}
          />
          <TextField
            label="Appointment Time *"
            type="time"
            fullWidth
            value={appointmentTime}
            onChange={(e) => {
              setAppointmentTime(e.target.value);
              validateField("appointmentTime", e.target.value);
            }}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ marginTop: "20px" }}
            helperText={formErrors.appointmentTime}
            error={!!formErrors.appointmentTime}
            disabled={!appointmentDate}
            inputProps={{
              min: appointmentDate === new Date().toISOString().split("T")[0] ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "09:00",
            }}
          />
          <TextField
            label="Chief Complaint *"
            fullWidth
            value={selectedAppointment.chiefComplaint}
            onChange={(e) => {
              setSelectedAppointment({ ...selectedAppointment, chiefComplaint: e.target.value });
              validateField("chiefComplaint", e.target.value);
            }}
            sx={{ marginTop: "20px" }}
            helperText={formErrors.chiefComplaint}
            error={!!formErrors.chiefComplaint}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="outlined">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Appointment Modal */}
      <Dialog open={openDeleteModal} onClose={handleCloseModal}>
        <DialogTitle>Delete Appointment</DialogTitle>
        <DialogContent>Are you sure you want to delete this appointment?</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Appointment Details Modal */}
      <Dialog open={openDetailsModal} onClose={handleCloseModal}>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "25px", color: "#003366",marginLeft:"30px" }}> Appointment Details</DialogTitle>
        <DialogContent>
          <Typography  variant="h6"><strong>Doctor: </strong>{selectedAppointment.doctorName}</Typography>
          <Typography variant="h6"><strong>Patient: </strong> {selectedAppointment.patientName}</Typography>
          <Typography variant="h6"><strong>Date: </strong>{selectedAppointment.appointmentDate}</Typography>
          <Typography variant="h6"><strong>Time:</strong> {selectedAppointment.appointmentTime}</Typography>
          <Typography variant="h6"><strong>Chief Complaint: </strong>{selectedAppointment.chiefComplaint}</Typography>
        </DialogContent>
        <DialogActions>
          
          <Button sx={{marginRight:"30px"}} onClick={() => handleUpdate(selectedAppointment)} color="primary">
            <EditIcon/>
          </Button>
          <Button sx={{marginRight:"30px"}} onClick={() => handleDelete(selectedAppointment)} color="error">
            <DeleteIcon/>
          </Button>
          <Button onClick={handleCloseModal} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showAlert} autoHideDuration={6000} onClose={() => setShowAlert(false)}>
        <Alert onClose={() => setShowAlert(false)} severity={alertType}>
          {alertMsg}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AppointmentManagement;