
import { checkPermission } from '../middlewares/permissionMiddleware.js';
import prisma from '../config/prismaClient.js';
import { generateToken } from '../utils/jwtHelper.js';

async function testPermissionMiddleware() {
  console.log('Starting Permission Middleware Test...');

  // 1. Setup Test Data
  const timestamp = Date.now();
  const testPermissionName = `TEST_PERM_${timestamp}`;
  const testRoleName = `TEST_ROLE_${timestamp}`;
  const testStaffEmail = `test_staff_${timestamp}@example.com`;

  try {
    console.log('Creating test data...');
    
    // Create Permission
    const permission = await prisma.permission.create({
      data: { name: testPermissionName },
    });

    // Create Role
    const role = await prisma.role.create({
      data: { name: testRoleName },
    });

    // Assign Permission to Role
    await prisma.rolePermission.create({
      data: {
        roleId: role.id,
        permissionId: permission.id,
      },
    });

    // Create Staff
    const staff = await prisma.staff.create({
      data: {
        name: 'Test Staff',
        email: testStaffEmail,
        password: 'hashed_password', // Dummy password
        roleId: role.id,
        isActive: true,
      },
    });

    console.log(`Created Staff ID: ${staff.id} with Role: ${testRoleName} and Permission: ${testPermissionName}`);

    // 2. Test Case 1: Staff HAS Permission
    console.log('\nTest Case 1: Check access WITH permission...');
    const req1 = {
      user: { id: staff.id },
    };
    const res1 = {
      status: (code) => {
        console.log(`[Case 1] Status called with: ${code}`);
        return res1;
      },
      json: (data) => console.log(`[Case 1] JSON response:`, data),
    };
    const next1 = () => console.log('[Case 1] SUCCESS: next() called!');

    await checkPermission(testPermissionName)(req1, res1, next1);

    // 3. Test Case 2: Staff logic WITHOUT Permission
    console.log('\nTest Case 2: Check access WITHOUT permission...');
    const req2 = {
        user: { id: staff.id },
    };
    const res2 = {
        status: (code) => {
            console.log(`[Case 2] Status called with: ${code}`);
            return {
                json: (data) => console.log(`[Case 2] JSON response:`, data)
            };
        },
        json: (data) => console.log(`[Case 2] JSON response:`, data), 
    };
    const next2 = () => console.log('[Case 2] FAIL: next() called unexpectedly!');
    
    await checkPermission('NON_EXISTENT_PERMISSION')(req2, res2, next2);


    // Cleanup
    console.log('\nCleaning up...');
    await prisma.staff.delete({ where: { id: staff.id } });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.role.delete({ where: { id: role.id } });
    await prisma.permission.delete({ where: { id: permission.id } });
    
    console.log('Test Completed.');

  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPermissionMiddleware();
