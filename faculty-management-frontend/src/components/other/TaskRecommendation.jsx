import React from "react";
import { TrendingUp, AlertCircle, Sparkles, Lightbulb, Info, ArrowRight, CalendarOff, Clock } from "lucide-react";

const availabilityConfig = {
  on_leave:       { label: "On Leave",       icon: <CalendarOff size={11} />, bg: "#FEE2E2", color: "#DC2626" },
  returning_soon: { label: "Returning Soon", icon: <Clock size={11} />, bg: "#FEF9C3", color: "#B45309" },
  available:      { label: "Available", icon: null, bg: null, color: null },
};

const AvailabilityBadge = ({ status, leaveUntil }) => {
  const cfg = availabilityConfig[status];
  if (!cfg || !cfg.bg) return null;

  let displayLabel = cfg.label;
  if (status === "on_leave" && leaveUntil) {
    const formattedDate = new Date(leaveUntil).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
    displayLabel = `On Leave (till ${formattedDate})`;
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.icon}
      {displayLabel}
    </span>
  );
};

const TaskRecommendation = ({ recommendations, loading, error, selectedEmployeeId, onSelectEmployee }) => {
  const getSourceBadge = (source) => {
    if (source === "ml+rule") {
      return {
        label: "ML + Rule",
        className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      };
    }

    return {
      label: "Rule Fallback",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    };
  };

  if (loading) {
    return (
      <div className="ui-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg animate-pulse">
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-blue-900">AI Recommendations</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-blue-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ui-card p-6">
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error loading recommendations</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="ui-card p-6">
        <div className="flex items-center gap-3">
          <TrendingUp size={20} className="text-blue-600" />
          <p className="text-blue-700">Select a category to see employee recommendations</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 60) return "bg-blue-100 text-blue-800 border-blue-300";
    if (score >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const topRecommendation = recommendations[0];
  const otherRecommendations = recommendations.slice(1, 4);

  return (
    <div className="space-y-4">
      {/* Top Recommendation - Highlighted */}
      {topRecommendation && (
        <div
          onClick={() => {
            if (topRecommendation.availabilityStatus !== "on_leave") {
              onSelectEmployee(topRecommendation.employeeId);
            }
          }}
          className={`ui-card border-2 p-5 transition-all ${
            topRecommendation.availabilityStatus === "on_leave"
              ? "opacity-60 cursor-not-allowed border-red-200 grayscale-[0.3]"
              : "cursor-pointer border-emerald-200 hover:border-emerald-300"
          } ${
            selectedEmployeeId === topRecommendation.employeeId ? "ring-2 ring-emerald-500" : ""
          }`}
        >
          <div className="mb-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                getSourceBadge(topRecommendation.recommendationSource).className
              }`}
            >
              {getSourceBadge(topRecommendation.recommendationSource).label}
            </span>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-emerald-700" />
                <h4 className="text-lg font-bold text-emerald-900">{topRecommendation.employeeName}</h4>
                <AvailabilityBadge 
                  status={topRecommendation.availabilityStatus} 
                  leaveUntil={topRecommendation.leaveUntil} 
                />
              </div>
              <p className="text-xs text-emerald-700">{topRecommendation.email}</p>
            </div>
            <div className="text-center">
              <div className={`rounded-lg p-2 ${getScoreColor(topRecommendation.overallScore)}`}>
                <div className="text-2xl font-bold">{topRecommendation.overallScore}</div>
                <div className="text-xs font-semibold">Best Match</div>
              </div>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-emerald-200">
            <div className="bg-white/60 rounded-lg p-2 text-center border border-emerald-100">
              <div className="text-sm font-bold text-emerald-800">{topRecommendation.performanceScore}</div>
              <div className="text-xs text-emerald-600">Performance</div>
            </div>
            <div className="bg-white/60 rounded-lg p-2 text-center border border-emerald-100">
              <div className="text-sm font-bold text-emerald-800">{topRecommendation.suitability.categoryMatch}</div>
              <div className="text-xs text-emerald-600">Category Match</div>
            </div>
            <div className="bg-white/60 rounded-lg p-2 text-center border border-emerald-100">
              <div className="text-sm font-bold text-emerald-800">{topRecommendation.currentLoad}</div>
              <div className="text-xs text-emerald-600">Pending Tasks</div>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-2">
            {topRecommendation.insights.map((insight, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <ArrowRight size={14} className="text-emerald-600" />
                <span className="text-emerald-800">{insight}</span>
              </div>
            ))}
            {topRecommendation.availabilityStatus === "on_leave" && (
              <div className="flex items-center gap-2 text-sm mt-3 pt-2 border-t border-red-100">
                <AlertCircle size={14} className="text-red-500" />
                <span className="text-red-600 font-medium">Task cannot be allocated because employee is on leave</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other Recommendations */}
      {otherRecommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Other Suitable Candidates:</h4>
          <div className="space-y-3">
            {otherRecommendations.map((rec) => {
              const isLeave = rec.availabilityStatus === "on_leave";
              return (
              <div
                key={rec.employeeId}
                onClick={() => {
                  if (!isLeave) onSelectEmployee(rec.employeeId);
                }}
                className={`bg-white rounded-xl shadow border p-4 transition-all ${
                  isLeave 
                    ? "opacity-60 cursor-not-allowed border-red-200 grayscale-[0.3]" 
                    : "cursor-pointer border-gray-200 hover:shadow-md hover:border-gray-300"
                } ${
                  selectedEmployeeId === rec.employeeId && !isLeave ? "ring-2 ring-emerald-500 border-emerald-400" : ""
                }`}
              >
                <div className="mb-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      getSourceBadge(rec.recommendationSource).className
                    }`}
                  >
                    {getSourceBadge(rec.recommendationSource).label}
                  </span>
                </div>

                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-semibold text-gray-900">{rec.employeeName}</h4>
                      <AvailabilityBadge 
                        status={rec.availabilityStatus} 
                        leaveUntil={rec.leaveUntil} 
                      />
                    </div>
                    <p className="text-xs text-gray-500">{rec.email}</p>
                  </div>
                  <div className={`text-center rounded-lg p-2 ${getScoreColor(rec.overallScore)}`}>
                    <div className="text-lg font-bold">{rec.overallScore}</div>
                  </div>
                </div>

                {/* Mini Metrics */}
                <div className="flex gap-2 mb-3 text-xs">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {rec.suitability.categoryMatch}% Category
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {rec.currentLoad} pending
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {rec.completionRate}% completion
                  </span>
                </div>

                {/* Key Insight */}
                {rec.insights[0] && (
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Lightbulb size={14} className="text-slate-500" />
                    <span>{rec.insights[0]}</span>
                  </p>
                )}

                {isLeave && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
                    <AlertCircle size={14} className="text-red-500" />
                    <span className="font-semibold">Cannot allocate: on leave</span>
                  </p>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <p className="text-xs text-blue-700 flex items-start gap-2">
          <Info size={14} className="text-slate-500 mt-0.5" />
          <span>
            Recommendations are based on employee performance history, task category expertise, workload capacity,
            and priority handling skills.
          </span>
        </p>
      </div>
    </div>
  );
};

export default TaskRecommendation;
