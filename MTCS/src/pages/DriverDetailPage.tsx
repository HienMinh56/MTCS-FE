import React from 'react';
import DriverDetailDialog from '../components/DriverDetailDialog';
import { Container } from '@mui/material';

const DriverDetailPage: React.FC = () => {
  return (
    <Container>
      <DriverDetailDialog standalone={true} />
    </Container>
  );
};

export default DriverDetailPage;
