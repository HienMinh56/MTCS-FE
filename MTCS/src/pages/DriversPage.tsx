import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Driver } from '../services/DriverApi';

const DriversPage: React.FC = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = React.useState<Driver[]>([]);

  // Add a function to handle row clicks
  const handleDriverClick = (driverId: string) => {
    navigate(`/drivers/${driverId}`);
  };

  React.useEffect(() => {
    // Fetch drivers data and set it to state
    // Example: setDrivers(fetchedDrivers);
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow
              key={driver.driverId}
              onClick={() => handleDriverClick(driver.driverId)}
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
            >
              <TableCell>{driver.driverId}</TableCell>
              <TableCell>{driver.fullName}</TableCell>
              <TableCell>{driver.status}</TableCell>
              <TableCell>{driver.email}</TableCell>
              <TableCell>{driver.phoneNumber}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DriversPage;