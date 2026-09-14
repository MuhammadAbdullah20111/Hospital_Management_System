import ApiService from "../../services/ApiService";

const getEndpoint = (path) => {
    const role = localStorage.getItem('role')?.toLowerCase();
    const userType = localStorage.getItem('userType');
    const isAdmin = role === 'admin' || userType === 'SYSTEM_ADMIN';
    
    const prefix = isAdmin ? '/admin' : '/staff';

    // Map conflicting path names if necessary
    // Admin uses plural (e.g., 'lab-tests'), Staff uses singular in routes (e.g., 'lab-test')
    let resource = path;
    if (!isAdmin) {
        if (path === 'lab-tests') resource = 'lab-test';
        else if (path === 'patients') resource = 'patient';
        else if (path === 'appointments') resource = 'appointment';
        else if (path === 'payments') resource = 'payment';
        else if (path === 'departments') resource = 'department';
        else if (path === 'services') resource = 'service';
        else if (path === 'shifts') resource = 'shift';
    }

    return `${prefix}/${resource}`;
};

export const getAllLabTestsAPI = async () => {
    return await ApiService.get(getEndpoint("lab-tests"));
};

export const getLabTestByIdAPI = async (id) => {
    return await ApiService.get(`${getEndpoint("lab-tests")}/${id}`);
};

export const createLabTestAPI = async (data) => {
    return await ApiService.post(getEndpoint("lab-tests"), data);
};

export const updateLabTestAPI = async (id, data) => {
    return await ApiService.put(`${getEndpoint("lab-tests")}/${id}`, data);
};

export const deleteLabTestAPI = async (id) => {
    return await ApiService.delete(`${getEndpoint("lab-tests")}/${id}`);
};

export const uploadLabTestReportAPI = async (id, formData) => {
    // Because it's FormData, ApiService needs to handle multipart or we fetch directly
    return await ApiService.post(`${getEndpoint("lab-tests")}/${id}/upload-report`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
