import { use, useEffect } from "react";

export default function Navbar() {
    useEffect(() => {
        
    }, []);
    return (
        <nav className="bg-white shadow-md h-16 flex items-center justify-between px-6 border-b border-gray-200">
            {/* Left side: page title or logo */}
            <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

            {/* Right side: user info or actions */}
            <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-gray-900">
                    🔔
                </button>
                <div className="flex items-center space-x-2">
                    <img
                        src="https://i.pravatar.cc/40"
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full"
                    />
                    <span className="text-gray-700 font-medium">Vishwajeet</span>
                </div>
            </div>
        </nav>
    );
}
