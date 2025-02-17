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
  TablePagination,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import { useParams } from "react-router-dom";

const DoctorAttendance = () => {
  const { doctorId } = useParams();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: "", type: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchDate, setSearchDate] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchAttendanceRecords = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:8080/api/staff/getAllStaffAttendanceById/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAttendanceRecords(response.data);
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data,
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const handleCheckIn = async () => {
    const token = localStorage.getItem("token");
    try {
      const staffId = doctorId;
      await axios.post(
        `http://localhost:8080/api/staff/staffCheckIn`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { staffId },
        }
      );
      setAlert({
        open: true,
        message: "Check-in successful!",
        type: "success",
      });
      fetchAttendanceRecords();
    } catch (error) {
      setAlert({
        open: true,
        message: "Failed to check in.",
        type: "error",
      });
    }
  };

  const handleCheckOut = async () => {
    const token = localStorage.getItem("token");
    const staffId = doctorId;
    try {
      await axios.put(
        `http://localhost:8080/api/staff/staffCheckOut`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { staffId },
        }
      );
      setAlert({
        open: true,
        message: "Check-out successful!",
        type: "success",
      });
      fetchAttendanceRecords();
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data,
        type: "error",
      });
    }
  };

  const handleDelete = async (recordId) => {
    const token = localStorage.getItem("token");
    const staffId = doctorId;
    try {
      await axios.delete(
        `http://localhost:8080/api/admin/removeAttendance`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { staffId, date: recordId.date },
        }
      );
      setAlert({
        open: true,
        message: "Attendance deleted successfully!",
        type: "success",
      });
      
     
      setDialogOpen(false);
      fetchAttendanceRecords();
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data,
        type: "error",
      });
    }
  };

  const handleSearchChange = (event) => {
    setSearchDate(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRecords = attendanceRecords.filter((record) =>
    record.date.includes(searchDate)
  );

  const handleCheckboxChange = (record) => {
    setSelectedRecord(record);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedRecord(null);
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
        Doctor Attendance Management
      </Typography>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <Button
          variant="contained"
          sx={{ marginLeft: "20px", backgroundColor: "#003366" }}
          onClick={handleCheckIn}
        >
          Check-In
        </Button>

        <TextField
          label="Search by Date"
          fullWidth
          variant="outlined"
          value={searchDate}
          onChange={handleSearchChange}
          sx={{ marginRight: "20px", width: "1000px" }}
        />
        <Button
          variant="contained"
          sx={{ marginLeft: "20px", backgroundColor: "#003366" }}
          onClick={handleCheckOut}
        >
          Check-Out
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}><strong>Select</strong></TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}><strong>Date</strong></TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}><strong>Check-In Time</strong></TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}><strong>Check-Out Time</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record) => (
              <TableRow key={record.attendanceId}>
                <TableCell sx={{ fontSize: '1.2rem' }}>
                  <Checkbox onChange={() => handleCheckboxChange(record)} />
                </TableCell>
                <TableCell sx={{ fontSize: '1.2rem' }}>{record.date}</TableCell>
                <TableCell sx={{ fontSize: '1.2rem' }}>{record.entryTime}</TableCell>
                <TableCell sx={{ fontSize: '1.2rem' }}>{record.exitTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredRecords.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.type}>
          {alert.message}
        </Alert>
      </Snackbar>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Attendance Details</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Date: {selectedRecord?.date}
          </DialogContentText>
          <DialogContentText>
            Check-In Time: {selectedRecord?.entryTime}
          </DialogContentText>
          <DialogContentText>
            Check-Out Time: {selectedRecord?.exitTime}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <IconButton onClick={() => handleDelete(selectedRecord)}>
            <DeleteIcon color="error" />
          </IconButton>
         
          <Button onClick={handleDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DoctorAttendance;