import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Typography, Grid } from '@mui/material';
 
const SearchResults = () => {
  const location = useLocation();
  const { results = [] } = location.state || {};  
 
  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ marginBottom: '30px', color: '#003366', fontWeight: 'bold', textAlign: 'center' }}>
        Search Results
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {results.map((result, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ padding: '20px', backgroundColor: '#fff', boxShadow: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
                Appointment ID   :  {result.appointmentId} 
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'center',color:'#003366' }}>
               <strong>Appointment Date  :  </strong>{result.appointmentDate} 
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'center',color:'#003366' }}>
              <strong>Appointment Time  :  </strong>{result.appointmentTime} 
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'center',color:'#003366' }}>
              <strong> Doctor ID  :  </strong>{result.doctorId} 
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'center',color:'#003366' }}>
              <strong>Patient Id  :  </strong>{result.patientId} 
              </Typography>
              <Typography variant="body1" sx={{ textAlign: 'center',color:'#003366' }}>
              <strong>Chief Complaint  : </strong> {result.chiefComplaint} 
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};
 
export default SearchResults;