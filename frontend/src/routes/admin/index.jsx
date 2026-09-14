import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "../../middleware/ProtectedRoute";
import DashboardLayout from "../../layouts/DashboardLayout";
import Dashboard from "../../pages/admin/Dashboard";
import StaffList from "../../pages/admin/staff/StaffList";
import CreateStaff from "../../pages/admin/staff/CreateStaff";
import EditStaff from "../../pages/admin/staff/EditStaff";
import StaffDetails from "../../pages/admin/staff/StaffDetails";
import RoleList from "../../pages/admin/roles/RoleList";
import CreateRole from "../../pages/admin/roles/CreateRole";
import EditRole from "../../pages/admin/roles/EditRole";
// Departments
import DepartmentList from "../../pages/admin/departments/DepartmentList";
import CreateDepartment from "../../pages/admin/departments/CreateDepartment";
import EditDepartment from "../../pages/admin/departments/EditDepartment";
// Shifts
import ShiftList from "../../pages/admin/shifts/ShiftList";
import CreateShift from "../../pages/admin/shifts/CreateShift";
import EditShift from "../../pages/admin/shifts/EditShift";
// Attendance
import AttendanceDashboard from "../../pages/admin/attendance/AttendanceDashboard";
import DeviceManagement from "../../pages/admin/attendance/DeviceManagement";
import MonthlyReport from "../../pages/admin/attendance/MonthlyReport";
// Services
import ServiceList from "../../pages/admin/services/ServiceList";
import CreateService from "../../pages/admin/services/CreateService";
import EditService from "../../pages/admin/services/EditService";
// Patients
import PatientList from "../../pages/admin/patients/PatientList";
import CreatePatient from "../../pages/admin/patients/CreatePatient";
import PatientDetails from "../../pages/admin/patients/PatientDetails";
import EditPatient from "../../pages/admin/patients/EditPatient";
// Appointments
import AppointmentList from "../../pages/admin/appointments/AppointmentList";
import CreateAppointment from "../../pages/admin/appointments/CreateAppointment";
import EditAppointment from "../../pages/admin/appointments/EditAppointment";
// Lab Tests
import LabTestList from "../../pages/admin/lab/LabTestList";
import CreateLabTest from "../../pages/admin/lab/CreateLabTest";
import EditLabTest from "../../pages/admin/lab/EditLabTest";
// Test
import TestList from "../../pages/admin/tests/TestList";
import CreateTest from "../../pages/admin/tests/CreateTest";
import EditTest from "../../pages/admin/tests/EditTest";
// Finance
import TransactionList from "../../pages/admin/finance/TransactionList";
import CreateTransaction from "../../pages/admin/finance/CreateTransaction";
import ProcessPayment from "../../pages/admin/finance/ProcessPayment";
import FinanceDashboard from "../../pages/admin/finance/FinanceDashboard";
import SalaryManagement from "../../pages/admin/finance/SalaryManagement";

// Inpatient
import WardList from "../../pages/admin/inpatient/WardList";
import CreateWard from "../../pages/admin/inpatient/CreateWard";
import EditWard from "../../pages/admin/inpatient/EditWard";
import RoomList from "../../pages/admin/inpatient/RoomList";
import CreateRoom from "../../pages/admin/inpatient/CreateRoom";
import EditRoom from "../../pages/admin/inpatient/EditRoom";
import BedList from "../../pages/admin/inpatient/BedList";
import CreateBed from "../../pages/admin/inpatient/CreateBed";
import EditBed from "../../pages/admin/inpatient/EditBed";
// Profile
import Profile from "../../pages/admin/Profile";

import Reports from "../../pages/admin/reports/Reports";

