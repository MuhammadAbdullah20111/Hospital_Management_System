import ZKLib from 'zk-attendance-sdk';
import bcrypt from 'bcryptjs';
import prisma from '../config/prismaClient.js';

async function main() {
  console.log('Fetching active biometric devices from database...');
  const devices = await prisma.biometricDevice.findMany({
    where: { isActive: true }
  });

  if (devices.length === 0) {
    console.log('No active biometric devices found in the database.');
    return;
  }

  const physicalDevice = devices.find(d => d.ipAddress !== '127.0.0.1');
  if (!physicalDevice) {
    console.log('No physical biometric devices (IP != 127.0.0.1) found.');
    return;
  }

  const { ipAddress, port, name } = physicalDevice;
  console.log(`Connecting to physical device "${name}" at ${ipAddress}:${port}...`);

  const zkInstance = new ZKLib(ipAddress, port, 10000, 4000);
  try {
    await zkInstance.createSocket();
    console.log('Socket created successfully. Fetching users from device...');

    const response = await zkInstance.getUsers();
    await zkInstance.disconnect();

    if (!response || !response.data) {
      console.log('No user data returned from device.');
      return;
    }

    const deviceUsers = response.data;
    console.log(`Fetched ${deviceUsers.length} users from physical device.`);

    // 1. Delete all existing staff and dependent records to start fresh
    console.log('Cleaning up existing staff members and all dependent database records...');
    
    await prisma.staffShift.deleteMany({});
    await prisma.staffSalary.deleteMany({});
    await prisma.dailyAttendanceSummary.deleteMany({});
    await prisma.attendanceRecord.deleteMany({});
    await prisma.prescription.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.labTest.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.queueToken.deleteMany({});
    
    const deletedStaff = await prisma.staff.deleteMany({});
    console.log(`Successfully deleted ${deletedStaff.count} existing staff members from the database.`);

    // 2. Pre-generate default hashed password
    console.log('Generating default password hash...');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('mkmc1234', salt);

    console.log('Creating database staff profiles for device users...');
    let createdCount = 0;
    const staffList = [];

    for (const user of deviceUsers) {
      const pinStr = String(user.userId);
      const rawName = user.name || `User ${pinStr}`;
      
      const cleanName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const email = `${cleanName}${pinStr}@mkmc.com`;
      const phoneNumber = `0300${pinStr.padStart(7, '0')}`;

      const isDoctor = rawName.toLowerCase().includes('dr') || rawName.toLowerCase().includes('doctor');
      const roleId = isDoctor ? 3 : 2;
      const shiftId = 1;

      try {
        const newStaff = await prisma.staff.create({
          data: {
            name: rawName,
            email,
            password: defaultPasswordHash,
            phoneNumber,
            roleId,
            isActive: true,
            biometricPin: pinStr,
            staffShifts: {
              create: {
                shiftId,
                status: 'ACTIVE'
              }
            }
          }
        });

        console.log(`[+] Created Staff: "${newStaff.name}" (ID: ${newStaff.id}, PIN: ${pinStr}, Role: ${isDoctor ? 'DOCTOR' : 'RECEPTIONIST'})`);
        staffList.push(newStaff);
        createdCount++;
      } catch (err) {
        console.error(`[-] Failed to create staff for user "${rawName}" (PIN: ${pinStr}):`, err.message);
      }
    }

    // 3. Pull and bulk insert all logs from the machine
    console.log('\nFetching and syncing all attendance records from physical device...');
    await zkInstance.createSocket();
    const logsResponse = await zkInstance.getAttendances();
    await zkInstance.disconnect();

    if (logsResponse && logsResponse.data && logsResponse.data.length > 0) {
      const rawLogs = logsResponse.data;
      console.log(`Pulled ${rawLogs.length} raw attendance logs from device. Processing and inserting...`);

      const staffPinMap = new Map();
      staffList.forEach(s => {
        if (s.biometricPin) {
          staffPinMap.set(String(s.biometricPin), s.id);
        }
      });

      const preparedRecords = [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // limit to last 30 days for summaries

      for (const log of rawLogs) {
        const pin = String(log.deviceUserId || log.userId || log.userPin);
        const timestamp = new Date(log.timestamp || log.recordTime);
        
        if (isNaN(timestamp.getTime())) continue;

        const staffId = staffPinMap.get(pin) || null;
        const deviceUid = `${physicalDevice.id}_${pin}_${timestamp.getTime()}`;
        const recordStatus = log.status === 0 ? 'CHECK_IN' : log.status === 1 ? 'CHECK_OUT' : 'UNKNOWN';

        preparedRecords.push({
          deviceUserPin: pin,
          staffId,
          timestamp,
          status: recordStatus,
          verifyMode: log.verifyMode || 0,
          deviceUid,
          biometricDeviceId: physicalDevice.id
        });
      }

      // Bulk write into database, skipping duplicates
      console.log(`Inserting ${preparedRecords.length} records into database...`);
      const result = await prisma.attendanceRecord.createMany({
        data: preparedRecords,
        skipDuplicates: true
      });
      console.log(`Successfully inserted ${result.count} new attendance records.`);

      // 4. Calculate summaries in memory for the last 30 days in bulk
      console.log('\nRecalculating summaries in memory for the last 30 days...');
      const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      const getLocalDateString = (date) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      };

      const getUtcMidnight = (dateStr) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      };

      // Fetch all logs in database in the last 30 days to process
      const recentPunches = await prisma.attendanceRecord.findMany({
        where: {
          staffId: { not: null },
          timestamp: { gte: cutoffDate }
        },
        orderBy: { timestamp: 'asc' }
      });

      // Group by staffId and dateStr
      const groups = {};
      for (const r of recentPunches) {
        const dateStr = getLocalDateString(r.timestamp);
        const key = `${r.staffId}_${dateStr}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(r);
      }

      // Fetch active shifts in batch
      const activeShifts = await prisma.staffShift.findMany({
        where: { status: 'ACTIVE' },
        include: { shift: { include: { slots: true } } }
      });

      const staffShiftMap = new Map();
      activeShifts.forEach(as => {
        staffShiftMap.set(as.staffId, as.shift);
      });

      const summariesToCreate = [];

      for (const key of Object.keys(groups)) {
        const [staffIdStr, dateStr] = key.split('_');
        const staffId = parseInt(staffIdStr);
        const dayPunches = groups[key];

        const dateStart = new Date(`${dateStr}T00:00:00`);
        const checkIn = dayPunches[0].timestamp;
        const checkOut = dayPunches.length > 1 ? dayPunches[dayPunches.length - 1].timestamp : null;

        let totalHours = 0;
        if (checkIn && checkOut) {
          totalHours = parseFloat(((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2));
        }

        const dayName = DAYS_MAP[dateStart.getDay()];
        const shift = staffShiftMap.get(staffId);
        const shiftSlot = (shift && shift.slots) ? shift.slots.find(s => s.startDayOfWeek === dayName) : null;

        let lateMinutes = 0;
        let overtimeMinutes = 0;
        let status = 'PRESENT';

        if (shiftSlot) {
          const [sh, sm] = shiftSlot.startTime.split(':').map(Number);
          const expectedCheckIn = new Date(dateStart);
          expectedCheckIn.setHours(sh, sm, 0, 0);

          const checkInDiffMs = checkIn - expectedCheckIn;
          if (checkInDiffMs > 0) {
            lateMinutes = Math.floor(checkInDiffMs / (1000 * 60));
            if (lateMinutes > 15) {
              status = 'LATE';
            }
          }

          if (checkOut) {
            const [eh, em] = shiftSlot.endTime.split(':').map(Number);
            const expectedCheckOut = new Date(dateStart);
            expectedCheckOut.setHours(eh, em, 0, 0);

            if (eh < sh || (eh === sh && em < sm)) {
              expectedCheckOut.setDate(expectedCheckOut.getDate() + 1);
            }

            const checkOutDiffMs = checkOut - expectedCheckOut;
            if (checkOutDiffMs > 0) {
              overtimeMinutes = Math.floor(checkOutDiffMs / (1000 * 60));
            }

            if (checkOut < expectedCheckOut) {
              const earlyMinutes = Math.floor((expectedCheckOut - checkOut) / (1000 * 60));
              if (earlyMinutes > 10) {
                status = status === 'LATE' ? 'LATE_AND_EARLY_DEPART' : 'EARLY_DEPARTURE';
              }
            }
          } else {
            status = 'INCOMPLETE';
          }
        } else {
          status = 'PRESENT';
          if (totalHours > 0) {
            overtimeMinutes = Math.floor(totalHours * 60);
          }
        }

        summariesToCreate.push({
          staffId,
          date: getUtcMidnight(dateStr),
          checkIn,
          checkOut,
          totalHours,
          status,
          overtimeMinutes,
          lateMinutes
        });
      }

      console.log(`Inserting ${summariesToCreate.length} daily summaries in a single batch...`);
      await prisma.dailyAttendanceSummary.createMany({
        data: summariesToCreate,
        skipDuplicates: true
      });
      console.log('Daily summaries inserted successfully!');
    } else {
      console.log('No attendance logs retrieved from physical device.');
    }

    console.log(`\nImport, log mapping, and recent summary calculations complete! Created ${createdCount}/${deviceUsers.length} staff.`);
  } catch (err) {
    console.error('Error during database replacement:', err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
