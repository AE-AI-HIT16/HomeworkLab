import { requireSession } from "@/lib/auth";
import { getCurrentUserRoleWithContext, getManagedCourseIdsForUser } from "@/lib/roles";
import { getStudents, getSubmissions } from "@/lib/google-sheets";
import { TopNav } from "@/components/TopNav";
import { StudentSidebar } from "@/components/StudentSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
    const session = await requireSession();
    const user = session.user;

    const studentsPromise = getStudents();
    const submissionsPromise = getSubmissions();

    const allStudents = await studentsPromise;
    const { role } = await getCurrentUserRoleWithContext({ session, students: allStudents });
    const activeStudents = allStudents.filter(s => s.active && s.role !== "guest");
    const [allSubmissions, managedCourseIds] = await Promise.all([
        submissionsPromise,
        getManagedCourseIdsForUser(session.user.githubUsername, role),
    ]);
    const allowedCourseIds = new Set(managedCourseIds);
    const scopedSubmissions =
        role === "teacher"
            ? allSubmissions.filter((s) => allowedCourseIds.has(s.courseId))
            : allSubmissions;

    // Aggregate once by username: O(students + submissions)
    const submissionStats = new Map<string, { totalScore: number; onTimeCount: number; submissionCount: number }>();
    for (const sub of scopedSubmissions) {
        const username = sub.githubUsername.toLowerCase();
        const existing = submissionStats.get(username) ?? { totalScore: 0, onTimeCount: 0, submissionCount: 0 };

        existing.submissionCount += 1;
        if (!sub.isLate) existing.onTimeCount += 1;
        if (sub.grade !== undefined) existing.totalScore += sub.grade;

        submissionStats.set(username, existing);
    }

    const rawLeaderboard = activeStudents.map((student) => {
        const stats = submissionStats.get(student.githubUsername.toLowerCase());
        return {
            ...student,
            totalScore: stats?.totalScore ?? 0,
            onTimeCount: stats?.onTimeCount ?? 0,
            submissionCount: stats?.submissionCount ?? 0,
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
                <main className="ml-0 md:ml-64 w-full min-w-0 min-h-0 p-4 sm:p-6 md:p-8 min-h-[calc(100vh-64px)] xl:h-[calc(100vh-64px)] xl:overflow-hidden bg-[var(--hw-surface)] pb-32 xl:pb-8 flex flex-col">
                    <header className="mb-6 xl:mb-8 text-center md:text-left shrink-0">
                        <h1 className="text-3xl font-bold tracking-tight text-[var(--hw-on-surface)] mb-2 flex items-center justify-center md:justify-start gap-2">
                            <span className="material-symbols-outlined text-[32px] text-[var(--hw-primary)]">emoji_events</span>
                            Global Leaderboard
                        </h1>
                        <p className="text-[var(--hw-on-surface-variant)] text-sm">
                            Earn XP by submitting your assignments and competing with peers!
                        </p>
                    </header>

                    <div className="flex flex-col xl:flex-row gap-8 xl:gap-8 items-start flex-1 min-h-0 overflow-hidden">
                        {/* ═══ LEFT COLUMN: PODIUM ═══ */}
                        <div className="w-full xl:w-5/12 shrink-0 flex flex-col xl:h-full">
                            <div className="bg-transparent xl:bg-white/60 backdrop-blur-2xl xl:border border-[var(--hw-surface-container-high)] xl:rounded-[2rem] xl:shadow-[0_4px_30px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-full w-full relative">
                                {/* Decorative Background inside card */}
                                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-[var(--hw-primary-fixed)]/5 to-transparent border-t-[8px] border-amber-400/20 xl:block hidden" />
                                
                                <div className="relative z-10 p-8 flex-col items-center justify-center flex-1 hidden xl:flex">
                                    <div className="w-16 h-16 bg-gradient-to-tr from-amber-100 to-orange-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-white">
                                        <span className="material-symbols-outlined text-[32px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>social_leaderboard</span>
                                    </div>
                                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 mb-2">Hall of Fame</h2>
                                    <p className="text-sm text-slate-500 text-center max-w-[280px] font-medium leading-relaxed mb-8">Top 3 performers of the active session. Submit assignments early to climb the ranks!</p>
                                </div>

                                {/* Podium Container */}
                                <div className="flex flex-col items-center justify-end relative w-full mt-auto xl:px-6">
                                    <div className="flex items-end justify-center w-full relative z-10 px-2 sm:px-4 gap-2 sm:gap-4 xl:gap-6 max-w-2xl mx-auto">
                                        {/* Rank 2 (Silver) */}
                                        {top2 && (
                                            <div className="flex flex-col items-center flex-1 z-20">
                                                <div className="relative mb-3 sm:mb-4 group">
                                                    <div className="absolute inset-0 bg-slate-300 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                                                    <Image src={`https://github.com/${top2.githubUsername}.png`} alt={top2.name} width={96} height={96} priority className="relative w-16 h-16 sm:w-20 sm:h-20 xl:w-24 xl:h-24 rounded-full border-4 xl:border-[6px] border-slate-200 shadow-xl object-cover bg-white" />
                                                    <div className="absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 xl:w-9 xl:h-9 bg-gradient-to-br from-slate-100 to-slate-300 border-2 xl:border-[3px] border-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black text-slate-700 shadow-sm">
                                                        #2
                                                    </div>
                                                </div>
                                                <h3 className="text-xs sm:text-sm xl:text-base font-bold text-slate-800 text-center line-clamp-2 w-full px-1">{top2.name}</h3>
                                                <p className="text-[10px] sm:text-xs xl:text-[13px] text-slate-500 font-bold mb-3 sm:mb-4">{top2.totalScore} XP</p>
                                                <div className="w-full h-[140px] sm:h-[180px] xl:h-[220px] bg-gradient-to-t from-slate-200 to-slate-50 rounded-t-2xl xl:rounded-t-[2rem] border-t border-x border-white shadow-[0_-5px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-start pt-4 sm:pt-6 backdrop-blur-sm">
                                                    <span className="text-4xl sm:text-5xl xl:text-6xl opacity-30 text-slate-400 font-black tracking-tighter drop-shadow-sm">2</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Rank 1 (Gold) */}
                                        {top1 && (
                                            <div className="flex flex-col items-center flex-[1.2] sm:flex-[1.3] z-30 shadow-[0_-10px_40px_rgba(251,191,36,0.1)] rounded-t-2xl xl:rounded-t-[2.5rem] relative">
                                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[200%] h-[200%] bg-amber-400/20 blur-3xl rounded-t-full opacity-0 xl:opacity-100 pointer-events-none" />
                                                <div className="relative mb-3 sm:mb-4 group pt-4 xl:pt-6">
                                                    <div className="absolute -top-4 xl:-top-6 left-1/2 -translate-x-1/2 w-10 sm:w-12 xl:w-14 animate-bounce text-amber-400 drop-shadow-md z-10 flex justify-center">
                                                        <span className="material-symbols-outlined text-[36px] xl:text-[42px]" style={{ fontVariationSettings: "'FILL' 1" }}>crown</span>
                                                    </div>
                                                    <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
                                                    <Image src={`https://github.com/${top1.githubUsername}.png`} alt={top1.name} width={112} height={112} priority className="relative w-20 h-20 sm:w-24 sm:h-24 xl:w-28 xl:h-28 rounded-full border-4 xl:border-[6px] border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.4)] object-cover bg-white" />
                                                </div>
                                                <h3 className="text-sm sm:text-base xl:text-lg font-black text-slate-900 text-center line-clamp-2 w-full px-1 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-500 tracking-tight">{top1.name}</h3>
                                                <p className="text-[10px] sm:text-sm xl:text-[15px] text-amber-600 font-black mb-3 sm:mb-4">{top1.totalScore} XP</p>
                                                <div className="w-full h-[180px] sm:h-[240px] xl:h-[300px] bg-gradient-to-t from-amber-200/90 to-amber-50 rounded-t-2xl xl:rounded-t-[2.5rem] border-t-2 border-x border-white shadow-inner flex flex-col items-center justify-start pt-6 sm:pt-8 backdrop-blur-md relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-pixels.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                                                    <span className="text-6xl sm:text-7xl xl:text-8xl opacity-30 text-amber-600 font-black tracking-tighter drop-shadow-md relative z-10">1</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Rank 3 (Bronze) */}
                                        {top3 && (
                                            <div className="flex flex-col items-center flex-1 z-10">
                                                <div className="relative mb-3 sm:mb-4 group">
                                                    <div className="absolute inset-0 bg-orange-300 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                                                    <Image src={`https://github.com/${top3.githubUsername}.png`} alt={top3.name} width={80} height={80} priority className="relative w-14 h-14 sm:w-16 sm:h-16 xl:w-20 xl:h-20 rounded-full border-4 xl:border-[6px] border-orange-200 shadow-xl object-cover bg-white" />
                                                    <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 bg-gradient-to-br from-orange-100 to-orange-300 border-2 xl:border-[3px] border-white rounded-full flex items-center justify-center text-[9px] sm:text-[10px] xl:text-[11px] font-black text-orange-800 shadow-sm">
                                                        #3
                                                    </div>
                                                </div>
                                                <h3 className="text-[11px] sm:text-xs xl:text-sm font-bold text-slate-800 text-center line-clamp-2 w-full px-1">{top3.name}</h3>
                                                <p className="text-[9px] sm:text-xs xl:text-xs text-orange-600 font-bold mb-3 sm:mb-4">{top3.totalScore} XP</p>
                                                <div className="w-full h-[110px] sm:h-[140px] xl:h-[180px] bg-gradient-to-t from-orange-200 to-orange-50 rounded-t-2xl xl:rounded-t-[2rem] border-t border-x border-white shadow-[0_-5px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-start pt-4 sm:pt-5 backdrop-blur-sm">
                                                    <span className="text-3xl sm:text-4xl xl:text-5xl opacity-40 text-orange-500 font-black tracking-tighter drop-shadow-sm">3</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ═══ RIGHT COLUMN: LEADERBOARD LIST ═══ */}
                        <div className="w-full xl:w-7/12 xl:h-full">
                            <div className="bg-white border border-[var(--hw-surface-container-high)] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-[500px] xl:h-full">
                                <div className="px-4 sm:px-6 py-4 bg-[var(--hw-surface-container-lowest)] border-b border-[var(--hw-surface-container-high)] grid grid-cols-12 gap-2 sm:gap-4 items-center shrink-0">
                                    <span className="col-span-2 sm:col-span-1 flex justify-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--hw-outline)]">Rank</span>
                                    <span className="col-span-7 sm:col-span-6 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--hw-outline)]">Student</span>
                                    <span className="hidden sm:block col-span-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--hw-outline)] text-right">Submissions</span>
                                    <span className="col-span-3 sm:col-span-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--hw-outline)] text-right">Total XP</span>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto divide-y divide-[var(--hw-surface-container-high)] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                    {restOfLeaderboard.length > 0 ? restOfLeaderboard.map((student, idx) => {
                                        const rank = idx + 4;
                                        const isCurrentUser = student.githubUsername.toLowerCase() === user.githubUsername.toLowerCase();
                                        
                                        return (
                                            <div key={student.githubUsername} className={`px-4 sm:px-6 py-4 grid grid-cols-12 gap-2 sm:gap-4 items-center hover:bg-slate-50 transition-colors ${isCurrentUser ? 'bg-[var(--hw-primary-fixed)]/20' : ''}`}>
                                                <div className="col-span-2 sm:col-span-1 flex justify-center text-xs sm:text-sm font-bold text-[var(--hw-on-surface-variant)]">
                                                    #{rank}
                                                </div>
                                                <div className="col-span-7 sm:col-span-6 flex items-center gap-2 sm:gap-3">
                                                    <Image src={`https://github.com/${student.githubUsername}.png`} alt={student.name} width={32} height={32} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-slate-200 object-cover bg-white" />
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

                                {/* EMBEDDED USER RANK BANNER */}
                                {currentUserStats && (
                                    <div className="bg-slate-50/80 backdrop-blur-md border-t border-[var(--hw-surface-container-high)] p-4 shrink-0 flex flex-row items-center justify-between">
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
                                            <div className="h-1.5 w-20 sm:w-32 bg-slate-200 rounded-full mt-1 sm:mt-1.5 overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: pointsToNextRank && pointsToNextRank > 0 ? '60%' : '100%' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <MobileBottomNav variant="student" />
        </div>
    );
}
