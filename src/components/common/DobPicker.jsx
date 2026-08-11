import React, { useState, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Sparkles, SlidersHorizontal } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DobPicker({
  value = '',
  onChange,
  name = 'birthDate',
  required = false,
  label = 'Date of Birth',
  className = '',
  error = '',
}) {
  const [entryMode, setEntryMode] = useState('calendar');
  const dateInputRef = useRef(null);

  // Parse YYYY-MM-DD
  const parseDate = (val) => {
    if (!val) return { year: '', month: '', day: '' };
    const parts = val.split('-');
    if (parts.length === 3) {
      return {
        year: parts[0],
        month: parts[1],
        day: parts[2],
      };
    }
    return { year: '', month: '', day: '' };
  };

  const { year, month, day } = parseDate(value);

  // Helper to format date display & calculate age
  const getAgeAndFormattedDate = (val) => {
    if (!val) return null;
    const parts = val.split('-');
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null;

    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10) - 1;
    const birthDay = parseInt(parts[2], 10);

    if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return null;

    const birthDateObj = new Date(birthYear, birthMonth, birthDay);
    if (isNaN(birthDateObj.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthYear;
    const m = today.getMonth() - birthMonth;
    if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
      age--;
    }

    if (age < 0 || age > 130) return null;

    const formattedStr = birthDateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return { formattedStr, age };
  };

  const dateDetails = getAgeAndFormattedDate(value);
  const maxToday = new Date().toISOString().split('T')[0];

  // Handle dropdown changes
  const handleDropdownChange = (field, newVal) => {
    let currentYear = year || '2000';
    let currentMonth = month || '01';
    let currentDay = day || '01';

    if (field === 'year') currentYear = newVal;
    if (field === 'month') currentMonth = newVal;
    if (field === 'day') currentDay = newVal;

    if (!currentYear || !currentMonth || !currentDay) return;

    // Check max days in month
    const daysInM = new Date(parseInt(currentYear, 10), parseInt(currentMonth, 10), 0).getDate();
    let formattedDay = currentDay;
    if (parseInt(currentDay, 10) > daysInM) {
      formattedDay = String(daysInM).padStart(2, '0');
    }

    const newIso = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(formattedDay).padStart(2, '0')}`;
    
    const event = {
      target: {
        name,
        value: newIso,
      },
    };
    onChange(event);
  };

  // Quick decade jump
  const jumpDecade = (decadeYear) => {
    const defaultM = month || '01';
    const defaultD = day || '01';
    const newIso = `${decadeYear}-${defaultM}-${defaultD}`;
    onChange({ target: { name, value: newIso } });
    
    setTimeout(() => {
      if (dateInputRef.current?.showPicker) {
        try {
          dateInputRef.current.showPicker();
        } catch (e) {
          // ignore fallback
        }
      }
    }, 50);
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      if (dateInputRef.current.showPicker) {
        try {
          dateInputRef.current.showPicker();
        } catch (e) {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  // Generate years list (from current year down to 1915)
  const currentYearNum = new Date().getFullYear();
  const years = [];
  for (let y = currentYearNum; y >= 1915; y--) {
    years.push(String(y));
  }

  // Days in current selected month/year
  const getDaysArray = () => {
    const yNum = parseInt(year || '2000', 10);
    const mNum = parseInt(month || '01', 10);
    const count = new Date(yNum, mNum, 0).getDate();
    const daysArr = [];
    for (let d = 1; d <= count; d++) {
      daysArr.push(String(d).padStart(2, '0'));
    }
    return daysArr;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setEntryMode(entryMode === 'calendar' ? 'dropdown' : 'calendar')}
          className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-lg transition-all"
          title="Switch entry style"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>{entryMode === 'calendar' ? 'Use Dropdowns' : 'Use Calendar'}</span>
        </button>
      </div>

      {entryMode === 'calendar' ? (
        <div className="space-y-2">
          {/* Main Input Container */}
          <div
            onClick={handleCalendarClick}
            className="group relative flex items-center rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/30 transition-all cursor-pointer overflow-hidden"
          >
            <div className="pl-3.5 pr-2 py-2.5 text-teal-400 group-hover:text-teal-300 transition-colors">
              <CalendarIcon className="w-4 h-4" />
            </div>

            <input
              ref={dateInputRef}
              type="date"
              name={name}
              required={required}
              max={maxToday}
              value={value}
              onChange={onChange}
              style={{ colorScheme: 'dark' }}
              className="w-full bg-transparent py-2.5 pr-10 text-xs font-medium text-white placeholder-slate-500 focus:outline-none cursor-pointer border-none"
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-teal-400 group-hover:text-white transition-colors">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>

          {/* Quick Decade Shortcuts */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Decade:</span>
            {['1970', '1980', '1990', '2000', '2010'].map((decade) => (
              <button
                key={decade}
                type="button"
                onClick={() => jumpDecade(decade)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all border ${
                  year && year.startsWith(decade.substring(0, 3))
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {decade}s
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Dropdown Mode (Month, Day, Year) */
        <div className="grid grid-cols-3 gap-2">
          {/* Month Select */}
          <div className="relative">
            <select
              value={month}
              onChange={(e) => handleDropdownChange('month', e.target.value)}
              className="w-full appearance-none px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-teal-500 pr-7"
            >
              <option value="" disabled>Month</option>
              {MONTHS.map((m, idx) => {
                const val = String(idx + 1).padStart(2, '0');
                return (
                  <option key={val} value={val} className="bg-slate-900 text-white">
                    {m}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Day Select */}
          <div className="relative">
            <select
              value={day}
              onChange={(e) => handleDropdownChange('day', e.target.value)}
              className="w-full appearance-none px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-teal-500 pr-7"
            >
              <option value="" disabled>Day</option>
              {getDaysArray().map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-white">
                  {parseInt(d, 10)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Year Select */}
          <div className="relative">
            <select
              value={year}
              onChange={(e) => handleDropdownChange('year', e.target.value)}
              className="w-full appearance-none px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-teal-500 pr-7"
            >
              <option value="" disabled>Year</option>
              {years.map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Visual Feedback / Age Badge */}
      {dateDetails ? (
        <div className="flex items-center gap-2 mt-1.5 px-3 py-1.5 rounded-lg bg-teal-950/50 border border-teal-800/60 text-xs text-teal-300 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="font-semibold">{dateDetails.formattedStr}</span>
          <span className="text-teal-400/60">•</span>
          <span className="bg-teal-500/20 text-teal-200 px-2 py-0.5 rounded-full text-[11px] font-bold">
            {dateDetails.age} years old
          </span>
        </div>
      ) : value ? (
        <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-1">
          Please select a valid date of birth.
        </p>
      ) : null}

      {error && (
        <p className="text-xs text-rose-400 font-medium mt-1">{error}</p>
      )}
    </div>
  );
}
