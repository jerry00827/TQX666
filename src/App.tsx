/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ChevronRight, 
  Search, 
  CheckCircle2, 
  Circle, 
  Download, 
  ArrowLeft,
  LayoutDashboard,
  Menu,
  X,
  GraduationCap,
  Calculator,
  Shapes,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { parseCSV, CSV_DATA } from './data';
import { KnowledgePoint, ViewType, CategoryStats } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const KNOWLEDGE_POINTS = parseCSV(CSV_DATA);

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  '数与代数': <Calculator className="w-6 h-6" />,
  '几何': <Shapes className="w-6 h-6" />,
  '统计与概率': <BarChart3 className="w-6 h-6" />,
  '解决问题': <Lightbulb className="w-6 h-6" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  '数与代数': 'bg-blue-50 text-blue-600 border-blue-100',
  '几何': 'bg-green-50 text-green-600 border-green-100',
  '统计与概率': 'bg-purple-50 text-purple-600 border-purple-100',
  '解决问题': 'bg-orange-50 text-orange-600 border-orange-100',
};

export default function App() {
  const [view, setView] = useState<ViewType>('dashboard');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [selectedPoint, setSelectedPoint] = useState<KnowledgePoint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('math-progress');
    if (saved) {
      try {
        setCompletedIds(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to load progress', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('math-progress', JSON.stringify(Array.from(completedIds)));
  }, [completedIds]);

  const stats = useMemo(() => {
    const total = KNOWLEDGE_POINTS.length;
    const completed = completedIds.size;
    const categories: Record<string, CategoryStats> = {};

    KNOWLEDGE_POINTS.forEach(kp => {
      if (!categories[kp.category]) {
        categories[kp.category] = { total: 0, completed: 0 };
      }
      categories[kp.category].total++;
      if (completedIds.has(kp.id)) {
        categories[kp.category].completed++;
      }
    });

    return { total, completed, categories };
  }, [completedIds]);

  const toggleComplete = (id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportCSV = () => {
    const uncompleted = KNOWLEDGE_POINTS.filter(kp => !completedIds.has(kp.id));
    const header = '分类,子分类,知识点名称,年级\n';
    const rows = uncompleted.map(kp => `${kp.category},${kp.subCategory},${kp.name},${kp.grade}`).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '未完成知识点课程表.csv';
    link.click();
  };

  const filteredPoints = useMemo(() => {
    if (!searchQuery) return KNOWLEDGE_POINTS;
    return KNOWLEDGE_POINTS.filter(kp => 
      kp.name.includes(searchQuery) || 
      kp.subCategory.includes(searchQuery) || 
      kp.category.includes(searchQuery)
    );
  }, [searchQuery]);

  const groupedPoints = useMemo(() => {
    const groups: Record<string, Record<string, KnowledgePoint[]>> = {};
    filteredPoints.forEach(kp => {
      if (!groups[kp.category]) groups[kp.category] = {};
      if (!groups[kp.category][kp.subCategory]) groups[kp.category][kp.subCategory] = [];
      groups[kp.category][kp.subCategory].push(kp);
    });
    return groups;
  }, [filteredPoints]);

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-gray-800 font-sans selection:bg-green-100">
      <AnimatePresence mode="wait">
        {view === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl mx-auto px-6 py-12"
          >
            {/* Header Stats */}
            <div className="flex flex-col items-center mb-16 text-center">
              <div className="relative w-48 h-48 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-100"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={552.9}
                    initial={{ strokeDashoffset: 552.9 }}
                    animate={{ strokeDashoffset: 552.9 - (552.9 * (stats.completed / stats.total)) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-green-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900">{Math.round((stats.completed / stats.total) * 100)}%</span>
                  <span className="text-sm text-gray-500 font-medium">总进度</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">小学数学知识点提前学</h1>
              <p className="text-gray-500 max-w-md">开启你的数学探索之旅，掌握每一个核心知识点，让学习变得简单有趣！</p>
            </div>

            {/* Main Action */}
            <div className="flex justify-center mb-16">
              <button
                onClick={() => setView('learning')}
                className="group relative px-12 py-5 bg-green-500 text-white rounded-3xl font-bold text-xl shadow-xl shadow-green-200 hover:bg-green-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                <BookOpen className="w-6 h-6" />
                进入提前学目录
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(stats.categories).map(([name, catStats]) => (
                <motion.div
                  key={name}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "p-6 rounded-[2rem] border-2 transition-all",
                    CATEGORY_COLORS[name] || 'bg-gray-50 text-gray-600 border-gray-100'
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                      {CATEGORY_ICONS[name] || <GraduationCap className="w-6 h-6" />}
                    </div>
                    <span className="text-sm font-bold opacity-80">{(catStats as CategoryStats).completed}/{(catStats as CategoryStats).total}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-3">{name}</h3>
                  <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((catStats as CategoryStats).completed / (catStats as CategoryStats).total) * 100}%` }}
                      className="h-full bg-current rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="learning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-screen overflow-hidden"
          >
            {/* Sidebar */}
            <motion.aside
              initial={false}
              animate={{ width: isSidebarOpen ? 320 : 0 }}
              className="bg-white border-r border-gray-100 flex flex-col relative"
            >
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <button 
                  onClick={() => setView('dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="font-bold text-lg">学习目录</h2>
                <button 
                  onClick={exportCSV}
                  className="p-2 hover:bg-green-50 text-green-600 rounded-xl transition-colors"
                  title="导出课程表"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索知识点..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {Object.entries(groupedPoints).map(([category, subGroups]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 px-2 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{category}</span>
                    </div>
                    {Object.entries(subGroups).map(([subCat, points]) => (
                      <details key={subCat} className="group" open={!!searchQuery}>
                        <summary className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors list-none">
                          <span className="text-sm font-semibold text-gray-700">{subCat}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="mt-1 ml-2 pl-4 border-l-2 border-gray-50 space-y-1">
                          {points.map(kp => (
                            <div
                              key={kp.id}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer group/item",
                                selectedPoint?.id === kp.id ? "bg-green-50 text-green-700" : "hover:bg-gray-50"
                              )}
                              onClick={() => setSelectedPoint(kp)}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleComplete(kp.id);
                                }}
                                className="shrink-0"
                              >
                                {completedIds.has(kp.id) ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-300 group-hover/item:text-green-300 transition-colors" />
                                )}
                              </button>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium truncate">{kp.name}</span>
                                <span className="text-[10px] opacity-50">{kp.grade}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                ))}
              </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-white">
              <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                  >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                  {selectedPoint && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{selectedPoint.category} / {selectedPoint.subCategory}</span>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                      <h1 className="font-bold text-gray-900">{selectedPoint.name}</h1>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-bold">
                    已掌握: {stats.completed} / {stats.total}
                  </div>
                </div>
              </header>

              <div className="flex-1 relative bg-gray-50">
                {selectedPoint ? (
                  <iframe
                    src={`./knowledge/${selectedPoint.name}.html`}
                    className="w-full h-full border-none"
                    title={selectedPoint.name}
                    onError={(e) => console.error('Iframe error', e)}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                      <BookOpen className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">准备好学习了吗？</h2>
                    <p className="text-gray-500 max-w-sm">从左侧目录中选择一个知识点开始学习。每一个小进步都值得被记录！</p>
                  </div>
                )}
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
