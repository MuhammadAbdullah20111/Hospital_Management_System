import { createStaff } from '../controllers/admin/staffController.js';
import prisma from '../config/prismaClient.js';
import httpMocks from 'node-mocks-http';
import BiometricService from '../services/biometricService.js';

async function runTest() {
  console.log("=== STARTING BIOMETRIC SYNC VERIFICATION ===");

  // 1. Fetch dependencies
  const role = await prisma.role.findFirst();
  const shift = await prisma.shift.findFirst();
  const department = await prisma.department.findFirst();

  if (!role || !shift) {
    console.error("Missing test data (Role/Shift) in DB!");
    process.exit(1);
  }

  // 2. Prepare mock request for staff creation
  const mockCreateReq = httpMocks.createRequest({
    method: 'POST',
    url: '/admin/staff',
    body: {
      name: 'Sync Test Staff',
      email: `test_sync_${Date.now()}@example.com`,
      password: 'password123',
      phoneNumber: '03001234567',
      roleId: role.id,
      shiftId: shift.id,
      departmentId: department ? department.id : null,
      isActive: true,
      biometricPin: '9999' // temporary unique PIN
    }
  });

  const mockCreateRes = httpMocks.createResponse();

  console.log("Creating staff with PIN 9999...");
  await createStaff(mockCreateReq, mockCreateRes);

  const createResult = mockCreateRes._getJSONData();
  console.log("Create API Result:", JSON.stringify(createResult, null, 2));

  if (!createResult.success) {
    console.error("Staff creation failed!");
    process.exit(1);
  }

  const staff = createResult.data.staff;

  // 3. Inject simulated punch for PIN 9999
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  console.log(`Injecting simulated check-in for PIN 9999 at ${todayStr} 08:30:00`);
  
  BiometricService.clearSimulatedLogs();
  BiometricService.addSimulatedLog('9999', `${todayStr}T08:30:00.000Z`, 0, 1);
  BiometricService.addSimulatedLog('9999', `${todayStr}T17:00:00.000Z`, 1, 1);

  // Sync simulated records
  // Create an active simulated device if none exists
  let simulatedDevice = await prisma.biometricDevice.findFirst({
    where: { ipAddress: '127.0.0.1' }
  });
  if (!simulatedDevice) {
    simulatedDevice = await prisma.biometricDevice.create({
      data: {
        name: 'Mock Test Device',
        ipAddress: '127.0.0.1',
        port: 4370,
        status: 'UNKNOWN',
        isActive: true
      }
    });
  }

  console.log("Syncing simulated device...");
  const syncStats = await BiometricService.syncDevice(simulatedDevice.id);
  console.log("Sync results:", syncStats);

  // 4. Verify AttendanceRecord is linked
  const records = await prisma.attendanceRecord.findMany({
    where: { deviceUserPin: '9999' }
  });
  console.log(`Found ${records.length} records for PIN 9999.`);
  console.log("Records detail:", JSON.stringify(records, null, 2));

  if (records.length > 0 && records[0].staffId === staff.id) {
    console.log("✅ SUCCESS: AttendanceRecord is successfully mapped to Staff ID:", staff.id);
  } else {
    console.error("❌ FAILURE: AttendanceRecord not mapped correctly!");
  }

  // 5. Verify DailyAttendanceSummary is calculated
  const summaries = await prisma.dailyAttendanceSummary.findMany({
    where: { staffId: staff.id }
  });
  console.log("Summaries detail:", JSON.stringify(summaries, null, 2));
  if (summaries.length > 0 && summaries[0].status !== 'ABSENT') {
    console.log("✅ SUCCESS: Daily summary is correctly calculated and status is not ABSENT.");
  } else {
    console.error("❌ FAILURE: Daily summary check failed!");
  }

  // 6. Clean up database
  console.log("Cleaning up test staff and records...");
  await prisma.attendanceRecord.deleteMany({ where: { deviceUserPin: '9999' } });
  await prisma.dailyAttendanceSummary.deleteMany({ where: { staffId: staff.id } });
  await prisma.staffShift.deleteMany({ where: { staffId: staff.id } });
  await prisma.staff.delete({ where: { id: staff.id } });
  
  console.log("=== VERIFICATION COMPLETE ===");
  process.exit(0);
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
