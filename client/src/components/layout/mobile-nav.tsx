import { Link, useLocation } from "wouter";
import { Home, Users, FileText, Menu } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function MobileNav() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-primary text-white shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        <Link href="/">
          <a className="flex flex-col items-center justify-center">
            <Home className={`h-6 w-6 ${location === "/" ? "text-white" : "text-white/80"}`} />
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        <Link href="/pasien">
          <a className="flex flex-col items-center justify-center">
            <Users className={`h-6 w-6 ${location.startsWith("/pasien") ? "text-white" : "text-white/80"}`} />
            <span className="text-xs mt-1">Pasien</span>
          </a>
        </Link>
        <Link href="/rekam-medis">
          <a className="flex flex-col items-center justify-center">
            <FileText className={`h-6 w-6 ${location.startsWith("/rekam-medis") ? "text-white" : "text-white/80"}`} />
            <span className="text-xs mt-1">Rekam Medis</span>
          </a>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto w-auto p-0 hover:bg-transparent">
              <div className="flex flex-col items-center justify-center">
                <Menu className="h-6 w-6 text-white/80" />
                <span className="text-xs mt-1">Menu</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-1 mb-16">
            <DropdownMenuLabel>{user?.nama || "Pengguna"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/jadwal">Jadwal & Appointment</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/rawat-jalan">Rawat Jalan</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/rawat-inap">Rawat Inap</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/farmasi">Farmasi</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/laboratorium">Laboratorium</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/radiologi">Radiologi</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/laporan">Laporan</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/pengaturan">Pengaturan</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? "Keluar..." : "Keluar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
