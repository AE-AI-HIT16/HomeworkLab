import { requireSession } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/roles";
import { getStudents, getSubmissions } from "@/lib/google-sheets";
import { TopNav } from "@/components/TopNav";
import { StudentSidebar } from "@/components/StudentSidebar";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
    const session = await requireSession();
    const { role } = await getCurrentUserRole();
    const user = session.user;

    const allStudents = await getStudents();
    const activeStudents = allStudents.filter(s => s.active);
    const allSubmissions = await getSubmissions();

    // Data Aggregation
    const rawLeaderboard = activeStudents.map(student => {
        const studentSubs = allSubmissions.filter(s => s.githubUsername.toLowerCase() === student.githubUsername.toLowerCase());
        const totalScore = studentSubs.reduce((sum, sub) => sum + (sub.grade || 0), 0);
        const onTimeCount = studentSubs.filter(s => !s.isLate).length;
        
        return {
            ...student,
            totalScore,
            onTimeCount,
            submissionCount: studentSubs.length
        };
    });

    // Sort by Total Score, then by OnTimeCount if tie
    const leaderboard = rawLeaderboard.sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        return b.onTimeCount - a.onTimeCount; // Tie-breaker
    });

    const currentUserRankIdx = leaderboard.findIndex(s => s.githubUsername.toLowerCase() === user.githubUsername.toLowerCase());
    const currentUserRank = currentUserRankIdx !== -1 ? currentUserRankIdx + 1 : null;
    const currentUserStats = currentUserRankIdx !== -1 ? leaderboard[currentUserRankIdx] : null;

    const pointsToNextRank = currentUserRank && currentUserRank > 1 
        ? leaderboard[currentUserRankIdx - 1].totalScore - (currentUserStats?.totalScore || 0)
        : null;

    const top1 = leaderboard[0];
    const top2 = leaderboard[1];
    const top3 = leaderboard[2];
    const restOfLeaderboard = leaderboard.slice(3);

    return (
        <div className="min-h-screen bg-[var(--hw-surface)] text-[var(--hw-on-surface)] antialiased pb-24 md:pb-0">
            <TopNav
                user={{
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    githubUsername: user.githubUsername
                }}
                role={role}
                showSearch={false}
            />

            <div className="flex pt-16 relative">
                <StudentSidebar role={role} />

                {/* ═══ MAIN CONTENT ═══ */}
                <main className="ml-0 md:ml-64 w-full p-4 sm:p-6 md:p-8 min-h-screen bg-[var(--hw-surface)] max-w-5xl mx-auto pb-32">
                    <header className="mb-10 text-center md:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-[var(--hw-on-surface)] mb-2 flex items-center justify-center md:justify-start gap-2">
                            <span className="material-symbols-outlined text-[32px] text-[var(--hw-primary)]">emoji_events</span>
                            Global Leaderboard
                        </h1>
                        <p className="text-[var(--hw-on-surface-variant)] text-sm">
                            Earn XP by submitting your assignments and competing with peers!
                        </p>
                    </header>
                    
                    {/* PODIUM SECTION */}
                    <div className="flex flex-col mb-12 items-center justify-end relative pt-12 max-w-4xl mx-auto min-h-[350px]">
                        <div className="absolute inset-0 bg-gradient-to-b from-[var(--hw-primary-fixed)]/20 to-transparent blur-3xl rounded-full opacity-50 -z-10" />
                        
                        <div className="flex items-end justify-center w-full relative z-10 px-2 sm:px-4 gap-2 sm:gap-4 max-w-2xl">
                            {/* Rank 2 (Silver) */}
                            {top2 && (
                                <div className="flex flex-col items-center flex-1 z-20">
                                    <div className="relative mb-2 sm:mb-3 group">
                                        <div className="absolute inset-0 bg-slate-300 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <img src={`https://github.com/${top2.githubUsername}.png`} alt={top2.name} className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-slate-300 shadow-xl object-cover bg-white" />
                                        <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 bg-slate-200 border-2 border-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-slate-700 shadow-sm">
                                            #2
                                        </div>
                                    </div>
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 text-center line-clamp-2 w-full px-1">{top2.name}</h3>
                                    <p className="text-[10px] sm:text-xs text-slate-500 font-semibold mb-2 sm:mb-3">{top2.totalScore} XP</p>
                                    <div className="w-full h-[140px] sm:h-[160px] bg-gradient-to-t from-slate-200 to-slate-100/50 rounded-tl-2xl border-t border-l border-white/50 shadow-inner flex flex-col items-center justify-start pt-4 backdrop-blur-sm">
                                        <span className="text-3xl sm:text-4xl opacity-40 text-slate-400 font-black tracking-tighter drop-shadow-sm">2</span>
                                    </div>
                                </div>
                            )}

                            {/* Rank 1 (Gold) */}
                            {top1 && (
                                <div className="flex flex-col items-center flex-[1.2] sm:flex-[1.3] z-30 shadow-[0_0_30px_rgba(0,0,0,0.1)] rounded-t-2xl">
                                    <div className="relative mb-2 sm:mb-3 group pt-2 sm:pt-4">
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 sm:w-10 text-amber-400 rotate-12 drop-shadow-md z-10 flex justify-center">
                                            <span className="material-symbols-outlined text-[28px] sm:text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>crown</span>
                                        </div>
                                        <div className="absolute inset-0 bg-amber-400 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
                                        <img src={`https://github.com/${top1.githubUsername}.png`} alt={top1.name} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] object-cover bg-white" />
                                    </div>
                                    <h3 className="text-xs sm:text-base font-extrabold text-slate-900 text-center line-clamp-2 w-full px-1 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-500">{top1.name}</h3>
                                    <p className="text-[10px] sm:text-sm text-amber-600 font-black mb-2 sm:mb-3">{top1.totalScore} XP</p>
                                    <div className="w-full h-[180px] sm:h-[220px] bg-gradient-to-t from-amber-200/80 to-amber-100/40 rounded-t-2xl border-t border-x border-white shadow-[0_-5px_20px_rgba(251,191,36,0.15)] flex flex-col items-center justify-start pt-4 sm:pt-6 backdrop-blur-md">
                                        <span className="text-5xl sm:text-6xl opacity-30 text-amber-500 font-black tracking-tighter drop-shadow-sm">1</span>
                                    </div>
                                </div>
                            )}

                            {/* Rank 3 (Bronze) */}
                            {top3 && (
                                <div className="flex flex-col items-center flex-1 z-10">
                                    <div className="relative mb-2 sm:mb-3 group">
                                        <div className="absolute inset-0 bg-orange-300 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <img src={`https://github.com/${top3.githubUsername}.png`} alt={top3.name} className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-orange-300 shadow-xl object-cover bg-white" />
                                        <div className="absolute -bottom-2 -right-2 w-5 h-5 sm:w-7 sm:h-7 bg-orange-200 border-2 border-white rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-orange-800 shadow-sm">
                                            #3
                                        </div>
                                    </div>
                                    <h3 className="text-[11px] sm:text-xs font-bold text-slate-800 text-center line-clamp-2 w-full px-1">{top3.name}</h3>
                                    <p className="text-[9px] sm:text-xs text-orange-600 font-semibold mb-2 sm:mb-3">{top3.totalScore} XP</p>
                                    <div className="w-full h-[110px] sm:h-[130px] bg-gradient-to-t from-orange-200 to-orange-100/50 rounded-tr-2xl border-t border-r border-white/50 shadow-inner flex flex-col items-center justify-start pt-3 backdrop-blur-sm">
                                        <span className="text-2xl sm:text-3xl opacity-40 text-orange-400 font-black tracking-tighter drop-shadow-sm">3</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LEADERBOARD LIST */}
                    <div className="bg-white border border-[var(--hw-surface-container-high)] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="px-4 sm:px-6 py-4 bg-[var(--hw-surface-container-lowest)] border-b border-[var(--hw-surface-container-high)] grid grid-cols-12 gap-2 sm:gap-4 items-center">
                            <span className="col-span-2 sm:col-span-1 flex justify-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--hw-outline)]">Rank</span>
                            <span className="col-span-7 sm:col-span-6 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--hw-outline)]">Student</span>
                            <span className="hidden sm:block col-span-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--hw-outline)] text-right">Submissions</span>
                            <span className="col-span-3 sm:col-span-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--hw-outline)] text-right">Total XP</span>
                        </div>
                        
                        <div className="divide-y divide-[var(--hw-surface-container-high)]">
                            {restOfLeaderboard.length > 0 ? restOfLeaderboard.map((student, idx) => {
                                const rank = idx + 4;
                                const isCurrentUser = student.githubUsername.toLowerCase() === user.githubUsername.toLowerCase();
                                
                                return (
                                    <div key={student.githubUsername} className={`px-4 sm:px-6 py-4 grid grid-cols-12 gap-2 sm:gap-4 items-center hover:bg-slate-50 transition-colors ${isCurrentUser ? 'bg-[var(--hw-primary-fixed)]/20' : ''}`}>
                                        <div className="col-span-2 sm:col-span-1 flex justify-center text-xs sm:text-sm font-bold text-[var(--hw-on-surface-variant)]">
                                            #{rank}
                                        </div>
                                        <div className="col-span-7 sm:col-span-6 flex items-center gap-2 sm:gap-3">
                                            <img src={`https://github.com/${student.githubUsername}.png`} alt={student.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-slate-200 object-cover bg-white" />
                                            <div className="min-w-0 flex flex-col justify-center">
                                                <p className={`text-xs sm:text-sm font-semibold truncate ${isCurrentUser ? 'text-[var(--hw-primary)]' : 'text-slate-900'}`}>{student.name}</p>
                                                {isCurrentUser && <p className="text-[9px] sm:text-[10px] text-[var(--hw-primary)] font-medium leading-tight">You</p>}
                                            </div>
                                        </div>
                                        <div className="hidden sm:block col-span-3 text-right">
                                            <p className="text-sm font-medium text-slate-700">{student.submissionCount} <span className="text-xs text-slate-400">({student.onTimeCount} on-time)</span></p>
                                        </div>
                                        <div className="col-span-3 sm:col-span-2 text-right">
                                            <p className="text-xs sm:text-sm font-bold text-slate-900">{student.totalScore}</p>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="p-8 text-center text-[var(--hw-outline)] text-sm">
                                    No more active students found.
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* STICKY USER RANK BANNER (Desktop + Mobile) */}
            {currentUserStats && (
                <div className="fixed bottom-[72px] md:bottom-0 left-0 w-full md:pl-64 z-40 p-3 sm:p-4 pointer-events-none">
                    <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl border border-indigo-100 shadow-[0_-8px_30px_rgba(79,70,229,0.15)] rounded-2xl p-3 sm:p-4 flex flex-row items-center justify-between pointer-events-auto">
                        <div className="flex items-center gap-3 sm:gap-4 shrink-0 overflow-hidden">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-inner shrink-0">
                                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest opacity-80 mb-[-2px]">Rank</span>
                                <span className="text-base sm:text-lg leading-none">#{currentUserRank}</span>
                            </div>
                            <div className="min-w-0 pr-2">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Your Current Rank</h4>
                                <p className="text-[10px] sm:text-xs text-slate-600 font-medium truncate">{currentUserStats.totalScore} XP <span className="hidden sm:inline-block">· {currentUserStats.submissionCount} Submissions</span></p>
                            </div>
                        </div>
                        <div className="text-right flex-1 min-w-0 flex flex-col items-end shrink">
                            {pointsToNextRank && pointsToNextRank > 0 ? (
                                <p className="text-[10px] sm:text-xs font-medium text-amber-600 truncate max-w-full">
                                    <span className="font-bold">{pointsToNextRank} XP</span> to next
                                </p>
                            ) : currentUserRank === 1 ? (
                                <p className="text-[10px] sm:text-xs font-bold text-amber-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px] sm:text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                                    You are #1!
                                </p>
                            ) : null}
                            <div className="h-1.5 w-20 sm:w-32 bg-slate-100 rounded-full mt-1 sm:mt-1.5 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: pointsToNextRank && pointsToNextRank > 0 ? '60%' : '100%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MOBILE BOTTOM NAV (From layout/courses, keeping it exact) ═══ */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[var(--hw-surface-container-lowest)] border-t border-[var(--hw-outline-variant)]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] h-[72px] flex items-center justify-around px-2 z-50">
                <Link href="/dashboard" className="flex flex-col items-center justify-center text-[var(--hw-outline)] gap-1 w-[30%] pb-2">
                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase">Dashboard</span>
                </Link>
                <Link href="/courses" className="flex flex-col items-center justify-center text-[var(--hw-outline)] gap-1 w-[30%] pb-2">
                    <span className="material-symbols-outlined text-[20px]">auto_stories</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase">Courses</span>
                </Link>
                <Link href="/leaderboard" className="flex flex-col items-center justify-center text-[var(--hw-primary)] gap-1 w-[30%] py-2 rounded-xl bg-[var(--hw-primary)]/5">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase text-[var(--hw-primary)]">Leaderboard</span>
                </Link>
            </nav>
        </div>
    );
}
