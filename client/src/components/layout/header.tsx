
import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  pageTitle: string;
  toggleSidebar: () => void;
}

const Header = ({ pageTitle, toggleSidebar }: HeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-30 border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className={isMobile ? "block" : "hidden lg:hidden"}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <h1 className="text-lg font-semibold capitalize md:text-xl">{pageTitle}</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
