import React from "react";
import { ClipboardList, CheckCircle2, Activity, XCircle } from "lucide-react";

const TaskListNumbers = ({ data }) => {

  const taskCounts = data?.taskCounts || { newTask: 0, completed: 0, active: 0, failed: 0 };

  const stats = [
    {
      label: "New Tasks",
      value: taskCounts.newTask,
      icon: <ClipboardList size={22} />,
      color: "blue",
    },
    {
      label: "Completed",
      value: taskCounts.completed,
      icon: <CheckCircle2 size={22} />,
      color: "emerald",
    },
    {
      label: "Active",
      value: taskCounts.active,
      icon: <Activity size={22} />,
      color: "yellow",
    },
    {
      label: "Failed",
      value: taskCounts.failed,
      icon: <XCircle size={22} />,
      color: "rose",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mt-6">

      {stats.map((item) => (

        <div
          key={item.label}
          className={`
          relative overflow-hidden
          bg-white/80 backdrop-blur-xl
          border border-gray-200
          rounded-2xl shadow-lg
          p-5
          hover:shadow-xl hover:-translate-y-1
          transition-all duration-300
        `}
        >

          {/* Accent Bar */}
          <div
            className={`absolute top-0 left-0 w-full h-1 bg-${item.color}-500`}
          />

          {/* Content */}
          <div className="flex items-center justify-between">

            <div>
              <h2 className={`text-3xl font-bold text-${item.color}-600`}>
                {item.value}
              </h2>
              <p className="text-sm font-medium text-gray-600 mt-1">
                {item.label}
              </p>
            </div>

            {/* Icon */}
            <div
              className={`p-3 rounded-xl bg-${item.color}-100 text-${item.color}-600`}
            >
              {item.icon}
            </div>

          </div>

        </div>
      ))}

    </div>
  );
};

export default TaskListNumbers;
