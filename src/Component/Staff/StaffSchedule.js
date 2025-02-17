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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  TablePagination,
  Checkbox,
  IconButton,
} from "@mui/material";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const StaffSchedule = () => {
  const location = useLocation();
  const { staffId } = location.state|| {};
  const [scheduleDetails, setScheduleDetails] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [scheduleData, setScheduleData] = useState({
    staffId: staffId,
    date: new Date(),
    startTime: "",
    endTime: "",
    tasks: "",
  });
  const [staffList, setStaffList] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:8080/api/admin/getAllStaff",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStaffList(response.data);
      fetchSchedules();
    } catch (error) {
      handleError(error, "Failed to fetch staff list.");
    }
  };

  const fetchSchedules = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:8080/api/admin/getStaffSchedulesById/${staffId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const schedules = response.data;

      const enhancedSchedules = await Promise.all(
        schedules.map(async (schedule) => {
          try {
            const staffResponse = await axios.get(
              `http://localhost:8080/api/admin/getStaffById/${schedule.staffId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const staff = staffResponse.data;
            return { ...schedule, staffName: staff.name };
          } catch (staffError) {
            return { ...schedule, staffName: "Unknown" };
          }
        })
      );

      setScheduleDetails(enhancedSchedules);
      setFilteredSchedules(enhancedSchedules);
    } catch (error) {
      handleError(error, "Failed to fetch schedules.");
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filteredData = scheduleDetails.filter((schedule) => {
        return (
          schedule.date.includes(lowerCaseQuery)    ||      (schedule.tasks && schedule.tasks.toLowerCase().includes(lowerCaseQuery))
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
        errors.startTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)
          ? ""
          : "Invalid time format (HH:mm)";
        break;
      case "endTime":
        errors.endTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)
          ? ""
          : "Invalid time format (HH:mm)";
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
      staffId: scheduleData.staffId,
      date: scheduleData.date.toISOString().split("T")[0],
      startTime: scheduleData.startTime,
      endTime: scheduleData.endTime,
      tasks: scheduleData.tasks,
    };
    try {
      await axios.post(
        "http://localhost:8080/api/admin/scheculeStaffDailyTasks",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAlertMsg("Schedule added successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowAddModal(false);
      fetchSchedules();
    } catch (error) {
      handleError(error, "Failed to add schedule.");
    }
  };

  const handleUpdateSchedule = async () => {
    const token = localStorage.getItem("token");
    let date = scheduleData.date;
    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    const dataToSend = {
      staffId: scheduleData.staffId,
      date: date.toISOString().split("T")[0],
      startTime: scheduleData.startTime,
      endTime: scheduleData.endTime,
      tasks: scheduleData.tasks,
    };
    console.log("datato send",dataToSend);
    try {
      await axios.put(
        `http://localhost:8080/api/admin/updateStaffSchedule/${staffId}/${selectedSchedule.date}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAlertMsg("Schedule updated successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowUpdateModal(false);
      fetchSchedules();
      setSelectedSchedule(null);
    } catch (error) {
      handleError(error, "Failed to update schedule.");
    }
  };

  const handleDeleteSchedule = async () => {
    const token = localStorage.getItem("token");
   
    try {
      await axios.delete(
        `http://localhost:8080/api/admin/removeStaffSchedule/${selectedSchedule.staffId}/${selectedSchedule.date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAlertMsg("Schedule removed successfully!");
      setAlertType("success");
      setShowAlert(true);
      setShowDeleteModal(false);
      fetchSchedules();
      setSelectedSchedule(null);
    } catch (error) {
      handleError(error, "Failed to delete schedule.");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowSelect = (schedule) => {
    setSelectedSchedule(schedule);
  };

  const handleError = (error, defaultMessage) => {
    const message = error.response?.data|| defaultMessage;
    setAlertMsg(message);
    setAlertType("error");
    setShowAlert(true);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{ marginBottom: "20px", color: "#003366", fontWeight: "bold", textAlign: "center" }}
      >
        Staff Schedule Management
      </Typography>
      {filteredSchedules.length > 0 && (
        <Typography
          variant="h5"
          sx={{
            marginBottom: "20px",
            color: "#003366",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Staff Name: {filteredSchedules[0].staffName}
        </Typography>
      )}

      {/* Snackbar for Alerts */}
      <Snackbar open={showAlert} autoHideDuration={6000} onClose={() => setShowAlert(false)}>
        <Alert onClose={() => setShowAlert(false)} severity={alertType} sx={{ width: "100%" }}>
          {alertMsg}
        </Alert>
      </Snackbar>

      {/* Search Field */}
      <TextField
        label="Search by Date or Task"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        style={{ marginBottom: "20px" }}
      />

      {/* Add Schedule Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setSelectedSchedule(null);
          setScheduleData({
            staffId: staffId,
            date: new Date(),
            startTime: "",
            endTime: "",
            tasks: "",
          });
          setShowAddModal(true);
        }}
        sx={{ marginBottom: "20px", position: "absolute", right: "20px", top: "190px" , backgroundColor: "#003366"  }}
      >
        Add Schedule
      </Button>

      {/* Schedule List Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>Select</TableCell>
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>Start Time</TableCell>
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>End Time</TableCell>
              <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>Tasks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSchedules
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((schedule) => (
                <TableRow key={schedule.scheduleId}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSchedule?.scheduleId === schedule.scheduleId}
                      onChange={() => handleRowSelect(schedule)}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.2rem" }}>{schedule.date}</TableCell>
                  <TableCell sx={{ fontSize: "1.2rem" }}>{schedule.startTime}</TableCell>
                  <TableCell sx={{ fontSize: "1.2rem" }}>{schedule.endTime}</TableCell>
                  <TableCell sx={{ fontSize: "1.2rem" }}>{schedule.tasks}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredSchedules.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {selectedSchedule && (
        <Dialog open={Boolean(selectedSchedule)} onClose={() => setSelectedSchedule(null)}>
          <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", color: "#003366" }}>
            Staff Schedule Details
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#fff" }}>
            <Typography sx={{fontSize:18}}><strong>Date : </strong> {selectedSchedule.date}</Typography>
            <Typography sx={{fontSize:18}}><strong>Start Time : </strong>{selectedSchedule.startTime}</Typography>
            <Typography sx={{fontSize:18}}><strong>End Time :</strong> {selectedSchedule.endTime}</Typography>
            <Typography sx={{fontSize:18}}><strong>Tasks  : </strong>{selectedSchedule.tasks}</Typography>
          </DialogContent>
          <DialogActions>
          
                    <IconButton sx={{marginLeft:"0px",marginRight:"50px"}}
                      color="primary"
                      onClick={() => {
                        
                        setScheduleData({
                          date: selectedSchedule.date,
                          startTime: selectedSchedule.startTime,
                          endTime: selectedSchedule.endTime,
                          tasks: selectedSchedule.tasks,
                        });
                        setScheduleData(selectedSchedule);
                        setShowUpdateModal(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton sx={{marginLeft:"0px",marginRight:"40px"}}
                      color="secondary"
                      onClick={() => {
                        setSelectedSchedule(scheduleData);
                        setShowDeleteModal(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  
            <Button onClick={() => setSelectedSchedule(null)} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Schedule Modal */}
      <Dialog open={showAddModal} onClose={() => setShowAddModal(false)}>
        <DialogTitle>Add Schedule</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Staff</InputLabel>
            <Select
              value={scheduleData.staffId}
              onChange={handleInputChange}
              name="staffId"
              disabled
            >
              {staffList.map((staff) => (
                <MenuItem key={staff.id} value={staff.id}>
                  {staff.name} - {staff.contact}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <DatePicker
            selected={scheduleData.date}
            onChange={(date) => setScheduleData((prev) => ({ ...prev, date }))}
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
          <TextField
            label="Tasks"
            fullWidth
            margin="normal"
            name="tasks"
            value={scheduleData.tasks}
            onChange={handleInputChange}
            helperText={formErrors.tasks}
            error={!!formErrors.tasks}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddModal(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddSchedule} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Schedule Modal */}
      <Dialog open={showUpdateModal} onClose={() => setShowUpdateModal(false)}>
        <DialogTitle>Update Schedule</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Staff</InputLabel>
            <Select
              value={scheduleData.staffId}
              onChange={handleInputChange}
              name="staffId"
              disabled
            >
              {staffList.map((staff) => (
                <MenuItem key={staff.id} value={staff.id}>
                  {staff.name} - {staff.contact}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <DatePicker
            selected={scheduleData.date}
            onChange={(date) => setScheduleData((prev) => ({ ...prev, date }))}
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
          <TextField
            label="Tasks"
            fullWidth
            margin="normal"
            name="tasks"
            value={scheduleData.tasks}
            onChange={handleInputChange}
            helperText={formErrors.tasks}
            error={!!formErrors.tasks}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpdateModal(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateSchedule} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this schedule?</DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteModal(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteSchedule} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StaffSchedule;