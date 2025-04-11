import { Users, UserPlus, Clipboard, Bed } from "lucide-react";

interface StatsProps {
  stats?: {
    todayPatients: number;
    newRegistrations: number;
    outpatients: number;
    inpatients: number;
  };
}

export default function StatsCards({ stats }: StatsProps) {
  const defaultStats = {
    todayPatients: 0,
    newRegistrations: 0,
    outpatients: 0,
    inpatients: 0
  };

  const data = stats || defaultStats;

  const statsCards = [
    {
      title: "Total Pasien Hari Ini",
      value: data.todayPatients,
      change: "+8%",
      changeType: "positive",
      icon: <Users className="h-5 w-5 text-primary" />
    },
    {
      title: "Pendaftaran Baru",
      value: data.newRegistrations,
      change: "+12%",
      changeType: "positive",
      icon: <UserPlus className="h-5 w-5 text-secondary" />
    },
    {
      title: "Rawat Jalan",
      value: data.outpatients,
      change: "-3%",
      changeType: "negative",
      icon: <Clipboard className="h-5 w-5 text-status-info" />
    },
    {
      title: "Rawat Inap",
      value: data.inpatients,
      change: "+2%",
      changeType: "positive",
      icon: <Bed className="h-5 w-5 text-status-error" />
    }
  ];

  return (
    <section className="mb-8">
      <h2 className="text-lg font-nunito font-bold mb-4 text-neutral-darkest">Informasi Harian</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-neutral-dark">{card.title}</h3>
              <span className="p-1.5 rounded-full bg-primary/10">
                {card.icon}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-neutral-darkest">{card.value}</span>
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                card.changeType === "positive" 
                  ? "bg-status-success/10 text-status-success" 
                  : "bg-status-warning/10 text-status-warning"
              }`}>
                {card.change}
              </span>
            </div>
            <div className="mt-2 text-xs text-neutral-medium">Dibandingkan hari kemarin</div>
          </div>
        ))}
      </div>
    </section>
  );
}
