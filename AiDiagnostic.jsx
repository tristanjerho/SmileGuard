import React, { useState } from 'react';
import { UploadCloud, FileText, Scan, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function AiDiagnostic() {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);

    const recentScans = [
        { id: 1, name: 'Carlo Mendoza', result: 'Possible early decay on upper molar', date: 'Jun 20, 2026', risk: 'High' },
        { id: 2, name: 'Juan dela Cruz', result: 'Minor enamel erosion detected', date: 'Jun 18, 2026', risk: 'Medium' },
        { id: 3, name: 'Ana Reyes', result: 'No abnormalities detected', date: 'Jun 15, 2026', risk: 'Low' },
    ];

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setUploadedFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="space-y-2">
            <div className="mb-6">
                <p className="text-sm text-slate-500 font-medium">
                    CNN-powered image analysis for early detection and preventive care
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all ${isDragging
                                ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                                : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50'
                            }`}
                    >
                        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                            <UploadCloud className="h-7 w-7" />
                        </div>

                        {uploadedFile ? (
                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-slate-800">File Selected Successfully</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md shadow-sm max-w-xs text-xs font-mono text-slate-600">
                                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                                    <span className="truncate">{uploadedFile.name}</span>
                                </div>
                                <button
                                    onClick={() => setUploadedFile(null)}
                                    className="block mx-auto text-xs font-semibold text-rose-500 hover:underline mt-1"
                                >
                                    Clear File
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-base font-bold text-slate-900 mb-1">Upload Dental Image</h3>
                                <p className="text-sm text-slate-500 max-w-xs mb-6">
                                    Drag & drop or click to select. Accepts X-ray, intraoral photo, or OPG.
                                </p>
                                <label className="cursor-pointer bg-[#008B8B] hover:bg-[#007A7A] text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-all shadow-sm">
                                    Browse Files
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])}
                                    />
                                </label>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Recent AI Scans</h3>
                        <div className="divide-y divide-slate-100">
                            {recentScans.map((scan) => (
                                <div key={scan.id} className="py-3.5 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                                    <div className="flex gap-3">
                                        <div className="h-9 w-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                            <Scan className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">{scan.name}</h4>
                                            <p className="text-xs text-slate-500 line-clamp-1">{scan.result}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{scan.date}</p>
                                        </div>
                                    </div>

                                    <span
                                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm shrink-0 ${scan.risk === 'High'
                                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                                : scan.risk === 'Medium'
                                                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                            }`}
                                    >
                                        {scan.risk}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-6">
                        <div className="flex gap-2.5 text-emerald-800 mb-3">
                            <Info className="h-5 w-5 shrink-0 text-emerald-600" />
                            <h4 className="text-sm font-bold">How CNN Analysis Works</h4>
                        </div>
                        <ol className="space-y-2 text-xs text-emerald-900/80 font-medium list-decimal list-inside pl-0.5">
                            <li>Dentist uploads dental image or X-ray</li>
                            <li>CNN processes the image for visual patterns</li>
                            <li>System detects signs of decay, cavities, or abnormalities</li>
                            <li>Risk assessment generated with confidence scores</li>
                            <li>Dentist reviews and makes final clinical decision</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
