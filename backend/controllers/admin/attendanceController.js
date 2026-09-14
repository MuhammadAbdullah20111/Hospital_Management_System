import BiometricDevice from '../../models/BiometricDevice.js';
import AttendanceRecord from '../../models/AttendanceRecord.js';
import DailyAttendanceSummary from '../../models/DailyAttendanceSummary.js';
import BiometricService from '../../services/biometricService.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import prisma from '../../config/prismaClient.js';

// Device Management
export const createDevice = asyncHandler(async (req, res) => {
  const { name, ipAddress, port, isActive } = req.body;

  if (!name || !ipAddress) {
    return ApiResponse.error(res, 'Name and IP Address are required', 400);
  }

  const existingDevice = await BiometricDevice.findByIp(ipAddress);
  if (existingDevice) {
    return ApiResponse.error(res, 'A device with this IP address already exists', 400);
  }

  const device = await BiometricDevice.create({
    name,
    ipAddress,
    port: port ? parseInt(port) : 4370,
    isActive: isActive !== undefined ? isActive : true,
    status: 'UNKNOWN'
  });

  return ApiResponse.success(res, 'Biometric device added successfully', { device }, 201);
});

export const getAllDevices = asyncHandler(async (req, res) => {
  const devices = await BiometricDevice.findAll();
  return ApiResponse.success(res, 'Biometric devices fetched successfully', { devices });
});

export const getDeviceById = asyncHandler(async (req, res) => {
  const device = await BiometricDevice.findById(req.params.id);
  if (!device) {
    return ApiResponse.error(res, 'Device not found', 404);
  }
  return ApiResponse.success(res, 'Biometric device fetched successfully', { device });
});

export const updateDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, ipAddress, port, isActive } = req.body;

  const device = await BiometricDevice.findById(id);
  if (!device) {
    return ApiResponse.error(res, 'Device not found', 404);
  }

  if (ipAddress && ipAddress !== device.ipAddress) {
    const existingDevice = await BiometricDevice.findByIp(ipAddress);
    if (existingDevice) {
      return ApiResponse.error(res, 'A device with this IP address already exists', 400);
    }
  }

  const data = {};
  if (name !== undefined) data.name = name;
  if (ipAddress !== undefined) data.ipAddress = ipAddress;
  if (port !== undefined) data.port = parseInt(port);
  if (isActive !== undefined) data.isActive = isActive;

  const updatedDevice = await BiometricDevice.update(id, data);
  return ApiResponse.success(res, 'Biometric device updated successfully', { device: updatedDevice });
});

export const deleteDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const device = await BiometricDevice.findById(id);
  if (!device) {
    return ApiResponse.error(res, 'Device not found', 404);
  }

  await BiometricDevice.delete(id);
  return ApiResponse.success(res, 'Biometric device deleted successfully');
});

// Test connection
export const testConnection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const device = await BiometricDevice.findById(id);
  if (!device) {
    return ApiResponse.error(res, 'Device not found', 404);
  }

  const result = await BiometricService.testConnection(device.ipAddress, device.port);
  
  // Update status based on test
  const newStatus = result.success ? 'CONNECTED' : 'DISCONNECTED';
  await BiometricDevice.update(device.id, { status: newStatus });

  if (!result.success) {
    return ApiResponse.error(res, `Connection failed: ${result.message}`, 500);
  }

  return ApiResponse.success(res, result.message, { status: newStatus });
});

// Manual Log Synchronization
export const syncDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const stats = await BiometricService.syncDevice(id);
    return ApiResponse.success(res, 'Device synchronized successfully', { stats });
  } catch (error) {
    return ApiResponse.error(res, `Sync failed: ${error.message}`, 500);
  }
});

// Sync all devices
export const syncAllDevices = asyncHandler(async (req, res) => {
  const results = await BiometricService.syncAllDevices();
  return ApiResponse.success(res, 'All devices synchronized', { results });
});

// Logs Queries
export const getAttendanceLogs = asyncHandler(async (req, res) => {
  const { staffId, biometricDeviceId, startDate, endDate, deviceUserPin } = req.query;
  const logs = await AttendanceRecord.findAll({ staffId, biometricDeviceId, startDate, endDate, deviceUserPin });
  return ApiResponse.success(res, 'Attendance logs fetched successfully', { logs });
});

export const getDailySummaries = asyncHandler(async (req, res) => {
  const { staffId, departmentId, status, startDate, endDate } = req.query;
  const summaries = await DailyAttendanceSummary.findAll({ staffId, departmentId, status, startDate, endDate });
  return ApiResponse.success(res, 'Daily summaries fetched successfully', { summaries });
});

