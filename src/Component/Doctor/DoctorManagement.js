import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  InputLabel
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";


const DoctorManagement = () => {
  const [doctorList, setDoctorList] = useState([]);
  const [filteredDoctorList, setFilteredDoctorList] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employmentStartDate: null,
    specialization: "",
  });
  const [doctorId, setDoctorId] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showDoctorDetails, setShowDoctorDetails] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const specializations = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Dermatology",
    "Oncology",
    "Gastroenterology",
    "Psychiatry",
    "Radiology",
    "Endocrinology",
    "General Practitioner",
  ];

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.name) {
      tempErrors.name = "Doctor name is required";
      isValid = false;
    }
    if (!formData.email) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is not valid";
      isValid = false;
    }
    if (!formData.employmentStartDate) {
      tempErrors.employmentStartDate = "Employment start date is required";
      isValid = false;
    }
    if (!formData.specialization) {
      tempErrors.specialization = "Specialization is required";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchDoctorList = async () => {
    const token = localStorage.getItem("token");
    const role = 'DOCTOR';

    try {
      const response = await axios.get(`http://localhost:8080/api/admin/getAllStaffByStaffRole/${role}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setDoctorList(response.data);
      setFilteredDoctorList(response.data);
    } catch (error) {
      setAlertMsg(error.response?.data);
      setAlertType("error");
      setShowAlert(true);
    }
  };

  useEffect(() => {
    fetchDoctorList();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "searchQuery") {
      setSearchQuery(e.target.value);
      filterDoctorList(e.target.value);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };


  const filterDoctorList = (query) => {
    const lowercasedQuery = query.toLowerCase();
    const filteredList = doctorList.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(lowercasedQuery)  ||      doctor.contactInfo.toLowerCase().includes(lowercasedQuery)  ||      doctor.staffRole.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredDoctorList(filteredList);
  };

  const handleRegisterDoctor = async () => {
    const token = localStorage.getItem("token");
    if (!validateForm()) return;
    const data={ ...formData, staffRole: "DOCTOR", contactInfo: formData.email }
    console.log(data);

    try {
      await axios.post(
        "http://localhost:8080/api/admin/registerStaff",
      data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAlertMsg("Doctor registered successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowRegisterForm(false);
      fetchDoctorList();
    } catch (error) {
      setAlertMsg(error.response?.data);
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleUpdateDoctor = async () => {
    if (!validateForm()) return;
    const token = localStorage.getItem("token");
    const data={ ...formData, staffRole: "DOCTOR", contactInfo: formData.email }
    console.log(data);
    try {
      await axios.put(
        `http://localhost:8080/api/admin/updateStaff/${doctorId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAlertMsg("Doctor updated successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowDoctorDetails(false);
      fetchDoctorList();
    } catch (error) {
      setAlertMsg(error.response?.data);
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleRemoveDoctor = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:8080/api/admin/removeStaff/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setAlertMsg("Doctor removed successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowDoctorDetails(false);
      fetchDoctorList();
    } catch (error) {
      setAlertMsg(error.response?.data);
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleSelectDoctor = (doctor) => {
    setDoctorId(doctor.id);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      employmentStartDate: doctor.employmentStartDate,
      specialization: doctor.specialization,
    });
    setShowDoctorDetails(true);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ marginBottom: "30px", color: "#003366", fontWeight: "bold", textAlign: "center" }}>
        Doctor Management
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<PersonAddIcon />}
        onClick={() => setShowRegisterForm(true)}
        sx={{ marginLeft: "auto", display: "block", backgroundColor: "#003366" }}
      >
        Register Doctor
      </Button>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <TextField
          label="Search by Name, Email"
          variant="outlined"
          name="searchQuery"
          value={searchQuery}
          onChange={handleChange}
          style={{ marginRight: "10px", width: "900px" }}
        />
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="doctor table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Select</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Start Date</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Specialization</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDoctorList
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <FormControlLabel
                      control={<Checkbox onChange={() => handleSelectDoctor(doctor)} />}
                      label=""
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{doctor.name}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{doctor.contactInfo}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{doctor.employmentStartDate}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{doctor.specialization}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredDoctorList.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Snackbar open={showAlert} autoHideDuration={6000} onClose={() => setShowAlert(false)}>
        <Alert onClose={() => setShowAlert(false)} severity={alertType} sx={{ width: "100%" }}>
          {alertMsg}
        </Alert>
      </Snackbar>

      <Dialog open={showRegisterForm} onClose={() => setShowRegisterForm(false)}>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", color: "#003366" }}>
          Register Doctor
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#fff" }}>
          <TextField
            label="Name *"
            fullWidth
            margin="normal"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="Email *"
            fullWidth
            margin="normal"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <InputLabel>Start Date *</InputLabel>
         <DatePicker
            selected={formData.employmentStartDate}
            onChange={(date) => setFormData({ ...formData, employmentStartDate: date })}
            dateFormat="yyyy-MM-dd"
            customInput={<TextField fullWidth margin="normal" />}
          />
          <Autocomplete
            options={specializations}
            getOptionLabel={(option) => option}
            value={formData.specialization}
            onChange={(event, newValue) => {
              setFormData({ ...formData, specialization: newValue ||"" });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Specialization *"
                margin="normal"
                error={!!errors.specialization}
                helperText={errors.specialization}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRegisterForm(false)} color="secondary">Cancel</Button>
          <Button onClick={handleRegisterDoctor} color="primary">Register</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDoctorDetails} onClose={() => setShowDoctorDetails(false)}>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", color: "#003366" }}>
          Doctor Details
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#fff" }}>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
         <DatePicker
            selected={formData.employmentStartDate}
            onChange={(date) => setFormData({ ...formData, employmentStartDate: date })}
            dateFormat="yyyy-MM-dd"
            customInput={<TextField fullWidth margin="normal" />}
          />
          <Autocomplete
            options={specializations}
            getOptionLabel={(option) => option}
            value={formData.specialization}
            onChange={(event, newValue) => {
              setFormData({ ...formData, specialization: newValue|| "" });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Specialization"
                margin="normal"
                error={!!errors.specialization}
                helperText={errors.specialization}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
        <Button onClick={() => navigate('/doctorPerformance', { state: { doctorId } })} color="primary">
  Performance
</Button>
<Button onClick={() => navigate('/doctorSchedule', { state: { doctorId } })} color="secondary">
  Schedule
</Button>
<Button onClick={() => navigate('/doctorAttendance', { state: { doctorId } })} color="success">
  Attendance
</Button>
<Button onClick={() => navigate('/doctorAppointments', { state: { doctorId } })} color="info">
  Appointments
</Button>

          <Button onClick={handleUpdateDoctor} color="primary" startIcon={<EditIcon />}>
          
          </Button>
          <Button onClick={handleRemoveDoctor} color="error" startIcon={<DeleteIcon />}>
         
          </Button>
          <Button
            onClick={() => {
              
              setShowDoctorDetails(false); // Uncheck the checkbox
            }}
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DoctorManagement;