import React, { useState, useEffect, useContext, useCallback } from 'react';
import { SimulationContext } from '../context/SimulationContext';
import { InstanceSimulationContext } from '../context/InstanceSimulationContext';
import {
    Trophy, RefreshCw, Download, CheckCircle, Heart, Brain,
    MessageSquare, Shield, Scale, Clock, Target, Star,
    Sparkles, ArrowRight, BookOpen, ExternalLink,
} from 'lucide-react';
import type { CategoryScore } from '../context/SimulationContext';
import type { ScoringCategory } from '../data/scenesData';

/* ─── demo / fallback data for admin preview ─── */
const DEMO_SCORE = 73;
const DEMO_CATEGORY_SCORES: CategoryScore[] = [
    { category: 'timelyPainManagement', correct: 3, total: 4, percentage: 75 },
    { category: 'clinicalJudgment', correct: 4, total: 5, percentage: 80 },
    { category: 'communication', correct: 2, total: 3, percentage: 67 },
    { category: 'culturalSafety', correct: 3, total: 4, percentage: 75 },
    { category: 'biasMitigation', correct: 1, total: 2, percentage: 50 },
];
const DEMO_COMPLETION_MS = 32 * 60 * 1000; // 32 minutes

/* ─── category display meta ─── */
const CATEGORY_CONFIG: Record<ScoringCategory, {
    label: string;
    icon: React.FC<{ className?: string }>;
    color: string;
    bg: string;
    border: string;
}> = {
    timelyPainManagement: { label: 'Timely Pain Management', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-400/30' },
    clinicalJudgment: { label: 'Clinical Judgment', icon: Brain, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-400/30' },
    communication: { label: 'Communication', icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-400/30' },
    culturalSafety: { label: 'Cultural Safety', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-400/30' },
    biasMitigation: { label: 'Bias Mitigation', icon: Scale, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-400/30' },
};

const RESOURCES = [
    { title: 'Sickle Cell Disease: Pathophysiology and Treatment', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3172721/', desc: 'Comprehensive review of SCD mechanisms and therapeutic approaches' },
    { title: 'Emergency Management of Vaso-Occlusive Crisis', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4938685/', desc: 'Evidence-based guidelines for acute crisis management' },
    { title: 'Cultural Competency in Sickle Cell Care', url: 'https://bmcemergmed.biomedcentral.com/articles/10.1186/s12873-025-01192-1', desc: 'Addressing bias and improving outcomes through cultural awareness' },
];

function fmtTime(ms: number) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function scoreGrade(s: number) {
    if (s >= 90) return { label: 'Excellent', color: 'text-emerald-400', bg: 'from-emerald-500/20 to-green-500/10', ring: 'ring-emerald-400/50' };
    if (s >= 80) return { label: 'Very Good', color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/10', ring: 'ring-blue-400/50' };
    if (s >= 70) return { label: 'Good', color: 'text-cyan-400', bg: 'from-cyan-500/20 to-teal-500/10', ring: 'ring-cyan-400/50' };
    if (s >= 60) return { label: 'Satisfactory', color: 'text-yellow-400', bg: 'from-yellow-500/20 to-amber-500/10', ring: 'ring-yellow-400/50' };
    return { label: 'Needs Improvement', color: 'text-red-400', bg: 'from-red-500/20 to-rose-500/10', ring: 'ring-red-400/50' };
}

interface Props {
    /** Called when the user wants to restart */
    onRestart?: () => void;
    /** If true renders in a compact card mode (admin preview). Defaults to full-screen mode. */
    isPreview?: boolean;
}

/**
 * Fully self-contained simulation completion screen.
 * Works inside SimulationProvider, InstanceSimulationProvider, or without any provider (shows demo data).
 */
const SimulationCompleteScreen: React.FC<Props> = ({ onRestart, isPreview = false }) => {
    const simCtx = useContext(SimulationContext);
    const instanceCtx = useContext(InstanceSimulationContext);

    /* ── derive data from whichever context is available ── */
    const score: number = simCtx
        ? simCtx.calculateScore()
        : DEMO_SCORE;

    const categoryScores: CategoryScore[] = simCtx
        ? simCtx.calculateCategoryScores()
        : DEMO_CATEGORY_SCORES;

    const totalResponses = simCtx ? simCtx.state.userData.responses.length : 12;
    const correctAnswers = simCtx ? simCtx.state.userData.responses.filter(r => r.isCorrect).length : Math.round(DEMO_SCORE / 100 * 12);
    const completedScenes = simCtx ? simCtx.state.userData.completedScenes.size : 9;
    const totalScenes = simCtx ? simCtx.state.userData.totalScenes : 9;
    const startTime = simCtx ? simCtx.state.userData.startTime : Date.now() - DEMO_COMPLETION_MS;
    const completionMs = startTime ? Date.now() - startTime : DEMO_COMPLETION_MS;
    const avgPerScene = completedScenes > 0 ? Math.round(completionMs / completedScenes / 60000) : 0;

    const grade = scoreGrade(score);

    /* ── animation steps ── */
    const [step, setStep] = useState(0);
    useEffect(() => {
        if (step >= 5) return;
        const t = setTimeout(() => setStep(s => s + 1), 400);
        return () => clearTimeout(t);
    }, [step]);

    /* ── PDF / print report ── */
    const handleDownload = useCallback(() => {
        window.print();
    }, []);

    /* ── restart handler chains to prop then context ── */
    const handleRestart = useCallback(() => {
        if (onRestart) { onRestart(); return; }
        if (simCtx) { simCtx.dispatch({ type: 'RESET_SIMULATION' }); }
        if (instanceCtx) { instanceCtx.dispatch({ type: 'RESET_SCENE_STATE' }); }
    }, [onRestart, simCtx, instanceCtx]);

    /* ─────────────────────────────────────
       PREVIEW MODE: compact card (admin)
    ───────────────────────────────────── */
    if (isPreview) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center gap-4 p-6 overflow-auto">
                {/* Trophy burst */}
                <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/30 to-amber-500/20 border-2 border-yellow-400/40 flex items-center justify-center shadow-xl shadow-yellow-900/20 animate-pulse">
                        <Trophy className="w-9 h-9 text-yellow-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md">
                        <Sparkles className="w-3 h-3 text-white" />
                    </div>
                </div>

                <div className="text-center">
                    <h2 className="text-xl font-bold text-white mb-1">Simulation Complete!</h2>
                    <p className="text-gray-400 text-xs">This is how Scene 10 appears to participants</p>
                </div>

                {/* Score ring preview */}
                <div className={`px-6 py-3 rounded-2xl bg-gradient-to-br ${grade.bg} border border-white/10`}>
                    <div className={`text-4xl font-black text-center ${grade.color}`}>{DEMO_SCORE}%</div>
                    <div className="text-center text-xs text-gray-300 mt-1">{grade.label} · Preview Data</div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-medium">
                        <RefreshCw className="w-3 h-3" /> Redo Simulation
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-medium">
                        <Download className="w-3 h-3" /> Download Report
                    </div>
                </div>
            </div>
        );
    }

    /* ─────────────────────────────────────
       FULL SCREEN MODE
    ───────────────────────────────────── */
    return (
        <div className="h-full w-full overflow-y-auto">
            <div className="min-h-full px-4 py-6 max-w-5xl mx-auto flex flex-col gap-5">

                {/* ── Hero Header ── */}
                <div className={`text-center transition-all duration-700 ${step >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    {/* animated trophy */}
                    <div className="flex justify-center mb-3">
                        <div className="relative">
                            <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400/25 to-amber-500/15 border-2 border-yellow-400/40 flex items-center justify-center shadow-2xl shadow-yellow-900/30 ring-4 ${grade.ring} transition-all duration-1000`}>
                                <Trophy className="w-11 h-11 text-yellow-400 drop-shadow-lg" />
                            </div>
                            {/* orbiting stars */}
                            {[0, 1, 2].map(i => (
                                <Star
                                    key={i}
                                    className="absolute w-4 h-4 text-yellow-300 fill-yellow-300 opacity-80 animate-spin"
                                    style={{
                                        top: `${50 + 44 * Math.sin((i * 2 * Math.PI) / 3)}%`,
                                        left: `${50 + 44 * Math.cos((i * 2 * Math.PI) / 3)}%`,
                                        animationDuration: `${3 + i}s`,
                                        animationDelay: `${i * 0.5}s`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-white mb-1 tracking-tight">
                        Simulation Complete!
                    </h1>
                    <p className="text-gray-300 text-sm max-w-lg mx-auto">
                        You have successfully completed the Sickle Cell Vaso-occlusive Crisis Care Digital Simulation.
                    </p>
                </div>

                {/* ── Score + CTA Row ── */}
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-700 delay-200 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

                    {/* Score card — spans 1 col */}
                    <div className={`md:col-span-1 rounded-2xl bg-gradient-to-br ${grade.bg} backdrop-blur-xl border border-white/15 p-5 flex flex-col items-center justify-center gap-2 shadow-xl`}>
                        <div className={`text-6xl font-black ${grade.color} tabular-nums`}>{score}%</div>
                        <div className={`text-base font-bold ${grade.color}`}>{grade.label}</div>
                        <div className="grid grid-cols-3 gap-3 w-full mt-1 pt-3 border-t border-white/10">
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{correctAnswers}</div>
                                <div className="text-[10px] text-gray-400 leading-tight">Correct</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{fmtTime(completionMs)}</div>
                                <div className="text-[10px] text-gray-400 leading-tight">Total Time</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{completedScenes}/{totalScenes}</div>
                                <div className="text-[10px] text-gray-400 leading-tight">Scenes</div>
                            </div>
                        </div>
                    </div>

                    {/* Action cards — 2 cols */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Redo */}
                        <button
                            onClick={handleRestart}
                            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/15 border border-cyan-400/30 hover:border-cyan-400/60 hover:from-cyan-500/30 hover:to-blue-600/25 transition-all duration-300 shadow-lg hover:shadow-cyan-900/30 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center"
                        >
                            <div className="w-12 h-12 rounded-xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <RefreshCw className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <div className="text-white font-bold text-sm">Redo Simulation</div>
                                <div className="text-gray-400 text-xs mt-0.5">Start fresh from the beginning</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                        </button>

                        {/* Download Report */}
                        <button
                            onClick={handleDownload}
                            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/15 border border-purple-400/30 hover:border-purple-400/60 hover:from-purple-500/30 hover:to-pink-600/25 transition-all duration-300 shadow-lg hover:shadow-purple-900/30 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center"
                        >
                            <div className="w-12 h-12 rounded-xl bg-purple-400/20 border border-purple-400/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <Download className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <div className="text-white font-bold text-sm">Download Report</div>
                                <div className="text-gray-400 text-xs mt-0.5">Save your full analytics as PDF</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                        </button>

                        {/* Time breakdown */}
                        <div className="sm:col-span-2 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex flex-wrap gap-4 items-center justify-around">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                <div>
                                    <div className="text-white font-semibold text-sm">{fmtTime(completionMs)}</div>
                                    <div className="text-gray-400 text-xs">Total completion time</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Target className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <div>
                                    <div className="text-white font-semibold text-sm">{avgPerScene}m avg/scene</div>
                                    <div className="text-gray-400 text-xs">Average time per scene</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <div>
                                    <div className="text-white font-semibold text-sm">{totalResponses} questions answered</div>
                                    <div className="text-gray-400 text-xs">{correctAnswers} correct · {totalResponses - correctAnswers} incorrect</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Category Performance ── */}
                <div className={`transition-all duration-700 delay-400 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500" />
                        Performance by Domain
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {categoryScores.map((cs, i) => {
                            const cfg = CATEGORY_CONFIG[cs.category];
                            if (!cfg) return null;
                            const Icon = cfg.icon;
                            const pct = cs.percentage;
                            const pctColor = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-yellow-400' : 'text-red-400';
                            const bgPct = pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-400';
                            return (
                                <div
                                    key={cs.category}
                                    className={`p-3 rounded-xl ${cfg.bg} border ${cfg.border} flex flex-col gap-2 transition-all duration-500 hover:scale-[1.03]`}
                                    style={{ transitionDelay: `${i * 80}ms` }}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Icon className={`w-3.5 h-3.5 ${cfg.color} flex-shrink-0`} />
                                        <span className="text-white font-semibold text-[11px] leading-tight">{cfg.label}</span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <span className={`text-xl font-black ${pctColor}`}>{pct}%</span>
                                        <span className="text-[10px] text-gray-400">{cs.correct}/{cs.total}</span>
                                    </div>
                                    <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${bgPct}`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Resources ── */}
                <div className={`transition-all duration-700 delay-600 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        Continue Your Learning
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {RESOURCES.map((r, i) => (
                            <a
                                key={i}
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/40 transition-all duration-300 flex flex-col gap-1"
                            >
                                <div className="flex items-start gap-1.5">
                                    <ExternalLink className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5 group-hover:text-cyan-300 transition-colors" />
                                    <span className="text-white font-semibold text-xs leading-tight group-hover:text-cyan-100 transition-colors">{r.title}</span>
                                </div>
                                <p className="text-gray-400 text-[11px] leading-relaxed group-hover:text-gray-300 transition-colors">{r.desc}</p>
                            </a>
                        ))}
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className={`text-center transition-all duration-700 delay-700 ${step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <p className="text-gray-500 text-xs">
                        This simulation is designed for healthcare education purposes. Performance data is anonymised and used to improve sickle cell disease care.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default SimulationCompleteScreen;
