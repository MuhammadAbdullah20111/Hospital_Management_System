import prisma from '../config/prismaClient.js';
import DailyAttendanceSummary from '../models/DailyAttendanceSummary.js';

async function test() {
  try {
    const year = "2026";
    const month = "06";
    const departmentId = undefined;

    console.log("Parsing dates...");
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

    console.log("Dates parsed:", { startDate, endDate });

    const filters = { startDate, endDate };
    if (departmentId) filters.departmentId = departmentId;

    console.log("Calling DailyAttendanceSummary.findAll...");
    const summaries = await DailyAttendanceSummary.findAll(filters);
    console.log(`Summaries found: ${summaries.length}`);

    console.log("Mapping staff summaries...");
    const staffSummariesMap = new Map();

    const staffQuery = {};
    if (departmentId) staffQuery.departmentId = parseInt(departmentId);
    console.log("Calling prisma.staff.findMany...");
    const allStaff = await prisma.staff.findMany({
      where: { isActive: true, ...staffQuery },
      include: { role: true, department: true }
    });
    console.log(`Staff found: ${allStaff.length}`);

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
    console.log("Success! Compiled report with items:", reportList.length);
  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

test();