const AdminRoutes = () => {
    return (
        <Routes>
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route element={<DashboardLayout />}>
                    <Route path="dashboard">
                        <Route index element={<Dashboard />} />
                        <Route path="staff" element={<StaffList />} />
                        <Route path="staff/create" element={<CreateStaff />} />
                        <Route path="staff/edit/:id" element={<EditStaff />} />
                        <Route path="staff/view/:id" element={<StaffDetails />} />
                        {/* Role Management Routes */}
                        <Route path="roles" element={<RoleList />} />
                        <Route path="roles/create" element={<CreateRole />} />
                        <Route path="roles/edit/:id" element={<EditRole />} />

                        {/* Department Management Routes */}
                        <Route path="departments" element={<DepartmentList />} />
                        <Route path="departments/create" element={<CreateDepartment />} />
                        <Route path="departments/edit/:id" element={<EditDepartment />} />

                        {/* Shift Management Routes */}
                        <Route path="shifts" element={<ShiftList />} />
                        <Route path="shifts/create" element={<CreateShift />} />
                        <Route path="shifts/edit/:id" element={<EditShift />} />

                        {/* Attendance Management Routes */}
                        <Route path="attendance" element={<AttendanceDashboard />} />
                        <Route path="attendance/devices" element={<DeviceManagement />} />
                        <Route path="attendance/reports" element={<MonthlyReport />} />

                        {/* Service Management Routes */}
                        <Route path="services" element={<ServiceList />} />
                        <Route path="services/create" element={<CreateService />} />
                        <Route path="services/edit/:id" element={<EditService />} />

                        {/* Patient Management Routes */}
                        <Route path="patients" element={<PatientList />} />
                        <Route path="patients/create" element={<CreatePatient />} />
                        <Route path="patients/edit/:id" element={<EditPatient />} />
                        <Route path="patients/view/:id" element={<PatientDetails />} />

                        {/* Appointment Management Routes */}
                        <Route path="appointments" element={<AppointmentList />} />
                        <Route path="appointments/create" element={<CreateAppointment />} />
                        <Route path="appointments/edit/:id" element={<EditAppointment />} />

                        {/* Lab Test Management Routes */}
                        <Route path="lab-tests" element={<LabTestList />} />
                        <Route path="lab-tests/create" element={<CreateLabTest />} />
                        <Route path="lab-tests/edit/:id" element={<EditLabTest />} />

                        {/* Test Table Routes */}
                        <Route path="tests" element={<TestList />} />
                        <Route path="tests/create" element={<CreateTest />} />
                        <Route path="tests/edit/:id" element={<EditTest />} />

                        {/* Finance Management Routes */}
                        <Route path="finance">
                            <Route index element={<Navigate to="transactions" replace />} />
                            <Route path="dashboard" element={<FinanceDashboard />} />
                            <Route path="transactions" element={<TransactionList />} />
                            <Route path="create" element={<CreateTransaction />} />
                            <Route path="pay/:id" element={<ProcessPayment />} />
                            <Route path="salary" element={<SalaryManagement />} />
                        </Route>

                        {/* Inpatient Management Routes */}
                        <Route path="inpatient/wards" element={<WardList />} />
                        <Route path="inpatient/wards/create" element={<CreateWard />} />
                        <Route path="inpatient/wards/edit/:id" element={<EditWard />} />
                        
                        <Route path="inpatient/rooms" element={<RoomList />} />
                        <Route path="inpatient/rooms/create" element={<CreateRoom />} />
                        <Route path="inpatient/rooms/edit/:id" element={<EditRoom />} />
                        
                        <Route path="inpatient/beds" element={<BedList />} />
                        <Route path="inpatient/beds/create" element={<CreateBed />} />
                        <Route path="inpatient/beds/edit/:id" element={<EditBed />} />

                        {/* Profile Management Route */}
                        <Route path="profile" element={<Profile />} />

                        {/* Contact Messages Route */}

                        {/* Reports & Analytics Route */}
                        <Route path="reports" element={<Reports />} />

                        {/* Nested admin routes will go here, e.g. <Route path="staff" element={<Staff />} /> */}
                    </Route>
                    <Route index element={<Navigate to="dashboard" replace />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AdminRoutes;
