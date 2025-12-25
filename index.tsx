
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Users, 
  PlusCircle, 
  History, 
  Trash2, 
  MinusCircle, 
  Plus, 
  Search, 
  UserPlus, 
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Phone,
  Calendar,
  BookOpen,
  Star,
  MessageSquare,
  Award,
  X,
  MessageCircle,
  AlertTriangle,
  BellRing,
  ArrowUpRight,
  Image as ImageIcon,
  Download,
  UploadCloud,
  CheckCircle2,
  Circle,
  Clock,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Smile
} from 'lucide-react';

// --- 常量定义 ---
const LOW_BALANCE_THRESHOLD = 5;

// --- 类型定义 ---

interface LessonLog {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  type: 'consume' | 'refill';
  date: number;
  note: string;
}

interface Review {
  id: string;
  studentId: string;
  studentName: string;
  content: string;
  rating: number;
  date: number;
}

interface ArchiveImage {
  id: string;
  studentId: string;
  url: string; // 本地存储演示使用 Base64
  name: string;
  date: number;
}

interface Student {
  id: string;
  name: string;
  phone: string;
  remainingLessons: number;
  totalLessons: number;
  joinDate: number;
}

// --- 1:1 复刻品牌 Logo 组件 ---

const AppLogo = ({ showText = true, size = "md", className = "" }: { showText?: boolean, size?: "sm" | "md" | "lg", className?: string }) => {
  const smileySize = size === "lg" ? 100 : size === "md" ? 44 : 32;
  
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* 1:1 复刻笑脸图形 */}
      <svg 
        width={smileySize} 
        height={smileySize} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        <circle cx="50" cy="50" r="48" fill="#FACC15" stroke="black" strokeWidth="3"/>
        {/* 椭圆眼睛 */}
        <ellipse cx="36" cy="40" rx="3.5" ry="7" fill="black"/>
        <ellipse cx="64" cy="40" rx="3.5" ry="7" fill="black"/>
        {/* 经典的带弧度笑脸嘴巴，含小酒窝末端 */}
        <path 
          d="M28 60C32 72 68 72 72 60" 
          stroke="black" 
          strokeWidth="4" 
          strokeLinecap="round"
        />
        {/* 左酒窝细节 */}
        <path d="M25 58C26 58 29 60 29 62" stroke="black" strokeWidth="4" strokeLinecap="round"/>
        {/* 右酒窝细节 */}
        <path d="M75 58C74 58 71 60 71 62" stroke="black" strokeWidth="4" strokeLinecap="round"/>
      </svg>
      
      {showText && (
        <div className="flex flex-col items-center leading-none mt-1">
          <span className={`font-black text-slate-900 tracking-tight ${size === "lg" ? "text-4xl" : "text-xl"}`}>乐贝色彩</span>
          <span className={`font-bold text-slate-900 tracking-[0.3em] uppercase ${size === "lg" ? "text-sm mt-1" : "text-[8px] mt-0.5"}`}>SMILEY ART</span>
        </div>
      )}
    </div>
  );
};

// --- 应用程序主组件 ---

