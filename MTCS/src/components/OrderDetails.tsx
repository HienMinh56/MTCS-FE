import React from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  Divider,
} from "@mui/material";

interface Order {
  id: string;
  customer: string;
  date: string;
  status: string;
  driverName?: string;
  trailerLicense?: string;
  tractorLicense?: string;
  containerCode?: string;
  containerType?: string;
  weight?: string;
  images?: {
    contract: string[];
    exportDocs: string[];
  };
}

interface OrderDetailDialogProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onEdit: (orderId: string) => void;
}

const OrderDetailDialog = ({
  open,
  order,
  onClose,
  onEdit,
}: OrderDetailDialogProps) => {
  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chi tiết đơn hàng #{order.id}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Thông tin đơn hàng
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1">
                <strong>Mã đơn:</strong> {order.id}
              </Typography>
              <Typography variant="body1">
                <strong>Khách hàng:</strong> {order.customer}
              </Typography>
              <Typography variant="body1">
                <strong>Ngày tạo:</strong> {order.date}
              </Typography>
              <Typography variant="body1">
                <strong>Trạng thái:</strong>{" "}
                <Chip
                  size="small"
                  label={
                    order.status === "pending"
                      ? "Chờ xử lý"
                      : order.status === "processing"
                      ? "Đang xử lý"
                      : order.status === "completed"
                      ? "Hoàn thành"
                      : "Đã hủy"
                  }
                  color={
                    order.status === "pending"
                      ? "warning"
                      : order.status === "processing"
                      ? "info"
                      : order.status === "completed"
                      ? "success"
                      : "error"
                  }
                />
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Thông tin vận chuyển
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1">
                <strong>Tài xế:</strong> {order.driverName || "Chưa có"}
              </Typography>
              <Typography variant="body1">
                <strong>Biển số đầu kéo:</strong>{" "}
                {order.tractorLicense || "Chưa có"}
              </Typography>
              <Typography variant="body1">
                <strong>Biển số rơ moóc:</strong>{" "}
                {order.trailerLicense || "Chưa có"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Thông tin container
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1">
                <strong>Mã container:</strong>{" "}
                {order.containerCode || "Chưa có"}
              </Typography>
              <Typography variant="body1">
                <strong>Loại container:</strong>{" "}
                {order.containerType || "Chưa có"}
              </Typography>
              <Typography variant="body1">
                <strong>Trọng lượng:</strong> {order.weight || "Chưa có"}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" component="div" sx={{ mb: 1 }}>
          Ảnh hợp đồng
        </Typography>
        {order.images?.contract && order.images.contract.length > 0 ? (
          <ImageList cols={3} rowHeight={164}>
            {order.images.contract.map((item, index) => (
              <ImageListItem key={index}>
                <img
                  src={item}
                  alt={`Contract Image ${index + 1}`}
                  loading="lazy"
                />
              </ImageListItem>
            ))}
          </ImageList>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Không có ảnh hợp đồng
          </Typography>
        )}

        <Typography variant="subtitle1" component="div" sx={{ mt: 2, mb: 1 }}>
          Ảnh giấy tờ xuất cảng
        </Typography>
        {order.images?.exportDocs && order.images.exportDocs.length > 0 ? (
          <ImageList cols={3} rowHeight={164}>
            {order.images.exportDocs.map((item, index) => (
              <ImageListItem key={index}>
                <img
                  src={item}
                  alt={`Export Document Image ${index + 1}`}
                  loading="lazy"
                />
              </ImageListItem>
            ))}
          </ImageList>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Không có ảnh giấy tờ xuất cảng
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onEdit(order.id)}
          color="primary"
          variant="outlined"
        >
          Chỉnh sửa
        </Button>
        <Button onClick={onClose} color="primary">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailDialog;
