import React, { useState, useEffect } from "react";
import {
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  Box,
  Table,
  TableBody,
  TableCell,
  IconButton,
  InputLabel,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Checkbox,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";

const PatientManagement = () => {
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: null,
    phoneNumber: "",
    gender: "",
    email: "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [patientId, setPatientId] = useState("");
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const navigate = useNavigate();

  const fetchPatients = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:8080/api/admin/getAllPatient",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients", error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    filterPatients(event.target.value);
  };

  const filterPatients = (query) => {
    const filtered = patients.filter((patient) => {
      const matchesQuery =
        patient.name.toLowerCase().includes(query.toLowerCase())     ||   patient.phoneNumber.includes(query)  ||      patient.email.toLowerCase().includes(query.toLowerCase());
      return matchesQuery;
    });
    setFilteredPatients(filtered);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errors = { ...formErrors };
    switch (name) {
      case "name":
        errors.name = value ? "" : "Name is mandatory";
        break;
      case "dateOfBirth":
        errors.dateOfBirth = value ? "" : "Date of birth is mandatory";
        break;
      case "phoneNumber":
        const phonePattern = /^\d{10}$/;
        errors.phoneNumber = phonePattern.test(value)
          ? ""
          : "Phone number must be exactly 10 digits";
        break;
      case "gender":
        const genderPattern = /^(Male|Female|Other)$/;
        errors.gender = genderPattern.test(value)
          ? ""
          : "Gender must be Male, Female, or Other";
        break;
      case "email":
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        errors.email = emailPattern.test(value) ? "" : "Email should be valid";
        break;
      case "address":
        errors.address = value ? "" : "Address is mandatory";
        break;
      default:
        break;
    }
    setFormErrors(errors);
  };

  const validateFormData = () => {
    let isValid = true;
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key]);
      if (formErrors[key]) {
        isValid = false;
      }
    });
    return isValid;
  };

  const registerPatient = async () => {
    if (validateFormData()) {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.post(
          "http://localhost:8080/api/admin/registerPatient",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setAlertMsg("Patient registered successfully!");
        setAlertType("success");
        setShowAlert(true);
        setShowRegisterForm(false);
        fetchPatients();
      } catch (error) {
        setAlertMsg(
          error.response.message ||"Patient with email already exists."
        );
        setAlertType("error");
        setShowAlert(true);
      }
    }
  };

  const updatePatient = async () => {
    if (validateFormData()) {
      const token = localStorage.getItem("token");
      console.log(patientId);
      const id=formData.patientId;
      try {
        const response = await axios.put(
          `http://localhost:8080/api/admin/updatePatient/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setAlertMsg("Patient details updated successfully!");
        setAlertType("success");
        setShowAlert(true);
        setShowUpdateForm(false);
        fetchPatients();
      } catch (error) {
        const errorMessage = error.response?.data?.message ||"An unexpected error occurred. Please try again.";
        setAlertMsg(errorMessage);
        setAlertType("error");
        setShowAlert(true);
      }
    }
  };
  

  const handleRemovePatient = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://localhost:8080/api/admin/removePatient/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAlertMsg("Patient removed successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowDeleteModal(false);
      fetchPatients();
    } catch (error) {
      setAlertMsg(
        "An unexpected error occurred. Please try again."
      );
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const viewInsurance = (patientId) => {
    navigate('/insurance', { state: { patientId } });
  };

  const viewMedicalHistory = (patientId) => {
    navigate('/medicalhistory', { state: { patientId } });
  };

  const handleCheckboxChange = (patient) => {
    setSelectedPatient(patient);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{
          marginBottom: "30px",
          color: "#003366",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Patient Management
      </Typography>

      {/* Search Section */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
        <TextField
          label="Search by Name, Phone, or Email"
          value={searchQuery}
          onChange={handleSearch}
          fullWidth
          sx={{ marginRight: "20px" }}
          placeholder="Search by Name or Phone or Email"
        />
      </Box>

      {/* Button to Register New Patient */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowRegisterForm(true)}
          startIcon={<PersonAddIcon />}
          sx={{ backgroundColor: "#003366" }}
        >
          Register Patient
        </Button>
      </Box>

      {/* Patients Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="patients table">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Select</strong>
              </TableCell>
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                <strong>Name</strong>
              </TableCell>
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                <strong>Age</strong>
              </TableCell>
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                <strong>Email</strong>
              </TableCell>
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                <strong>Phone Number</strong>
              </TableCell>
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                <strong>Gender</strong>
              </TableCell>
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                <strong>Address</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((patient) => (
                <TableRow key={patient.patientId}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPatient?.patientId === patient.patientId}
                      onChange={() => handleCheckboxChange(patient)}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.2rem" }}>{patient.name}</TableCell>
                  <TableCell sx={{ fontSize: "1.2rem" }}>{patient.age}</TableCell>
                  <TableCell sx={{ fontSize: "1.2rem" }}>{patient.email}</TableCell>
                  <TableCell sx={{ fontSize: "1.2rem" }}>{patient.phoneNumber}</TableCell>
                  <TableCell sx={{ fontSize: "1.2rem" }}>{patient.gender}</TableCell>
                  <TableCell sx={{ fontSize: "1.2rem" }}>{patient.address}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredPatients.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {/* Snackbar for alerts */}
      <Snackbar open={showAlert} autoHideDuration={6000} onClose={() => setShowAlert(false)}>
        <Alert onClose={() => setShowAlert(false)} severity={alertType} sx={{ width: "100%" }}>
          {alertMsg}
        </Alert>
      </Snackbar>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <Dialog open={Boolean(selectedPatient)} onClose={() => setSelectedPatient(null)}>
          <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", color: "#003366",marginLeft:"150px" }}>
            Patient Details
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#fff" }}>
            <Typography sx={{fontSize:18}}><strong>Name : </strong>{selectedPatient.name}</Typography>
            <Typography sx={{fontSize:18}}><strong>Age: </strong> {selectedPatient.age}</Typography>
            <Typography sx={{fontSize:18}}><strong>Email: </strong> {selectedPatient.email}</Typography>
            <Typography sx={{fontSize:18}}><strong>Phone Number:  </strong>{selectedPatient.phoneNumber}</Typography>
            <Typography sx={{fontSize:18}}><strong>Gender: </strong>{selectedPatient.gender}</Typography>
            <Typography sx={{fontSize:18}}><strong>Address: </strong>{selectedPatient.address}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => viewInsurance(selectedPatient.patientId)} color="primary">
               Insurance
            </Button>
            <Button onClick={() => viewMedicalHistory(selectedPatient.patientId)} color="primary">
             Medical History
            </Button>
            <IconButton
              onClick={() => {
                setFormData(selectedPatient);
                setShowUpdateForm(true);
                setSelectedPatient(null);
              }}
              color="primary"
            >
              <EditIcon/>
            </IconButton>
            <Button
              onClick={() => {
                setPatientId(selectedPatient.patientId);
                setShowDeleteModal(true);
                setSelectedPatient(null);
              }}
              color="error"
            >
              <DeleteIcon />
            </Button>
            <Button onClick={() => { setSelectedPatient(null);}}color="secondary">
            Cancel
          </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Register Patient Modal */}
      <Dialog open={showRegisterForm} onClose={() => setShowRegisterForm(false)}>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", color: "#003366" }}>
          Register Patient
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#fff" }}>
          <TextField
            label="Name *"
            fullWidth
            margin="normal"
            name="name"
            value={formData.name}
            error={!!formErrors.name}
            helperText={formErrors.name}
            onChange={handleChange}
          />
          <DatePicker
            selected={formData.dateOfBirth}
            onChange={(date) => {
              setFormData({ ...formData, dateOfBirth: date });
              validateField("dateOfBirth", date);
            }}
            customInput={<TextField fullWidth margin="normal" label="Date of Birth *" />}
          />
          <TextField
            label="Phone Number *"
            fullWidth
            margin="normal"
            name="phoneNumber"
            value={formData.phoneNumber}
            error={!!formErrors.phoneNumber}
            helperText={formErrors.phoneNumber}
            onChange={handleChange}
          />
          <TextField
            label="Email *"
            fullWidth
            margin="normal"
            name="email"
            value={formData.email}
            error={!!formErrors.email}
            helperText={formErrors.email}
            onChange={handleChange}
          />
          <TextField
            label="Address *"
            fullWidth
            margin="normal"
            name="address"
            value={formData.address}
            error={!!formErrors.address}
            helperText={formErrors.address}
            onChange={handleChange}
          />
          
          <Select
          
            label="Gender *"
            fullWidth
            margin="normal"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            error={!!formErrors.gender}
          >
            <InputLabel> Gender * </InputLabel>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRegisterForm(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={registerPatient} color="primary">
            Register
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Patient Modal */}
      <Dialog open={showUpdateForm} onClose={() => setShowUpdateForm(false)}>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", color: "#003366" }}>
          Update Patient
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#fff" }}>
          <TextField
            label="Name *"
            fullWidth
            margin="normal"
            name="name"
            value={formData.name}
            error={!!formErrors.name}
            helperText={formErrors.name}
            onChange={handleChange}
          />
          <DatePicker
            selected={formData.dateOfBirth}
            onChange={(date) => {
              setFormData({ ...formData, dateOfBirth: date });
              validateField("dateOfBirth", date);
            }}
            customInput={<TextField fullWidth margin="normal" label="Date of Birth *" />}
          />
          <TextField
            label="Phone Number *"
            fullWidth
            margin="normal"
            name="phoneNumber"
            value={formData.phoneNumber}
            error={!!formErrors.phoneNumber}
            helperText={formErrors.phoneNumber}
            onChange={handleChange}
          />
          <TextField
            label="Email *"
            fullWidth
            margin="normal"
            name="email"
            value={formData.email}
            error={!!formErrors.email}
            helperText={formErrors.email}
            onChange={handleChange}
          />
          <TextField
            label="Address *"
            fullWidth
            margin="normal"
            name="address"
            value={formData.address}
            error={!!formErrors.address}
            helperText={formErrors.address}
            onChange={handleChange}
          />
          <Select
            label="Gender *"
            fullWidth
            margin="normal"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            error={!!formErrors.gender}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpdateForm(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={updatePatient} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Patient Modal */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", color: "#003366" }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#fff" }}>
          <Typography>Are you sure you want to delete this patient?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteModal(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleRemovePatient} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PatientManagement;