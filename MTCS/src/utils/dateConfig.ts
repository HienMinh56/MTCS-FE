import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

// Format constants
export const DATE_FORMAT = "DD/MM/YYYY";
export const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";

export const formatDate = (date: string | Date | dayjs.Dayjs): string => {
  return dayjs(date).format(DATE_FORMAT);
};

export const formatDateTime = (date: string | Date | dayjs.Dayjs): string => {
  return dayjs(date).format(DATE_TIME_FORMAT);
};

export const parseToISODate = (dateStr: string): string => {
  if (!dateStr) return "";
  return dayjs(dateStr, DATE_FORMAT).format("YYYY-MM-DD");
};

export const getCurrentISODate = (): string => {
  return dayjs().format("YYYY-MM-DD");
};

export const getCurrentISODateTime = (): string => {
  return dayjs().toISOString();
};
