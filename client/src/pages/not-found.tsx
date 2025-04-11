import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 shadow-lg border-t-4 border-t-red-500">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <CardTitle className="text-xl">Halaman Tidak Ditemukan</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600 mb-6">
            Maaf, halaman yang Anda cari tidak ditemukan. Silakan kembali ke dashboard atau hubungi administrator sistem jika Anda yakin alamat ini seharusnya valid.
          </p>
          
          <div className="flex justify-center">
            <Link href="/">
              <Button className="bg-[#0a192f] hover:bg-[#172a46]">
                <span className="material-icons text-sm mr-2">home</span>
                Kembali ke Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
