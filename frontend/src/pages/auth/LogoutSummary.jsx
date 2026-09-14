import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogIn, Clock, CalendarDays, ShieldCheck, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

// ── helpers ──────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${pad(h)} h : ${pad(m)} m : ${pad(s)} s`;
}

function formatLoginDate(isoString) {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
}
// ─────────────────────────────────────────────────────────────────────────────

const LogoutSummary = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { loginTime, logoutTime, role } = location.state || {};

    const [elapsed, setElapsed] = useState(0);
    const [visible, setVisible] = useState(false);

    // true only when we have a real loginTime from localStorage
    const hasSessionData = !!loginTime;

    useEffect(() => {
        if (loginTime && logoutTime) {
            const diff = Math.max(
                0,
                Math.floor((new Date(logoutTime) - new Date(loginTime)) / 1000)
            );
            setElapsed(diff);
        }
        const t = setTimeout(() => setVisible(true), 60);
        return () => clearTimeout(t);
    }, [loginTime, logoutTime]);

    const loginPath =
        role === "ADMIN" ? "/auth/admin/login" : "/auth/staff/login";

    return (
        <div className="flex min-h-screen flex-col bg-teal-50">

            {/* ── Auth Header (matches AuthLayout header) ── */}
            <header className="flex w-full items-center justify-between bg-teal-600 px-6 py-4">
                <Link to="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
                        <Stethoscope className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold text-white">MKMC</span>
                </Link>
            </header>

            {/* ── Main content ── */}
            <main className="flex flex-1 flex-col items-center justify-center p-4">

                {/* Card */}
                <div
                    className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(20px)",
                        transition: "opacity 0.45s ease, transform 0.45s ease",
                    }}
                >
                    {/* Shield icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full bg-teal-50 border-2 border-teal-100 flex items-center justify-center">
                                <ShieldCheck className="h-8 w-8 text-teal-600" strokeWidth={1.75} />
                            </div>
                            {/* Subtle ping ring */}
                            <span className="absolute inset-0 rounded-full border-2 border-teal-400 opacity-0 animate-ping-slow" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 className="text-2xl font-bold text-slate-800 mb-1">
                        You've been logged out
                    </h1>
                    <p className="text-sm text-slate-500 mb-7 leading-relaxed">
                        Thank you for using{" "}
                        <span className="font-semibold text-teal-600">MKMC Portal</span>.
                        <br />Your session has been securely closed.
                    </p>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-3 mb-7">
                        {/* Login Date */}
                        <div className="flex flex-col items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-4">
                            <div className="h-9 w-9 rounded-lg bg-teal-100 flex items-center justify-center">
                                <CalendarDays className="h-4 w-4 text-teal-600" strokeWidth={1.75} />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
                                    Login Date
                                </p>
                                <p className="text-xs font-semibold text-slate-700 leading-tight">
                                    {hasSessionData ? formatLoginDate(loginTime) : <span className="text-slate-400 italic">Not available</span>}
                                </p>
                            </div>
                        </div>

                        {/* Session Duration */}
                        <div className="flex flex-col items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-4">
                            <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
                                    Session Duration
                                </p>
                                <p className="text-xs font-semibold text-slate-700 leading-tight font-mono">
                                    {hasSessionData ? formatDuration(elapsed) : <span className="text-slate-400 italic not-italic">Not available</span>}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Login Again button */}
                    <button
                        id="login-again-btn"
                        onClick={() => navigate(loginPath)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
                    >
                        <LogIn className="h-4 w-4" strokeWidth={2} />
                        Login Again
                    </button>

                    {/* Security note */}
                    <p className="mt-4 text-xs text-slate-400">
                        🔒 All session data has been cleared
                    </p>
                </div>
            </main>

            {/* Ping animation */}
            <style>{`
                @keyframes ping-slow {
                    0%   { transform: scale(1);   opacity: 0.5; }
                    80%  { transform: scale(1.6); opacity: 0;   }
                    100% { transform: scale(1.6); opacity: 0;   }
                }
                .animate-ping-slow {
                    animation: ping-slow 2.4s cubic-bezier(0,0,0.2,1) infinite;
                }
            `}</style>
        </div>
    );
};

export default LogoutSummary;
