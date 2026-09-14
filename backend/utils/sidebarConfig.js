export const sidebarConfig = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '',
        permission: 'view-dashboard'
    },
    {
        id: 'staff',
        label: 'Staff Management',
        icon: 'Users',
        path: 'staff',
        permission: 'view-staff'
    },
    {
        id: 'roles',
        label: 'Role Management',
        icon: 'ShieldCheck',
        path: 'roles',
        permission: 'view-roles'
    },
    {
        id: 'patients',
        label: 'Patient Directory',
        icon: 'Contact',
        path: 'patients',
        permission: 'view-patient'
    },
    {
        id: 'appointments',
        label: 'Appointments',
        icon: 'Calendar',
        path: 'appointments',
        permission: 'view-appointment'
    },
    {
        id: 'lab-tests',
        label: 'Lab Tests',
        icon: 'TestTube2',
        path: 'lab-tests',
        permission: 'view-labtest'
    },
    {
        id: 'tests',
        label: 'Test',
        icon: 'Beaker',
        path: 'tests',
        permission: 'view-test'
    },
    {
        id: 'departments',
        label: 'Departments',
        icon: 'Building2',
        path: 'departments',
        permission: 'view-department'
    },
    {
        id: 'services',
        label: 'Services',
        icon: 'Stethoscope',
        path: 'services',
        permission: 'view-service'
    },
    {
        id: 'shifts',
        label: 'Shifts',
        icon: 'Clock',
        path: 'shifts',
        permission: 'view-shift'
    },
    {
        id: 'attendance',
        label: 'Attendance',
        icon: 'Fingerprint',
        path: 'attendance',
        permission: 'view-attendance'
    },
    {
        id: 'finance',
        label: 'Finance',
        icon: 'Wallet',
        path: 'finance',
        permission: 'view-finance'
    },
    {
        id: 'wards',
        label: 'Wards',
        icon: 'LayoutGrid',
        path: 'inpatient/wards',
        permission: 'view-ward'
    },
    {
        id: 'rooms',
        label: 'Rooms',
        icon: 'DoorOpen',
        path: 'inpatient/rooms',
        permission: 'view-room'
    },
    {
        id: 'beds',
        label: 'Beds',
        icon: 'Bed',
        path: 'inpatient/beds',
        permission: 'view-bed'
    },

    {
        id: 'reports',
        label: 'Reports & Analytics',
        icon: 'BarChart3',
        path: 'reports',
        permission: 'view-reports'
    }
];
