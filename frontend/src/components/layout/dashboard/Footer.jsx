const Footer = () => {
    return (
        <footer className="mt-auto border-t border-teal-200 bg-white p-4 text-center sm:ml-64">
            <span className="text-sm text-slate-500">
                © {new Date().getFullYear()} MKMC Hospital. All Rights Reserved.
            </span>
        </footer>
    );
};

export default Footer;
