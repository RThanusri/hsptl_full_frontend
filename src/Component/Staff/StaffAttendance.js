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
  IconButton,
  TablePagination,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useParams } from "react-router-dom";

const StaffAttendance = () => {
  const { staffId } = useParams();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: "", type: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchDate, setSearchDate] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:8080/api/staff/getAllStaffAttendanceById/${staffId}`,
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
        message: error.response.data,
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async () => {
    const token = localStorage.getItem("token");
    try {
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
      fetchData();
    } catch (error) {
      setAlert({
        open: true,
        message: error.response.data,
        type: "error",
      });
    }
  };

  const handleCheckOut = async () => {
    const token = localStorage.getItem("token");
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
      fetchData();
    } catch (error) {
      setAlert({
        open: true,
        message: error.response.data,
        type: "error",
      });
    }
  };

  const handleDelete = async (recordId) => {
    const token = localStorage.getItem("token");
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
      fetchData();
    } catch (error) {
      setAlert({
        open: true,
        message: error.response.data,
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

  const handleRowSelect = (record) => {
    setSelectedRecord(record);
  };

  const filteredRecords = attendanceRecords.filter((record) =>
    record.date.includes(searchDate)
  );

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
        Staff Attendance Management
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
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>Select</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}><strong>Date</strong></TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}><strong>Check-In Time</strong></TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}><strong>Check-Out Time</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record) => (
              <TableRow key={record.attendanceId}>
                <TableCell>
                  <Checkbox
                    checked={selectedRecord?.attendanceId === record.attendanceId}
                    onChange={() => handleRowSelect(record)}
                  />
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

      {selectedRecord && (
        <Dialog open={Boolean(selectedRecord)} onClose={() => setSelectedRecord(null)}>
          <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", color: "#003366" }}>
            Attendance Details
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#fff" }}>
            <Typography sx={{fontSize:18}}><strong>Date : </strong>{selectedRecord.date}</Typography>
            <Typography sx={{fontSize:18}}><strong>Check-In Time: </strong>{selectedRecord.entryTime}</Typography>
            <Typography sx={{fontSize:18}}><strong>Check-Out Time: </strong>{selectedRecord.exitTime}</Typography>
          </DialogContent>
          <DialogActions>
            <IconButton sx={{marginLeft:"0px",marginRight:"150px"}}
              color="error"
              onClick={() => {
                handleDelete(selectedRecord);
                setSelectedRecord(null);
              }}
            >
              <DeleteIcon />
            </IconButton>
            <Button onClick={() => setSelectedRecord(null)} color="error">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

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

export default StaffAttendance;
