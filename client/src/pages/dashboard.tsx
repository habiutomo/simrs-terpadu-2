import React from "react";
import StatCard from "@/components/dashboard/stat-card";
import AppointmentTable from "@/components/dashboard/appointment-table";
import SatuSehatStatus from "@/components/dashboard/satu-sehat-status";
import RecentActivities from "@/components/dashboard/recent-activities";
import QuickAccess from "@/components/dashboard/quick-access";
import { STATS_DATA } from "@/lib/constants";

const Dashboard: React.FC = () => {
  return (
    <div id="dashboard-section">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS_DATA.map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color as "primary" | "secondary" | "success" | "warning" | "error" | "neutral"}
          />
        ))}
      </div>
      
      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <AppointmentTable />
        <SatuSehatStatus />
      </div>
      
      {/* Recent Activities & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivities />
        <QuickAccess />
      </div>
    </div>
  );
};

export default Dashboard;
