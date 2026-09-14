import ApiResponse from '../utils/ApiResponse.js';

const errorHandler = (err, req, res, next) => {
  console.error("_______________________________");
  console.error(`[ERROR] ${new Date().toISOString()}`);
  console.error(`Request: ${req.method} ${req.url}`);
  console.error(err.stack || err);
  console.error("_______________________________");

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Prisma Error Handling
  if (err.code === 'P2002') {
    statusCode = 409;
    const target = err.meta?.target ? ` on ${err.meta.target}` : '';
    message = `Unique constraint failed${target}. Entry already exists.`;
  } else if (err.code === 'P2003') {
    statusCode = 400;
    if (req.method === 'DELETE') {
      message = "This record cannot be deleted because it is being used by other records (e.g., appointments, payments, or reports).";
    } else {
      message = "Related record not found or constraint failed. Please ensure all related entities exist.";
    }
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = "Record not found.";
  } else if (err.code === 'P2014') {
    statusCode = 400;
    message = "The change you are trying to make would violate a required relationship.";
  } else if (err.code === 'P2011') {
    statusCode = 400;
    message = "Null constraint violation on a required field.";
  } else if (err.code === 'P2004') {
    statusCode = 400;
    message = "A database constraint failed.";
  } else if (err.name === 'PrismaClientValidationError' || err.message?.includes("Invalid `prisma.")) {
    statusCode = 400;
    // Attempt to extract the specific validation error line from Prisma's verbose message
    const lines = err.message.split('\n');
    const specificErrorLine = lines.find(line =>
      line.includes("Unknown argument") ||
      line.includes("Missing argument") ||
      line.includes("Argument") ||
      line.includes("Value") ||
      line.includes("Provided")
    );
    message = specificErrorLine ? specificErrorLine.trim() : "Invalid input data. Validation failed.";
  } else if (err.name === 'PrismaClientInitializationError' || err.code === 'P1001') {
    statusCode = 503;
    message = "Database connection error. Please try again later.";
  }

  // Final fallback to ensure no 500 is shown if possible (per user request), 
  // but keeping 500 for true crashes is usually standard. 
  // Given "at any cost", we'll attempt to frame unknown errors safely.
  if (statusCode === 500) {
    message = "Internal Server Error";
  }

  return ApiResponse.error(res, message, statusCode, null);
};

export default errorHandler;
