import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { NAV_LINKS, USER_DATA } from "@/lib/constants";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const [location] = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  
  const toggleMenu = (path: string) => {
    if (expandedMenus.includes(path)) {
      setExpandedMenus(expandedMenus.filter(item => item !== path));
    } else {
      setExpandedMenus([...expandedMenus, path]);
    }
  };
  
  const isMenuActive = (href: string): boolean => {
    return location === href || (href !== "/" && location.startsWith(href));
  };
  
  const isParentActive = (parent: string): boolean => {
    return NAV_LINKS.some(link => 
      link.parent === parent && isMenuActive(link.href)
    );
  };
  
  const shouldExpandMenu = (href: string): boolean => {
    return expandedMenus.includes(href) || isParentActive(href);
  };
  
  // Group menu items by parent
  const mainLinks = NAV_LINKS.filter(link => !link.isSubmenu);
  
  return (
    <aside 
      className={`w-64 bg-[#111827] text-white fixed h-full z-10 md:relative transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">RS</span>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-medium text-white">SIMRS Terpadu</h1>
            </div>
          </div>
        </div>
        
        {/* User Info */}
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <span className="font-medium">A</span>
            </div>
            <div className="ml-3">
              <p className="text-white text-sm font-medium">Administrator</p>
              <p className="text-gray-400 text-xs">RSUD Harapan Bunda</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-1 px-2">
            {mainLinks.map((link) => {
              // Find any child menus
              const childMenus = NAV_LINKS.filter(item => item.parent === link.href.substring(1));
              const hasChildren = childMenus.length > 0;
              const isExpanded = shouldExpandMenu(link.href.substring(1));
              
              return (
                <li key={link.href}>
                  {hasChildren ? (
                    <div>
                      <button
                        className={`w-full flex items-center justify-between px-3 py-2 text-white rounded-md ${
                          (isMenuActive(link.href) || isParentActive(link.href.substring(1))) 
                            ? "bg-gray-700" 
                            : "hover:bg-gray-700"
                        }`}
                        onClick={() => toggleMenu(link.href.substring(1))}
                      >
                        <div className="flex items-center">
                          <span className="material-icons text-lg mr-3">{link.icon}</span>
                          <span className="font-medium">{link.label}</span>
                        </div>
                        {hasChildren && (
                          <span className="material-icons text-sm">
                            {isExpanded ? "expand_less" : "expand_more"}
                          </span>
                        )}
                      </button>
                      
                      {isExpanded && (
                        <ul className="mt-1 pl-8 space-y-1">
                          {childMenus.map(childItem => (
                            <li key={childItem.href}>
                              <div onClick={() => {
                                if (window.innerWidth < 768) {
                                  setOpen(false);
                                }
                              }}>
                                <Link href={childItem.href}>
                                  <div 
                                    className={`flex items-center px-3 py-2 text-white rounded-md cursor-pointer ${
                                      isMenuActive(childItem.href) ? "bg-gray-700" : "hover:bg-gray-700"
                                    }`}
                                  >
                                    <span className="material-icons text-sm mr-3">{childItem.icon}</span>
                                    <span className="text-sm">{childItem.label}</span>
                                  </div>
                                </Link>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div onClick={() => {
                      if (window.innerWidth < 768) {
                        setOpen(false);
                      }
                    }}>
                      <Link href={link.href}>
                        <div 
                          className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${
                            isMenuActive(link.href) ? "bg-gray-700" : "hover:bg-gray-700"
                          }`}
                        >
                          <span className="material-icons text-lg mr-3">{link.icon}</span>
                          <span className="font-medium">{link.label}</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Border Line */}
        <div className="mx-3 border-t border-gray-700 my-2"></div>
        
        {/* Settings & Help */}
        <div className="px-2 pb-4">
          <ul className="space-y-1">
            <li>
              <div>
                <Link href="/bantuan">
                  <div className={`flex items-center px-3 py-2 text-white rounded-md cursor-pointer ${
                    location === "/bantuan" ? "bg-gray-700" : "hover:bg-gray-700"
                  }`}>
                    <span className="material-icons text-lg mr-3">help_outline</span>
                    <span className="font-medium">Bantuan</span>
                  </div>
                </Link>
              </div>
            </li>
            <li>
              <div>
                <Link href="/logout">
                  <div className={`flex items-center px-3 py-2 text-white rounded-md cursor-pointer ${
                    location === "/logout" ? "bg-gray-700" : "hover:bg-gray-700"
                  }`}>
                    <span className="material-icons text-lg mr-3">logout</span>
                    <span className="font-medium">Keluar</span>
                  </div>
                </Link>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
