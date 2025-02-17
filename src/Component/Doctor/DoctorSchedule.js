import React, { useState, useEffect } from "react";
import {
  Typography,
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
  Snackbar,
  Alert,
  Paper,
  TablePagination,
  Checkbox,
  IconButton,
} from "@mui/material";
import UpdateIcon from "@mui/icons-material/Update";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation } from "react-router-dom";

const DoctorSchedule = () => {
  const location = useLocation();
  const { doctorId } = location.state|| {};
  const [scheduleDetails, setScheduleDetails] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    doctorId: doctorId,
    date: new Date(),
    startTime: "",
    endTime: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchSchedules();
  }, [doctorId]);

  const fetchSchedules = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`http://localhost:8080/api/admin/getDoctorScheduleByDoctorId/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScheduleDetails(response.data);
      setFilteredSchedules(response.data);
    } catch (error) {
      setAlertMsg(error.response?.data);
      setAlertType("error");
      setShowAlert(true);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filteredData = scheduleDetails.filter((schedule) => {
        return (
          schedule.date.includes(lowerCaseQuery)       ||   (schedule.tasks && schedule.tasks.toLowerCase().includes(lowerCaseQuery))
        );
      });
      setFilteredSchedules(filteredData);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, scheduleDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleData({ ...scheduleData, [name]: value });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errors = { ...formErrors };
    switch (name) {
      case "startTime":
        errors.startTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(value) ? "" : "Invalid time format (HH:mm)";
        break;
      case "endTime":
        errors.endTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(value) ? "" : "Invalid time format (HH:mm)";
        break;
      case "tasks":
        errors.tasks = value ? "" : "Tasks cannot be empty";
        break;
      default:
        break;
    }
    setFormErrors(errors);
  };

  const handleAddSchedule = async () => {
    const token = localStorage.getItem("token");
    const dataToSend = {
      doctorId: doctorId,
      date: scheduleData.date.toISOString().split("T")[0],
      startTime: scheduleData.startTime,
      endTime: scheduleData.endTime,
      
    };
    console.log(dataToSend);
    try {
      await axios.post("http://localhost:8080/api/admin/scheculeDoctorDailyTasks", dataToSend, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setAlertMsg("Schedule added successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowAddForm(false);
      fetchSchedules();
    } catch (error) {
      setAlertMsg(error.response?.data);
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleEditSchedule = async () => {
    const token = localStorage.getItem("token");
    let date = scheduleData.date;
    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    const dataToSend = {
      doctorId: scheduleData.doctorId,
      date: date.toISOString().split("T")[0],
      startTime: scheduleData.startTime,
      endTime: scheduleData.endTime,
      
    };
    try {
      await axios.put(`http://localhost:8080/api/admin/updateDoctorAppointmentScheduleForDay/${selectedSchedule.doctorId}/${selectedSchedule.date}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setAlertMsg("Schedule updated successfully!");
      setAlertType("success");
      setShowAlert(true);
      setSelectedSchedule(null);
      setShowEditForm(false);
      fetchSchedules();
    } catch (error) {
      setAlertMsg(error.response?.data);
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const removeSchedule = async () => {
    const token = localStorage.getItem("token");
    let date = scheduleData.date;

    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    const dateString = date.toISOString().split("T")[0];

    try {
      await axios.delete(`http://localhost:8080/api/admin/removeDoctorAppointmentSchedule/${selectedSchedule.doctorId}/${selectedSchedule.date}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setAlertMsg("Schedule removed successfully!");
      setAlertType("success");
      setShowAlert(true);
      setSelectedSchedule(null);
      fetchSchedules();
    } catch (error) {
      setAlertMsg(error.response?.data);
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", color: "#003366", fontWeight: "bold", marginLeft: '650px' }}>
        Doctor Schedule Management
      </Typography>

      <Snackbar open={showAlert} autoHideDuration={6000} onClose={() => setShowAlert(false)}>
        <Alert onClose={() => setShowAlert(false)} severity={alertType} sx={{ width: "100%" }}>
          {alertMsg}
        </Alert>
      </Snackbar>

      <TextField
        label="Search by Date or Task"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        style={{ marginBottom: '20px' }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowAddForm(true)}
        startIcon={<PersonAddIcon />}
        sx={{ marginBottom: "20px", backgroundColor: "#003366", marginLeft: "1320px" }}
      >
        Add Schedule
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Select</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Start Time</TableCell>
              <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>End Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSchedules.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((schedule) => (
              <TableRow key={schedule.scheduleId}>
                <TableCell>
                  <Checkbox
                    checked={selectedSchedule?.scheduleId === schedule.scheduleId}
                    onChange={() => setSelectedSchedule(schedule)}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '1.2rem' }}>{schedule.date}</TableCell>
                <TableCell sx={{ fontSize: '1.2rem' }}>{schedule.startTime}</TableCell>
                <TableCell sx={{ fontSize: '1.2rem' }}>{schedule.endTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredSchedules.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <AddScheduleModal
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAdd={handleAddSchedule}
        scheduleData={scheduleData}
        handleInputChange={handleInputChange}
        formErrors={formErrors}
      />

      <EditScheduleModal
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        onEdit={handleEditSchedule}
        scheduleData={scheduleData}
        handleInputChange={handleInputChange}
        formErrors={formErrors}
        selectedSchedule={selectedSchedule}
        setScheduleData={setScheduleData}
      />

      {selectedSchedule && (
        <Dialog open={Boolean(selectedSchedule)} onClose={() => setSelectedSchedule(null)}>
          <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", color: "#003366" }}>
            Schedule Details
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#fff" }}>
            <Typography>Date: {selectedSchedule.date}</Typography>
            <Typography>Start Time: {selectedSchedule.startTime}</Typography>
            <Typography>End Time: {selectedSchedule.endTime}</Typography>
          </DialogContent>
          <DialogActions>
            <IconButton
              color="primary"
              onClick={() => {
                setScheduleData({
                  date: selectedSchedule.date,
                  startTime: selectedSchedule.startTime,
                  endTime: selectedSchedule.endTime,
                  tasks: selectedSchedule.tasks,
                });
                setShowEditForm(true);
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="secondary"
              onClick={() => {
                removeSchedule();
                setSelectedSchedule(null);
              }}
            >
              <DeleteIcon />
            </IconButton>
            <Button onClick={() => setSelectedSchedule(null)} color="secondary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

const AddScheduleModal = ({ open, onClose, onAdd, scheduleData, handleInputChange, formErrors }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Schedule</DialogTitle>
      <DialogContent>
        <DatePicker
          selected={scheduleData.date}
          onChange={(date) => handleInputChange({ target: { name: "date", value: date } })}
          dateFormat="yyyy-MM-dd"
          customInput={<TextField fullWidth margin="normal" label="Date" />}
          minDate={new Date()}
        />
        <TextField
          label="Start Time"
          fullWidth
          margin="normal"
          name="startTime"
          value={scheduleData.startTime}
          onChange={handleInputChange}
          helperText={formErrors.startTime}
          error={!!formErrors.startTime}
        />
        <TextField
          label="End Time"
          fullWidth
          margin="normal"
          name="endTime"
          value={scheduleData.endTime}
          onChange={handleInputChange}
          helperText={formErrors.endTime}
          error={!!formErrors.endTime}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onAdd} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EditScheduleModal = ({ open, onClose, onEdit, scheduleData, handleInputChange, formErrors, selectedSchedule, setScheduleData }) => {
  useEffect(() => {
    if (selectedSchedule) {
      setScheduleData({
        date: selectedSchedule.date,
        startTime: selectedSchedule.startTime,
        endTime: selectedSchedule.endTime,
        tasks: selectedSchedule.tasks,
      });
    }
  }, [selectedSchedule, setScheduleData]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Schedule</DialogTitle>
      <DialogContent>
        <DatePicker
          selected={scheduleData.date}
          onChange={(date) => handleInputChange({ target: { name: "date", value: date } })}
          dateFormat="yyyy-MM-dd"
          customInput={<TextField fullWidth margin="normal" label="Date" />}
          minDate={new Date()}
        />
        <TextField
          label="Start Time"
          fullWidth
          margin="normal"
          name="startTime"
          value={scheduleData.startTime}
          onChange={handleInputChange}
          helperText={formErrors.startTime}
          error={!!formErrors.startTime}
        />
        <TextField
          label="End Time"
          fullWidth
          margin="normal"
          name="endTime"
          value={scheduleData.endTime}
          onChange={handleInputChange}
          helperText={formErrors.endTime}
          error={!!formErrors.endTime}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onEdit} color="primary">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DoctorSchedule;