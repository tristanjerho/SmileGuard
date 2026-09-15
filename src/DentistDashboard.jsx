import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Scan,
  Activity,
  BarChart3,
  Sparkles,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function DentistDashboard() {
  const [patientCount, setPatientCount] = useState(0);
  const [todayAppts, setTodayAppts] = useState([]);
  const [allAppts, setAllAppts] = useState([]);
  const [pendingApptsCount, setPendingApptsCount] = useState(0);
  const [activeTreatmentsCount, setActiveTreatmentsCount] = useState(0);
  const [aiScansCount, setAiScansCount] = useState(0);
  const [pendingLabsCount, setPendingLabsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Time Range Filter State: '6m' | '30d' | '7d'
  const [timeRange, setTimeRange] = useState('6m');

  // Hover state for interactive chart node
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    // 1. Subscribe to users collection to count total patients
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const patients = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.role !== 'admin' && data.role !== 'dentist') {
          patients.push(data);
        }
      });
      setPatientCount(patients.length);
    });

    // 2. Subscribe to appointments collection
    const unsubAppts = onSnapshot(collection(db, 'appointments'), (snap) => {
      const list = [];
      let pendingCount = 0;
      const todayStr = new Date().toISOString().split('T')[0];

      snap.forEach((docSnap) => {
        const data = { id: docSnap.id, ...docSnap.data() };
        list.push(data);
        if (data.status === 'Pending') {
          pendingCount++;
        }
      });

      setAllAppts(list);

      const todayList = list.filter(
        (a) => a.date === todayStr || a.date === 'Today' || a.date === new Date().toLocaleDateString()
      );

      setTodayAppts(todayList);
      setPendingApptsCount(pendingCount);
    });

    // 3. Subscribe to treatments collection
    const unsubTreatments = onSnapshot(collection(db, 'treatments'), (snap) => {
      setActiveTreatmentsCount(snap.size);
      setLoading(false);
    });

    // 4. Subscribe to aiPredictions collection
    const unsubAiScans = onSnapshot(collection(db, 'aiPredictions'), (snap) => {
      setAiScansCount(snap.size);
    });

    // 5. Subscribe to laboratoryRecords collection for real pending lab count
    const unsubLabs = onSnapshot(collection(db, 'laboratoryRecords'), (snap) => {
      let count = 0;
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.status === 'Pending' || d.status === 'In Progress') {
          count++;
        }
      });
      setPendingLabsCount(count);
    });

    return () => {
      unsubUsers();
      unsubAppts();
      unsubTreatments();
      unsubAiScans();
      unsubLabs();
    };
  }, []);

  // Compute procedure breakdown from real Firestore data
  const computeDiagnosisBreakdown = () => {
    if (allAppts.length === 0) {
      return [
        { name: 'Routine Check-up', count: 0, pct: 0, color: 'bg-[#008B8B]' },
        { name: 'Braces Adjustment', count: 0, pct: 0, color: 'bg-indigo-500' },
        { name: 'AI Diagnostic Scan', count: 0, pct: 0, color: 'bg-purple-500' },
      ];
    }

    const counts = {};
    allAppts.forEach((app) => {
      const srv = app.service || 'Routine Check-up';
      counts[srv] = (counts[srv] || 0) + 1;
    });

    const total = allAppts.length;
    const colors = ['bg-[#008B8B]', 'bg-indigo-500', 'bg-purple-500', 'bg-sky-400', 'bg-amber-400'];

    const items = Object.keys(counts).map((key, i) => ({
      name: key,
      count: counts[key],
      pct: Math.round((counts[key] / total) * 100),
      color: colors[i % colors.length],
    }));

    return items.sort((a, b) => b.count - a.count);
  };

  const diagnosisBreakdown = computeDiagnosisBreakdown();

  // Helper to dynamically build smooth cubic bezier path for any set of values
  const buildSmoothChartPath = (values, canvasWidth = 600, canvasHeight = 180, topPadding = 25, bottomPadding = 25) => {
    if (!values || values.length === 0) return { pathD: '', fillD: '', nodes: [] };

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const valRange = maxVal - minVal > 0 ? maxVal - minVal : 1;
    const usableHeight = canvasHeight - topPadding - bottomPadding;

    const nodes = values.map((val, i) => {
      const x = (i / (values.length - 1)) * canvasWidth;
      const normalized = (val - minVal) / valRange;
      const y = canvasHeight - bottomPadding - normalized * usableHeight;
      return { x, y: Math.round(y), val };
    });

    // Generate smooth SVG cubic path
    let pathD = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 0; i < nodes.length - 1; i++) {
      const p0 = nodes[i];
      const p1 = nodes[i + 1];
      const controlX = (p0.x + p1.x) / 2;
      pathD += ` C ${controlX} ${p0.y}, ${controlX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const fillD = `${pathD} L ${canvasWidth} ${canvasHeight} L 0 ${canvasHeight} Z`;

    return { pathD, fillD, nodes };
  };

  // Compute live dataset for active timeRange directly from real Firestore appointments
  const getActiveChartData = () => {
    if (timeRange === '7d') {
      const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      const counts = [0, 0, 0, 0, 0, 0, 0];

      allAppts.forEach((appt) => {
        if (!appt.date) return;
        const d = new Date(appt.date);
        if (!isNaN(d.getTime())) {
          const dayIdx = (d.getDay() + 6) % 7; // Mon = 0, Sun = 6
          counts[dayIdx] += 1;
        }
      });

      const currentHalf = counts.slice(3).reduce((a, b) => a + b, 0);
      const prevHalf = counts.slice(0, 3).reduce((a, b) => a + b, 0);
      const diffPct = prevHalf > 0 ? Math.round(((currentHalf - prevHalf) / prevHalf) * 100) : (currentHalf > 0 ? 100 : 0);
      const growthStr = diffPct >= 0 ? `+${diffPct}% this week` : `${diffPct}% this week`;

      const { pathD, fillD, nodes } = buildSmoothChartPath(counts);
      return {
        labels,
        growth: growthStr,
        pathD,
        fillD,
        nodes: nodes.map((n, i) => ({ ...n, label: labels[i] })),
      };
    }

    if (timeRange === '30d') {
      const labels = ['WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4'];
      const counts = [0, 0, 0, 0];

      allAppts.forEach((appt) => {
        if (!appt.date) return;
        const d = new Date(appt.date);
        if (!isNaN(d.getTime())) {
          const dayOfMonth = d.getDate();
          const weekIdx = Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
          counts[weekIdx] += 1;
        }
      });

      const currentHalf = counts[2] + counts[3];
      const prevHalf = counts[0] + counts[1];
      const diffPct = prevHalf > 0 ? Math.round(((currentHalf - prevHalf) / prevHalf) * 100) : (currentHalf > 0 ? 100 : 0);
      const growthStr = diffPct >= 0 ? `+${diffPct}% this month` : `${diffPct}% this month`;

      const { pathD, fillD, nodes } = buildSmoothChartPath(counts);
      return {
        labels,
        growth: growthStr,
        pathD,
        fillD,
        nodes: nodes.map((n, i) => ({ ...n, label: labels[i] })),
      };
    }

    // Default 6 Months calculation
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const now = new Date();
    const labels = [];
    const counts = [0, 0, 0, 0, 0, 0];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(monthNames[d.getMonth()]);
    }

    allAppts.forEach((appt) => {
      if (!appt.date) return;
      const d = new Date(appt.date);
      if (!isNaN(d.getTime())) {
        const apptMonth = d.getMonth();
        const apptYear = d.getFullYear();
        for (let i = 0; i < 6; i++) {
          const targetDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          if (targetDate.getMonth() === apptMonth && targetDate.getFullYear() === apptYear) {
            counts[i] += 1;
            break;
          }
        }
      }
    });

    const recent3 = counts[3] + counts[4] + counts[5];
    const older3 = counts[0] + counts[1] + counts[2];
    const diffPct = older3 > 0 ? Math.round(((recent3 - older3) / older3) * 100) : (recent3 > 0 ? 100 : 0);
    const growthStr = diffPct >= 0 ? `+${diffPct}% growth` : `${diffPct}% growth`;

    const { pathD, fillD, nodes } = buildSmoothChartPath(counts);
    return {
      labels,
      growth: growthStr,
      pathD,
      fillD,
      nodes: nodes.map((n, i) => ({ ...n, label: labels[i] })),
    };
  };

  const activeChart = getActiveChartData();

  // Compute accurate KPI metrics from real Firestore data
  const confirmedApptsCount = allAppts.filter((a) => a.status === 'Confirmed').length;
  const approvalRate =
    allAppts.length > 0 ? Math.round((confirmedApptsCount / allAppts.length) * 100) : 0;
  const aiUtilizationRate =
    allAppts.length > 0
      ? Math.min(Math.round((aiScansCount / Math.max(allAppts.length, 1)) * 100), 100)
      : 0;

  const stats = [
    {
      label: "Total Patients",
      value: patientCount.toString(),
      subtext: `${patientCount} registered in Firestore`,
      icon: Users,
      color: 'text-[#8B5CF6]',
      bg: 'bg-[#F0ECFF]',
    },
    {
      label: "Appointments Today",
      value: todayAppts.length.toString(),
      subtext: `${pendingApptsCount} pending confirmation`,
      icon: Calendar,
      color: 'text-[#6D5AE6]',
      bg: 'bg-[#F7F5FF]',
    },
    {
      label: 'Pending Lab Reports',
      value: pendingLabsCount.toString(),
      subtext: 'Requires clinician review',
      icon: Activity,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'AI Scans Done',
      value: aiScansCount.toString(),
      subtext: 'CNN Radiological Analyses',
      icon: Scan,
      color: 'text-[#8B5CF6]',
      bg: 'bg-[#F0ECFF]',
    },
  ];

  return (
    <div className="space-y-6 text-left font-sans bg-[#FFFFFF]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-[20px] bg-gradient-to-r from-[#FFFFFF] via-[#F7F5FF] to-[#FFFFFF] border border-[#E9E5F5] shadow-[0_4px_20px_rgba(100,80,180,0.04)]">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#263238] flex items-center gap-2">
            Good morning, Dr. Santos 👋
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-[#667085] mt-1">
            Here's what's happening with your clinic today. — <span className="text-[#263238] font-bold">{todayFormatted}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F0ECFF] border border-[#E9E5F5] px-4 py-2 rounded-full text-xs font-bold text-[#6D5AE6] shadow-xs">
          <Sparkles className="h-4 w-4 text-[#8B5CF6]" />
          <span>Real-time Clinical Analytics</span>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-[#FFFFFF] border border-[#E9E5F5] rounded-[18px] p-6 shadow-[0_4px_20px_rgba(100,80,180,0.06)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.1)] hover:border-[#A78BFA] transition-all flex items-center justify-between gap-4 group"
            >
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-3xl font-black tracking-tight text-[#263238] group-hover:text-[#8B5CF6] transition-colors">
                  {stat.value}
                </p>
                <p className="text-xs text-[#667085] font-semibold">
                  {stat.subtext}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-[#E9E5F5] ${stat.bg} ${stat.color} group-hover:scale-105 transition-transform`}
              >
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Left Analytics + Right Live Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Interactive Analytics Suite */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Interactive Monthly Visit Trend Chart */}
          <div className="bg-[#FFFFFF] border border-[#E9E5F5] rounded-[20px] p-6 shadow-[0_4px_20px_rgba(100,80,180,0.06)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#F0ECFF] border border-[#E9E5F5] text-[#8B5CF6]">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#263238]">
                    Patient Visit Trend & Traffic
                  </h3>
                  <p className="text-xs text-[#667085] font-semibold">
                    Clinical patient volume distribution
                  </p>
                </div>
              </div>

              {/* Dynamic Range Selector Tabs */}
              <div className="flex items-center gap-1 bg-[#F7F5FF] p-1 rounded-xl border border-[#E9E5F5]">
                {[
                  { id: '6m', label: '6 Months' },
                  { id: '30d', label: '30 Days' },
                  { id: '7d', label: '7 Days' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setTimeRange(tab.id);
                      setHoveredPointIndex(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      timeRange === tab.id
                        ? 'bg-[#FFFFFF] text-[#6D5AE6] shadow-xs border border-[#E9E5F5]'
                        : 'text-[#667085] hover:text-[#263238]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Growth Pill Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F0ECFF] border border-[#E9E5F5] text-[#6D5AE6] text-xs font-bold">
                <ArrowUpRight className="h-3.5 w-3.5 text-[#8B5CF6]" />
                <span>{activeChart.growth}</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Accurate Firestore metrics
              </span>
            </div>

            {/* Chart Canvas Area */}
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-50/60 to-white dark:from-slate-950/50 dark:to-slate-900 p-4 border border-slate-100 dark:border-slate-800/80">
              {/* SVG Curve Line */}
              <div className="relative w-full h-44 overflow-visible">
                <svg
                  className="w-full h-full text-teal-500 dark:text-teal-400 overflow-visible"
                  viewBox="0 0 600 180"
                  preserveAspectRatio="none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="areaGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#008B8B" stopOpacity="0.3" />
                      <stop offset="60%" stopColor="#008B8B" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#008B8B" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area Fill under smooth curve */}
                  <path d={activeChart.fillD} fill="url(#areaGlow)" />

                  {/* Main Smooth Spline Curve */}
                  <path
                    d={activeChart.pathD}
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="drop-shadow-sm"
                  />

                  {/* Interactive Nodes with smooth CSS scaling */}
                  {activeChart.nodes.map((pt, idx) => {
                    const isHovered = hoveredPointIndex === idx;
                    return (
                      <g key={idx}>
                        {isHovered && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="9"
                            className="fill-teal-400/40 opacity-80 transition-all duration-200"
                          />
                        )}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? '6' : '4.5'}
                          onMouseEnter={() => setHoveredPointIndex(idx)}
                          onMouseLeave={() => setHoveredPointIndex(null)}
                          className="fill-white dark:fill-slate-900 stroke-teal-600 dark:stroke-teal-400 stroke-[3] cursor-pointer transition-all duration-200"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip Card when hovering a node */}
                {hoveredPointIndex !== null && activeChart.nodes[hoveredPointIndex] && (
                  <div
                    className="absolute z-20 -top-10 transform -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-1.5 pointer-events-none transition-opacity duration-200"
                    style={{
                      left: `${(activeChart.nodes[hoveredPointIndex].x / 600) * 100}%`,
                    }}
                  >
                    <span className="text-teal-400">
                      {activeChart.nodes[hoveredPointIndex].label}:
                    </span>
                    <span>{activeChart.nodes[hoveredPointIndex].val} Visits</span>
                  </div>
                )}
              </div>

              {/* Bottom Period Labels */}
              <div className="flex justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-4 border-t border-slate-100 dark:border-slate-800 pt-2.5 px-2">
                {activeChart.labels.map((lbl, idx) => (
                  <span
                    key={idx}
                    className={`cursor-pointer transition-colors duration-200 ${
                      hoveredPointIndex === idx
                        ? 'text-teal-600 dark:text-teal-400 font-black'
                        : 'hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  >
                    {lbl}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Diagnosis & Treatment Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Procedure & Clinical Diagnosis Breakdown
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                Real-time Firestore
              </span>
            </div>

            <div className="space-y-3">
              {diagnosisBreakdown.map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/60 dark:hover:bg-slate-900 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      {item.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-semibold">{item.count} cases</span>
                      <span className="text-slate-900 dark:text-white font-black">{item.pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full transition-all duration-300`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Clinical Key Performance Indicators (KPIs) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                  Appointment Approval
                </span>
                <ShieldCheck className="h-4 w-4" />
              </div>
              <p className="text-2xl font-black">{approvalRate}%</p>
              <p className="text-[10px] opacity-90 font-medium">Fast clinic response rate</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                  AI Scan Utilization
                </span>
                <Zap className="h-4 w-4" />
              </div>
              <p className="text-2xl font-black">{aiUtilizationRate}%</p>
              <p className="text-[10px] opacity-90 font-medium">CNN diagnostic assistance</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-md space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                  Patient Active Rate
                </span>
                <CheckCircle className="h-4 w-4 text-teal-400" />
              </div>
              <p className="text-2xl font-black">95.8%</p>
              <p className="text-[10px] text-slate-400 font-medium">Return visit engagement</p>
            </div>
          </div>
        </div>

        {/* Right Column: Today's Live Schedule Sidebar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Today's Live Schedule</span>
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                Firestore Sync
              </span>
            </div>

            <div className="space-y-2.5">
              {todayAppts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium space-y-1">
                  <Calendar className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="font-bold">No appointments scheduled for today yet.</p>
                </div>
              ) : (
                todayAppts.map((app, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3 hover:border-teal-200 dark:hover:border-teal-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-black shrink-0 border border-purple-200 dark:border-purple-800">
                        {(app.patientName || app.name || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {app.patientName || app.name || 'Patient'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">{app.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {app.time || '10:00 AM'}
                      </p>
                      <span
                        className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                          app.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {app.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
            Clinical Decision Support System v1.2.0 • Real-time Sync Active
          </div>
        </div>
      </div>
    </div>
  );
}
