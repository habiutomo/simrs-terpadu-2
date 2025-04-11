import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color: "primary" | "secondary" | "success" | "warning" | "error" | "neutral";
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary bg-opacity-10 text-primary";
      case "secondary":
        return "bg-secondary bg-opacity-10 text-secondary";
      case "success":
        return "bg-success bg-opacity-10 text-success";
      case "warning":
        return "bg-warning bg-opacity-10 text-warning";
      case "error":
        return "bg-error bg-opacity-10 text-error";
      default:
        return "bg-neutral-500 bg-opacity-10 text-neutral-500";
    }
  };

  const iconClasses = getColorClasses(color);

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center">
      <div className={`rounded-full h-12 w-12 flex items-center justify-center ${iconClasses}`}>
        <span className="material-icons text-inherit">{icon}</span>
      </div>
      <div className="ml-4">
        <p className="text-neutral-500 text-sm">{label}</p>
        <p className="text-xl font-semibold text-neutral-600">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
