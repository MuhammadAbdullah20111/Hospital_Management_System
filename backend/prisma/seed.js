// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DAYS_MAP = {
  Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3,
  Friday: 4, Saturday: 5, Sunday: 6
};

function calculateDurationMinutes(startDay, endDay, startTime, endTime) {
  if (!startTime || !endTime || !startDay || !endDay) return 0;
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const startIndex = DAYS_MAP[startDay];
  const endIndex = DAYS_MAP[endDay];
  let startTotal = (startIndex * 24 * 60) + (startHours * 60) + startMinutes;
  let endTotal = (endIndex * 24 * 60) + (endHours * 60) + endMinutes;
  if (endTotal <= startTotal) endTotal += 7 * 24 * 60;
  return endTotal - startTotal;
}

async function main() {
  console.log('🌱 Starting comprehensive Pakistani Hospital Database Seeding...\n');

  // =================================================================
  // 1. CLEANUP EXISTING DATA (Reverse dependency order)
  // =================================================================
  console.log('🗑️  Cleaning existing database records...');
  
  await prisma.attendanceRecord.deleteMany();
  await prisma.dailyAttendanceSummary.deleteMany();
  await prisma.biometricDevice.deleteMany();
  await prisma.queueToken.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.bedAssignment.deleteMany();
  await prisma.hospitalAssetRent.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.labTest.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.room.deleteMany();
  await prisma.ward.deleteMany();
  await prisma.roomCategory.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.test.deleteMany();
  await prisma.service.deleteMany();
  await prisma.staffShift.deleteMany();
  if (prisma.shiftSlot) await prisma.shiftSlot.deleteMany(); // Cascade will handle it, but let's be safe
  await prisma.shift.deleteMany();
  await prisma.staffSalary.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.department.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.transactionCategory.deleteMany();

  console.log('✅ Cleanup completed.\n');

  // =================================================================
  // 2. SEED ADMINS
  // =================================================================
  console.log('👤 Seeding System Administrators...');
  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  
  const admins = [];
  const adminData = [
    {
      name: 'Kamran Ahmed',
      email: 'kamran.admin@mkmc.com',
      password: defaultPasswordHash,
      phoneNumber: '0300-1234567',
      profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
      isTwoFactorEnabled: false
    },
    {
      name: 'Sana Malik',
      email: 'sana.admin@mkmc.com',
      password: defaultPasswordHash,
      phoneNumber: '0321-7654321',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      isTwoFactorEnabled: false
    }
  ];

  for (const adm of adminData) {
    const createdAdmin = await prisma.admin.create({ data: adm });
    admins.push(createdAdmin);
  }
  console.log(`  ✓ Seeded ${admins.length} Admins.\n`);

  // =================================================================
  // 3. SEED OTPS
  // =================================================================
  console.log('🔑 Seeding OTP Logs...');
  await prisma.otp.createMany({
    data: [
      {
        email: 'kamran.admin@mkmc.com',
        otp: '4591',
        reason: '2FA',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hr future
      },
      {
        email: 'sana.admin@mkmc.com',
        otp: '8832',
        reason: 'RESET_PASSWORD',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      }
    ]
  });
  console.log('  ✓ Seeded OTP sample logs.\n');

  // =================================================================
  // 4. SEED PERMISSIONS & ROLES
  // =================================================================
  console.log('🔐 Seeding Permissions & Roles...');
  const entities = [
    'staff', 'patient', 'appointment', 'prescription',
    'labtest', 'test', 'finance', 'inpatient', 'department', 'shift', 'service',
    'role', 'salary', 'asset', 'dashboard', 'settings', 'ward', 'room', 'bed',
    'attendance', 'biometric', 'reports'
  ];
  const actions = ['view', 'create', 'edit', 'delete'];
  
  const allPermissions = [];
  for (const entity of entities) {
    for (const action of actions) {
      allPermissions.push(`${action}-${entity}`);
    }
  }

  // Create permissions
  const createdPerms = [];
  for (const name of allPermissions) {
    const perm = await prisma.permission.create({ data: { name } });
    createdPerms.push(perm);
  }

  const roleNames = ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'LAB_TECHNICIAN'];
  const roles = {};
  for (const rName of roleNames) {
    roles[rName] = await prisma.role.create({ data: { name: rName } });
  }

  // Role - Permissions mapping
  const rolePermissionsMap = {
    'ADMIN': allPermissions,
    'RECEPTIONIST': [
      'view-patient', 'create-patient', 'edit-patient',
      'view-appointment', 'create-appointment', 'edit-appointment', 'delete-appointment',
      'view-staff', 'view-department', 'view-shift', 'view-inpatient', 'view-service', 'view-labtest', 'view-test',
      'view-dashboard', 'view-ward', 'view-room', 'view-bed', 'view-finance', 'create-finance',
      'view-asset', 'create-asset', 'edit-asset',
      'view-attendance', 'create-attendance', 'edit-attendance', 'view-biometric', 'create-biometric', 'edit-biometric'
    ],
    'DOCTOR': [
      'view-patient',
      'view-appointment', 'edit-appointment',
      'view-prescription', 'create-prescription', 'edit-prescription', 'delete-prescription',
      'view-labtest', 'create-labtest', 'view-test',
      'view-inpatient', 'edit-inpatient',
      'view-staff', 'view-shift', 'view-department', 'view-service',
      'view-dashboard', 'view-ward', 'view-room', 'view-bed',
      'view-attendance'
    ],
    'LAB_TECHNICIAN': [
      'view-patient',
      'view-labtest', 'create-labtest', 'edit-labtest', 'delete-labtest',
      'view-test', 'create-test', 'edit-test', 'delete-test',
      'view-staff', 'view-shift', 'view-department',
      'view-dashboard',
      'view-attendance'
    ]
  };

  for (const [rName, perms] of Object.entries(rolePermissionsMap)) {
    const role = roles[rName];
    const targetPerms = createdPerms.filter(p => perms.includes(p.name));
    const mappings = targetPerms.map(p => ({
      roleId: role.id,
      permissionId: p.id
    }));
    await prisma.rolePermission.createMany({ data: mappings });
  }
  console.log('  ✓ Roles & Permissions mapped successfully.\n');

  // =================================================================
  // 5. SEED DEPARTMENTS
  // =================================================================
  console.log('📁 Seeding Departments...');
  const departmentNames = [
    { name: 'Cardiology', description: 'Heart and blood vessel health specialists.' },
    { name: 'Pediatrics', description: 'Healthcare for children and infants.' },
    { name: 'Emergency', description: '24/7 Urgent care and trauma treatments.' },
    { name: 'Gynaecology', description: 'Women health and maternity specialists.' },
    { name: 'Orthopedics', description: 'Bone and joint surgery and treatment.' },
    { name: 'Laboratory', description: 'Pathology and biochemistry diagnostics.' },
    { name: 'Pharmacy', description: 'Medicinal supply and dispensing.' }
  ];

  const departments = {};
  for (const dept of departmentNames) {
    departments[dept.name] = await prisma.department.create({ data: dept });
  }
  console.log('  ✓ Departments seeded.\n');

  // =================================================================
  // 6. SEED SHIFTS & SHIFT SLOTS
  // =================================================================
  console.log('⏰ Seeding Shifts and slots...');
  const shiftsData = [
    {
      name: 'General Morning',
      departmentName: null,
      slots: [
        { startDayOfWeek: 'Monday', endDayOfWeek: 'Monday', startTime: '08:00', endTime: '16:00' },
        { startDayOfWeek: 'Tuesday', endDayOfWeek: 'Tuesday', startTime: '08:00', endTime: '16:00' },
        { startDayOfWeek: 'Wednesday', endDayOfWeek: 'Wednesday', startTime: '08:00', endTime: '16:00' },
        { startDayOfWeek: 'Thursday', endDayOfWeek: 'Thursday', startTime: '08:00', endTime: '16:00' },
        { startDayOfWeek: 'Friday', endDayOfWeek: 'Friday', startTime: '08:00', endTime: '16:00' },
        { startDayOfWeek: 'Saturday', endDayOfWeek: 'Saturday', startTime: '08:00', endTime: '13:00' }
      ]
    },
    {
      name: 'General Evening',
      departmentName: null,
      slots: [
        { startDayOfWeek: 'Monday', endDayOfWeek: 'Monday', startTime: '16:00', endTime: '00:00' },
        { startDayOfWeek: 'Tuesday', endDayOfWeek: 'Tuesday', startTime: '16:00', endTime: '00:00' },
        { startDayOfWeek: 'Wednesday', endDayOfWeek: 'Wednesday', startTime: '16:00', endTime: '00:00' },
        { startDayOfWeek: 'Thursday', endDayOfWeek: 'Thursday', startTime: '16:00', endTime: '00:00' },
        { startDayOfWeek: 'Friday', endDayOfWeek: 'Friday', startTime: '16:00', endTime: '00:00' },
        { startDayOfWeek: 'Saturday', endDayOfWeek: 'Saturday', startTime: '13:00', endTime: '18:00' }
      ]
    },
    {
      name: 'General Night',
      departmentName: null,
      slots: [
        { startDayOfWeek: 'Monday', endDayOfWeek: 'Tuesday', startTime: '00:00', endTime: '08:00' },
        { startDayOfWeek: 'Tuesday', endDayOfWeek: 'Wednesday', startTime: '00:00', endTime: '08:00' },
        { startDayOfWeek: 'Wednesday', endDayOfWeek: 'Thursday', startTime: '00:00', endTime: '08:00' },
        { startDayOfWeek: 'Thursday', endDayOfWeek: 'Friday', startTime: '00:00', endTime: '08:00' },
        { startDayOfWeek: 'Friday', endDayOfWeek: 'Saturday', startTime: '00:00', endTime: '08:00' }
      ]
    },
    {
      name: 'ER Emergency Shift',
      departmentName: 'Emergency',
      slots: [
        { startDayOfWeek: 'Saturday', endDayOfWeek: 'Sunday', startTime: '00:00', endTime: '23:59' },
        { startDayOfWeek: 'Sunday', endDayOfWeek: 'Monday', startTime: '00:00', endTime: '23:59' }
      ]
    }
  ];

  const shifts = {};
  for (const s of shiftsData) {
    let deptId = null;
    if (s.departmentName) {
      deptId = departments[s.departmentName].id;
    }
    
    const shift = await prisma.shift.create({
      data: {
        name: s.name,
        departmentId: deptId,
        slots: {
          create: s.slots.map(slot => ({
            startDayOfWeek: slot.startDayOfWeek,
            endDayOfWeek: slot.endDayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            duration: calculateDurationMinutes(slot.startDayOfWeek, slot.endDayOfWeek, slot.startTime, slot.endTime)
          }))
        }
      }
    });
    shifts[s.name] = shift;
  }
  console.log('  ✓ Shift structures and duration calculations completed.\n');

  // =================================================================
  // 7. SEED STAFF
  // =================================================================
  console.log('👥 Seeding Staff...');
  const staffData = [
    // Receptionists
    {
      name: 'Shahzaib Raza',
      email: 'shahzaib.frontdesk@mkmc.com',
      password: defaultPasswordHash,
      phoneNumber: '0301-4444555',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      role: 'RECEPTIONIST',
      department: 'Emergency',
      consultationFee: 0,
      consultationDuration: 0,
      shift: 'General Morning'
    },
    {
      name: 'Nida Khan',
      email: 'nida.frontdesk@mkmc.com',
      password: defaultPasswordHash,
      phoneNumber: '0322-8889991',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      role: 'RECEPTIONIST',
      department: 'Emergency',
      consultationFee: 0,
      consultationDuration: 0,
      shift: 'General Evening'
    },
    // Lab Technicians
    {
      name: 'Hamza Qureshi',
      email: 'hamza.labs@mkmc.com',
      password: defaultPasswordHash,
      phoneNumber: '0334-1122334',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      role: 'LAB_TECHNICIAN',
      department: 'Laboratory',
      consultationFee: 0,
      consultationDuration: 0,
      shift: 'General Morning'
    },
    {
      name: 'Sadia Mirza',
      email: 'sadia.labs@mkmc.com',
      password: defaultPasswordHash,
      phoneNumber: '0315-7776665',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
      role: 'LAB_TECHNICIAN',
      department: 'Laboratory',
      consultationFee: 0,
      consultationDuration: 0,
      shift: 'General Evening'
    },
    // Doctors
    {
      name: 'Dr. Muhammad Tariq',
      email: 'dr.muhammad.tariq@mkmc.com',
      password: defaultPasswordHash,
      phoneNumber: '0300-8881234',
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
      role: 'DOCTOR',
      department: 'Cardiology',
      consultationFee: 2500,
      consultationDuration: 15,
      shift: 'General Morning'
    },
    {
      name: 'Dr. Aisha Khan',
      email: 'dr.aisha.khan@mkmc.com',
      password: defaultPasswordHash,
      phoneNumber: '0321-9993334',
      profileImage: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200',
      role: 'DOCTOR',
      department: 'Cardiology',
      consultationFee: 2000,
      consultationDuration: 15,
      shift: 'General Evening'
    },
    {
      name: 'Dr. Bilal Ahmed',
      email: 'dr.bilal.ahmed@mkmc.com',
      password: defaultPasswordHash,
      phoneNumber: '0333-5556667',
      profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
      role: 'DOCTOR',
      department: 'Emergency',
      consultationFee: 1500,
      consultationDuration: 15,
      shift: 'ER Emergency Shift'
    },
    {
      name: 'Dr. Sana Ali',
      email: 'dr.sana.ali@mkmc.com',
      password: defaultPasswordHash,
      phoneNumber: '0345-4443332',
      profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
      role: 'DOCTOR',
      department: 'Pediatrics',
      consultationFee: 1800,
      consultationDuration: 20,
      shift: 'General Morning'
    },
    {
      name: 'Dr. Usman Raza',
      email: 'dr.usman.raza@mkmc.com',
      password: defaultPasswordHash,
      phoneNumber: '0302-6667770',
      profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
      role: 'DOCTOR',
      department: 'Orthopedics',
      consultationFee: 2200,
      consultationDuration: 20,
      shift: 'General Evening'
    },
    {
      name: 'Dr. Zainab Fatimah',
      email: 'dr.zainab.fatimah@mkmc.com',
      password: defaultPasswordHash,
      phoneNumber: '0323-9990001',
      profileImage: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200',
      role: 'DOCTOR',
      department: 'Gynaecology',
      consultationFee: 2500,
      consultationDuration: 20,
      shift: 'General Morning'
    }
  ];

  const staff = {};
  let pinNum = 1001;
  for (const s of staffData) {
    const roleRecord = roles[s.role];
    const deptRecord = departments[s.department];
    
    const createdStaff = await prisma.staff.create({
      data: {
        name: s.name,
        email: s.email,
        password: s.password,
        phoneNumber: s.phoneNumber,
        profileImage: s.profileImage,
        roleId: roleRecord.id,
        departmentId: deptRecord ? deptRecord.id : null,
        consultationFee: s.consultationFee,
        consultationDuration: s.consultationDuration,
        biometricPin: String(pinNum++),
        isActive: true
      }
    });
    staff[s.name] = createdStaff;

    // Link shift
    const shiftRecord = shifts[s.shift];
    if (shiftRecord) {
      await prisma.staffShift.create({
        data: {
          staffId: createdStaff.id,
          shiftId: shiftRecord.id,
          status: 'ACTIVE'
        }
      });
    }
  }
  console.log('  ✓ Staff accounts and shift rotations setup.\n');

  // =================================================================
  // 8. SEED STAFF SALARIES
  // =================================================================
  console.log('💰 Seeding Staff Salaries (PKR)...');
  const salaries = {
    'Shahzaib Raza': { base: 45000, allowances: 5000, deductions: 2000 },
    'Nida Khan': { base: 45000, allowances: 5000, deductions: 2000 },
    'Hamza Qureshi': { base: 60000, allowances: 8000, deductions: 3000 },
    'Sadia Mirza': { base: 60000, allowances: 8000, deductions: 3000 },
    'Dr. Muhammad Tariq': { base: 350000, allowances: 50000, deductions: 15000 },
    'Dr. Aisha Khan': { base: 300000, allowances: 40000, deductions: 12000 },
    'Dr. Bilal Ahmed': { base: 280000, allowances: 45000, deductions: 10000 },
    'Dr. Sana Ali': { base: 280000, allowances: 30000, deductions: 10000 },
    'Dr. Usman Raza': { base: 320000, allowances: 40000, deductions: 12000 },
    'Dr. Zainab Fatimah': { base: 350000, allowances: 50000, deductions: 15000 }
  };

  for (const [name, val] of Object.entries(salaries)) {
    const sMember = staff[name];
    if (sMember) {
      const net = val.base + val.allowances - val.deductions;
      await prisma.staffSalary.create({
        data: {
          staffId: sMember.id,
          baseSalary: val.base,
          allowances: val.allowances,
          deductions: val.deductions,
          netSalary: net,
          payDate: 1
        }
      });
    }
  }
  console.log('  ✓ Salaries generated successfully.\n');

  // =================================================================
  // 9. SEED SERVICES
  // =================================================================
  console.log('🩺 Seeding Hospital Services...');
  await prisma.service.createMany({
    data: [
      {
        name: 'OPD General Consultation',
        category: 'Consultation',
        specialty: 'General Practice',
        description: 'Comprehensive outpatient clinical consultation with general practitioners.',
        shortDescription: 'General clinical consultation.',
        baseCost: 1500,
        successRate: 98.5,
        rating: 4.8,
        patientsServed: 3500,
        features: ['Professional Care', 'Immediate Triage', 'Prescription & Plan'],
        isActive: true
      },
      {
        name: 'Cardiac Screening Package',
        category: 'Diagnostics',
        specialty: 'Cardiology',
        description: 'Detailed screening involving ECG, blood work, and expert cardiologist consult.',
        shortDescription: 'Complete heart health check.',
        baseCost: 7500,
        successRate: 99.1,
        rating: 4.9,
        patientsServed: 850,
        features: ['Full Lipid & ECG', 'Cardiologist Consultation', 'Dietary Assessment'],
        isActive: true
      },
      {
        name: 'Emergency Trauma Care',
        category: 'Emergency',
        specialty: 'Trauma & ER',
        description: '24/7 life-saving clinical operations for fractures, accidents, and cardiovascular emergencies.',
        shortDescription: '24/7 life-saving emergency services.',
        baseCost: 5000,
        successRate: 94.6,
        rating: 4.7,
        patientsServed: 6200,
        features: ['Triage within 3 minutes', 'Fully Loaded ICU & ER', 'Life Support & Ambulatory Care'],
        isActive: true
      },
      {
        name: 'Pediatric Care & Vaccination',
        category: 'Consultation',
        specialty: 'Pediatrics',
        description: 'Care for kids and infants including regular growth assessment and vaccinations.',
        shortDescription: 'Childcare and vaccine delivery.',
        baseCost: 1800,
        successRate: 99.8,
        rating: 4.9,
        patientsServed: 1950,
        features: ['Kid-friendly Environment', 'Certified Vaccines', 'Developmental Assessments'],
        isActive: true
      },
      {
        name: 'Orthopedic Bone Care',
        category: 'Specialist Operations',
        specialty: 'Orthopedics',
        description: 'Treatment for joint issues, knee arthritis, and post-fracture physical rehabilitation.',
        shortDescription: 'Joint and bone treatment.',
        baseCost: 2200,
        successRate: 96.2,
        rating: 4.6,
        patientsServed: 1200,
        features: ['Joint Splinting', 'Physiotherapy Center Access', 'Digital X-Rays'],
        isActive: true
      }
    ]
  });
  console.log('  ✓ Services catalog established.\n');

  // =================================================================
  // 10. SEED TESTS
  // =================================================================
  console.log('🔬 Seeding Lab Tests...');
  const testsData = [
    { name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 1000 },
    { name: 'Lipid Profile', category: 'Biochemistry', price: 2200 },
    { name: 'Liver Function Test (LFT)', category: 'Biochemistry', price: 1800 },
    { name: 'X-Ray Chest PA View', category: 'Radiology', price: 1500 },
    { name: 'Urine Routine Examination (Urine RE)', category: 'Pathology', price: 450 },
    { name: 'Fasting Blood Sugar (FBS)', category: 'Biochemistry', price: 300 },
    { name: 'Electrocardiogram (ECG)', category: 'Cardiology', price: 1200 }
  ];

  const tests = {};
  for (const t of testsData) {
    tests[t.name] = await prisma.test.create({ data: t });
  }
  console.log('  ✓ Diagnostic lab test directory seeded.\n');

  // =================================================================
  // 11. SEED ROOM CATEGORIES, WARDS, ROOMS & BEDS
  // =================================================================
  console.log('🏨 Seeding Wards, Rooms, and Beds...');
  const roomCategoriesData = [
    { name: 'General Ward', pricePerDay: 1200, description: 'Shared clinical wards with essential facilities.' },
    { name: 'Semi-Private', pricePerDay: 2800, description: 'Double occupancy recovery rooms.' },
    { name: 'Private Room', pricePerDay: 6000, description: 'Single occupancy air-conditioned rooms.' },
    { name: 'VIP Suite', pricePerDay: 15000, description: 'Luxury medical suites with patient lounge.' },
    { name: 'ICU', pricePerDay: 18000, description: 'Intensive Critical Care Units with vital systems.' }
  ];

  const roomCats = {};
  for (const rc of roomCategoriesData) {
    roomCats[rc.name] = await prisma.roomCategory.create({ data: rc });
  }

  const wardData = [
    { name: 'Cardiology Ward', code: 'CAR-W', description: 'Monitoring unit for heart stroke patients.' },
    { name: 'Emergency Ward', code: 'ER-W', description: 'Initial admission and stabilization ward.' },
    { name: 'Intensive Care Unit', code: 'ICU-W', description: 'Highly isolated clinical critical-care ward.' },
    { name: 'General Medical Ward', code: 'GEN-W', description: 'Standard post-operation observation ward.' },
    { name: 'VIP Suite Block', code: 'VIP-W', description: 'Premium recovery ward blocks.' }
  ];

  const wards = {};
  for (const wd of wardData) {
    wards[wd.name] = await prisma.ward.create({ data: wd });
  }

  // Seeding Rooms & Beds for Wards
  // -- Cardiology Ward (2 Semi-Private Rooms with 3 beds each)
  for (let rNum = 1; rNum <= 2; rNum++) {
    const room = await prisma.room.create({
      data: {
        roomNumber: `CAR-R${rNum}`,
        floor: 2,
        wardId: wards['Cardiology Ward'].id,
        categoryId: roomCats['Semi-Private'].id,
        isActive: true
      }
    });
    for (let bNum = 1; bNum <= 3; bNum++) {
      await prisma.bed.create({
        data: {
          roomId: room.id,
          wardId: wards['Cardiology Ward'].id,
          bedNumber: `CAR-R${rNum}-B${bNum}`,
          status: 'AVAILABLE',
          isActive: true
        }
      });
    }
  }

  // -- Emergency Ward (1 General Ward room with 10 triage beds)
  const erRoom = await prisma.room.create({
    data: {
      roomNumber: `ER-TR1`,
      floor: 1,
      wardId: wards['Emergency Ward'].id,
      categoryId: roomCats['General Ward'].id,
      isActive: true
    }
  });
  for (let bNum = 1; bNum <= 10; bNum++) {
    await prisma.bed.create({
      data: {
        roomId: erRoom.id,
        wardId: wards['Emergency Ward'].id,
        bedNumber: `ER-TR1-B${bNum}`,
        status: 'AVAILABLE',
        isActive: true
      }
    });
  }

  // -- ICU Ward (4 Private Critical ICU rooms with 1 bed each)
  for (let rNum = 1; rNum <= 4; rNum++) {
    const room = await prisma.room.create({
      data: {
        roomNumber: `ICU-R${rNum}`,
        floor: 1,
        wardId: wards['Intensive Care Unit'].id,
        categoryId: roomCats['ICU'].id,
        isActive: true
      }
    });
    await prisma.bed.create({
      data: {
        roomId: room.id,
        wardId: wards['Intensive Care Unit'].id,
        bedNumber: `ICU-R${rNum}-B1`,
        status: 'AVAILABLE',
        isActive: true
      }
    });
  }

  // -- General Medical Ward (3 General Ward rooms with 6 beds each)
  for (let rNum = 1; rNum <= 3; rNum++) {
    const room = await prisma.room.create({
      data: {
        roomNumber: `GEN-R${rNum}`,
        floor: 3,
        wardId: wards['General Medical Ward'].id,
        categoryId: roomCats['General Ward'].id,
        isActive: true
      }
    });
    for (let bNum = 1; bNum <= 6; bNum++) {
      await prisma.bed.create({
        data: {
          roomId: room.id,
          wardId: wards['General Medical Ward'].id,
          bedNumber: `GEN-R${rNum}-B${bNum}`,
          status: 'AVAILABLE',
          isActive: true
        }
      });
    }
  }

  // -- VIP Suite Block (2 VIP Suite rooms with 1 bed each)
  for (let rNum = 1; rNum <= 2; rNum++) {
    const room = await prisma.room.create({
      data: {
        roomNumber: `VIP-R${rNum}`,
        floor: 4,
        wardId: wards['VIP Suite Block'].id,
        categoryId: roomCats['VIP Suite'].id,
        isActive: true
      }
    });
    await prisma.bed.create({
      data: {
        roomId: room.id,
        wardId: wards['VIP Suite Block'].id,
        bedNumber: `VIP-R${rNum}-B1`,
        status: 'AVAILABLE',
        isActive: true
      }
    });
  }
  console.log('  ✓ Inpatient layouts, recovery suites and beds set to default AVAILABLE state.\n');

  // =================================================================
  // 12. SEED TRANSACTION CATEGORIES
  // =================================================================
  console.log('💰 Seeding Ledger Categories (Income & Expenses)...');
  const ledgerCategories = [
    { name: 'Appointment', type: 'INCOME', description: 'Outpatient consultation appointment booking fees' },
    { name: 'Lab Test', type: 'INCOME', description: 'Diagnostic pathology and radiology service charges' },
    { name: 'Bed Rent', type: 'INCOME', description: 'Inpatient recovery accommodation and ICU daily charges' },
    { name: 'Asset Rent', type: 'INCOME', description: 'Fees for renting wheelchairs, oxygen cylinders, etc.' },
    { name: 'Salary', type: 'EXPENSE', description: 'Monthly payroll, payouts, and bonuses to clinic staff' },
    { name: 'Utility', type: 'EXPENSE', description: 'Electricity, gas, internet, and municipal utility bills' },
    { name: 'Supplies', type: 'EXPENSE', description: 'Medical equipment, sterile packages, syringes, and medication replenishment' },
    { name: 'Other Income', type: 'INCOME', description: 'Miscellaneous revenue' },
    { name: 'Other Expense', type: 'EXPENSE', description: 'Miscellaneous expense records' }
  ];

  const categories = {};
  for (const cat of ledgerCategories) {
    categories[cat.name] = await prisma.transactionCategory.create({ data: cat });
  }
  console.log('  ✓ Ledger category indexes generated.\n');

  // =================================================================
  // 13. SEED PATIENTS
  // =================================================================
  console.log('👤 Seeding Patients...');
  const patientData = [
    { mrNumber: 'MR-00001', name: 'Muhammad Rizwan', email: 'rizwan.m@gmail.com', phoneNumber: '0300-9876543', cnic: '35201-1234567-1', age: 45, gender: 'Male', address: 'Model Town, Lahore' },
    { mrNumber: 'MR-00002', name: 'Zainab Bibi', email: 'zainab.bibi@yahoo.com', phoneNumber: '0321-5551234', cnic: '35202-9876543-2', age: 38, gender: 'Female', address: 'G-11, Islamabad' },
    { mrNumber: 'MR-00003', name: 'Abdul Rehman', email: 'rehman.abdul@outlook.com', phoneNumber: '0333-4448888', cnic: '34101-4444555-3', age: 62, gender: 'Male', address: 'Gulshan-e-Iqbal, Karachi' },
    { mrNumber: 'MR-00004', name: 'Fatima Noor', email: 'fatima.noor9@gmail.com', phoneNumber: '0345-6667777', cnic: '37405-7778889-4', age: 24, gender: 'Female', address: 'Saddar, Rawalpindi' },
    { mrNumber: 'MR-00005', name: 'Haris Jamil', email: 'haris.jamil@gmail.com', phoneNumber: '0312-3456789', cnic: '35201-5555111-5', age: 29, gender: 'Male', address: 'DHA Phase 5, Lahore' },
    { mrNumber: 'MR-00006', name: 'Amna Sajid', email: 'amna.sajid@gmail.com', phoneNumber: '0302-8889999', cnic: '17301-2223334-6', age: 12, gender: 'Female', address: 'Hayatabad, Peshawar' },
    { mrNumber: 'MR-00007', name: 'Tariq Masood', email: 'tariq.masood@gmail.com', phoneNumber: '0334-8765432', cnic: '33100-8889990-7', age: 50, gender: 'Male', address: 'Peoples Colony, Faisalabad' },
    { mrNumber: 'MR-00008', name: 'Sobia Kamal', email: 'sobia.kamal@gmail.com', phoneNumber: '0322-1122334', cnic: '36302-3334445-8', age: 34, gender: 'Female', address: 'Boson Road, Multan' }
  ];

  const patients = {};
  for (const p of patientData) {
    patients[p.name] = await prisma.patient.create({ data: p });
  }
  console.log(`  ✓ Seeded ${Object.keys(patients).length} Patients with unique MR records.\n`);

  // =================================================================
  // 14. SEED CLINICAL INTERACTIONS (Appointments, Queues, Prescriptions, Transactions)
  // =================================================================
  console.log('🩺 Seeding Clinical Interactions (OPD workflow)...');

  // Today dates for seeding appointments
  const today = new Date();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // ---- Appointment 1: Muhammad Rizwan (Patient 1) with Dr. Muhammad Tariq (Cardiology) ----
  const app1 = await prisma.appointment.create({
    data: {
      date: today,
      time: '09:30',
      reason: 'Chest pain during jogging',
      status: 'PENDING',
      patientId: patients['Muhammad Rizwan'].id,
      doctorId: staff['Dr. Muhammad Tariq'].id
    }
  });

  // Unique QueueToken for App 1
  await prisma.queueToken.create({
    data: {
      tokenNumber: 1,
      department: 'DOCTOR',
      status: 'WAITING',
      date: today,
      appointmentId: app1.id
    }
  });

  // Unique Financial Transaction for App 1
  await prisma.transaction.create({
    data: {
      type: 'INCOME',
      categoryId: categories['Appointment'].id,
      amount: 2500, // Dr Tariq fee
      baseAmount: 2500,
      discount: 0,
      method: 'CASH',
      status: 'PAID',
      patientId: patients['Muhammad Rizwan'].id,
      appointmentId: app1.id,
      referenceNumber: 'TXN-APP-00001',
      notes: 'Consultation fee for Cardiology'
    }
  });

  // ---- Appointment 2: Zainab Bibi (Patient 2) with Dr. Aisha Khan (Cardiology) ----
  const app2 = await prisma.appointment.create({
    data: {
      date: today,
      time: '10:15',
      reason: 'Follow-up for hypertension',
      status: 'CONFIRMED',
      patientId: patients['Zainab Bibi'].id,
      doctorId: staff['Dr. Aisha Khan'].id
    }
  });

  await prisma.queueToken.create({
    data: {
      tokenNumber: 2,
      department: 'DOCTOR',
      status: 'SERVING',
      date: today,
      appointmentId: app2.id
    }
  });

  await prisma.transaction.create({
    data: {
      type: 'INCOME',
      categoryId: categories['Appointment'].id,
      amount: 2000, // Dr Aisha fee
      baseAmount: 2000,
      discount: 0,
      method: 'CARD',
      status: 'PAID',
      patientId: patients['Zainab Bibi'].id,
      appointmentId: app2.id,
      referenceNumber: 'TXN-APP-00002',
      notes: 'Cardiology consultation fee paid by card'
    }
  });

  // ---- Appointment 3: Abdul Rehman (Patient 3) with Dr. Usman Raza (Orthopedics) ----
  const app3 = await prisma.appointment.create({
    data: {
      date: yesterday,
      time: '11:00',
      reason: 'Severe lower back ache',
      status: 'COMPLETED',
      patientId: patients['Abdul Rehman'].id,
      doctorId: staff['Dr. Usman Raza'].id
    }
  });

  await prisma.queueToken.create({
    data: {
      tokenNumber: 1,
      department: 'DOCTOR',
      status: 'COMPLETED',
      date: yesterday,
      appointmentId: app3.id
    }
  });

  await prisma.transaction.create({
    data: {
      type: 'INCOME',
      categoryId: categories['Appointment'].id,
      amount: 2200, // Dr Usman fee
      baseAmount: 2200,
      discount: 0,
      method: 'ONLINE',
      status: 'PAID',
      patientId: patients['Abdul Rehman'].id,
      appointmentId: app3.id,
      referenceNumber: 'TXN-APP-00003',
      notes: 'Orthopedic consultation fee paid via EasyPaisa'
    }
  });

  // Create Prescription for the completed appointment (app3)
  await prisma.prescription.create({
    data: {
      date: yesterday,
      diagnosis: 'Lumbar spondylosis & acute muscle spasm.',
      prescriptionContent: '1. Tab. Panadol Joint 665mg -- Thrice Daily (10 days)\n2. Tab. Muscoril 4mg -- Twice Daily (5 days)\n3. Fastum Gel local application -- Thrice Daily',
      nextFollowUp: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days later
      appointmentId: app3.id,
      patientId: patients['Abdul Rehman'].id,
      doctorId: staff['Dr. Usman Raza'].id
    }
  });

  // ---- Appointment 4: Fatima Noor (Patient 4) with Dr. Zainab Fatimah (Gynaecology) ----
  const app4 = await prisma.appointment.create({
    data: {
      date: tomorrow,
      time: '12:00',
      reason: 'Routine prenatal checkup',
      status: 'PENDING',
      patientId: patients['Fatima Noor'].id,
      doctorId: staff['Dr. Zainab Fatimah'].id
    }
  });

  await prisma.queueToken.create({
    data: {
      tokenNumber: 1,
      department: 'DOCTOR',
      status: 'WAITING',
      date: tomorrow,
      appointmentId: app4.id
    }
  });

  await prisma.transaction.create({
    data: {
      type: 'INCOME',
      categoryId: categories['Appointment'].id,
      amount: 2500, // Dr Zainab fee
      baseAmount: 2500,
      discount: 0,
      method: 'CASH',
      status: 'PENDING', // Unpaid yet, since it is a tomorrow's booking
      patientId: patients['Fatima Noor'].id,
      appointmentId: app4.id,
      referenceNumber: 'TXN-APP-00004',
      notes: 'Consultation fee booking generated (Pending Cash)'
    }
  });

  console.log('  ✓ Outpatient bookings, token logs, diagnostics, and prescriptions generated.\n');

  // =================================================================
  // 15. SEED LAB TEST ORDERS
  // =================================================================
  console.log('🔬 Seeding Diagnostics Laboratory Orders...');

  // ---- Lab Test 1: Completed lipid profile for Muhammad Rizwan ----
  const lt1 = await prisma.labTest.create({
    data: {
      testId: tests['Lipid Profile'].id,
      testName: 'Lipid Profile',
      result: 'Cholesterol: 245 mg/dL (High)\nTriglycerides: 195 mg/dL (High)\nHDL Cholesterol: 32 mg/dL (Low)\nLDL Cholesterol: 168 mg/dL (Borderline High)',
      reportFile: '/uploads/reports/lipid_mr_00001.pdf',
      expectedDate: today,
      status: 'COMPLETED',
      patientId: patients['Muhammad Rizwan'].id,
      conductedById: staff['Hamza Qureshi'].id
    }
  });

  await prisma.queueToken.create({
    data: {
      tokenNumber: 101,
      department: 'LAB',
      status: 'COMPLETED',
      date: today,
      labTestId: lt1.id
    }
  });

  await prisma.transaction.create({
    data: {
      type: 'INCOME',
      categoryId: categories['Lab Test'].id,
      amount: 2200,
      baseAmount: 2200,
      discount: 0,
      method: 'CASH',
      status: 'PAID',
      patientId: patients['Muhammad Rizwan'].id,
      labTestId: lt1.id,
      referenceNumber: 'TXN-LAB-00001',
      notes: 'Lipid profile fee paid in cash'
    }
  });

  // ---- Lab Test 2: Pending Complete Blood Count for Haris Jamil ----
  const lt2 = await prisma.labTest.create({
    data: {
      testId: tests['Complete Blood Count (CBC)'].id,
      testName: 'Complete Blood Count (CBC)',
      result: null,
      expectedDate: tomorrow,
      status: 'PENDING',
      patientId: patients['Haris Jamil'].id,
      conductedById: staff['Sadia Mirza'].id
    }
  });

  await prisma.queueToken.create({
    data: {
      tokenNumber: 102,
      department: 'LAB',
      status: 'WAITING',
      date: today,
      labTestId: lt2.id
    }
  });

  await prisma.transaction.create({
    data: {
      type: 'INCOME',
      categoryId: categories['Lab Test'].id,
      amount: 1000,
      baseAmount: 1000,
      discount: 0,
      method: 'BANK_TRANSFER',
      status: 'PAID',
      patientId: patients['Haris Jamil'].id,
      labTestId: lt2.id,
      referenceNumber: 'TXN-LAB-00002',
      notes: 'CBC test fee paid online via Allied Bank App'
    }
  });

  console.log('  ✓ Diagnostic laboratory orders and ledger records linked.\n');

  // =================================================================
  // 16. SEED INPATIENT RECOVERIES (Bed Assignments & Status Updates)
  // =================================================================
  console.log('🛏️  Seeding Inpatient Admissions & Bed Assignments...');

  // Get available beds to assign
  const icuBed = await prisma.bed.findFirst({ where: { bedNumber: 'ICU-R1-B1' } });
  const generalBed = await prisma.bed.findFirst({ where: { bedNumber: 'GEN-R1-B1' } });

  if (icuBed && generalBed) {
    // ---- Bed Assignment 1: Active critical care for Abdul Rehman ----
    // Update bed status to OCCUPIED
    const activeBed = await prisma.bed.update({
      where: { id: icuBed.id },
      data: { status: 'OCCUPIED' }
    });

    const assign1 = await prisma.bedAssignment.create({
      data: {
        patientId: patients['Abdul Rehman'].id,
        bedId: activeBed.id,
        assignedAt: yesterday,
        assignedBy: staff['Dr. Bilal Ahmed'].id,
        expectedDischargeAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days out
        notes: 'Under critical ventilation monitoring due to unstable angina.',
        dailyRate: 18000, // ICU Rate
        totalBill: 0, // Not discharged yet
        isPaid: false
      }
    });

    // Unpaid billing transaction representation for Active stay
    await prisma.transaction.create({
      data: {
        type: 'INCOME',
        categoryId: categories['Bed Rent'].id,
        amount: 0, // Unsettled bill
        baseAmount: 18000, // Track 1 day charge so far
        discount: 0,
        method: 'CASH',
        status: 'PENDING',
        patientId: patients['Abdul Rehman'].id,
        bedAssignmentId: assign1.id,
        referenceNumber: 'TXN-BED-00001',
        notes: 'ICU room charges pending discharge calculation'
      }
    });

    // ---- Bed Assignment 2: Discharged General Ward recovery for Tariq Masood ----
    // This bed was occupied and is now AVAILABLE again since patient is discharged
    const assign2 = await prisma.bedAssignment.create({
      data: {
        patientId: patients['Tariq Masood'].id,
        bedId: generalBed.id,
        assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        assignedBy: staff['Dr. Bilal Ahmed'].id,
        actualDischargeAt: yesterday,
        dischargeReason: 'RECOVERED',
        dischargedBy: staff['Dr. Bilal Ahmed'].id,
        notes: 'Admitted for acute gastroenteritis. Responded well to IV fluids.',
        dailyRate: 1200, // General ward rate
        totalBill: 4800, // 4 days stay * 1200
        isPaid: true
      }
    });

    // Paid transaction for this completed ward stay
    await prisma.transaction.create({
      data: {
        type: 'INCOME',
        categoryId: categories['Bed Rent'].id,
        amount: 4800,
        baseAmount: 4800,
        discount: 0,
        method: 'CASH',
        status: 'PAID',
        patientId: patients['Tariq Masood'].id,
        bedAssignmentId: assign2.id,
        referenceNumber: 'TXN-BED-00002',
        notes: 'Paid General Ward charges (4 days stay)'
      }
    });
  }
  console.log('  ✓ Inpatient clinical admissions and room leases mapped.\n');

  // =================================================================
  // 17. SEED HOSPITAL ASSET RENTS
  // =================================================================
  console.log('♿ Seeding Hospital Asset Rents...');

  // Rent 1: Tariq Masood rented a Wheelchair during admission
  const ar1 = await prisma.hospitalAssetRent.create({
    data: {
      patientId: patients['Tariq Masood'].id,
      assetType: 'WHEELCHAIR',
      assetId: 101,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: yesterday,
      ratePerDay: 500,
      totalAmount: 2000, // 4 days * 500
      status: 'COMPLETED'
    }
  });

  await prisma.transaction.create({
    data: {
      type: 'INCOME',
      categoryId: categories['Asset Rent'].id,
      amount: 2000,
      baseAmount: 2000,
      discount: 0,
      method: 'CASH',
      status: 'PAID',
      patientId: patients['Tariq Masood'].id,
      assetRentId: ar1.id,
      referenceNumber: 'TXN-AST-00001',
      notes: 'Wheelchair rent charges settled'
    }
  });

  // Rent 2: Zainab Bibi is actively leasing an Oxygen cylinder
  const ar2 = await prisma.hospitalAssetRent.create({
    data: {
      patientId: patients['Zainab Bibi'].id,
      assetType: 'OXYGEN_CYLINDER',
      assetId: 205,
      startDate: yesterday,
      ratePerDay: 1500,
      status: 'ACTIVE'
    }
  });

  await prisma.transaction.create({
    data: {
      type: 'INCOME',
      categoryId: categories['Asset Rent'].id,
      amount: 0,
      baseAmount: 1500, // Rate per day tracker
      discount: 0,
      method: 'CASH',
      status: 'PENDING',
      patientId: patients['Zainab Bibi'].id,
      assetRentId: ar2.id,
      referenceNumber: 'TXN-AST-00002',
      notes: 'Active Oxygen Cylinder rent daily charges billing accumulator'
    }
  });
  console.log('  ✓ Asset rent agreements and transactions seeded.\n');

  // =================================================================
  // 18. SEED STAFF SALARY PAYMENTS & UTILITY EXPENSES
  // =================================================================
  console.log('💸 Seeding Operating Expenditures (Staff Salaries & Utilities)...');

  // Staff Salary payout entries (for last month)
  const staffMembers = Object.keys(staff);
  for (const sName of staffMembers) {
    const sMember = staff[sName];
    const sSalary = await prisma.staffSalary.findUnique({ where: { staffId: sMember.id } });
    if (sSalary) {
      await prisma.transaction.create({
        data: {
          type: 'EXPENSE',
          categoryId: categories['Salary'].id,
          amount: sSalary.netSalary,
          baseAmount: sSalary.netSalary,
          discount: 0,
          method: 'BANK_TRANSFER',
          status: 'PAID',
          staffId: sMember.id,
          referenceNumber: `TXN-SAL-${sMember.id}-MAY`,
          notes: `Monthly salary payout of PKR ${sSalary.netSalary.toLocaleString()} for ${sMember.name} (May 2026)`
        }
      });
    }
  }

  // Clinic utility expenses
  await prisma.transaction.create({
    data: {
      type: 'EXPENSE',
      categoryId: categories['Utility'].id,
      amount: 85400,
      baseAmount: 85400,
      method: 'BANK_TRANSFER',
      status: 'PAID',
      referenceNumber: 'TXN-UTL-LESCO-01',
      notes: 'LESCO Electricity Bill for MK Medical Centre'
    }
  });

  await prisma.transaction.create({
    data: {
      type: 'EXPENSE',
      categoryId: categories['Utility'].id,
      amount: 12000,
      baseAmount: 12000,
      method: 'BANK_TRANSFER',
      status: 'PAID',
      referenceNumber: 'TXN-UTL-SNGPL-01',
      notes: 'SNGPL Commercial Gas Bill for MK Medical Centre'
    }
  });

  await prisma.transaction.create({
    data: {
      type: 'EXPENSE',
      categoryId: categories['Supplies'].id,
      amount: 140000,
      baseAmount: 140000,
      method: 'ONLINE',
      status: 'PAID',
      referenceNumber: 'TXN-EXP-SUP-001',
      notes: 'Purchase of disposable surgical gloves, syringes, and clinical antiseptics'
    }
  });

  console.log('  ✓ Operational expenditure ledger logs seeded.\n');

  console.log('✨ Database Seeding Completed Successfully! All schemas populated with correctly mapped relationships and Pakistani Muslim contextual records. ✨');
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });