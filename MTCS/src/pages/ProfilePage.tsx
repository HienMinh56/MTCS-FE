import React from "react";
import { Box } from "@mui/material";
import UserProfile from "../components/UserProfile";

const ProfilePage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pt: 8, // Leave space for the app bar
      }}
    >
      <UserProfile standalone={true} />
    </Box>
  );
};

export default ProfilePage;
