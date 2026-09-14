import React, { useState, useEffect } from 'react';
import { getDoctorsAPI } from '../../api/web/webApi';
import DoctorHero from '../../components/web/DoctorHero';
import DoctorGrid from '../../components/web/DoctorGrid';
import DoctorCTA from '../../components/web/DoctorCTA';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setIsLoading(true);
                const response = await getDoctorsAPI();
                if (response.success) {
                    setDoctors(response.doctors);
                } else {
                    setError('Failed to fetch doctors');
                }
            } catch (err) {
                console.error('Error fetching doctors:', err);
                setError(err.message || 'An error occurred while fetching doctors');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    return (
        <div className="bg-white min-h-screen font-sans">
            <DoctorHero />
            <DoctorGrid doctors={doctors} isLoading={isLoading} error={error} />
            <DoctorCTA />
        </div>
    );
};

export default Doctors;
