import React from "react";
import { Link } from "wouter";
import { QUICK_ACCESS_LINKS } from "@/lib/constants";

const QuickAccess: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-600">Akses Cepat</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACCESS_LINKS.map((link, index) => (
            <Link key={index} href={link.href}>
              <a className="flex flex-col items-center p-3 bg-neutral-100 hover:bg-neutral-200 rounded-lg">
                <span className="material-icons text-primary mb-2">{link.icon}</span>
                <span className="text-sm text-neutral-600 text-center">{link.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickAccess;
