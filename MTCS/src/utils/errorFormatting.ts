export const formatApiError = (error: any): string => {
  if (typeof error === "string") return error;

  // Prioritize messageVN for backend logic errors
  if (error?.messageVN) {
    return error.messageVN;
  }

  // For regular message
  if (error?.message) {
    return error.message;
  }

  // If there are validation errors (typically handled by frontend)
  if (error?.errors) {
    if (typeof error.errors === "object" && !Array.isArray(error.errors)) {
      const firstErrorKey = Object.keys(error.errors)[0];
      const firstError = error.errors[firstErrorKey];
      return Array.isArray(firstError) ? firstError[0] : String(firstError);
    } else if (Array.isArray(error.errors) && error.errors.length > 0) {
      return typeof error.errors[0] === "string"
        ? error.errors[0]
        : JSON.stringify(error.errors[0]);
    }
  }

  return "Có lỗi xảy ra";
};