const App = () => {
  // 身份验证状态
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('edu_auth') === 'true';
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('edu_students');
    return saved ? JSON.parse(saved) : [];
  });

  const [logs, setLogs] = useState<LessonLog[]>(() => {
    const saved = localStorage.getItem('edu_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('edu_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [archives, setArchives] = useState<ArchiveImage[]>(() => {
    const saved = localStorage.getItem('edu_archives');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'history'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [reviewingStudent, setReviewingStudent] = useState<Student | null>(null);
  const [archivingStudent, setArchivingStudent] = useState<Student | null>(null);

  // 与本地存储同步
  useEffect(() => {
    localStorage.setItem('edu_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('edu_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('edu_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('edu_archives', JSON.stringify(archives));
  }, [archives]);

  // 登出处理
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      sessionStorage.removeItem('edu_auth');
      setIsAuthenticated(false);
    }
  };

  // 学员操作
  const addStudent = (name: string, phone: string, initialLessons: number) => {
    const newStudent: Student = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      phone,
      remainingLessons: initialLessons,
      totalLessons: initialLessons,
      joinDate: Date.now(),
    };
    setStudents([...students, newStudent]);
    setIsAddingStudent(false);
  };

  const deleteStudent = (id: string) => {
    if (confirm('确定要删除该学员吗？此操作不可撤销。')) {
      setStudents(students.filter(s => s.id !== id));
      setLogs(logs.filter(l => l.studentId !== id));
      setReviews(reviews.filter(r => r.studentId !== id));
      setArchives(archives.filter(a => a.studentId !== id));
    }
  };

  const addReview = (studentId: string, studentName: string, content: string, rating: number) => {
    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      studentId,
      studentName,
      content,
      rating,
      date: Date.now(),
    };
    setReviews([newReview, ...reviews]);
  };

  const addArchiveImages = (studentId: string, imageFiles: File[]) => {
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newImg: ArchiveImage = {
          id: Math.random().toString(36).substr(2, 9),
          studentId,
          url: base64,
          name: file.name,
          date: Date.now(),
        };
        setArchives(prev => [newImg, ...prev]);
      };
      reader.readAsDataURL(file);
    });
  };

  const deleteArchiveImages = (imageIds: string[]) => {
    setArchives(prev => prev.filter(img => !imageIds.includes(img.id)));
  };

  const handleLessonChange = (studentId: string, amount: number, type: 'consume' | 'refill', note: string = '') => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    if (type === 'consume' && student.remainingLessons < Math.abs(amount)) {
      alert('剩余课时不足！');
      return;
    }

    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          remainingLessons: s.remainingLessons + amount,
          totalLessons: type === 'refill' ? s.totalLessons + amount : s.totalLessons
        };
      }
      return s;
    });

    const newLog: LessonLog = {
      id: Math.random().toString(36).substr(2, 9),
      studentId,
      studentName: student.name,
      amount: Math.abs(amount),
      type,
      date: Date.now(),
      note: note || (type === 'consume' ? '课时核销' : '课时充值'),
    };

    setStudents(updatedStudents);
    setLogs([newLog, ...logs]);
  };

  // 过滤后的学员数据
  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.includes(searchTerm) || s.phone.includes(searchTerm)
    );
  }, [students, searchTerm]);

  // 课时余额不足的学员
  const lowBalanceStudents = useMemo(() => {
    return students.filter(s => s.remainingLessons < LOW_BALANCE_THRESHOLD);
  }, [students]);

  // 数据统计
  const stats = useMemo(() => ({
    totalStudents: students.length,
    totalRemaining: students.reduce((acc, s) => acc + s.remainingLessons, 0),
    todayConsumptions: logs.filter(l => 
      l.type === 'consume' && 
      new Date(l.date).toDateString() === new Date().toDateString()
    ).length,
    lowBalanceCount: lowBalanceStudents.length,
  }), [students, logs, lowBalanceStudents]);

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64 flex flex-col bg-slate-50 animate-in fade-in duration-500">
      
      {/* --- 侧边栏 (桌面端) --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 p-6 overflow-y-auto">
        <div className="mb-10 px-2">
          <AppLogo className="items-start" />
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <NavItem 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutDashboard size={20} />} 
            label="管理看板" 
          />
          <NavItem 
            active={activeTab === 'students'} 
            onClick={() => setActiveTab('students')} 
            icon={<Users size={20} />} 
            label="学员管理" 
            badge={stats.lowBalanceCount > 0 ? stats.lowBalanceCount : undefined}
          />
          <NavItem 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={<History size={20} />} 
            label="收支明细" 
          />
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-8 flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition font-medium border border-transparent hover:border-red-100"
        >
          <LogOut size={20} />
          <span>退出系统</span>
        </button>
      </aside>

      {/* --- 底部导航 (移动端) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50">
        <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={24} />} label="首页" />
        <MobileNavItem 
          active={activeTab === 'students'} 
          onClick={() => setActiveTab('students')} 
          icon={<Users size={24} />} 
          label="学员" 
          badge={stats.lowBalanceCount > 0 ? stats.lowBalanceCount : undefined}
        />
        <MobileNavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={24} />} label="明细" />
        <MobileNavItem active={false} onClick={handleLogout} icon={<LogOut size={24} />} label="退出" />
      </nav>

      {/* --- 主要内容区 --- */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">管理看板</h2>
                <p className="text-slate-500 text-sm">你好，管理员！今天也要开心哦</p>
              </div>
              <button 
                onClick={() => setIsAddingStudent(true)}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-black transition shadow-md shadow-slate-200"
              >
                <UserPlus size={18} />
                <span>新增学员</span>
              </button>
            </header>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Users className="text-blue-600" />} label="总学员" value={stats.totalStudents} color="blue" />
              <StatCard icon={<BookOpen className="text-emerald-600" />} label="剩余总课时" value={stats.totalRemaining} color="emerald" />
              <StatCard icon={<History className="text-orange-600" />} label="今日消课" value={stats.todayConsumptions} color="orange" />
              <StatCard 
                icon={<BellRing className={stats.lowBalanceCount > 0 ? "text-red-600 animate-pulse" : "text-slate-400"} />} 
                label="续费预警" 
                value={stats.lowBalanceCount} 
                color={stats.lowBalanceCount > 0 ? "red" : "slate"} 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 待续费名单 */}
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 ring-1 ring-red-50">
                <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={20} /> 待续费名单
                </h3>
                <div className="space-y-3">
                  {lowBalanceStudents.map(student => (
                    <div 
                      key={student.id} 
                      className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 transition cursor-pointer group"
                      onClick={() => {
                        setSearchTerm(student.name);
                        setActiveTab('students');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">{student.name}</p>
                          <p className="text-xs text-red-600">仅剩 {student.remainingLessons} 课时</p>
                        </div>
                      </div>
                      <ArrowUpRight size={18} className="text-red-400 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  ))}
                  {lowBalanceStudents.length === 0 && (
                    <div className="text-center py-10 text-slate-400">
                      <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500">
                        <Award size={24} />
                      </div>
                      <p className="text-sm">课时充裕，暂无预警</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 最近记录 */}
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                  <History className="text-blue-500" size={20} /> 最近交易记录
                </h3>
                <div className="space-y-3">
                  {logs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${log.type === 'consume' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {log.type === 'consume' ? <MinusCircle size={18} /> : <PlusCircle size={18} />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">{log.studentName}</p>
                          <p className="text-xs text-slate-400">{new Date(log.date).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${log.type === 'consume' ? 'text-red-500' : 'text-green-500'}`}>
                        {log.type === 'consume' ? '-' : '+'}{log.amount} 课时
                      </span>
                    </div>
                  ))}
                  {logs.length === 0 && <p className="text-center py-10 text-slate-400">暂无历史记录</p>}
                </div>
              </div>

              {/* 最新点评 */}
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                  <Award className="text-amber-500" size={20} /> 最新学员点评
                </h3>
                <div className="space-y-3">
                  {reviews.slice(0, 5).map(review => (
                    <div key={review.id} className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-700">{review.studentName}</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{review.content}</p>
                      <p className="text-[10px] text-slate-400 mt-2 text-right">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <div className="text-center py-10 text-slate-400">
                      <MessageCircle size={32} className="mx-auto mb-2 opacity-20" />
                      <p>还没有收到评价</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-800">学员列表</h2>
                {stats.lowBalanceCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full animate-pulse font-bold">
                    {stats.lowBalanceCount} 人待续费
                  </span>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="搜索姓名或手机号..."
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map(student => {
                const isLowBalance = student.remainingLessons < LOW_BALANCE_THRESHOLD;
                const studentArchiveCount = archives.filter(a => a.studentId === student.id).length;
                
                return (
                  <div key={student.id} className={`bg-white p-5 rounded-2xl shadow-sm border transition group relative overflow-hidden ${
                    isLowBalance ? 'border-red-200 ring-1 ring-red-50 shadow-red-50' : 'border-slate-100'
                  } hover:shadow-md`}>
                    
                    {isLowBalance && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-[10px] font-bold rounded-bl-xl flex items-center gap-1 animate-pulse z-10">
                        <AlertTriangle size={10} /> 课时不足
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          {student.name}
                        </h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Phone size={12} /> {student.phone}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setArchivingStudent(student)}
                          className="text-slate-300 hover:text-blue-500 p-1 transition relative"
                          title="成长档案"
                        >
                          <ImageIcon size={18} />
                          {studentArchiveCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[8px] rounded-full flex items-center justify-center border-2 border-white">
                              {studentArchiveCount}
                            </span>
                          )}
                        </button>
                        <button 
                          onClick={() => setReviewingStudent(student)}
                          className="text-slate-300 hover:text-amber-500 p-1 transition"
                          title="点评学员"
                        >
                          <Award size={18} />
                        </button>
                        <button 
                          onClick={() => deleteStudent(student.id)}
                          className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-500">剩余课时</span>
                        <span className={`font-bold ${isLowBalance ? 'text-red-600' : 'text-blue-600'}`}>
                          {student.remainingLessons} / {student.totalLessons}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isLowBalance ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(100, (student.remainingLessons / student.totalLessons) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleLessonChange(student.id, -1, 'consume')}
                        className={`flex items-center justify-center gap-2 py-2 rounded-xl font-medium transition active:scale-95 ${
                          isLowBalance ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        <MinusCircle size={16} /> 消课
                      </button>
                      <button 
                        onClick={() => {
                          const amount = parseInt(prompt('请输入充值课时数', '20') || '0');
                          if (amount > 0) handleLessonChange(student.id, amount, 'refill');
                        }}
                        className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-medium transition active:scale-95"
                      >
                        <Plus size={16} /> 充值
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredStudents.length === 0 && (
                <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                  <Users size={48} className="mb-2 opacity-20" />
                  <p>没有找到相关学员</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <header>
              <h2 className="text-2xl font-bold text-slate-800">收支明细</h2>
              <p className="text-slate-500 text-sm">记录每一笔课时的流向</p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">学员</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">类型</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">变动数量</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">操作时间</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-800">{log.studentName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.type === 'consume' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                          }`}>
                            {log.type === 'consume' ? '核销' : '充值'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {log.type === 'consume' ? '-' : '+'}{log.amount}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(log.date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {log.note}
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                          暂无收支记录
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- 弹窗组件 --- */}
      {isAddingStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6">新增学员</h3>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addStudent(
                  formData.get('name') as string,
                  formData.get('phone') as string,
                  parseInt(formData.get('lessons') as string)
                );
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">学员姓名</label>
                <input required name="name" type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">联系电话</label>
                <input required name="phone" type="tel" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">初始课时</label>
                <input required name="lessons" type="number" defaultValue="20" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddingStudent(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-black shadow-lg shadow-slate-200"
                >
                  确认添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 评价弹窗 */}
      {reviewingStudent && (
        <ReviewModal 
          student={reviewingStudent} 
          reviews={reviews.filter(r => r.studentId === reviewingStudent.id)}
          onClose={() => setReviewingStudent(null)}
          onAddReview={addReview}
        />
      )}

      {/* 成长档案弹窗 */}
      {archivingStudent && (
        <ArchiveModal 
          student={archivingStudent}
          images={archives.filter(a => a.studentId === archivingStudent.id)}
          onClose={() => setArchivingStudent(null)}
          onUpload={addArchiveImages}
          onDelete={deleteArchiveImages}
        />
      )}
    </div>
  );
};

// --- 登录页面组件 ---

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSettingInitial, setIsSettingInitial] = useState(() => !localStorage.getItem('edu_admin_password'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSettingInitial) {
      if (password.length < 6) {
        alert('密码长度至少需要6位');
        return;
      }
      localStorage.setItem('edu_admin_password', password);
      sessionStorage.setItem('edu_auth', 'true');
      onLogin();
    } else {
      const savedPassword = localStorage.getItem('edu_admin_password');
      if (password === savedPassword) {
        sessionStorage.setItem('edu_auth', 'true');
        onLogin();
      } else {
        setError(true);
        setTimeout(() => setError(false), 500);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 relative overflow-hidden">
      {/* 动态背景图案 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.02]">
        <div className="grid grid-cols-12 gap-4">
          {[...Array(144)].map((_, i) => (
            <Smile key={i} size={48} className="text-slate-900" />
          ))}
        </div>
      </div>

      <div className={`bg-white p-8 md:p-12 rounded-[48px] w-full max-w-md shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] relative z-10 transition-transform duration-300 ${error ? 'animate-shake' : ''} border border-slate-50`}>
        <div className="text-center mb-10">
          <div className="flex justify-center mb-8">
             <AppLogo size="lg" showText={false} className="animate-bounce-slow" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">乐贝色彩</h2>
          <p className="text-slate-500 mt-3 font-bold tracking-[0.3em] text-[10px] uppercase">
            {isSettingInitial ? '初始化管理密码' : 'SMILEY ART MANAGER'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">
              {isSettingInitial ? '设置新管理密码' : '管理员登录'}
            </label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-yellow-500 transition-colors">
                <Lock size={20} />
              </div>
              <input 
                autoFocus
                type={showPassword ? 'text' : 'password'}
                className={`w-full pl-14 pr-14 py-5 bg-slate-50 border-2 rounded-[24px] outline-none transition-all font-bold text-slate-800 ${
                  error ? 'border-red-400 bg-red-50' : 'border-transparent focus:border-yellow-400 focus:bg-white focus:shadow-xl focus:shadow-yellow-50'
                }`}
                placeholder={isSettingInitial ? '新密码（至少6位）' : '请输入访问密码'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-[10px] font-black mt-2 ml-2 tracking-widest uppercase">密码错误，请重新输入！</p>}
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 text-white font-black rounded-[24px] hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-[0.97] tracking-widest uppercase"
          >
            {isSettingInitial ? '立即启用' : '进入系统'}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-2 grayscale opacity-40">
             <span className="text-[10px] font-bold tracking-widest">乐贝色彩安全管理中心</span>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

// --- 成长档案组件 ---

const ArchiveModal = ({
  student,
  images,
  onClose,
  onUpload,
  onDelete
}: {
  student: Student;
  images: ArchiveImage[];
  onClose: () => void;
  onUpload: (studentId: string, files: File[]) => void;
  onDelete: (imageIds: string[]) => void;
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchDownload = () => {
    const toDownload = isSelectMode ? selectedIds : images.map(img => img.id);
    if (toDownload.length === 0) return;

    images.filter(img => toDownload.includes(img.id)).forEach((img, idx) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = img.url;
        link.download = img.name || `学员作品-${img.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, idx * 200);
    });
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`确定要删除选中的 ${selectedIds.length} 张图片吗？`)) {
      onDelete(selectedIds);
      setSelectedIds([]);
      setIsSelectMode(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 页眉 */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">成长档案：{student.name}</h3>
            <p className="text-sm text-slate-500">累计作品 {images.length} 件 • 记录成长点滴</p>
          </div>
          <div className="flex items-center gap-2">
            {!isSelectMode ? (
              <>
                <button 
                  onClick={() => setIsSelectMode(true)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition"
                >
                  管理作品
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-black transition shadow-md"
                >
                  <UploadCloud size={18} />
                  <span>批量上传</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => {
                    setIsSelectMode(false);
                    setSelectedIds([]);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
                >
                  取消
                </button>
                <button 
                  disabled={selectedIds.length === 0}
                  onClick={handleBatchDownload}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 transition disabled:opacity-50"
                >
                  <Download size={18} />
                  <span>下载已选 ({selectedIds.length})</span>
                </button>
                <button 
                  disabled={selectedIds.length === 0}
                  onClick={handleBatchDelete}
                  className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  <span>删除已选 ({selectedIds.length})</span>
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition ml-2">
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []) as File[];
            if (files.length > 0) onUpload(student.id, files);
            e.target.value = ''; 
          }}
        />

        {/* 内容展示区 */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map(img => (
                <div 
                  key={img.id} 
                  className={`relative group rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                    selectedIds.includes(img.id) ? 'border-yellow-400 ring-4 ring-yellow-50' : 'border-white hover:border-yellow-200'
                  }`}
                  onClick={() => isSelectMode && toggleSelect(img.id)}
                >
                  <img 
                    src={img.url} 
                    alt={img.name} 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* 选择状态覆盖层 */}
                  {isSelectMode ? (
                    <div className="absolute top-2 right-2 z-10">
                      {selectedIds.includes(img.id) ? (
                        <CheckCircle2 size={24} className="text-yellow-500 fill-white" />
                      ) : (
                        <Circle size={24} className="text-white/80" />
                      )}
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement('a');
                          link.href = img.url;
                          link.download = img.name;
                          link.click();
                        }}
                        className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition"
                      >
                        <Download size={20} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm('确定要删除这张作品吗？')) onDelete([img.id]);
                        }}
                        className="p-2 bg-red-500/20 backdrop-blur-md rounded-full text-white hover:bg-red-500/60 transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-[10px] text-white/90 truncate flex items-center gap-1">
                      <Clock size={10} /> {new Date(img.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <ImageIcon size={48} className="opacity-20" />
              </div>
              <h4 className="text-lg font-semibold text-slate-600 mb-2">相册空空如也</h4>
              <p className="text-sm max-w-xs text-center mb-8">点击“批量上传”按钮，开启学员的艺术探索之旅！</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition shadow-lg shadow-slate-100"
              >
                上传第一件作品
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 评价管理弹窗 ---

const ReviewModal = ({ 
  student, 
  reviews, 
  onClose, 
  onAddReview 
}: { 
  student: Student, 
  reviews: Review[], 
  onClose: () => void,
  onAddReview: (id: string, name: string, content: string, rating: number) => void
}) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddReview(student.id, student.name, content, rating);
    setContent('');
    setRating(5);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 页眉 */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">课堂点评：{student.name}</h3>
            <p className="text-sm text-slate-500">累计评价：{reviews.length} 条</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* 新增点评表单 */}
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
            <h4 className="text-sm font-bold text-amber-800 mb-4 flex items-center gap-2">
              <Award size={16} /> 记录今日课堂表现
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-amber-700">课堂表现：</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition transform active:scale-90"
                    >
                      <Star 
                        size={24} 
                        className={star <= rating ? "fill-amber-400 text-amber-400" : "text-amber-200"} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea 
                required
                placeholder="例如：今日构思非常独特，对颜色的搭配有了显著提高，加油！"
                className="w-full p-4 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500 outline-none resize-none min-h-[100px] text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button 
                type="submit"
                className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition shadow-lg shadow-amber-200"
              >
                发布课堂点评
              </button>
            </form>
          </div>

          {/* 评价历史记录 */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <History size={16} /> 评价历史
            </h4>
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mt-2" />
                    <div className="w-0.5 flex-1 bg-slate-100 my-1" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(review.date).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 group-hover:border-slate-200 transition">
                      <p className="text-sm text-slate-600 leading-relaxed">{review.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="text-center py-10 text-slate-400 border border-dashed rounded-2xl">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-10" />
                  <p className="text-sm">暂无评价记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label, badge }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, badge?: number }) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition font-black uppercase text-[11px] tracking-widest ${
      active ? 'bg-yellow-400 text-slate-900 shadow-md shadow-yellow-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
        {badge}
      </span>
    )}
  </button>
);

const MobileNavItem = ({ active, onClick, icon, label, badge }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, badge?: number }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 flex-1 transition-all relative ${
      active ? 'text-yellow-600' : 'text-slate-400'
    }`}
  >
    <div className="relative">
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
          {badge}
        </span>
      )}
    </div>
    <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
  </button>
);

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) => (
  <div className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md ${color === 'red' && value > 0 ? 'ring-2 ring-red-100 border-red-200' : ''}`}>
    <div className={`p-3 rounded-xl bg-${color === 'slate' ? 'slate' : color}-50`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-black ${color === 'red' && value > 0 ? 'text-red-600' : 'text-slate-800'}`}>{value}</p>
    </div>
  </div>
);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
