import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  pageTitle: string;
  toggleSidebar: () => void;
}

const Header = ({ pageTitle, toggleSidebar }: HeaderProps) => {
  return (
    <header className="border-b bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
            <Menu size={24} />
          </Button>
          <h1 className="text-xl font-semibold capitalize">{pageTitle}</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;