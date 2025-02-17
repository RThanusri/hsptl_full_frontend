import React, { useState, useEffect } from "react";
import { Chart, registerables } from 'chart.js';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Checkbox,
  Select,
  MenuItem,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { useParams } from "react-router-dom";
Chart.register(...registerables);

const DoctorPerformance = () => {
  const { doctorId } = useParams();
  const [formData, setFormData] = useState({
    staffId: "",
    patientsSeen: "",
    year: "",
    workHours: "",
    month: "",
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [alert, setAlert] = useState({ open: false, message: "", type: "" });
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:8080/api/admin/getStaffPerformanceById/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const performanceData = Array.isArray(response.data)
        ? response.data
        : [response.data];
      const enrichedData = await Promise.all(
        performanceData.map(async (data) => {
          const relatedResponse = await axios.get(
            `http://localhost:8080/api/admin/getStaffById/${doctorId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return {
            ...data,
            staffName: relatedResponse.data.name,
          };
        })
      );

      setPerformanceData(enrichedData);
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data,
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [doctorId]);

  const handleChange = (e) => {
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
      case "patientsSeen":
        errors.patientsSeen = value ? "" : "Patients Seen is required";
        break;
      case "year":
        errors.year = value ? "" : "Year is required";
        break;
      case "workHours":
        errors.workHours = value ? "" : "Work Hours is required";
        break;
      case "month":
        errors.month = value ? "" : "Month is required";
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

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddOrUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const updatedFormData = { ...formData, staffId: doctorId };

      if (isEditing) {
        await axios.put(
          `http://localhost:8080/api/admin/updateStaffPerformance/${selectedRecord.performanceId}`,
          updatedFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAlert({
          open: true,
          message: "Performance updated successfully!",
          type: "success",
        });
      } else {
        await axios.post(
          "http://localhost:8080/api/admin/inputStaffPerformance",
          updatedFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAlert({
          open: true,
          message: "Performance added successfully!",
          type: "success",
        });
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data,
        type: "error",
      });
    }
  };

  const handleDelete = async (performanceId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8080/api/admin/removeStaffPerformance/${performanceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({
        open: true,
        message: "Performance deleted successfully!",
        type: "success",
      });
      fetchData();
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data,
        type: "error",
      });
    }
  };

  const handleSelectRecord = (record) => {
    setSelectedRecord(record);
    setFormData({
      patientsSeen: record.patientsSeen,
      feedbackScore: record.feedbackScore,
      workHours: record.workHours,
      month: record.month,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const monthOrder = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filteredData = performanceData
    .filter((record) => {
      const monthMatches = record.month.toLowerCase().includes(searchTerm.toLowerCase());
      const ratingMatches = (!minRating|| record.efficiencyRating >= minRating) &&
                            (!maxRating|| record.efficiencyRating <= maxRating);
      return monthMatches && ratingMatches;
    })
    .sort((a, b) => {
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });

  const chartData = {
    labels: filteredData.map((record) => record.month),
    datasets: [
      {
        label: "Efficiency Rating",
        data: filteredData.map((record) => record.efficiencyRating),
        fill: false,
        backgroundColor: "#003366",
        borderColor: "#003366",
        pointBorderColor: "#fff",
      },
    ],
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
        Doctor Performance Management
      </Typography>
      {performanceData.length > 0 && (
        <Typography
          variant="h5"
          sx={{
            marginBottom: "20px",
            color: "#003366",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Staff Name: {performanceData[0].staffName}
        </Typography>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <TextField
          label="Search by Month"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ marginRight: "20px" }}
        />
        <TextField
          label="Min Rating"
          variant="outlined"
          type="number"
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          sx={{ marginRight: "20px" }}
        />
        <TextField
          label="Max Rating"
          variant="outlined"
          type="number"
          value={maxRating}
          onChange={(e) => setMaxRating(e.target.value)}
          sx={{ marginRight: "20px" }}
        />
        <Button
          variant="contained"
          sx={{ backgroundColor: "#003366" }}
          onClick={() => {
            setFormData({ patientsSeen: "", year: "", workHours: "", month: "" });
            setIsEditing(false);
            setShowModal(true);
          }}
        >
          Add
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}><strong>Select</strong></TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}><strong>Month</strong></TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}><strong>Year</strong></TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}><strong>Patients Seen</strong></TableCell>
             
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}><strong>Work Hours</strong></TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}><strong>Efficiency Rating</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((record) => (
                <TableRow key={record.performanceId}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRecord?.performanceId === record.performanceId}
                      onChange={() => handleSelectRecord(record)}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{record.month}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{record.year}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{record.patientsSeen}</TableCell>
                 
                  <TableCell sx={{ fontSize: '1.2rem' }}>{record.workHours}</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>{record.efficiencyRating}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Chart for Performance */}
      <div style={{ marginTop: "40px" }}>
        <Typography variant="h5" sx={{ marginBottom: "20px", textAlign: "center" }}>
          Monthly Efficiency Rating
        </Typography>
        <Line data={chartData} />
      </div>

      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>{isEditing ? "Edit Performance" : "Add Performance"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Patients Seen **"
            fullWidth
            margin="normal"
            name="patientsSeen"
            value={formData.patientsSeen}
            onChange={handleChange}
            error={!!formErrors.patientsSeen}
            helperText={formErrors.patientsSeen}
          />
          <TextField
            label="Year**"
            fullWidth
            margin="normal"
            name="year"
            value={formData.year}
            onChange={handleChange}
            error={!!formErrors.year}
            helperText={formErrors.year}
          />
          <TextField
            label="Work Hours **"
            fullWidth
            margin="normal"
            name="workHours"
            value={formData.workHours}
            onChange={handleChange}
            error={!!formErrors.workHours}
            helperText={formErrors.workHours}
          />
          <Select
            label="Month **"
            fullWidth
            margin="normal"
            name="month"
            value={formData.month}
            onChange={handleChange}
            error={!!formErrors.month}
          >
            {monthOrder.map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleAddOrUpdate}>{isEditing ? "Update" : "Add"}</Button>
          {isEditing && (
            <Button onClick={() => handleDelete(selectedRecord.performanceId)} color="error">
              Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.type}>
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DoctorPerformance;