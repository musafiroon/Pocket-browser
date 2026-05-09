import React, { useState } from 'react';

interface AdmissionsLoginProps {
    onUnlock: () => void;
}

const AdmissionsLogin: React.FC<AdmissionsLoginProps> = ({ onUnlock }) => {
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [studentId, setStudentId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Secret unlock code for the admissions portal
        if (studentId === 'BR117' && password === 'Pala') {
            onUnlock();
        }
    };

    const sidebarItems = [
        { label: 'Home', icon: '/home.png' },
        { label: 'About Us', icon: '/aboutus.png' },
        { label: 'Student Portal', icon: '/stuportal.png' },
        { label: 'Contact Us', icon: '/contact.png' },
        { label: 'Centers', icon: '/centers.png' },
    ];

    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col font-sans overflow-hidden text-[#333333]">
            <style>
                {`
                    :root {
                        --primary-blue: #0056a4;
                        --footer-bg: #004481;
                        --text-dark: #333333;
                        --text-muted: #777777;
                        --border-color: #dddddd;
                    }
                    .brilliant-login * {
                        box-sizing: border-box;
                    }
                    @media (orientation: landscape) {
                        .landscape-split {
                            display: flex;
                            flex-direction: row;
                            height: 100%;
                        }
                        .landscape-banner {
                            flex: 1;
                            height: 100%;
                        }
                        .landscape-form {
                            flex: 1;
                            height: 100%;
                            overflow-y: auto;
                        }
                    }
                `}
            </style>
            
            <div className="brilliant-login flex flex-col landscape:flex-row h-screen w-full overflow-hidden">
                {/* Sidebar Overlay */}
                {isSidebarActive && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-[1000] transition-opacity duration-300 opacity-100"
                        onClick={() => setIsSidebarActive(false)}
                    />
                )}
                
                {/* Sidebar (Mobile/PortraitDrawer) */}
                <aside className={`fixed top-0 bottom-0 w-[280px] bg-white z-[1001] transition-all duration-300 flex flex-col shadow-2xl ${isSidebarActive ? 'left-0' : '-left-[280px]'} landscape:hidden`}>
                    <div className="p-5 flex justify-end border-b border-gray-100">
                        <button onClick={() => setIsSidebarActive(false)} className="bg-none border-none cursor-pointer p-0">
                            <img src="/leftarrow.png" alt="Close" className="w-5" />
                        </button>
                    </div>
                    <nav className="py-2 flex flex-col">
                        {sidebarItems.map((item, idx) => (
                            <a key={idx} href="#" className="flex items-center px-6 py-4 text-[#333333] font-medium border-b border-gray-50 hover:bg-[#f0f7ff] hover:text-[#0056a4] transition-colors no-underline">
                                <img src={item.icon} alt={item.label} className="w-5 h-5 mr-3" />
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* Landscape Fixed Left Sidebar */}
                <aside className="hidden landscape:flex flex-col w-16 bg-[#004481] text-white py-8 items-center border-r border-[#003366] shrink-0">
                   <div className="flex flex-col gap-12 mt-12 [writing-mode:vertical-lr] rotate-180 text-[10px] uppercase tracking-widest opacity-80 font-bold whitespace-nowrap">
                        <a href="#" className="hover:opacity-100">Privacy</a>
                        <a href="#" className="hover:opacity-100">About Us</a>
                        <a href="#" className="hover:opacity-100">Terms</a>
                        <a href="#" className="hover:opacity-100">Refund</a>
                        <a href="#" className="hover:opacity-100">Contact</a>
                   </div>
                   <div className="mt-auto [writing-mode:vertical-lr] rotate-180 text-[8px] opacity-50 pb-4 whitespace-nowrap">
                        © 2026 BRILLIANT PALA
                   </div>
                </aside>

                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <header className="flex justify-between items-center p-4 bg-white sticky top-0 z-[100] border-b border-gray-100 shrink-0">
                        <button 
                            className="w-10 h-10 border border-[#dddddd] rounded flex items-center justify-center bg-transparent cursor-pointer"
                            onClick={() => setIsSidebarActive(true)}
                        >
                            <img src="/menuham.png" alt="Menu" className="w-6 h-6" />
                        </button>
                        <div className="logo cursor-default">
                            <img src="/logo_1.webp" alt="Brilliant Study Centre" className="h-10 w-auto" />
                        </div>
                    </header>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col landscape:flex-row overflow-hidden">
                        
                        {/* Landscape Banner (Left Side) */}
                        <div className="hidden landscape:flex flex-1 bg-[#f0f7ff] items-center justify-center overflow-hidden border-r border-gray-100">
                             <img src="/1--slider.jpeg" alt="Banner" className="w-full h-full object-cover" />
                        </div>

                         {/* Form Area */}
                        <main className="flex-1 overflow-y-auto px-5 py-8 flex flex-col items-center">
                            <div className="w-full max-w-[480px] md:max-w-[620px] landscape:max-w-[480px] flex flex-col items-center">
                                <section className="text-center my-8">
                                    <h1 className="text-[32px] font-bold">Welcome <span className="text-[#0056a4]">Back!</span></h1>
                                </section>

                                <form onSubmit={handleSubmit} className="w-full mb-5">
                                    <div className="mb-6 relative">
                                        <input 
                                            type="text" 
                                            placeholder="Student ID" 
                                            required 
                                            value={studentId}
                                            onChange={(e) => setStudentId(e.target.value)}
                                            className="w-full py-3 px-1 border-b border-[#dddddd] text-base outline-none focus:border-[#0056a4] transition-colors"
                                        />
                                    </div>
                                    <div className="mb-6 relative">
                                        <input 
                                            type={isPasswordVisible ? "text" : "password"} 
                                            placeholder="Password" 
                                            required 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full py-3 px-1 border-b border-[#dddddd] text-base outline-none focus:border-[#0056a4] transition-colors pr-10"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                            className="absolute right-1 bottom-3 bg-transparent border-none cursor-pointer p-0 opacity-60"
                                        >
                                            <img src="/eye.png" alt="Toggle Visibility" className="w-5" />
                                        </button>
                                    </div>
                                    
                                    <a href="#" className="block text-center my-4 text-[#0056a4] no-underline font-bold text-sm">Forgot Password?</a>
                                    <button type="submit" className="w-full py-4 bg-[#0056a4] text-white border-none rounded-[30px] text-lg font-bold cursor-pointer mt-2 shadow-[0_4px_6px_rgba(0,86,164,0.2)]">Login</button>
                                </form>

                                <div className="text-center text-sm mb-8">
                                    Don't have an account? <a href="#" className="text-[#0056a4] no-underline font-bold">Sign up</a>
                                </div>

                                <div className="flex gap-4 items-center mb-8">
                                    <div className="bg-[#0056a4] p-3 rounded flex items-center justify-center w-[120px]">
                                        <span className="text-white font-bold text-[10px] leading-tight text-center">Brilliant<br/>NEET</span>
                                    </div>
                                    <img src="/neet-scan.jpg.jpeg" alt="QR Code" className="w-[80px] h-auto" />
                                </div>

                                <div className="w-full landscape:hidden rounded-lg overflow-hidden shadow-lg border border-gray-100 mb-10">
                                    <img src="/1--slider.jpeg" alt="Repeaters Banner" className="w-full block" />
                                </div>
                            </div>
                        </main>
                    </div>

                    {/* Portrait Footer */}
                    <footer className="landscape:hidden bg-[#004481] text-white py-6 px-4 text-center text-[12px] shrink-0">
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                            <a href="#" className="text-white no-underline opacity-90">Privacy Policies</a> |
                            <a href="#" className="text-white no-underline opacity-90">About Us</a> |
                            <a href="#" className="text-white no-underline opacity-90">Terms & Conditions</a> |
                            <a href="#" className="text-white no-underline opacity-90">Refund and Cancellation Policy</a> |
                            <a href="#" className="text-white no-underline opacity-90">Contact us</a>
                        </div>
                        <p className="opacity-80">© 2026 Brilliant study centre. All rights Reserved</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default AdmissionsLogin;
