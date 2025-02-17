import React from "react";
import { Route, Routes } from "react-router-dom";

import SignUp from "./Component/User/SignUp";
import SignIn from "./Component/User/SignIn";
import Logout from "./Component/User/LogOut";
import PatientManagement from "./Component/Patient/PatientManagement";
import StaffManagement from "./Component/Staff/StaffManagement";


import HomePage from './Component/Home/HomePage';
import AppointmentManagement from "./Component/Appointment/AppointmentManagement";
import SearchResults from "./Component/Appointment/SearchResults"

import DoctorManagement from "./Component/Doctor/DoctorManagement";


import Insurance from "./Component/Insurance/Insurance";
import MedicalHistoryManagement from "./Component/MedicalHistory/MedicalHistoryManagement";
import StaffSchedule from "./Component/Staff/StaffSchedule";
import DoctorSchedule from "./Component/Doctor/DoctorSchedule";
import StaffPerformance from "./Component/Staff/StaffPerformance";
import StaffAttendance from "./Component/Staff/StaffAttendance";
import DoctorPerformance from "./Component/Doctor/DoctorPerformance";
import DoctorAttendance from "./Component/Doctor/DoctorAttendance";
import ForgotPassword from "./Component/User/ForgotPassword";
import DoctorAppointments from "./Component/Doctor/DoctorAppointments";


const SRoutes = () => {
  return (
    <Routes>
      
      
      <Route path="/SignUp" element={<SignUp/>} />
      <Route path="/SignIn" element={<SignIn/>} />
      <Route path="/LogOut" element={<Logout/>} />
      <Route path="/patients" element={<PatientManagement />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/*" element={<SRoutes />} /> 
      <Route path="/insurance" element={<Insurance />} />
      <Route path="/medicalhistory" element={<MedicalHistoryManagement/>} />
      <Route path="/staffSchedule" element={<StaffSchedule/>} />
      <Route path="/staffAttendance" element={<StaffAttendance/>} />
      <Route path="/doctorSchedule" element={<DoctorSchedule/>} />
      <Route path="/doctorPerformance" element={<DoctorPerformance/>} />
      <Route path="/doctorAttendance" element={<DoctorAttendance/>} />
      <Route path="/doctorAppointments" element={<DoctorAppointments/>} />
      <Route path="/forgotpassword" element={<ForgotPassword/>} />
      <Route path="/staff" element={<StaffManagement />} />
   
      <Route path="/staffperformance" element={<StaffPerformance/>} />
      <Route path="/appointment" element={<AppointmentManagement />} />
    
      <Route path="/doctors" element={<DoctorManagement />} />
    
      <Route path="/results" element={<SearchResults/>}/>
    


   
    </Routes>
  );
};

export default SRoutes;
