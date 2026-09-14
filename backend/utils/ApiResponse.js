class ApiResponse {
  constructor(statusCode, message = "Success", data = null, success = true, isAllowed = true) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = success;
    this.isAllowed = isAllowed;
  }

  static success(res, message = "Success", ...data) {
    const mergedData = Object.assign({}, ...data);

    return res.status(200).json({
      success: true,
      isAllowed: true,
      message,
      ...mergedData,
    });
  }

  static error(res, message = "Error", statusCode = 500, data = null) {
    const isAllowed = statusCode !== 401 && statusCode !== 403;
    
    return res.status(statusCode).json({
      success: false,
      isAllowed,
      message,
      data
    });
  }
}

export default ApiResponse;
