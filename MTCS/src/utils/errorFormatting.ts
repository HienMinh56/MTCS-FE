export const formatApiError = (error: any): string => {
  if (typeof error === "string") return error;

  if (error?.messageVN) {
    return error.messageVN;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.errors) {
    if (typeof error.errors === "string") {
      return error.errors;
    }

    if (typeof error.errors === "object" && !Array.isArray(error.errors)) {
      const firstErrorKey = Object.keys(error.errors)[0];
      const firstError = error.errors[firstErrorKey];
      return Array.isArray(firstError) ? firstError[0] : String(firstError);
    }

    if (Array.isArray(error.errors) && error.errors.length > 0) {
      const firstError = error.errors[0];
      if (typeof firstError === "string") {
        return firstError;
      } else if (firstError?.description) {
        return firstError.description;
      } else {
        return JSON.stringify(firstError);
      }
    }
  }

  return "Có lỗi xảy ra. Vui lòng thử lại sau.";
};
