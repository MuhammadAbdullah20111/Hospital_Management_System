import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "../../middleware/ProtectedRoute";
import DashboardLayout from "../../layouts/DashboardLayout";
import StaffDashboard from "../../pages/staff/StaffDashboard";
import DoctorDashboard from "../../pages/staff/DoctorDashboard";
import StaffAppointments from "../../pages/staff/appointments/StaffAppointments";
import StaffCreateAppointment from "../../pages/staff/appointments/StaffCreateAppointment";
import StaffEditAppointment from "../../pages/staff/appointments/StaffEditAppointment";
import StaffConsultation from "../../pages/staff/appointments/StaffConsultation";
import StaffPatients from "../../pages/staff/patients/StaffPatients";
import StaffCreatePatient from "../../pages/staff/patients/StaffCreatePatient";
import StaffEditPatient from "../../pages/staff/patients/StaffEditPatient";
import StaffLabTests from "../../pages/staff/lab/StaffLabTests";
import StaffLabTestEdit from "../../pages/staff/lab/StaffLabTestEdit";
import StaffCreateLabTest from "../../pages/staff/lab/StaffCreateLabTest";
import { StaffStaffList, StaffRoleList, StaffDepartmentList, StaffServiceList, StaffShiftList, StaffPaymentList } from "../../pages/staff/StaffModules";
import StaffProfile from "../../pages/staff/Profile";
import PermissionGuard from "../../middleware/PermissionGuard";
import PatientDetails from "../../pages/admin/patients/PatientDetails";
import CreateTransaction from "../../pages/staff/finance/CreateTransaction";
import ProcessPayment from "../../pages/admin/finance/ProcessPayment";
import SalaryManagement from "../../pages/admin/finance/SalaryManagement";

// Admin components reused by Staff with permissions
import StaffDetails from "../../pages/admin/staff/StaffDetails";
import EditStaff from "../../pages/admin/staff/EditStaff";
import CreateStaff from "../../pages/admin/staff/CreateStaff";
import EditRole from "../../pages/admin/roles/EditRole";
import CreateRole from "../../pages/admin/roles/CreateRole";
import EditDepartment from "../../pages/admin/departments/EditDepartment";
import CreateDepartment from "../../pages/admin/departments/CreateDepartment";
import EditService from "../../pages/admin/services/EditService";
import CreateService from "../../pages/admin/services/CreateService";
import EditShift from "../../pages/admin/shifts/EditShift";
import CreateShift from "../../pages/admin/shifts/CreateShift";

// Additional Admin components reused by Staff
import TestList from "../../pages/admin/tests/TestList";
import CreateTest from "../../pages/admin/tests/CreateTest";
import EditTest from "../../pages/admin/tests/EditTest";

import AttendanceDashboard from "../../pages/admin/attendance/AttendanceDashboard";
import DeviceManagement from "../../pages/admin/attendance/DeviceManagement";
import MonthlyReport from "../../pages/admin/attendance/MonthlyReport";

import Reports from "../../pages/admin/reports/Reports";

// Inpatient Components
import WardList from "../../pages/admin/inpatient/WardList";
import CreateWard from "../../pages/admin/inpatient/CreateWard";
import EditWard from "../../pages/admin/inpatient/EditWard";
import RoomList from "../../pages/admin/inpatient/RoomList";
import CreateRoom from "../../pages/admin/inpatient/CreateRoom";
import EditRoom from "../../pages/admin/inpatient/EditRoom";
import BedList from "../../pages/admin/inpatient/BedList";
import CreateBed from "../../pages/admin/inpatient/CreateBed";
import EditBed from "../../pages/admin/inpatient/EditBed";

