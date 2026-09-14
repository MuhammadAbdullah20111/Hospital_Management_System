import ApiService from '../../services/ApiService';

export const getComprehensiveReportAPI = async (startDate, endDate) => {
    let url = '/admin/reports';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const response = await ApiService.get(url);
    return response;
};
