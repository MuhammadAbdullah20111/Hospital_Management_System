import toast from 'react-hot-toast';

const toastOptions = {
    style: {
        background: 'rgba(0, 0, 0, 0.85)',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
    },
    duration: 3000,
};

const toastHelper = {
    success: (message) => {
        toast.success(message, {
            ...toastOptions,
            iconTheme: {
                primary: '#10b981', // teal/green
                secondary: '#fff',
            },
        });
    },

    error: (message) => {
        toast.error(message, {
            ...toastOptions,
            iconTheme: {
                primary: '#ef4444', // red
                secondary: '#fff',
            },
        });
    },

    info: (message) => {
        toast(message, {
            ...toastOptions,
            icon: 'ℹ️',
        });
    },

    loading: (message) => {
        return toast.loading(message, {
            ...toastOptions,
        });
    },

    dismiss: (toastId) => {
        toast.dismiss(toastId);
    },
};

export default toastHelper;
