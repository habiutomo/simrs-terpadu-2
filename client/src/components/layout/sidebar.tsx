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
      className={`w-64 bg-white shadow-md fixed h-full z-10 md:relative transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <div className="ml-2">
              <h1 className="text-lg font-semibold text-neutral-600">SIMRS</h1>
              <p className="text-xs text-neutral-400">Sistem Manajemen RS</p>
            </div>
          </div>
        </div>
        
        {/* User info */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              <span>{CURRENT_USER.initials}</span>
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-neutral-600">{CURRENT_USER.name}</p>
              <p className="text-xs text-neutral-400">{CURRENT_USER.role}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="mb-1">
                <Link href={link.href}>
                  <a 
                    className={`flex items-center px-6 py-3 hover:bg-neutral-100 text-neutral-500 ${
                      (location === link.href || 
                       (link.href !== "/" && location.startsWith(link.href))) 
                        ? "bg-primary bg-opacity-10 text-primary border-l-4 border-primary" 
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
        
        {/* Settings & Logout */}
        <div className="p-4 border-t border-neutral-200">
          <ul>
            <li className="mb-1">
              <Link href="/settings">
                <a className={`flex items-center px-2 py-2 text-neutral-500 hover:bg-neutral-100 rounded ${
                  location === "/settings" ? "text-primary" : ""
                }`}>
                  <span className="material-icons text-sm mr-3">settings</span>
                  <span>Pengaturan</span>
                </a>
              </Link>
            </li>
            <li>
              <a href="#" className="flex items-center px-2 py-2 text-neutral-500 hover:bg-neutral-100 rounded">
                <span className="material-icons text-sm mr-3">logout</span>
                <span>Keluar</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
