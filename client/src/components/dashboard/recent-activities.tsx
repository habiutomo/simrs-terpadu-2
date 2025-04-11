import React from "react";
import { ACTIVITIES_DATA } from "@/lib/constants";
import { Link } from "wouter";

interface ActivityItemProps {
  user: {
    name: string;
    icon: string;
    color: string;
  };
  action: string;
  target: string;
  timestamp: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ user, action, target, timestamp }) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary";
      case "secondary":
        return "bg-secondary";
      case "success":
        return "bg-success";
      case "warning":
        return "bg-warning";
      case "error":
        return "bg-error";
      default:
        return "bg-neutral-500";
    }
  };
  
  return (
    <div className="flex">
      <div className="flex-shrink-0 mr-3">
        <div className={`w-10 h-10 rounded-full ${getColorClass(user.color)} flex items-center justify-center text-white`}>
          <span className="material-icons text-sm">{user.icon}</span>
        </div>
      </div>
      <div>
        <p className="text-sm text-neutral-600">
          <span className="font-medium">{user.name}</span> {action} <span className="font-medium">{target}</span>
        </p>
        <p className="text-xs text-neutral-400">{timestamp}</p>
      </div>
    </div>
  );
};

const RecentActivities: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow col-span-1 lg:col-span-2">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-600">Aktivitas Terbaru</h3>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {ACTIVITIES_DATA.map((activity, index) => (
            <ActivityItem 
              key={activity.id}
              user={activity.user}
              action={activity.action}
              target={activity.target}
              timestamp={activity.timestamp}
            />
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Link href="#activities">
            <a className="text-primary text-sm hover:underline">
              Lihat Semua Aktivitas
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
