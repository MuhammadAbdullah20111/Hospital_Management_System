import ZKLib from 'zk-attendance-sdk';
import BiometricDevice from '../models/BiometricDevice.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import DailyAttendanceSummary from '../models/DailyAttendanceSummary.js';
import Staff from '../models/Staff.js';
import prisma from '../config/prismaClient.js';

// Internal memory database to hold simulated logs for local testing/offline runs
let SIMULATED_LOGS = [];

const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getLocalDateString = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const getUtcMidnight = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

class BiometricService {
  /**
   * Helper to check if a device requires simulation
   */
  static isSimulated(ipAddress) {
    return ipAddress === '127.0.0.1' || process.env.SIMULATE_BIOMETRIC === 'true';
  }

  /**
   * Test connection to a biometric device
   */
  static async testConnection(ipAddress, port = 4370) {
    if (this.isSimulated(ipAddress)) {
      return { success: true, message: 'Successfully connected to Mock Biometric Device (127.0.0.1)' };
    }

    const zkInstance = new ZKLib(ipAddress, port, 5200, 5000);
    try {
      await zkInstance.createSocket();
      await zkInstance.disconnect();
      return { success: true, message: 'Successfully established TCP/IP socket connection' };
    } catch (error) {
      console.error(`[Biometric] Connection failed for ${ipAddress}:`, error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Sync a single device
   */
  static async syncDevice(deviceId) {
    const device = await BiometricDevice.findById(deviceId);
    if (!device || !device.isActive) {
      throw new Error('Device not found or inactive');
    }

    console.log(`[Biometric] [${new Date().toISOString()}] Starting sync for device: ${device.name} (${device.ipAddress}:${device.port})`);
    
    let rawLogs = [];
    let status = 'CONNECTED';

    if (this.isSimulated(device.ipAddress)) {
      console.log(`[Biometric] [${new Date().toISOString()}] Running in Simulation Mode...`);
      rawLogs = [...SIMULATED_LOGS];
    } else {
      const zkInstance = new ZKLib(device.ipAddress, device.port, 5200, 5000);
      try {
        console.log(`[Biometric] [${new Date().toISOString()}] Connecting to terminal ${device.name}...`);
        await zkInstance.createSocket();
        console.log(`[Biometric] [${new Date().toISOString()}] Connected. Fetching raw attendance logs...`);
        const response = await zkInstance.getAttendances();
        await zkInstance.disconnect();
        console.log(`[Biometric] [${new Date().toISOString()}] Connection closed.`);
        
        if (response && response.err) {
          throw response.err;
        }
        rawLogs = response && response.data ? response.data : [];
        console.log(`[Biometric] [${new Date().toISOString()}] Retrieved ${rawLogs.length} total logs from device.`);
      } catch (error) {
        console.error(`[Biometric] [${new Date().toISOString()}] Sync connection failed for ${device.name}:`, error.message);
        status = 'DISCONNECTED';
        await BiometricDevice.update(device.id, { status });
        throw error;
      }
    }

    // Process logs and save them
    const syncStats = await this.processRawLogs(rawLogs, device.id);
    
    // Update device status and sync time
    await BiometricDevice.update(device.id, {
      status,
      lastSyncAt: new Date()
    });

    console.log(`[Biometric] [${new Date().toISOString()}] Sync completed for ${device.name}. Saved: ${syncStats.inserted} new punches. Summaries updated: ${syncStats.processedDays}.`);
    return syncStats;
  }

  /**
   * Sync all active devices
   */
  static async syncAllDevices() {
    const devices = await BiometricDevice.findAll();
    const activeDevices = devices.filter(d => d.isActive);
    
    console.log(`[Biometric] Triggering periodic sync for ${activeDevices.length} active devices...`);
    const results = [];

    for (const device of activeDevices) {
      try {
        const stats = await this.syncDevice(device.id);
        results.push({ deviceId: device.id, deviceName: device.name, success: true, ...stats });
      } catch (err) {
        results.push({ deviceId: device.id, deviceName: device.name, success: false, error: err.message });
      }
    }
    return results;
  }

  /**
   * Process raw logs pulled from ZKTeco
   */
  static async processRawLogs(rawLogs, deviceId) {
    if (!rawLogs || rawLogs.length === 0) {
      return { inserted: 0, processedDays: 0 };
    }

    // Only process logs from the last 24 hours (1 day data) to keep database sync extremely light and fast
    const cutoffTimestamp = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch all staff members to map pins to database IDs
    const allStaff = await prisma.staff.findMany({
      where: { isActive: true },
      select: { id: true, biometricPin: true }
    });

    const staffPinMap = new Map();
    allStaff.forEach(s => {
      if (s.biometricPin) {
        staffPinMap.set(String(s.biometricPin), s.id);
      }
    });

    // Prepare structured records for insertion
    const preparedRecords = [];
    const affectedStaffDates = new Set(); // Keep track of unique staffId_YYYY-MM-DD pairs

    // Optimization: Only recalculate summaries for the last 2 days of logs (48 hours) to cover midnight shift boundaries.
    const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000);

    for (const log of rawLogs) {
      const pin = String(log.deviceUserId || log.userId || log.userPin);
      const timestamp = new Date(log.timestamp || log.recordTime);
      
      if (isNaN(timestamp.getTime())) continue;

      // Optimization: Skip logs that are older than our cutoff timestamp
      if (cutoffTimestamp && timestamp < cutoffTimestamp) {
        continue;
      }

      const staffId = staffPinMap.get(pin) || null;
      
      // Compute unique ID: deviceId_pin_timestampEpoch to prevent duplicates
      const deviceUid = `${deviceId}_${pin}_${timestamp.getTime()}`;
      
      const recordStatus = log.status === 0 ? 'CHECK_IN' : log.status === 1 ? 'CHECK_OUT' : 'UNKNOWN';

      preparedRecords.push({
        deviceUserPin: pin,
        staffId,
        timestamp,
        status: recordStatus,
        verifyMode: log.verifyMode || 0,
        deviceUid,
        biometricDeviceId: deviceId
      });

      if (staffId && timestamp >= cutoffDate) {
        const dateStr = getLocalDateString(timestamp);
        affectedStaffDates.add(`${staffId}_${dateStr}`);
      }
    }

    // Bulk write into database in chunks to prevent query size limit failures
    let insertedCount = 0;
    if (preparedRecords.length > 0) {
      const chunkSize = 500;
      for (let i = 0; i < preparedRecords.length; i += chunkSize) {
        const chunk = preparedRecords.slice(i, i + chunkSize);
        const result = await AttendanceRecord.createMany(chunk);
        insertedCount += result.count;
      }
      
      if (insertedCount > 0) {
        console.log(`[Biometric] [${new Date().toISOString()}] Bulk write finished: ${insertedCount} new attendance logs stored in batches.`);
      } else {
        console.log(`[Biometric] [${new Date().toISOString()}] Bulk write finished: No new logs to store.`);
      }
    }

    // Re-calculate Daily Summaries for any affected staff and dates
    console.log(`[Biometric] [${new Date().toISOString()}] Recalculating summaries for ${affectedStaffDates.size} staff-date pairs...`);
    for (const entry of affectedStaffDates) {
      const [staffIdStr, dateStr] = entry.split('_');
      const staffId = parseInt(staffIdStr);
      await this.calculateDailySummary(staffId, dateStr);
    }

    return {
      inserted: insertedCount,
      processedDays: affectedStaffDates.size
    };
  }

  /**
   * Core logic to calculate day summary for an employee on a specific date
   */
  static async calculateDailySummary(staffId, dateStr) {
    const dateStart = new Date(`${dateStr}T00:00:00`);
    const dateEnd = new Date(`${dateStr}T23:59:59.999`);

    // Fetch all logs for this employee on this date
    const dayPunches = await prisma.attendanceRecord.findMany({
      where: {
        staffId,
        timestamp: {
          gte: dateStart,
          lte: dateEnd
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    if (dayPunches.length === 0) {
      // If no logs exist, let's see if they had a shift today (to declare ABSENT vs OFF_DAY)
      const isWorkDay = await this.hasScheduledShift(staffId, dateStart);
      const status = isWorkDay ? 'ABSENT' : 'OFF_DAY';

      const summaryDate = getUtcMidnight(dateStr);
      await DailyAttendanceSummary.upsert(staffId, summaryDate, {
        checkIn: null,
        checkOut: null,
        totalHours: 0,
        lateMinutes: 0,
        overtimeMinutes: 0,
        status
      });
      return;
    }

    const checkInRecord = dayPunches[0];
    // If only one punch, check-out remains null
    const checkOutRecord = dayPunches.length > 1 ? dayPunches[dayPunches.length - 1] : null;

    const checkIn = checkInRecord.timestamp;
    const checkOut = checkOutRecord ? checkOutRecord.timestamp : null;

    // Calculate hours worked
    let totalHours = 0;
    if (checkIn && checkOut) {
      totalHours = parseFloat(((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2));
    }

    // Fetch employee shift details for today's day of week
    const dayName = DAYS_MAP[dateStart.getDay()]; // e.g. "Monday"
    const shiftSlot = await this.getShiftSlot(staffId, dayName);

    let lateMinutes = 0;
    let overtimeMinutes = 0;
    let status = 'PRESENT';

    if (shiftSlot) {
      // 1. Calculate Late Minutes
      const [sh, sm] = shiftSlot.startTime.split(':').map(Number);
      const expectedCheckIn = new Date(dateStart);
      expectedCheckIn.setHours(sh, sm, 0, 0);

      const checkInDiffMs = checkIn - expectedCheckIn;
      if (checkInDiffMs > 0) {
        lateMinutes = Math.floor(checkInDiffMs / (1000 * 60));
        // If they exceed 15 mins (or grace period), flag as LATE
        if (lateMinutes > 15) {
          status = 'LATE';
        }
      }

      // 2. Calculate Overtime (only if check-out exists)
      if (checkOut) {
        const [eh, em] = shiftSlot.endTime.split(':').map(Number);
        const expectedCheckOut = new Date(dateStart);
        expectedCheckOut.setHours(eh, em, 0, 0);

        // Adjust for shift that wraps past midnight
        if (eh < sh || (eh === sh && em < sm)) {
          expectedCheckOut.setDate(expectedCheckOut.getDate() + 1);
        }

        const checkOutDiffMs = checkOut - expectedCheckOut;
        if (checkOutDiffMs > 0) {
          overtimeMinutes = Math.floor(checkOutDiffMs / (1000 * 60));
        }

        // 3. Early Departure check
        if (checkOut < expectedCheckOut) {
          const earlyMinutes = Math.floor((expectedCheckOut - checkOut) / (1000 * 60));
          if (earlyMinutes > 10) {
            status = status === 'LATE' ? 'LATE_AND_EARLY_DEPART' : 'EARLY_DEPARTURE';
          }
        }
      } else {
        // Punched in, but never punched out
        status = 'INCOMPLETE';
      }
    } else {
      // Off day punches represent overtime or off-day presence
      status = 'PRESENT';
      if (totalHours > 0) {
        overtimeMinutes = Math.floor(totalHours * 60);
      }
    }

    // Upsert summary using UTC midnight representing the local date
    const summaryDate = getUtcMidnight(dateStr);
    await DailyAttendanceSummary.upsert(staffId, summaryDate, {
      checkIn,
      checkOut,
      totalHours,
      lateMinutes,
      overtimeMinutes,
      status
    });
  }

  /**
   * Check if employee has a scheduled shift on a specific date
   */
  static async hasScheduledShift(staffId, date) {
    const dayName = DAYS_MAP[date.getDay()];
    const slot = await this.getShiftSlot(staffId, dayName);
    return !!slot;
  }

  /**
   * Get shift slot details for staff on a specific day of week
   */
  static async getShiftSlot(staffId, dayName) {
    const activeShift = await prisma.staffShift.findFirst({
      where: {
        staffId: parseInt(staffId),
        status: 'ACTIVE'
      },
      include: {
        shift: {
          include: {
            slots: {
              where: {
                startDayOfWeek: dayName
              }
            }
          }
        }
      }
    });

    if (activeShift && activeShift.shift && activeShift.shift.slots.length > 0) {
      return activeShift.shift.slots[0];
    }
    return null;
  }

  /**
   * Sync a staff member's profile (name & PIN) to all active biometric devices
   */
  static async syncStaffToDevices(staff) {
    if (!staff.biometricPin) return [];

    const devices = await prisma.biometricDevice.findMany({
      where: { isActive: true }
    });

    const results = [];
    const uid = staff.id;
    const userid = String(staff.biometricPin);
    const name = staff.name.substring(0, 24); // ZK terminals usually cap names around 24 chars

    for (const device of devices) {
      if (this.isSimulated(device.ipAddress)) {
        console.log(`[Biometric] [Mock] Synced user to device ${device.name}: UID=${uid}, PIN=${userid}, Name=${name}`);
        results.push({ deviceId: device.id, name: device.name, success: true, message: 'Simulated sync successful' });
        continue;
      }

      const zkInstance = new ZKLib(device.ipAddress, device.port, 10000, 4000);
      try {
        await zkInstance.createSocket();
        // setUser(uid, userid, name, password, role, cardno)
        await zkInstance.setUser(uid, userid, name, '', 0, 0);
        await zkInstance.disconnect();
        results.push({ deviceId: device.id, name: device.name, success: true });
        console.log(`[Biometric] Successfully synced staff ${name} to device ${device.name}`);
      } catch (err) {
        console.error(`[Biometric] Failed to sync staff ${name} to device ${device.name}:`, err.message);
        results.push({ deviceId: device.id, name: device.name, success: false, error: err.message });
      }
    }
    return results;
  }

  /**
   * Sync and map attendance records when a staff's biometric PIN is updated or assigned
   */
  static async handleStaffPinMappingUpdate(staffId, oldPin, newPin) {
    staffId = parseInt(staffId);
    
    // We want to collect all staff-date pairs that are affected to recalculate summaries later
    const affectedStaffDates = new Set(); // store as "staffId_YYYY-MM-DD"
    
    const getLocalDateString = (date) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };

    // 1. If there was an old PIN and it changed (or was removed)
    if (oldPin && oldPin !== newPin) {
      // Find all records that were linked to this staff under the old PIN
      const oldRecords = await prisma.attendanceRecord.findMany({
        where: {
          staffId,
          deviceUserPin: oldPin
        },
        select: { timestamp: true }
      });
      
      oldRecords.forEach(r => {
        affectedStaffDates.add(`${staffId}_${getLocalDateString(r.timestamp)}`);
      });

      // Dissociate old PIN records from this staff member
      await prisma.attendanceRecord.updateMany({
        where: {
          staffId,
          deviceUserPin: oldPin
        },
        data: { staffId: null }
      });
    }

    // 2. If there is a new PIN
    if (newPin) {
      // Find all records with this new PIN to see if they were linked to other staff members
      const otherStaffRecords = await prisma.attendanceRecord.findMany({
        where: {
          deviceUserPin: newPin
        },
        select: { staffId: true, timestamp: true }
      });

      otherStaffRecords.forEach(r => {
        affectedStaffDates.add(`${staffId}_${getLocalDateString(r.timestamp)}`);
        if (r.staffId && r.staffId !== staffId) {
          affectedStaffDates.add(`${r.staffId}_${getLocalDateString(r.timestamp)}`);
        }
      });

      // Update all records with the new PIN to point to this staff member
      await prisma.attendanceRecord.updateMany({
        where: {
          deviceUserPin: newPin
        },
        data: { staffId }
      });
    }

    // 3. Recalculate daily summaries for all affected staff-date pairs
    if (affectedStaffDates.size > 0) {
      console.log(`[Biometric] Recalculating summaries for ${affectedStaffDates.size} affected staff-date pairs...`);
      for (const pair of affectedStaffDates) {
        const [sIdStr, dateStr] = pair.split('_');
        const sId = parseInt(sIdStr);
        await this.calculateDailySummary(sId, dateStr);
      }
    }
  }

  /**
   * Helper to append a simulated log in memory for development testing
   */
  static addSimulatedLog(pin, timestampStr, statusNum = 0, verifyMode = 1) {
    const timestamp = new Date(timestampStr);
    SIMULATED_LOGS.push({
      deviceUserId: String(pin),
      timestamp,
      status: statusNum, // 0 = check-in, 1 = check-out
      verifyMode
    });
    // Sort logs chronologically
    SIMULATED_LOGS.sort((a, b) => a.timestamp - b.timestamp);
    console.log(`[Biometric Simulator] Added punch: Staff Pin ${pin} at ${timestampStr} (Status: ${statusNum === 0 ? 'IN' : 'OUT'})`);
  }

  /**
   * Clear all simulated logs in memory
   */
  static clearSimulatedLogs() {
    SIMULATED_LOGS = [];
    console.log('[Biometric Simulator] Cleared all memory logs.');
  }
}

export default BiometricService;