// Manual Correction Override
export const updateDailySummary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, status, overrideNotes } = req.body;

  const summary = await DailyAttendanceSummary.findById(id);
  if (!summary) {
    return ApiResponse.error(res, 'Summary record not found', 404);
  }

  const parsedIn = checkIn ? new Date(checkIn) : null;
  const parsedOut = checkOut ? new Date(checkOut) : null;

  let totalHours = 0;
  if (parsedIn && parsedOut) {
    totalHours = parseFloat(((parsedOut - parsedIn) / (1000 * 60 * 60)).toFixed(2));
  }

  const updateData = {
    checkIn: parsedIn,
    checkOut: parsedOut,
    totalHours,
    status: status || summary.status,
    isManualOverride: true,
    overrideNotes: overrideNotes || 'Manual correction applied by Admin'
  };

  const updatedSummary = await DailyAttendanceSummary.update(id, updateData);
  return ApiResponse.success(res, 'Attendance summary updated successfully', { summary: updatedSummary });
});

// Biometric Simulator endpoints
export const simulatePunch = asyncHandler(async (req, res) => {
  const { pin, timestamp, status, verifyMode } = req.body;

  if (!pin || !timestamp) {
    return ApiResponse.error(res, 'PIN and Timestamp are required for simulation', 400);
  }

  BiometricService.addSimulatedLog(pin, timestamp, status !== undefined ? parseInt(status) : 0, verifyMode || 1);
  return ApiResponse.success(res, 'Simulated punch added to biometric memory database');
});

export const clearSimulationLogs = asyncHandler(async (req, res) => {
  BiometricService.clearSimulatedLogs();
  return ApiResponse.success(res, 'Simulated biometric buffer cleared successfully');
});

// Monthly Aggregated Report for Payroll
export const getMonthlyReport = asyncHandler(async (req, res) => {
  const { year, month, departmentId } = req.query;

  if (!year || !month) {
    return ApiResponse.error(res, 'Year and Month are required parameters', 400);
  }

  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

  // Fetch summaries for date range
  const filters = { startDate, endDate };
  if (departmentId) filters.departmentId = departmentId;

  const summaries = await DailyAttendanceSummary.findAll(filters);
  const staffSummariesMap = new Map();

  // Retrieve all active staff to compile a full report (including employees with zero punch history)
  const staffQuery = {};
  if (departmentId) staffQuery.departmentId = parseInt(departmentId);
  const allStaff = await prisma.staff.findMany({
    where: { isActive: true, ...staffQuery },
    include: { role: true, department: true }
  });

  allStaff.forEach(s => {
    staffSummariesMap.set(s.id, {
      staff: {
        id: s.id,
        name: s.name,
        email: s.email,
        biometricPin: s.biometricPin,
        role: s.role?.name,
        department: s.department?.name
      },
      presentCount: 0,
      lateCount: 0,
      absentCount: 0,
      offDayCount: 0,
      earlyDepartCount: 0,
      incompleteCount: 0,
      totalHours: 0,
      totalOvertimeMinutes: 0,
      totalLateMinutes: 0
    });
  });

  // Aggregate stats
  summaries.forEach(sum => {
    const report = staffSummariesMap.get(sum.staffId);
    if (report) {
      report.totalHours += sum.totalHours;
      report.totalOvertimeMinutes += sum.overtimeMinutes;
      report.totalLateMinutes += sum.lateMinutes;

      switch (sum.status) {
        case 'PRESENT':
          report.presentCount++;
          break;
        case 'LATE':
          report.presentCount++;
          report.lateCount++;
          break;
        case 'EARLY_DEPARTURE':
          report.presentCount++;
          report.earlyDepartCount++;
          break;
        case 'LATE_AND_EARLY_DEPART':
          report.presentCount++;
          report.lateCount++;
          report.earlyDepartCount++;
          break;
        case 'ABSENT':
          report.absentCount++;
          break;
        case 'OFF_DAY':
          report.offDayCount++;
          break;
        case 'INCOMPLETE':
          report.presentCount++;
          report.incompleteCount++;
          break;
      }
    }
  });

  const reportList = Array.from(staffSummariesMap.values());
  return ApiResponse.success(res, 'Monthly report compiled successfully', {
    month: `${year}-${month.padStart(2, '0')}`,
    report: reportList
  });
});
