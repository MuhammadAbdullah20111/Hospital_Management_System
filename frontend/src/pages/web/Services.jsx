import React, { useState, useEffect } from 'react';
import { getServicesAPI } from '../../api/web/webApi';
import ServiceHero from '../../components/web/ServiceHero';
import ServiceGrid from '../../components/web/ServiceGrid';
import ServiceCTA from '../../components/web/ServiceCTA';

const Services = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await getServicesAPI();
        if (response.success) {
          setServices(response.services);
        } else {
          setError('Failed to fetch services');
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err.message || 'An error occurred while fetching services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="py-12 bg-slate-50 min-h-screen font-sans">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <ServiceHero />

        {/* Specialized Care Units */}
        <ServiceGrid services={services} isLoading={isLoading} error={error} />

        {/* CTA Section */}
        <ServiceCTA />
      </div>
    </div>
  );
};

export default Services;
