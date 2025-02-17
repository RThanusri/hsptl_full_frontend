import React, { useState, useEffect } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
  Checkbox,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [filteredStaffList, setFilteredStaffList] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    staffRole: "",
    contactInfo: "",
    salaryAmount: "",
    employmentStartDate: new Date(),
    specialization: "nursing",
  });
  const [staffId, setStaffId] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const handlePerformance = (staffId) => {
    navigate(`/staffPerformance/${staffId}`);
  };

  const handleStaffSchedule = (staffId) => {
    navigate(`/staffSchedule/${staffId}`);
  };

  const handleAttendance = (staffId) => {
    navigate(`/staffAttendance/${staffId}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchStaffList = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:8080/api/admin/getAllStaff", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setStaffList(response.data);
      setFilteredStaffList(response.data);
    } catch (error) {
      setAlertMsg(error.response.data||"unexpected");
      setAlertType("error");
      setShowAlert(true);
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let tempErrors = { ...errors };

    switch (name) {
      case "name":
        tempErrors.name = value ? "" : "Staff name is required";
        break;
      case "staffRole":
        tempErrors.staffRole = value ? "" : "Role is required";
        break;
      case "contactInfo":
        tempErrors.contactInfo = value ? "" : "Contact information is required";
        break;
      case "searchQuery":
        setSearchQuery(value);
        filterStaffList(value);
        return;
      default:
        break;
    }

    setErrors(tempErrors);
  };

  const filterStaffList = (query) => {
    const lowercasedQuery = query.toLowerCase();
    const filteredList = staffList.filter(
      (staff) =>
        staff.name.toLowerCase().includes(lowercasedQuery)  ||      staff.contactInfo.toLowerCase().includes(lowercasedQuery)  ||      staff.staffRole.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredStaffList(filteredList);
  };

  const handleRegisterStaff = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:8080/api/admin/registerStaff", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setAlertMsg("Staff registered successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowRegisterForm(false);
      fetchStaffList();
    } catch (error) {
      if (error.response && error.response.data) {
        setAlertMsg(error.response.data||"Error registering staff.");
      } else {
        setAlertMsg("Error registering staff. Please try again.");
      }
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleUpdateStaff = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`http://localhost:8080/api/admin/updateStaff/${staffId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setAlertMsg("Staff updated successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowUpdateForm(false);
      setSelectedStaff(null); // Uncheck the checkbox
      fetchStaffList();
    } catch (error) {
      if (error.response && error.response.data) {
        setAlertMsg(error.response.data||"Error updating staff.");
      } else {
        setAlertMsg("Error updating staff. Please try again.");
      }
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleRemoveStaff = async () => {
    const token = localStorage.getItem("token");
    try {
      // Delete staff record
      await axios.delete(`http://localhost:8080/api/admin/removeStaff/${staffId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      // Delete related performance records
      await axios.delete(`http://localhost:8080/api/admin/removeStaffPerformanceById/${staffId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      // Delete related schedule records
      await axios.delete(`http://localhost:8080/api/admin/removeStaffScheduleById/${staffId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      
      await axios.delete(`http://localhost:8080/api/admin/removeStaffAttendanceById/${staffId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      setAlertMsg("Staff and related records removed successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowDetailsModal(false);
      setShowDeleteModal(false);
      setSelectedStaff(null); 
      fetchStaffList();
    } catch (error) {
      setAlertMsg(error.response.data ||"Error removing staff and related records.");
      setAlertType("error");
      setShowAlert(true);
    }
  };
  

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ marginBottom: "30px", color: "#003366", fontWeight: "bold", textAlign: "center" }}>
        Staff Management
      </Typography>

      <Button
        variant="contained"
        startIcon={<PersonAddIcon />}
        onClick={() => setShowRegisterForm(true)}
        sx={{ marginLeft: "auto", display: "block", backgroundColor: "#003366" }}
      >
        Register Staff
      </Button>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <TextField
          label="Search by Name, Email, Phone"
          variant="outlined"
          name="searchQuery"
          value={searchQuery}
          onChange={handleChange}
          style={{ marginRight: "10px", width: "900px" }}
        />
      </div>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="staff table">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Select</strong>
              </TableCell>
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>Role</TableCell>
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>Contact Info</TableCell>
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>Start Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaffList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedStaff?.id === staff.id}
                    onChange={() => {
                      setSelectedStaff(staff);
                      setFormData({
                        name: staff.name,
                        staffRole: staff.staffRole,
                        contactInfo: staff.contactInfo,
                        salaryAmount: staff.salaryAmount,
                        employmentStartDate: new Date(staff.employmentStartDate),
                        specialization: staff.specialization,
                      });
                      setStaffId(staff.id);
                      setShowDetailsModal(true);
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: "1.2rem" }}>{staff.name}</TableCell>
                <TableCell sx={{ fontSize: "1.2rem" }}>{staff.staffRole}</TableCell>
                <TableCell sx={{ fontSize: "1.2rem" }}>{staff.contactInfo}</TableCell>
                <TableCell sx={{ fontSize: "1.2rem" }}>{staff.employmentStartDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredStaffList.length}
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
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", color: "#003366" }}>Register Staff</DialogTitle>
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
          <FormControl fullWidth margin="normal">
            <InputLabel>Role *</InputLabel>
            <Select name="staffRole" value={formData.staffRole} onChange={handleChange} error={!!errors.staffRole}>
              <MenuItem value="NURSE">NURSE</MenuItem>
              <MenuItem value="ADMINISTRATIVE_STAFF">ADMINISTRATIVE STAFF</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Email ID *"
            fullWidth
            margin="normal"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            error={!!errors.contactInfo}
            helperText={errors.contactInfo}
          />
          <InputLabel>Start Date *</InputLabel>
          <DatePicker
            selected={formData.employmentStartDate}
            onChange={(date) => setFormData({ ...formData, employmentStartDate: date })}
            dateFormat="yyyy-MM-dd"
            customInput={<TextField fullWidth margin="normal" />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRegisterForm(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleRegisterStaff} color="primary">
            Register
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showUpdateForm} onClose={() => setShowUpdateForm(false)}>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", color: "#003366" }}>Update Staff</DialogTitle>
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
          <FormControl fullWidth margin="normal">
            <InputLabel>Role *</InputLabel>
            <Select name="staffRole" value={formData.staffRole} onChange={handleChange} error={!!errors.staffRole}>
              <MenuItem value="NURSE">NURSE</MenuItem>
              <MenuItem value="ADMINISTRATIVE_STAFF">ADMINISTRATIVE STAFF</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Email ID *"
            fullWidth
            margin="normal"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            error={!!errors.contactInfo}
            helperText={errors.contactInfo}
          />
          <InputLabel>Start Date *</InputLabel>
          <DatePicker
            selected={formData.employmentStartDate}
            onChange={(date) => setFormData({ ...formData, employmentStartDate: date })}
            dateFormat="yyyy-MM-dd"
            customInput={<TextField fullWidth margin="normal" />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpdateForm(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateStaff} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "25px", color: "#003366",marginLeft:"210px"}}>Staff Details</DialogTitle>
        
        <DialogContent sx={{ backgroundColor: "#fff" }}>
          <Typography sx={{fontSize:18,marginLeft:"200px"}}><strong>Name  :   </strong>{formData.name}</Typography>
          <Typography sx={{fontSize:18,marginLeft:"200px"}}><strong>Role  :    </strong> {formData.staffRole}</Typography>
          <Typography sx={{fontSize:18,marginLeft:"200px"}}><strong>Email :     </strong>{formData.contactInfo}</Typography>
          <Typography sx={{fontSize:18,marginLeft:"200px"}}><strong>Start Date : </strong>{formData.employmentStartDate.toISOString().split("T")[0]}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handlePerformance(selectedStaff.id)}
            variant="outlined"
            color="primary"
            sx={{ marginRight: "10px" }}
          >
            Performance
          </Button>
          <Button
            onClick={() => handleStaffSchedule(selectedStaff.id)}
            variant="outlined"
            color="secondary"
            sx={{ marginRight: "10px" }}
          >
            Schedule
          </Button>
          <Button
            onClick={() => handleAttendance(selectedStaff.id)}
            variant="outlined"
            color="success"
            sx={{ marginRight: "10px" }}
          >
            Attendance
          </Button>
          <Button
            onClick={() => {
              setStaffId(selectedStaff.id);
              setShowDetailsModal(false);
              setShowUpdateForm(true);
            }}
            variant="outlined"
            color="secondary"
            sx={{ marginRight: "10px" }}
          >
            <EditIcon />
          </Button>
          <Button
            onClick={() => {
              setStaffId(selectedStaff.id);
              setShowDetailsModal(false);
              setShowDeleteModal(true);
              
            }}
            variant="outlined"
            color="error"
          >
            <DeleteIcon />
          </Button>
          <Button
            onClick={() => {
              setShowDetailsModal(false);
              setSelectedStaff(null); // Uncheck the checkbox
            }}
            color="secondary"
          >
            X
          </Button>
        </DialogActions>
      </Dialog>
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
          <Button onClick={handleRemoveStaff } color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StaffManagement;