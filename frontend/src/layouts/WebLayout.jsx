import React from 'react';
import WebHeader from '../components/layout/web/WebHeader';
import WebFooter from '../components/layout/web/WebFooter';
import { Outlet } from 'react-router-dom';

const WebLayout = () => {
    return (
        <div className="min-h-screen font-sans antialiased text-slate-900 bg-white">
            <WebHeader />

            <main className="w-full">
                <Outlet />
            </main>

            <WebFooter />
        </div>
    );
};

export default WebLayout;
