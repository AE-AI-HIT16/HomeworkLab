import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-[#f7f9fb] font-[Inter,sans-serif] text-[#191c1e] antialiased overflow-x-hidden">
      {/* Global Animated Background Styles */}
      <style>{`
        @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-40px) scale(1.1); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px,30px) scale(0.95); } }
        @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,20px) scale(1.05); } }
        .orb-1 { animation: float1 8s ease-in-out infinite; }
        .orb-2 { animation: float2 10s ease-in-out infinite; }
        .orb-3 { animation: float3 12s ease-in-out infinite; }
        .dot-grid {
          background-image: radial-gradient(circle, #c7c4d7 0.8px, transparent 0.8px);
          background-size: 32px 32px;
        }
      `}</style>
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-[20px]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="text-xl font-bold tracking-tighter text-[#4648d4] font-[Manrope,sans-serif]">HIT - AI/DATA</div>
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-[#4648d4] font-semibold font-[Manrope] text-sm tracking-tight" href="#features">Features</a>
            <a className="text-[#464554] font-medium font-[Manrope] text-sm tracking-tight hover:text-[#4648d4] transition-colors" href="#students">For Students</a>
            <a className="text-[#464554] font-medium font-[Manrope] text-sm tracking-tight hover:text-[#4648d4] transition-colors" href="#instructors">For Instructors</a>
            <Link className="text-[#464554] font-medium font-[Manrope] text-sm tracking-tight hover:text-[#4648d4] transition-colors" href="/courses">Courses</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white text-sm font-semibold hover:scale-[1.02] transition-transform shadow-lg shadow-[#4648d4]/20">
              Get Started
            </Link>
          </div>
        </div>
        <div className="bg-[#c7c4d7]/15 h-px w-full absolute bottom-0" />
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb-1 absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-[#4648d4]/[0.07] blur-[80px]" />
          <div className="orb-2 absolute top-1/2 -left-32 w-[400px] h-[400px] rounded-full bg-[#6063ee]/[0.06] blur-[60px]" />
          <div className="orb-3 absolute bottom-10 right-1/4 w-[300px] h-[300px] rounded-full bg-[#ffdcc5]/30 blur-[70px]" />
          <div className="absolute inset-0 dot-grid opacity-[0.06]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <span className="text-[#4648d4] text-[0.75rem] font-bold tracking-[0.05em] uppercase mb-4 block">Future-Ready Education</span>
            <h1 className="text-[#191c1e] font-[Manrope] text-5xl md:text-7xl font-extrabold tracking-[-0.04em] leading-[1.1] mb-8">
              Modern Learning Hub for <span className="text-[#4648d4]">AI & Data</span> Classes
            </h1>
            <p className="text-[#464554] text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
              A lightweight, structured workspace for students and instructors in data and engineering programs. Built for the era of machine intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white font-semibold hover:scale-[1.02] transition-transform shadow-[0_32px_64px_-12px_rgba(19,20,74,0.06)]">
                Get Started
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl border border-[#c7c4d7]/30 text-[#191c1e] font-semibold hover:bg-[#f2f4f6] transition-colors">
                Request Demo
              </button>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative max-w-6xl mx-auto mt-20">
            <div className="bg-white rounded-2xl shadow-[0_32px_64px_-12px_rgba(19,20,74,0.06)] p-4 md:p-8 border border-[#c7c4d7]/15">
              <div className="flex items-center gap-2 mb-6 px-2">
                <div className="w-3 h-3 rounded-full bg-[#ba1a1a]/20" />
                <div className="w-3 h-3 rounded-full bg-[#bdbefe]" />
                <div className="w-3 h-3 rounded-full bg-[#e0e3e5]" />
                <div className="ml-4 h-6 w-48 bg-[#f2f4f6] rounded-full" />
              </div>
              <Image alt="Dashboard Mockup" className="w-full rounded-xl object-cover shadow-inner" src="/landing/hero-dashboard.jpg" width={1200} height={675} priority />
            </div>

            {/* Floating Element */}
            <div className="absolute -top-12 -right-6 hidden lg:block bg-[#ffdcc5] p-6 rounded-2xl shadow-xl max-w-[240px]">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-[#904900]">bolt</span>
                <span className="font-[Manrope] font-bold text-[#301400]">AI Grading Ready</span>
              </div>
              <p className="text-sm text-[#703700] leading-tight">Instant feedback loops for neural network submissions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-[#f2f4f6] relative">
        <div className="absolute inset-0 dot-grid opacity-[0.04] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <span className="text-[#4648d4] text-[0.75rem] font-bold tracking-[0.05em] uppercase mb-4 block">The Friction</span>
            <h2 className="text-[#191c1e] font-[Manrope] text-3xl md:text-4xl font-bold tracking-tight mb-4">The Chaos of Modern Learning</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "folder_off", title: "Fragmented Drive", desc: "Files buried in deep subfolders, lost between personal and university accounts." },
              { icon: "chat_error", title: "Chat Notifications", desc: "Assignment instructions getting pushed up by endless threads in Slack or Discord." },
              { icon: "schedule_send", title: "Missed Deadlines", desc: "No centralized view of what's due tomorrow across different AI modules." },
            ].map((item) => (
              <div key={item.title} className="bg-white p-10 rounded-2xl border border-[#c7c4d7]/10 hover:border-[#4648d4]/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#ba1a1a]/10 flex items-center justify-center mb-6 text-[#ba1a1a] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <h3 className="font-[Manrope] text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-[#464554] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="py-32 relative overflow-hidden bg-[#f7f9fb]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb-2 absolute top-20 right-10 w-[350px] h-[350px] rounded-full bg-[#e1e0ff]/40 blur-[80px]" />
          <div className="orb-3 absolute bottom-20 left-10 w-[250px] h-[250px] rounded-full bg-[#ffdcc5]/20 blur-[60px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-[#4648d4] text-[0.75rem] font-bold tracking-[0.05em] uppercase mb-4 block">The Solution</span>
            <h2 className="text-[#191c1e] font-[Manrope] text-4xl md:text-5xl font-extrabold tracking-tight mb-8">HIT - AI/DATA: Your Intelligent Learning Canvas</h2>
            <p className="text-[#464554] text-lg leading-relaxed mb-10">
              We&apos;ve eliminated the friction. HIT - AI/DATA provides a unified platform where lessons, submissions, and progress tracking live in perfect harmony. Designed specifically for the high-velocity demands of engineering education.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#4648d4]/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#4648d4] text-sm">check</span>
                </div>
                <div>
                  <span className="font-bold block">Unified Lessons</span>
                  <span className="text-[#464554]">Syncs directly with instructor repositories.</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#4648d4]/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#4648d4] text-sm">check</span>
                </div>
                <div>
                  <span className="font-bold block">Smart Submissions</span>
                  <span className="text-[#464554]">GitHub-native workflow with automated status checks.</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(19,20,74,0.06)]">
              <Image alt="Coding Interface" className="w-full h-full object-cover" src="/landing/coding-screen.jpg" width={600} height={600} />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-2xl shadow-2xl border border-[#c7c4d7]/15 max-w-xs">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#bdbefe] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#4648d4]">analytics</span>
                </div>
                <div>
                  <div className="text-xs text-[#464554] font-semibold">WEEKLY PROGRESS</div>
                  <div className="text-xl font-bold">92% Complete</div>
                </div>
              </div>
              <div className="w-full bg-[#eceef0] h-2 rounded-full">
                <div className="bg-[#4648d4] h-full w-[92%] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Style */}
      <section id="students" className="py-24 bg-[#f2f4f6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-[#191c1e] font-[Manrope] text-4xl font-bold mb-4">Tailored for the Classroom</h2>
            <p className="text-[#464554] max-w-2xl mx-auto">Different views for different needs. One powerful engine underneath.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:h-[600px]">
            <div className="md:col-span-7 bg-white rounded-2xl p-10 border border-[#c7c4d7]/10 flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-[#4648d4]/10 text-[#4648d4] text-xs font-bold mb-6">FOR STUDENTS</span>
                <h3 className="text-3xl font-[Manrope] font-bold mb-4">A dashboard that understands you.</h3>
                <p className="text-[#464554] max-w-md">Track deadlines with millisecond precision, submit via GitHub, and manage large datasets without leaving the app.</p>
              </div>
              <div className="mt-8 transform group-hover:translate-y-[-10px] transition-transform duration-500">
                <Image alt="Student Workspace" className="rounded-xl shadow-lg border border-[#c7c4d7]/10" src="/landing/student-workspace.jpg" width={800} height={450} />
              </div>
            </div>
            <div id="instructors" className="md:col-span-5 bg-[#6063ee] rounded-2xl p-10 flex flex-col justify-between text-white overflow-hidden group">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-6">FOR INSTRUCTORS</span>
                <h3 className="text-3xl font-[Manrope] font-bold mb-4">Control at scale.</h3>
                <p className="text-white/80">Automated alerts for missing submissions and one-click grading integration with Google Drive.</p>
              </div>
              <div className="mt-8 flex justify-center transform group-hover:scale-110 transition-transform duration-500">
                <div className="bg-white/10 p-6 rounded-full backdrop-blur-md border border-white/20">
                  <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Tracks */}
      <section className="py-24 bg-[#f7f9fb] relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb-1 absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-[#4648d4]/[0.04] blur-[80px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 flex justify-between items-end">
            <div>
              <h2 className="text-[#191c1e] font-[Manrope] text-3xl font-bold mb-2">Academic Tracks</h2>
              <p className="text-[#464554]">Available pre-configured environments for your program.</p>
            </div>
            <Link href="/courses" className="hidden md:block text-[#4648d4] font-bold hover:underline underline-offset-4 transition-all">View all tracks →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { img: "/landing/ai-track.jpg", title: "AI Core", desc: "Fundamental architectures and mathematics for deep learning foundations.", modules: 12, slug: "ai-core" },
              { img: "/landing/ml-engineer.jpg", title: "AI/ML Engineer", desc: "Production-ready ML pipelines, model deployment, and MLOps workflows.", modules: 24, slug: "ai-ml-engineer" },
              { img: "/landing/data-engineer.jpg", title: "Data Engineer", desc: "Scaling data storage, processing pipelines, and architecture for big data systems.", modules: 18, slug: "data-engineer" },
            ].map((course) => (
              <Link href={`/courses/${course.slug}`} key={course.slug} className="bg-[#f2f4f6] p-2 rounded-2xl hover:scale-[1.02] transition-transform block">
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-6 relative">
                  <Image alt={course.title} className="object-cover" src={course.img} fill sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="px-6 pb-8">
                  <h4 className="font-[Manrope] text-xl font-bold mb-2">{course.title}</h4>
                  <p className="text-[#464554] text-sm mb-6">{course.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#767586]">{course.modules} MODULES</span>
                    <span className="material-symbols-outlined text-[#4648d4]">arrow_forward</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 relative" style={{ background: "linear-gradient(135deg, #eceef0 0%, #e6e8ea 50%, #eceef0 100%)" }}>
        <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-[#4648d4] text-[0.75rem] font-bold tracking-[0.05em] uppercase mb-4 block">The Workflow</span>
            <h2 className="text-[#191c1e] font-[Manrope] text-4xl font-bold">From Thought to Submission</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-[#c7c4d7]/30 -z-0" />
            {[
              { icon: "edit_note", title: "Create", desc: "Instructors define tasks and provision necessary compute or data links." },
              { icon: "publish", title: "Submit", desc: "Students sync their work via GitHub or direct file upload to specific lessons." },
              { icon: "verified_user", title: "Review", desc: "Automated checks and manual feedback loops finalize the learning cycle." },
            ].map((step) => (
              <div key={step.title} className="relative z-10 bg-white p-8 rounded-2xl border border-[#c7c4d7]/20 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#e1e0ff] flex items-center justify-center mb-6 border-4 border-[#eceef0]">
                  <span className="material-symbols-outlined text-[#4648d4] font-bold">{step.icon}</span>
                </div>
                <h5 className="text-xl font-[Manrope] font-bold mb-4">{step.title}</h5>
                <p className="text-[#464554] text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#f7f9fb]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all mb-24">
            {["TECHLEARN", "DATA ACADEMY", "ENGINEER.IO", "CODELAB"].map((brand) => (
              <span key={brand} className="font-[Manrope] font-extrabold text-2xl tracking-tighter">{brand}</span>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#f2f4f6] p-12 rounded-2xl border-l-4 border-[#4648d4]">
              <p className="text-xl font-medium italic mb-8">&ldquo;HIT - AI/DATA has cut our administrative time by 40%. Our students finally have a single source of truth for their AI projects.&rdquo;</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image alt="Dr. Marcus Chen" className="object-cover" src="/landing/mentor-male.jpg" width={48} height={48} />
                </div>
                <div>
                  <div className="font-bold">Dr. Marcus Chen</div>
                  <div className="text-sm text-[#464554]">Director of AI at TechLearn</div>
                </div>
              </div>
            </div>
            <div className="bg-[#f2f4f6] p-12 rounded-2xl border-l-4 border-[#4648d4] mt-8 md:mt-16">
              <p className="text-xl font-medium italic mb-8">&ldquo;The GitHub integration is a game-changer. No more hunting for repository links in Discord threads.&rdquo;</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image alt="Sarah Jenkins" className="object-cover" src="/landing/mentor-female.jpg" width={48} height={48} />
                </div>
                <div>
                  <div className="font-bold">Sarah Jenkins</div>
                  <div className="text-sm text-[#464554]">Senior ML Instructor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#4648d4] p-12 md:p-24 rounded-[3rem] text-center text-white relative overflow-hidden shadow-[0_32px_64px_-12px_rgba(19,20,74,0.06)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6063ee]/30 rounded-full blur-3xl -ml-20 -mb-20" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-[Manrope] font-extrabold mb-6">Start Your HIT - AI/DATA Journey</h2>
              <p className="text-white/80 text-lg mb-10">Join over 5,000 students and instructors building the future of intelligence.</p>
              <Link href="/login" className="inline-block px-10 py-5 rounded-2xl bg-white text-[#4648d4] font-bold text-lg hover:scale-[1.05] transition-transform shadow-xl">
                Join Your Learning Space
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f2f4f6] w-full border-t border-[#c7c4d7]/15">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="text-lg font-bold text-[#4648d4] mb-6">HIT - AI/DATA</div>
              <p className="text-[#464554] text-sm leading-relaxed mb-6">Built for the modern mind. Empowering the next generation of AI and Data Engineers.</p>
            </div>
            <div>
              <h6 className="font-[Manrope] font-bold text-[#191c1e] mb-6">Platform</h6>
              <ul className="space-y-4">
                <li><a className="text-sm text-[#464554] hover:text-[#4648d4] hover:underline underline-offset-4" href="#features">Features</a></li>
                <li><Link className="text-sm text-[#464554] hover:text-[#4648d4] hover:underline underline-offset-4" href="/courses">Courses</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="font-[Manrope] font-bold text-[#191c1e] mb-6">Company</h6>
              <ul className="space-y-4">
                <li><a className="text-sm text-[#464554] hover:text-[#4648d4] hover:underline underline-offset-4" href="#">About</a></li>
                <li><a className="text-sm text-[#464554] hover:text-[#4648d4] hover:underline underline-offset-4" href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-[Manrope] font-bold text-[#191c1e] mb-6">Legal</h6>
              <ul className="space-y-4">
                <li><a className="text-sm text-[#464554] hover:text-[#4648d4] hover:underline underline-offset-4" href="#">Privacy</a></li>
                <li><a className="text-sm text-[#464554] hover:text-[#4648d4] hover:underline underline-offset-4" href="#">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[#c7c4d7]/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[#464554] text-sm">© 2025 HIT - AI/DATA. Built for the modern mind.</div>
            <div className="flex gap-6">
              <span className="material-symbols-outlined text-[#464554] cursor-pointer hover:text-[#4648d4]">language</span>
              <span className="material-symbols-outlined text-[#464554] cursor-pointer hover:text-[#4648d4]">terminal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
