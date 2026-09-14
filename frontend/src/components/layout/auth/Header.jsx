import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";

const Header = () => {
    return (
        <header className="flex w-full items-center justify-between bg-teal-600 px-6 py-4">
            <Link to="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                    <Stethoscope className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-white">MKMC</span>
            </Link>
        </header>
    );
};

export default Header;