const StaffRoutes = () => {
    const loggedInRole = localStorage.getItem('role')?.toUpperCase();
    const isDoctor = loggedInRole === 'DOCTOR';

    return (
        <Routes>
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route element={<PermissionGuard />}>
                        <Route index element={isDoctor ? <DoctorDashboard /> : <StaffDashboard />} />
                        <Route path="appointments" element={<StaffAppointments />} />
                        <Route path="appointments/create" element={<StaffCreateAppointment />} />
                        <Route path="appointments/edit/:id" element={<StaffEditAppointment />} />
                        <Route path="appointments/consult/:id" element={<StaffConsultation />} />
                        <Route path="patients" element={<StaffPatients />} />
                        <Route path="patients/create" element={<StaffCreatePatient />} />
                        <Route path="patients/view/:id" element={<PatientDetails />} />
                        <Route path="patients/edit/:id" element={<StaffEditPatient />} />
                        <Route path="lab-tests" element={<StaffLabTests />} />
                        <Route path="lab-tests/create" element={<StaffCreateLabTest />} />
                        <Route path="lab-tests/edit/:id" element={<StaffLabTestEdit />} />
                        <Route path="staff" element={<StaffStaffList />} />
                        <Route path="staff/create" element={<CreateStaff />} />
                        <Route path="staff/edit/:id" element={<EditStaff />} />
                        <Route path="staff/view/:id" element={<StaffDetails />} />
                        
                        <Route path="roles" element={<StaffRoleList />} />
                        <Route path="roles/create" element={<CreateRole />} />
                        <Route path="roles/edit/:id" element={<EditRole />} />
                        
                        <Route path="departments" element={<StaffDepartmentList />} />
                        <Route path="departments/create" element={<CreateDepartment />} />
                        <Route path="departments/edit/:id" element={<EditDepartment />} />
                        
                        <Route path="services" element={<StaffServiceList />} />
                        <Route path="services/create" element={<CreateService />} />
                        <Route path="services/edit/:id" element={<EditService />} />
                        
                        <Route path="shifts" element={<StaffShiftList />} />
                        <Route path="shifts/create" element={<CreateShift />} />
                        <Route path="shifts/edit/:id" element={<EditShift />} />
                        
                        {/* Test Management Routes */}
                        <Route path="tests" element={<TestList />} />
                        <Route path="tests/create" element={<CreateTest />} />
                        <Route path="tests/edit/:id" element={<EditTest />} />

                        {/* Attendance Management Routes */}
                        <Route path="attendance" element={<AttendanceDashboard />} />
                        <Route path="attendance/devices" element={<DeviceManagement />} />
                        <Route path="attendance/reports" element={<MonthlyReport />} />

                        <Route path="payments" element={<StaffPaymentList />} />
                        <Route path="finance">
                            <Route index element={<Navigate to="transactions" replace />} />
                            <Route path="transactions" element={<StaffPaymentList />} />
                            <Route path="create" element={<CreateTransaction />} />
                            <Route path="pay/:id" element={<ProcessPayment />} />
                            <Route path="salary" element={<SalaryManagement />} />
                        </Route>
                        <Route path="profile" element={<StaffProfile />} />

                        {/* Contact Messages Route */}

                        {/* Reports Route */}
                        <Route path="reports" element={<Reports />} />

                        {/* Inpatient Management */}
                        <Route path="inpatient/wards" element={<WardList />} />
                        <Route path="inpatient/wards/create" element={<CreateWard />} />
                        <Route path="inpatient/wards/edit/:id" element={<EditWard />} />
                        <Route path="inpatient/rooms" element={<RoomList />} />
                        <Route path="inpatient/rooms/create" element={<CreateRoom />} />
                        <Route path="inpatient/rooms/edit/:id" element={<EditRoom />} />
                        <Route path="inpatient/beds" element={<BedList />} />
                        <Route path="inpatient/beds/create" element={<CreateBed />} />
                        <Route path="inpatient/beds/edit/:id" element={<EditBed />} />
                    </Route>

                    {/* Fallback for /staff/* */}
                    <Route path="*" element={<Navigate to="/staff" replace />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default StaffRoutes;
