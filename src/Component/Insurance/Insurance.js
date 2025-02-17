import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Snackbar,
  Alert,
  TextField,
  Dialog,
  DialogActions,
  TablePagination,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const Insurance = () => {
  const { patientId } = useParams();
  const [formErrors, setFormErrors] = useState({});
  const [insuranceDetails, setInsuranceDetails] = useState([]);
  const [filteredInsuranceDetails, setFilteredInsuranceDetails] = useState([]); // Use a separate state for filtered data
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("");
  const [formData, setFormData] = useState({
    policyNumber: "",
    coverageAmount: "",
    insuranceProvider: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [insuranceToEdit, setInsuranceToEdit] = useState(null);
  const [insuranceToDelete, setInsuranceToDelete] = useState(null);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchInsuranceDetails = async () => {
    const token = localStorage.getItem("token");
    if (!patientId) {
      setAlertMsg("Patient ID is required.");
      setAlertType("error");
      setShowAlert(true);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/api/admin/getAllInsuranceDetailsByPatientId/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setInsuranceDetails(response.data);
      setFilteredInsuranceDetails(response.data); // Initially, all details are shown
    } catch (error) {
      console.log(error.response)
      setAlertMsg(error.response.message);
      setAlertType("error");
      setShowAlert(true);
    }
  };

  useEffect(() => {
    fetchInsuranceDetails();
  }, [patientId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errors = { ...formErrors };
    switch (name) {
      case "policyNumber":
        errors.policyNumber = value ? "" : "Policy Number is mandatory";
        break;
      case "coverageAmount":
        if (!value) {
          errors.coverageAmount = "Coverage Amount is mandatory";
        } else if (value <= 0) {
          errors.coverageAmount = "Amount should be greater than 0";
        } else {
          errors.coverageAmount = "";
        }
        break;
      case "insuranceProvider":
        errors.insuranceProvider = value ? "" : "Insurance Provider is mandatory";
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

  const handleInsuranceSelect = (insurance) => {
    setSelectedInsurance(insurance);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = insuranceDetails.filter((insurance) => {
      const policyNumber = insurance.policyNumber.toString();
      const id = insurance.id.toString();

      return (
        policyNumber.toLowerCase().includes(query.toLowerCase())     ||   insurance.insuranceProvider.toLowerCase().includes(query.toLowerCase())     ||   id.toLowerCase().includes(query.toLowerCase())
      );
    });

    setFilteredInsuranceDetails(filtered);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Add insurance handler
  const handleAddInsurance = async () => {
    if (!validateFormData()) return;
    const token = localStorage.getItem("token");
    const newInsurance = {
      patientId,
      ...formData,
    };

    try {
      await axios.post(
        "http://localhost:8080/api/admin/addInsurance",
        newInsurance,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAlertMsg("Insurance added successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowAddForm(false);
      fetchInsuranceDetails();
    } catch (error) {
      setAlertMsg(error.response.data ||"Unable to add insurance");
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleEditInsurance = async () => {
    if (!validateFormData()) return;
    const token = localStorage.getItem("token");
    const updatedInsurance = { ...insuranceToEdit, ...formData };

    try {
      await axios.put(
        `http://localhost:8080/api/admin/updateInsuranceInfo/${insuranceToEdit.id}`,
        updatedInsurance,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAlertMsg("Insurance updated successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowEditForm(false);
      fetchInsuranceDetails(); // Refresh insurance details after update
    } catch (error) {
      setAlertMsg(error.response.data|| "Unable to update the record");
      setAlertType("error");
      setShowAlert(true);
    }
  };

  // Remove insurance handler
  const removeInsurance = async (insuranceId) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(
        `http://localhost:8080/api/admin/removeInsuranceDetails/${insuranceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAlertMsg("Insurance details removed successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowDeleteModal(false);
      fetchInsuranceDetails(); // Refresh the insurance details after removing
    } catch (error) {
      setAlertMsg(error.response.data ||"Unable to remove data");
      setAlertType("error");
      setShowAlert(true);
    }
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", color: "#003366", fontWeight: "bold", marginLeft: '650px' }}>
        Insurance Management
      </Typography>

      <Snackbar open={showAlert} autoHideDuration={6000} onClose={() => setShowAlert(false)}>
        <Alert onClose={() => setShowAlert(false)} severity={alertType} sx={{ width: "100%" }}>
          {alertMsg}
        </Alert>
      </Snackbar>

      {/* Search Field for Policy Number and Insurance Provider */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-end" }}>
        <TextField
          label="Search by Policy Number or Provider"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange} // Update the filtered results on input change
        />
      </div>

      {/* Add Insurance Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowAddForm(true)}
        startIcon={<PersonAddIcon />}
        sx={{ marginBottom: "20px", display: "flex", justifyContent: "flex-end", marginLeft: "1300px", backgroundColor: "#003366" }}
      >
        Add Insurance
      </Button>

      {/* Insurance List Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Select</strong>
              </TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Policy Number</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Coverage Amount</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Insurance Provider</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInsuranceDetails
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((insurance) => (
                <TableRow key={insurance.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedInsurance?.id === insurance.id}
                      onChange={() => handleInsuranceSelect(insurance)}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{insurance.policyNumber}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{insurance.coverageAmount}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{insurance.insuranceProvider}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredInsuranceDetails.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {/* Insurance Details Modal */}
      {selectedInsurance && (
        <Dialog open={Boolean(selectedInsurance)} onClose={() => setSelectedInsurance(null)}>
          <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", color: "#003366" ,marginLeft:"60px"}}>
            Insurance Details
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#fff" }}>
            <Typography sx={{fontSize:18}}><strong>Policy Number:</strong> {selectedInsurance.policyNumber}</Typography>
            <Typography sx={{fontSize:18}}><strong>Coverage Amount: </strong>{selectedInsurance.coverageAmount}</Typography>
            <Typography sx={{fontSize:18}}><strong>Insurance Provider: </strong>{selectedInsurance.insuranceProvider}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setInsuranceToEdit(selectedInsurance);
                setFormData({
                  policyNumber: selectedInsurance.policyNumber,
                  coverageAmount: selectedInsurance.coverageAmount,
                  insuranceProvider: selectedInsurance.insuranceProvider,
                });
                setShowEditForm(true);
                setSelectedInsurance(null);
              }}
              color="primary"
            >
              <EditIcon />
            </Button>
            <Button
              onClick={() => {
                setInsuranceToDelete(selectedInsurance.id);
                setShowDeleteModal(true);
                setSelectedInsurance(null);
              }}
              color="error"
            >
              <DeleteIcon />
            </Button>
            <Button onClick={() => setSelectedInsurance(null)} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Add Insurance Dialog */}
      <Dialog open={showAddForm} onClose={() => setShowAddForm(false)}>
        <DialogTitle>Add Insurance</DialogTitle>
        <DialogContent>
          <TextField
            label="Policy Number **"
            fullWidth
            margin="normal"
            name="policyNumber"
            value={formData.policyNumber}
            onChange={handleInputChange}
            error={!!formErrors.policyNumber}
            helperText={formErrors.policyNumber}
          />
          <TextField
            label="Coverage Amount **"
            fullWidth
            margin="normal"
            name="coverageAmount"
            value={formData.coverageAmount}
            onChange={handleInputChange}
            error={!!formErrors.coverageAmount}
            helperText={formErrors.coverageAmount}
          />
          <TextField
            label="Insurance Provider **"
            fullWidth
            margin="normal"
            name="insuranceProvider"
            value={formData.insuranceProvider}
            onChange={handleInputChange}
            error={!!formErrors.insuranceProvider}
            helperText={formErrors.insuranceProvider}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddForm(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddInsurance} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Insurance Dialog */}
      <Dialog open={showEditForm} onClose={() => setShowEditForm(false)}>
        <DialogTitle>Edit Insurance</DialogTitle>
        <DialogContent>
          <TextField
            label="Policy Number **"
            fullWidth
            margin="normal"
            name="policyNumber"
            value={formData.policyNumber}
            onChange={handleInputChange}
            error={!!formErrors.policyNumber}
            helperText={formErrors.policyNumber}
          />
          <TextField
            label="Coverage Amount **"
            fullWidth
            margin="normal"
            name="coverageAmount"
            value={formData.coverageAmount}
            onChange={handleInputChange}
            error={!!formErrors.coverageAmount}
            helperText={formErrors.coverageAmount}
          />
          <TextField
            label="Insurance Provider **"
            fullWidth
            margin="normal"
            name="insuranceProvider"
            value={formData.insuranceProvider}
            onChange={handleInputChange}
            error={!!formErrors.insuranceProvider}
            helperText={formErrors.insuranceProvider}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditForm(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditInsurance} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <DialogTitle>Delete Insurance</DialogTitle>
        <DialogContent>Are you sure you want to delete this insurance detail?</DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteModal(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => removeInsurance(insuranceToDelete)} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Insurance;