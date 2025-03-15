import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  InputAdornment,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import BuildIcon from "@mui/icons-material/Build";
import EventIcon from "@mui/icons-material/Event";

const Trailers = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleEdit = (trailerId: string) => {
    console.log(`Edit trailer with ID: ${trailerId}`);
  };

  const handleDelete = (trailerId: string) => {
    console.log(`Delete trailer with ID: ${trailerId}`);
  };

  // Fake trailer data
  const trailers = [
    {
      id: "TR001",
      licensePlate: "29R-12345",
      manufacturer: "Hyundai",
      model: "Xcient",
      registrationDate: "2025-01-01",
      nextMaintenanceDate: "2025-06-01",
      status: "active",
    },
    {
      id: "TR002",
      licensePlate: "30R-67890",
      manufacturer: "Isuzu",
      model: "Giga",
      registrationDate: "2025-02-01",
      nextMaintenanceDate: "2025-07-01",
      status: "maintenance",
    },
    {
      id: "TR003",
      licensePlate: "31R-54321",
      manufacturer: "Hino",
      model: "500 Series",
      registrationDate: "2025-03-01",
      nextMaintenanceDate: "2025-08-01",
      status: "repair",
    },
    // Add more trailers as needed
  ];

  // Filtered trailers based on search term
  const filteredTrailers = trailers.filter((trailer) =>
    trailer.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Trailer status options
  const statusOptions = [
    { value: "active", label: "Đang hoạt động", color: "success" },
    { value: "maintenance", label: "Bảo dưỡng", color: "warning" },
    { value: "repair", label: "Đang sửa chữa", color: "error" },
    { value: "inactive", label: "Không hoạt động", color: "default" },
  ];

  // Status chip component
  const getStatusChip = (status: string) => {
    switch (status) {
      case "active":
        return <Chip label="Đang hoạt động" color="success" size="small" />;
      case "maintenance":
        return <Chip label="Bảo dưỡng" color="warning" size="small" />;
      case "repair":
        return <Chip label="Đang sửa chữa" color="error" size="small" />;
      case "inactive":
        return <Chip label="Không hoạt động" color="default" size="small" />;
      default:
        return <Chip label="Không xác định" size="small" />;
    }
  };

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}
    >
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={1} sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Tổng số rơ moóc
                  </Typography>
                  <Typography variant="h5" component="div">
                    {trailers.length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <DirectionsCarFilledIcon color="primary" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={1} sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Đang hoạt động
                  </Typography>
                  <Typography variant="h5" component="div">
                    {
                      trailers.filter((trailer) => trailer.status === "active")
                        .length
                    }
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(76, 175, 80, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <DirectionsCarFilledIcon color="success" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={1} sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Cần đăng kiểm
                  </Typography>
                  <Typography variant="h5" component="div">
                    {
                      trailers.filter((trailer) => trailer.status === "repair")
                        .length
                    }
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(255, 152, 0, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <EventIcon color="warning" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={1} sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    gutterBottom
                  >
                    Cần bảo dưỡng
                  </Typography>
                  <Typography variant="h5" component="div">
                    {
                      trailers.filter(
                        (trailer) => trailer.status === "maintenance"
                      ).length
                    }
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(244, 67, 54, 0.08)",
                    p: 1,
                    borderRadius: "50%",
                  }}
                >
                  <BuildIcon color="error" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trailers Table Section */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              flexWrap: { xs: "wrap", sm: "nowrap" },
              gap: 1,
            }}
          >
            <Typography variant="h6" component="div" fontWeight={500}>
              Danh sách rơ moóc
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                placeholder="Tìm kiếm rơ moóc..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                size="small"
              >
                Lọc
              </Button>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
            <Table
              stickyHeader
              size="small"
              sx={{ minWidth: 650 }}
              aria-label="trailers table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Biển số</TableCell>
                  <TableCell>Hãng sản xuất</TableCell>
                  <TableCell>Mẫu</TableCell>
                  <TableCell>Đăng kiểm</TableCell>
                  <TableCell>Bảo dưỡng tiếp theo</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTrailers.length > 0 ? (
                  filteredTrailers.map((trailer) => (
                    <TableRow key={trailer.id}>
                      <TableCell>{trailer.licensePlate}</TableCell>
                      <TableCell>{trailer.manufacturer}</TableCell>
                      <TableCell>{trailer.model}</TableCell>
                      <TableCell>{trailer.registrationDate}</TableCell>
                      <TableCell>{trailer.nextMaintenanceDate}</TableCell>
                      <TableCell>{getStatusChip(trailer.status)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(trailer.id)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(trailer.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary" py={3}>
                        Không có dữ liệu
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTrailers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`
            }
            sx={{ borderTop: "1px solid rgba(224, 224, 224, 1)" }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default Trailers;