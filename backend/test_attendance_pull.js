import { PrismaClient } from '@prisma/client';
import BiometricService from './services/biometricService.js';
import BiometricDevice from './models/BiometricDevice.js';
import DailyAttendanceSummary from './models/DailyAttendanceSummary.js';

const prisma = new PrismaClient();

async function runTests() {
  console.log(' Starting Biometric Pull Mode Integration Verification Tests...\n');

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

    // 2. Setup temporary test shift for Mondays and Tuesdays (09:00 to 17:00)
    testShift = await prisma.shift.create({
      data: {
        name: 'Test Verify Shift',
        slots: {
          create: [
            {
              startDayOfWeek: 'Monday',
              endDayOfWeek: 'Monday',
              startTime: '09:00',
              endTime: '17:00',
              duration: 480
            },
            {
              startDayOfWeek: 'Tuesday',
              endDayOfWeek: 'Tuesday',
              startTime: '09:00',
              endTime: '17:00',
              duration: 480
            }
          ]
        }
      }
    });

    // 3. Setup temporary staff member with PIN '9999'
    testStaff = await prisma.staff.create({
      data: {
        name: 'Test Verification Employee',
        email: 'test.verify@mkmc.com',
        password: 'testpasswordhash',
        phoneNumber: '0300-9999999',
        roleId: testRole.id,
        biometricPin: '9999',
        isActive: true,
        staffShifts: {
          create: {
            shiftId: testShift.id,
            status: 'ACTIVE'
          }
        }
      }
    });

    // 4. Create a test device (set IP to 127.0.0.1 to activate simulator)
    testDevice = await BiometricDevice.create({
      name: 'Verification Test Device',
      ipAddress: '127.0.0.1',
      port: 4370,
      isActive: true,
      status: 'UNKNOWN'
    });

    console.log('✓ Seeded temporary testing environment data.');

    // ----------------------------------------------------
    // TEST CASE 1: Monday Punch - On time (inside grace period), overtime
    // ----------------------------------------------------
    console.log('\n--- Running Test Case 1: Monday (On-time with Overtime) ---');
    
    // Simulate punches on Monday (June 1st, 2026 is a Monday)
    const mondayStr = '2026-06-01';
    
    // Check-in at 09:05 AM (5 minutes late - expected 09:00, within 15 min grace)
    BiometricService.addSimulatedLog('9999', `${mondayStr}T09:05:00`, 0, 1);
    
    // Check-out at 05:10 PM (10 minutes overtime - expected 17:00)
    BiometricService.addSimulatedLog('9999', `${mondayStr}T17:10:00`, 1, 1);

    console.log('Syncing test logs...');
    let syncResult = await BiometricService.syncDevice(testDevice.id);
    console.log('Sync result stats:', syncResult);

    // Fetch daily summary
    let summaryMonday = await prisma.dailyAttendanceSummary.findFirst({
      where: { staffId: testStaff.id, date: new Date(`${mondayStr}T00:00:00.000Z`) }
    });

    if (!summaryMonday) {
      throw new Error('Test Case 1 Failed: No daily summary record created for Monday');
    }

    console.log('Monday Daily Summary Result:');
    console.log(`  - Check-In: ${summaryMonday.checkIn}`);
    console.log(`  - Check-Out: ${summaryMonday.checkOut}`);
    console.log(`  - Status: ${summaryMonday.status} (Expected: PRESENT)`);
    console.log(`  - Total Hours: ${summaryMonday.totalHours} hrs (Expected: ~8.08)`);
    console.log(`  - Late Minutes: ${summaryMonday.lateMinutes} mins (Expected: 5)`);
    console.log(`  - Overtime Minutes: ${summaryMonday.overtimeMinutes} mins (Expected: 10)`);

    // Assertions
    if (summaryMonday.status !== 'PRESENT') throw new Error(`Status mismatch! Expected PRESENT, got ${summaryMonday.status}`);
    if (summaryMonday.lateMinutes !== 5) throw new Error(`Late minutes mismatch! Expected 5, got ${summaryMonday.lateMinutes}`);
    if (summaryMonday.overtimeMinutes !== 10) throw new Error(`Overtime minutes mismatch! Expected 10, got ${summaryMonday.overtimeMinutes}`);
    console.log('💚 Test Case 1 Passed successfully!');

    // ----------------------------------------------------
    // TEST CASE 2: Tuesday Punch - Late arrival (> 15 minutes grace)
    // ----------------------------------------------------
    console.log('\n--- Running Test Case 2: Tuesday (Late Arrival) ---');
    
    // Clear simulation logs buffer to start clean
    BiometricService.clearSimulatedLogs();
    
    // Tuesday (June 2nd, 2026 is a Tuesday)
    const tuesdayStr = '2026-06-02';
    
    // Check-in at 09:30 AM (30 minutes late - exceeds 15 min grace)
    BiometricService.addSimulatedLog('9999', `${tuesdayStr}T09:30:00`, 0, 1);
    
    // Check-out at 05:00 PM (on-time departure)
    BiometricService.addSimulatedLog('9999', `${tuesdayStr}T17:00:00`, 1, 1);

    console.log('Syncing test logs...');
    syncResult = await BiometricService.syncDevice(testDevice.id);

    // Fetch daily summary
    let summaryTuesday = await prisma.dailyAttendanceSummary.findFirst({
      where: { staffId: testStaff.id, date: new Date(`${tuesdayStr}T00:00:00.000Z`) }
    });

    if (!summaryTuesday) {
      throw new Error('Test Case 2 Failed: No daily summary record created for Tuesday');
    }

    console.log('Tuesday Daily Summary Result:');
    console.log(`  - Status: ${summaryTuesday.status} (Expected: LATE)`);
    console.log(`  - Late Minutes: ${summaryTuesday.lateMinutes} mins (Expected: 30)`);
    console.log(`  - Overtime Minutes: ${summaryTuesday.overtimeMinutes} mins (Expected: 0)`);

    // Assertions
    if (summaryTuesday.status !== 'LATE') throw new Error(`Status mismatch! Expected LATE, got ${summaryTuesday.status}`);
    if (summaryTuesday.lateMinutes !== 30) throw new Error(`Late minutes mismatch! Expected 30, got ${summaryTuesday.lateMinutes}`);
    console.log('💚 Test Case 2 Passed successfully!');

    console.log('\n🌟 All Biometric Pull Mode Integration tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Verification tests failed:', error.message);
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
