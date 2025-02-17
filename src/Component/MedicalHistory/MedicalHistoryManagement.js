import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TablePagination,
  Grid,
  Checkbox
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MedicalHistoryManagement = () => {
  const location = useLocation();
  const { patientId } = location.state ||{}; 


  const [medicalHistoryId, setMedicalHistoryId] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [medicalHistories, setMedicalHistories] = useState([]);
  const [filteredHistories, setFilteredHistories] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [historyToDelete, setHistoryToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    allergies: "", 
    knownDiseases: "", 
    pastTreatments: "", 
    currentTreatments: "", 
    lastCheckUpDate: null, 
    familyMedicalHistory: "", 
    medicalHistoryId: "", 
  });

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      lastCheckUpDate: date,
    }));
    validateField("lastCheckUpDate", date);
  };

  const validateField = (name, value) => { 
    let errors = { ...formErrors }; 
    switch (name) { 
      case "allergies": 
        errors.allergies = value ? "" : "Allergies is mandatory"; 
        break; 
      case "knownDiseases": 
        errors.knownDiseases = value ? "" : "Known Diseases is mandatory"; 
        break; 
      case "pastTreatments": 
        errors.pastTreatments = value ? "" : "Past Treatments is mandatory"; 
        break; 
      case "currentTreatments": 
        errors.currentTreatments = value ? "" : "Current Treatments is mandatory"; 
        break; 
      case "lastCheckUpDate": 
        errors.lastCheckUpDate = value ? "" : "Last Check Up Date is mandatory"; 
        break; 
      case "familyMedicalHistory": // Add validation for familyMedicalHistory if needed
        errors.familyMedicalHistory = value ? "" : "Family Medical History is mandatory"; 
        break;
      default: 
        break; 
    } 
    setFormErrors(errors); 
  };
  

  const validateFormData = () => {
    let isValid = true;
    let errors = {};
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key]);
      if (formErrors[key]) {
        isValid = false;
      }
    });
    setFormErrors(errors);
    return isValid;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchMedicalHistory = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:8080/api/admin/getAllMedicalHistoryByPatientId/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMedicalHistories(response.data);
      setFilteredHistories(response.data);
    } catch (error) {
      setAlertMsg("Error fetching medical history. Please try again.");
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleRegister = async () => {
    if (!validateFormData()) return;
    const token = localStorage.getItem("token");
    const data = { ...formData, patientId };
    try {
      await axios.post(
        "http://localhost:8080/api/admin/addMedicalHistory",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAlertMsg("Medical history registered successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowRegisterForm(false);
      fetchMedicalHistory();
    } catch (error) {
      setAlertMsg(error.response.data || "Error registering medical history. Please try again.");
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleUpdate = async () => {
    if (!validateFormData()) return;
    const token = localStorage.getItem("token");
    const data = { ...formData, patientId };
    try {
      await axios.put(
        `http://localhost:8080/api/admin/updateMedicalHistory/${data.medicalHistoryId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAlertMsg("Medical history updated successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowUpdateForm(false);
      fetchMedicalHistory();
    } catch (error) {
      console.error("Error updating medical history:", error);
      if (error.response && error.response.data) {
        setAlertMsg(error.response.data);
      } else {
        setAlertMsg("Error updating medical history. Please try again.");
      }
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://localhost:8080/api/admin/removeMedicalHistory/${historyToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAlertMsg("Medical history removed successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowDeleteModal(false);
      fetchMedicalHistory();
    } catch (error) {
      setAlertMsg(error.response.data|| "Error removing medical history. Please try again.");
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setMedicalHistoryId(value);
    const filtered = medicalHistories.filter(history =>
      history.knownDiseases.toLowerCase().includes(value)
    );
    setFilteredHistories(filtered);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{ marginBottom: "20px", color: "#003366", fontWeight: "bold", textAlign: "center" }}
      >
        Medical History Management
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowRegisterForm(true)}
        sx={{ marginBottom: "20px", display: "block", marginLeft: "1200px", marginRight: "auto", marginTop: "-10px", width: "200px", backgroundColor: "#003366" }}
      >
        Add Medical History <PersonAddIcon />
      </Button>

      <Grid container spacing={2} alignItems="center" sx={{ marginBottom: "20px" }}>
        <Grid item xs={8}>
          <TextField
            label="Search by Disease"
            margin="normal"
            value={medicalHistoryId}
            sx={{ width: "1300px" }}
            onChange={handleSearch}
          />
        </Grid>
       
      </Grid>

      <Snackbar open={showAlert} autoHideDuration={6000} onClose={() => setShowAlert(false)}>
        <Alert onClose={() => setShowAlert(false)} severity={alertType} sx={{ width: "100%" }}>
          {alertMsg}
        </Alert>
      </Snackbar>

      <TableContainer component={Paper} sx={{ marginBottom: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Select</strong>
              </TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Allergies</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Known Diseases</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Past Treatments</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Current Treatments</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Last Check up date</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Family Medical History</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHistories
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((history) => (
                <TableRow key={history.medicalHistoryId} onClick={() => setSelectedHistory(history)}>
                  <TableCell>
                    <Checkbox
                      checked={selectedHistory?.medicalHistoryId === history.medicalHistoryId}
                      onChange={() => setSelectedHistory(history)}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{history.allergies}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{history.knownDiseases}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{history.pastTreatments}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{history.currentTreatments}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{history.lastCheckUpDate}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{history. familyMedicalHistory}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredHistories.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {selectedHistory && (
        <Dialog open={Boolean(selectedHistory)} onClose={() => setSelectedHistory(null)}>
          <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", color: "#003366" ,marginLeft:"50px"}}>
            Medical History Details
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#fff" }}>
            <Typography sx={{fontSize:18}}><strong>Allergies: </strong>{selectedHistory.allergies}</Typography>
            <Typography sx={{fontSize:18}}><strong>Known Diseases: </strong>{selectedHistory.knownDiseases}</Typography>
            <Typography sx={{fontSize:18}}><strong>Past Treatments: </strong>{selectedHistory.pastTreatments}</Typography>
            <Typography sx={{fontSize:18}}><strong>Current Treatments: </strong>{selectedHistory.currentTreatments}</Typography>
            <Typography sx={{fontSize:18}}><strong>Last Check Up Date: </strong> {selectedHistory.lastCheckUpDate}</Typography>
            <Typography sx={{fontSize:18}}><strong>Family Medical History: </strong>{selectedHistory. familyMedicalHistory}</Typography>
          </DialogContent>
          <DialogActions>
            <Button sx={{marginRight:"60px"}}
              onClick={() => {
                setFormData({
                  allergies: selectedHistory.allergies,
                  knownDiseases: selectedHistory.knownDiseases,
                  pastTreatments: selectedHistory.pastTreatments,
                  currentTreatments: selectedHistory.currentTreatments,
                  lastCheckUpDate: new Date(selectedHistory.lastCheckUpDate),
                  familyMedicalHistory: selectedHistory. familyMedicalHistory,
                  medicalHistoryId: selectedHistory.medicalHistoryId,
                });
                setShowUpdateForm(true);
                setSelectedHistory(null);
              }}
              color="primary"
            >
              <EditIcon />
            </Button>
            <Button sx={{marginRight:"60px"}}
              onClick={() => {
                setHistoryToDelete(selectedHistory.medicalHistoryId);
                setShowDeleteModal(true);
                setSelectedHistory(null);
              }}
              color="error"
            >
              <DeleteIcon />
            </Button>
            <Button onClick={() => setSelectedHistory(null)} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog open={showRegisterForm} onClose={() => setShowRegisterForm(false)}>
        <DialogTitle>Register Medical History</DialogTitle>
        <DialogContent>
          <TextField
            label="Allergies **"
            fullWidth
            margin="normal"
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            error={!!formErrors.allergies}
            helperText={formErrors.allergies}
          />
          <TextField
            label="Known Diseases **"
            fullWidth
            margin="normal"
            name="knownDiseases"
            value={formData.knownDiseases}
            onChange={handleChange}
            error={!!formErrors.knownDiseases}
            helperText={formErrors.knownDiseases}
          />
          <TextField
            label="Past Treatments **"
            fullWidth
            margin="normal"
            name="pastTreatments"
            value={formData.pastTreatments}
            onChange={handleChange}
            error={!!formErrors.pastTreatments}
            helperText={formErrors.pastTreatments}
          />
          <TextField
            label="Current Treatments **"
            fullWidth
            margin="normal"
            name="currentTreatments"
            value={formData.currentTreatments}
            onChange={handleChange}
            error={!!formErrors.currentTreatments}
            helperText={formErrors.currentTreatments}
          />
           <TextField 
  label="Family Medical History" 
  fullWidth 
  margin="normal" 
  name="familyMedicalHistory" // Ensure this matches the key in your formData
  value={formData.familyMedicalHistory} 
  onChange={handleChange} 
  error={!!formErrors.familyMedicalHistory} 
  helperText={formErrors.familyMedicalHistory} 
/>

          <DatePicker
            selected={formData.lastCheckUpDate}
            onChange={handleDateChange}
            dateFormat="yyyy/MM/dd"
            customInput={<TextField fullWidth margin="normal" label="Last Check-up Date **" />}
          />
         
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRegisterForm(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRegister} color="primary">
            Register
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showUpdateForm} onClose={() => setShowUpdateForm(false)}>
        <DialogTitle>Edit Medical History</DialogTitle>
        <DialogContent>
          <TextField
            label="Allergies **"
            fullWidth
            margin="normal"
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            error={!!formErrors.allergies}
            helperText={formErrors.allergies}
          />
          <TextField
            label="Known Diseases **"
            fullWidth
            margin="normal"
            name="knownDiseases"
            value={formData.knownDiseases}
            onChange={handleChange}
            error={!!formErrors.knownDiseases}
            helperText={formErrors.knownDiseases}
          />
          <TextField
            label="Past Treatments **"
            fullWidth
            margin="normal"
            name="pastTreatments"
            value={formData.pastTreatments}
            onChange={handleChange}
            error={!!formErrors.pastTreatments}
            helperText={formErrors.pastTreatments}
          />
          <TextField
            label="Current Treatments **"
            fullWidth
            margin="normal"
            name="currentTreatments"
            value={formData.currentTreatments}
            onChange={handleChange}
            error={!!formErrors.currentTreatments}
            helperText={formErrors.currentTreatments}
          />
          <DatePicker
            selected={formData.lastCheckUpDate}
            onChange={handleDateChange}
            dateFormat="yyyyMMdd"
            customInput={<TextField fullWidth margin="normal" label="Last Check-up Date **" />}
          />
           <TextField
            label="Family Medical History"
            fullWidth
            margin="normal"
            name="familyMedicalHistory"
            value={formData.familyMedicalHistory}
            onChange={handleChange}
            error={!!formErrors.familyMedicalHistory}
            helperText={formErrors.familyMedicalHistory}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpdateForm(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdate} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <DialogTitle>Delete Medical History</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this medical history?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteModal(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MedicalHistoryManagement;