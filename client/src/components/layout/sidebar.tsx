import React from "react";
import { Link, useLocation } from "wouter";
import { NAV_LINKS } from "@/lib/constants";
import { CURRENT_USER } from "@/lib/constants";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const [location] = useLocation();
  
  return (
    <aside 
      className={`w-64 bg-[#0a192f] text-white fixed h-full z-10 md:relative transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
              <span className="text-[#0a192f] font-bold">RS</span>
            </div>
            <div className="ml-2">
              <h1 className="text-lg font-semibold text-white">SIMRS Terpadu</h1>
              <p className="text-xs text-gray-400">Sistem Manajemen RS</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>
                  <a 
                    className={`flex items-center px-4 py-3 hover:bg-[#172a46] text-gray-300 ${
                      (location === link.href || 
                       (link.href !== "/" && location.startsWith(link.href))) 
                        ? "sidebar-link active" 
                        : ""
                    }`}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setOpen(false);
                      }
                    }}
                  >
                    <span className="material-icons text-sm mr-3">{link.icon}</span>
                    <span>{link.label}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Settings & Help */}
        <div className="p-4 border-t border-gray-700">
          <ul>
            <li className="mb-1">
              <Link href="/settings">
                <a className={`flex items-center px-4 py-2 text-gray-300 hover:bg-[#172a46] ${
                  location === "/settings" ? "text-white" : ""
                }`}>
                  <span className="material-icons text-sm mr-3">settings</span>
                  <span>Pengaturan</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/bantuan">
                <a className={`flex items-center px-4 py-2 text-gray-300 hover:bg-[#172a46] ${
                  location === "/bantuan" ? "text-white" : ""
                }`}>
                  <span className="material-icons text-sm mr-3">help</span>
                  <span>Bantuan</span>
                </a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
