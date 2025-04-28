import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Avatar,
  Divider,
  Skeleton,
  Snackbar,
  Alert,
  Card,
  Stack,
  useTheme,
  alpha,
  Button,
  Grid,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditIcon from "@mui/icons-material/Edit";
import EventIcon from "@mui/icons-material/Event";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import WcIcon from "@mui/icons-material/Wc";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ProfileForm, { genderOptions } from "../forms/ProfileForm";
import { ProfileFormValues } from "../forms/profileSchema";
import { getProfile, updateProfile, UserProfile } from "../services/authApi";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const theme = useTheme();
  const prefix = user?.role === "Admin" ? "/admin" : "/staff-menu";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getProfile();
        setProfile(profileData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (data: ProfileFormValues) => {
    try {
      setSubmitting(true);
      setError(null);

      const message = await updateProfile({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        birthday: data.birthday,
        currentPassword: data.currentPassword || undefined,
      });

      setSuccess(message);
      setIsEditing(false);

      // Refresh profile data
      const updatedProfile = await getProfile();
      setProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      console.error("Error updating profile:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const getGenderInVietnamese = (gender?: string) => {
    if (!gender) return "N/A";

    // Map English gender terms to Vietnamese UI values
    const genderOption = genderOptions.find(
      (option) => option.apiValue.toLowerCase() === gender.toLowerCase()
    );

    if (genderOption) return genderOption.value;

    // If we can't find a match but it's already a Vietnamese value
    const vietnameseOption = genderOptions.find(
      (option) => option.value.toLowerCase() === gender.toLowerCase()
    );
    if (vietnameseOption) return vietnameseOption.value;

    // Default to first option if no match
    return genderOptions[0].value;
  };

  const initialFormValues: ProfileFormValues = {
    fullName: profile?.fullName || "",
    email: profile?.email || "",
    phoneNumber: profile?.phoneNumber || "",
    gender: profile?.gender
      ? getGenderInVietnamese(profile.gender)
      : genderOptions[0].value,
    birthday: profile?.birthday ? profile.birthday.split("T")[0] : "",
    currentPassword: "",
  };

  // Reusable card styles
  const cardStyle = {
    elevation: 0,
    borderRadius: 3,
    border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
  };

  const renderProfileInfo = () => {
    // Combined info fields with icons
    const profileInfoFields = [
      {
        label: "Họ và tên",
        value: profile?.fullName,
        icon: <PersonIcon fontSize="small" color="primary" />,
      },
      {
        label: "Email",
        value: profile?.email,
        icon: <EmailIcon fontSize="small" color="primary" />,
      },
      {
        label: "Số điện thoại",
        value: profile?.phoneNumber,
        icon: <PhoneIcon fontSize="small" color="primary" />,
      },
      {
        label: "Giới tính",
        value: getGenderInVietnamese(profile?.gender),
        icon: <WcIcon fontSize="small" color="primary" />,
      },
      {
        label: "Ngày sinh",
        value: profile?.birthday ? formatDate(profile.birthday) : "N/A",
        icon: <EventIcon fontSize="small" color="primary" />,
      },
      {
        label: "Ngày tham gia",
        value: profile?.createdDate ? formatDate(profile.createdDate) : "N/A",
        icon: <EventIcon fontSize="small" color="primary" />,
      },
    ];

    return (
      <Box sx={{ py: 1 }}>
        <Grid container spacing={2}>
          {profileInfoFields.map((field, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.default, 0.7),
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  boxShadow: `0 2px 4px ${alpha(
                    theme.palette.common.black,
                    0.03
                  )}`,
                  height: "100%",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.background.default, 1),
                    boxShadow: `0 3px 8px ${alpha(
                      theme.palette.common.black,
                      0.05
                    )}`,
                  },
                }}
              >
                <Box sx={{ mt: 0.5 }}>{field.icon}</Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mb: 0.5 }}
                  >
                    {field.label}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {field.value}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Back Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`${prefix}/orders`)}
            size="small"
          >
            Quay lại
          </Button>
        </Box>

        {/* Profile Header */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.mtcs.primary,
              0.8
            )}, ${alpha(theme.palette.mtcs.secondary, 0.8)})`,
            color: "white",
            position: "relative",
            overflow: "hidden",
            p: { xs: 3, sm: 2 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
              gap: { xs: 2, sm: 3 },
              position: "relative",
              zIndex: 10,
            }}
          >
            {loading ? (
              <Skeleton
                variant="circular"
                width={100}
                height={100}
                animation="wave"
              />
            ) : (
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: "white",
                  color: theme.palette.mtcs.primary,
                  border: `3px solid ${alpha("#ffffff", 0.8)}`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              >
                <AccountCircleIcon sx={{ fontSize: 60 }} />
              </Avatar>
            )}

            <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
              {loading ? (
                <>
                  <Skeleton
                    variant="text"
                    width={200}
                    height={40}
                    animation="wave"
                  />
                  <Skeleton
                    variant="text"
                    width={150}
                    height={30}
                    animation="wave"
                  />
                </>
              ) : (
                <>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5 }}>
                    {profile?.fullName || "User Profile"}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {profile?.email || "email@example.com"}
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {/* Abstract background shapes */}
          <Box
            sx={{
              position: "absolute",
              bottom: -20,
              right: -20,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: alpha("#ffffff", 0.1),
              zIndex: 1,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: -30,
              left: -30,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: alpha("#ffffff", 0.1),
              zIndex: 1,
            }}
          />
        </Card>

        {/* Content Section */}
        <Card
          sx={{
            ...cardStyle,
            p: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {isEditing ? "Chỉnh sửa thông tin" : "Thông tin tài khoản"}
            </Typography>
            {!isEditing && !loading && (
              <Button
                variant="contained"
                onClick={() => setIsEditing(true)}
                startIcon={<EditIcon />}
                size="small"
              >
                Chỉnh sửa thông tin
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {loading ? (
            <Grid container spacing={2}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                    }}
                  >
                    <Skeleton
                      variant="circular"
                      width={20}
                      height={20}
                      animation="wave"
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton
                        variant="text"
                        width={100}
                        height={20}
                        animation="wave"
                      />
                      <Skeleton variant="text" height={24} animation="wave" />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : isEditing ? (
            <ProfileForm
              initialValues={{
                fullName: profile?.fullName || "",
                email: profile?.email || "",
                phoneNumber: profile?.phoneNumber || "",
                gender: profile?.gender
                  ? getGenderInVietnamese(profile.gender)
                  : genderOptions[0].value,
                birthday: profile?.birthday
                  ? profile.birthday.split("T")[0]
                  : "",
                currentPassword: "",
              }}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={submitting}
            />
          ) : (
            renderProfileInfo()
          )}
        </Card>
      </Stack>

      {/* Error and Success Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
