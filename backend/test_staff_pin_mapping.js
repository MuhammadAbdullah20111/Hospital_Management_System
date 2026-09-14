import { PrismaClient } from '@prisma/client';
import BiometricService from './services/biometricService.js';
import BiometricDevice from './models/BiometricDevice.js';

const prisma = new PrismaClient();

async function runTests() {
  console.log('🚀 Starting Biometric Staff PIN Mapping Integration Tests...\n');

  let testDevice = null;
  let testStaff = null;
  let testShift = null;
  let testRole = null;

  try {
    // 1. Setup temporary test role
    testRole = await prisma.role.upsert({
      where: { name: 'TEST_RECEPTIONIST' },
      update: {},
      create: { name: 'TEST_RECEPTIONIST' }
    });

    // 2. Setup temporary test shift (Mondays to Wednesdays 09:00 to 17:00)
    testShift = await prisma.shift.create({
      data: {
        name: 'Test PIN Mapping Shift',
        slots: {
          create: [
            {
              startDayOfWeek: 'Wednesday',
              endDayOfWeek: 'Wednesday',
              startTime: '09:00',
              endTime: '17:00',
              duration: 480
            }
          ]
        }
      }
    });

    // 3. Create a test device (127.0.0.1 activates simulator mode)
    testDevice = await BiometricDevice.create({
      name: 'PIN Mapping Test Device',
      ipAddress: '127.0.0.1',
      port: 4370,
      isActive: true,
      status: 'UNKNOWN'
    });

    // 4. Setup temporary staff member WITHOUT a PIN initially
    testStaff = await prisma.staff.create({
      data: {
        name: 'PIN Test Employee',
        email: 'pin.test@mkmc.com',
        password: 'testpasswordhash',
        phoneNumber: '0300-8888888',
        roleId: testRole.id,
        isActive: true,
        staffShifts: {
          create: {
            shiftId: testShift.id,
            status: 'ACTIVE'
          }
        }
      }
    });

    console.log('✓ Seeded testing environment data.');

    // 5. Add simulated logs for PIN '8888' on June 3rd, 2026 (Wednesday)
    const testDateStr = '2026-06-03';
    BiometricService.clearSimulatedLogs();
    BiometricService.addSimulatedLog('8888', `${testDateStr}T09:00:00`, 0, 1); // Check-in
    BiometricService.addSimulatedLog('8888', `${testDateStr}T17:00:00`, 1, 1); // Check-out

    console.log('\n--- Syncing Device Logs (Before PIN Mapping) ---');
    // Sync the device. Since PIN '8888' is not mapped to any staff, records should have staffId: null
    const syncResult = await BiometricService.syncDevice(testDevice.id);
    console.log('Sync result stats:', syncResult);

    // Retrieve attendance records for PIN 8888
    const recordsBeforeMapping = await prisma.attendanceRecord.findMany({
      where: { deviceUserPin: '8888' }
    });

    console.log(`Punches found for PIN 8888: ${recordsBeforeMapping.length}`);
    for (const record of recordsBeforeMapping) {
      console.log(`  - Record ID: ${record.id}, staffId: ${record.staffId} (Expected: null)`);
      if (record.staffId !== null) {
        throw new Error('Test Failed: Record should not be linked to any staff member before PIN mapping is established.');
      }
    }
    console.log('💚 Verification before mapping passed!');

    // ----------------------------------------------------
    // TEST CASE: Mapping PIN to Staff
    // ----------------------------------------------------
    console.log('\n--- Mapping PIN 8888 to Staff member ---');
    // Simulate updating staff profile with biometricPin: '8888'
    await prisma.staff.update({
      where: { id: testStaff.id },
      data: { biometricPin: '8888' }
    });

    // Call service helper to link historical logs
    await BiometricService.handleStaffPinMappingUpdate(testStaff.id, null, '8888');

    // Verify records are updated
    const recordsAfterMapping = await prisma.attendanceRecord.findMany({
      where: { deviceUserPin: '8888' }
    });

    console.log(`Punches found for PIN 8888 after mapping: ${recordsAfterMapping.length}`);
    for (const record of recordsAfterMapping) {
      console.log(`  - Record ID: ${record.id}, staffId: ${record.staffId} (Expected: ${testStaff.id})`);
      if (record.staffId !== testStaff.id) {
        throw new Error(`Test Failed: Record should be linked to staffId ${testStaff.id}.`);
      }
    }

    // Verify daily summary is generated
    const summaryAfterMapping = await prisma.dailyAttendanceSummary.findFirst({
      where: { staffId: testStaff.id, date: new Date(`${testDateStr}T00:00:00.000Z`) }
    });

    if (!summaryAfterMapping) {
      throw new Error(`Test Failed: No daily summary found for date ${testDateStr} after mapping.`);
    }

    console.log('Daily Summary after mapping:');
    console.log(`  - Status: ${summaryAfterMapping.status} (Expected: PRESENT)`);
    console.log(`  - Total Hours: ${summaryAfterMapping.totalHours} hrs (Expected: 8.0)`);
    
    if (summaryAfterMapping.status !== 'PRESENT') {
      throw new Error(`Test Failed: Summary status should be PRESENT, got ${summaryAfterMapping.status}`);
    }
    if (summaryAfterMapping.totalHours !== 8) {
      throw new Error(`Test Failed: Summary totalHours should be 8, got ${summaryAfterMapping.totalHours}`);
    }
    console.log('💚 Mapping and summary creation verified successfully!');

    // ----------------------------------------------------
    // TEST CASE: Unmapping PIN (Setting PIN to null)
    // ----------------------------------------------------
    console.log('\n--- Unmapping PIN 8888 from Staff member (Setting PIN to null) ---');
    // Simulate updating staff profile to remove PIN
    await prisma.staff.update({
      where: { id: testStaff.id },
      data: { biometricPin: null }
    });

    // Call service helper to handle unmapping
    await BiometricService.handleStaffPinMappingUpdate(testStaff.id, '8888', null);

    // Verify records are dissociated
    const recordsAfterUnmapping = await prisma.attendanceRecord.findMany({
      where: { deviceUserPin: '8888' }
    });

    console.log(`Punches found for PIN 8888 after unmapping: ${recordsAfterUnmapping.length}`);
    for (const record of recordsAfterUnmapping) {
      console.log(`  - Record ID: ${record.id}, staffId: ${record.staffId} (Expected: null)`);
      if (record.staffId !== null) {
        throw new Error(`Test Failed: Record should be dissociated (staffId: null).`);
      }
    }

    // Verify daily summary is recalculated (since they have no records, they should be marked ABSENT)
    const summaryAfterUnmapping = await prisma.dailyAttendanceSummary.findFirst({
      where: { staffId: testStaff.id, date: new Date(`${testDateStr}T00:00:00.000Z`) }
    });

    if (!summaryAfterUnmapping) {
      throw new Error(`Test Failed: Summary should still exist but updated.`);
    }

    console.log('Daily Summary after unmapping:');
    console.log(`  - Status: ${summaryAfterUnmapping.status} (Expected: ABSENT)`);
    console.log(`  - Total Hours: ${summaryAfterUnmapping.totalHours} hrs (Expected: 0)`);

    if (summaryAfterUnmapping.status !== 'ABSENT') {
      throw new Error(`Test Failed: Summary status should be ABSENT after dissociation, got ${summaryAfterUnmapping.status}`);
    }
    if (summaryAfterUnmapping.totalHours !== 0) {
      throw new Error(`Test Failed: Summary totalHours should be 0, got ${summaryAfterUnmapping.totalHours}`);
    }
    console.log('💚 Dissociation and summary recalculation verified successfully!');

    console.log('\n🌟 All staff PIN mapping integration tests passed successfully!');

  } catch (error) {
    console.error('\n❌ PIN mapping verification tests failed:', error.message);
    console.error(error.stack);
  } finally {
    console.log('\n🧹 Cleaning up testing environment database records...');
    
    // Clean up test records
    if (testDevice) {
      await prisma.attendanceRecord.deleteMany({ where: { biometricDeviceId: testDevice.id } });
      await BiometricDevice.delete(testDevice.id);
    }
    
    if (testStaff) {
      await prisma.dailyAttendanceSummary.deleteMany({ where: { staffId: testStaff.id } });
      await prisma.staffShift.deleteMany({ where: { staffId: testStaff.id } });
      await prisma.staff.delete({ where: { id: testStaff.id } });
    }

    if (testShift) {
      await prisma.shiftSlot.deleteMany({ where: { shiftId: testShift.id } });
      await prisma.shift.delete({ where: { id: testShift.id } });
    }

    if (testRole) {
      await prisma.rolePermission.deleteMany({ where: { roleId: testRole.id } });
      await prisma.role.delete({ where: { id: testRole.id } });
    }

    console.log('🧹 Cleanup complete. Database restored.');
    process.exit(0);
  }
}

runTests();
