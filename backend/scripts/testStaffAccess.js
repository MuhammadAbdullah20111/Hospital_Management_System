
import prisma from '../config/prismaClient.js';
import { checkPermission } from '../middlewares/permissionMiddleware.js';

// Mock request/response objects for middleware testing
const createMockReqRes = (user) => {
    const req = { user };
    const res = {
        status: (code) => {
            console.log(`Response Status: ${code}`);
            return res;
        },
        json: (data) => console.log('Response JSON:', data),
        send: (data) => console.log('Response Send:', data),
    };
    const next = (err) => {
        if (err) console.log('Next called with error:', err.message);
        else console.log('Next called (Access Granted)');
    };
    return { req, res, next };
};

async function testStaffAccess() {
    console.log('Starting Expanded Staff Access Test...');

    const timestamp = Date.now();
    const roleName = `TEST_ROLE_${timestamp}`;
    const staffEmail = `staff_${timestamp}@example.com`;
    // Added new permissions: VIEW_DASHBOARD, MANAGE_DEPARTMENTS, MANAGE_SERVICES, MANAGE_SHIFTS
    const permissions = [
        'MANAGE_PATIENTS', 
        'MANAGE_APPOINTMENTS', 
        'VIEW_DASHBOARD',
        'MANAGE_DEPARTMENTS',
        'MANAGE_SERVICES',
        'MANAGE_SHIFTS'
    ];

    try {
        console.log('Creating Schema Data...');
        
        // 1. Create Permissions
        const permRecords = [];
        for (const p of permissions) {
            let perm = await prisma.permission.findUnique({ where: { name: p } }); 
            if (!perm) {
                perm = await prisma.permission.create({ data: { name: p } });
                console.log(`Created Permission: ${p}`);
            }
            permRecords.push(perm);
        }

        // 2. Create Role
        const role = await prisma.role.create({ data: { name: roleName } });
        console.log(`Created Role: ${roleName}`);

        // 3. Assign Permissions to Role
        for (const perm of permRecords) {
            await prisma.rolePermission.create({
                data: { roleId: role.id, permissionId: perm.id },
            });
        }

        // 4. Create Staff
        const staff = await prisma.staff.create({
            data: {
                name: 'Test Expanded Access Staff',
                email: staffEmail,
                password: 'hashed',
                roleId: role.id,
            },
        });
        console.log(`Created Staff: ${staffEmail}`);

        // 5. Test Access
        const { req, res, next } = createMockReqRes({ id: staff.id });

        console.log('\n--- Testing MANAGE_PATIENTS ---');
        await checkPermission('MANAGE_PATIENTS')(req, res, next);

        console.log('\n--- Testing VIEW_DASHBOARD ---');
        await checkPermission('VIEW_DASHBOARD')(req, res, next);

        console.log('\n--- Testing MANAGE_DEPARTMENTS ---');
        await checkPermission('MANAGE_DEPARTMENTS')(req, res, next);

        console.log('\n--- Testing MANAGE_SERVICES ---');
        await checkPermission('MANAGE_SERVICES')(req, res, next);

        console.log('\n--- Testing MANAGE_SHIFTS ---');
        await checkPermission('MANAGE_SHIFTS')(req, res, next);

        console.log('\n--- Testing MISSING PERMISSION (SHOULD FAIL) ---');
        await checkPermission('SUPER_ADMIN_ONLY')(req, res, next);


        // Cleanup
        console.log('\nCleaning up...');
        await prisma.staff.delete({ where: { id: staff.id } });
        await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
        await prisma.role.delete({ where: { id: role.id } });
        
    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testStaffAccess();
