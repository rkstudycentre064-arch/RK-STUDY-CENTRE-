import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  BarChart3,
  SlidersHorizontal,
  Sparkles,
  Play,
  Info,
  CheckCircle2,
} from 'lucide-react';
import type { StoredTestResult, ClassLevel, Subject } from '../../types';

interface PerformanceSummaryGraphProps {
  testResults: StoredTestResult[];
  selectedClass: ClassLevel;
  subjects?: Subject[];
  onTakeTest?: () => void;
}

interface ChartDataPoint {
  id: string;
  name: string;
  fullTitle: string;
  date: string;
  fullDate: string;
  score: number;
  totalMarks: number;
  percentage: number;
  averageSoFar: number;
  subjectName: string;
  isPassed: boolean;
  isDemo?: boolean;
}

export function PerformanceSummaryGraph({
  testResults = [],
  selectedClass,
  subjects = [],
  onTakeTest,
}: PerformanceSummaryGraphProps) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);

  // Filter and prepare chart data
  const { chartData, isUsingDemoData, statsSummary } = useMemo(() => {
    const safeResults = Array.isArray(testResults) ? testResults : [];
    const classResults = safeResults.filter(
      (r) => !r.classLevel || r.classLevel === selectedClass
    );

    const filtered = subjectFilter === 'all'
      ? classResults
      : classResults.filter((r) => r.subjectId === subjectFilter);

    // If user has actual test results
    if (filtered.length > 0) {
      // Sort chronologically ascending
      const sorted = [...filtered].sort((a, b) => {
        const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return timeA - timeB;
      });

      let cumulativeSum = 0;
      const points: ChartDataPoint[] = sorted.map((res, index) => {
        const pct = res.totalMarks > 0 ? Math.round((res.score / res.totalMarks) * 100) : 0;
        cumulativeSum += pct;
        const avgSoFar = Math.round(cumulativeSum / (index + 1));

        let formattedDate = `टेस्ट ${index + 1}`;
        let fullDateStr = 'दिनांक उपलब्ध नहीं';
        if (res.completedAt) {
          try {
            const d = new Date(res.completedAt);
            formattedDate = d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' });
            fullDateStr = d.toLocaleDateString('hi-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
          } catch {
            // fallback
          }
        }

        const subObj = subjects.find((s) => s.id === res.subjectId);
        const subName = res.subjectName || subObj?.hindiName || 'सामान्य';

        return {
          id: res.id,
          name: formattedDate,
          fullTitle: res.testTitle || `ऑनलाइन टेस्ट ${index + 1}`,
          date: formattedDate,
          fullDate: fullDateStr,
          score: res.score,
          totalMarks: res.totalMarks,
          percentage: pct,
          averageSoFar: avgSoFar,
          subjectName: subName,
          isPassed: res.passed !== undefined ? res.passed : pct >= 40,
          isDemo: false,
        };
      });

      // Calculate stats
      const percentages = points.map((p) => p.percentage);
      const highest = Math.max(...percentages);
      const lowest = Math.min(...percentages);
      const latest = points[points.length - 1]?.percentage || 0;
      const overallAvg = Math.round(cumulativeSum / points.length);

      // Trend: compare latest vs first
      const first = points[0]?.percentage || 0;
      const trendDiff = latest - first;

      return {
        chartData: points,
        isUsingDemoData: false,
        statsSummary: {
          highest,
          lowest,
          latest,
          overallAvg,
          trendDiff,
          totalTests: points.length,
        },
      };
    }

    // DEMO DATA (if user hasn't taken any tests yet)
    const demoDates = ['12 मार्च', '18 मार्च', '25 मार्च', '02 अप्रैल', '10 अप्रैल', '18 अप्रैल'];
    const demoTitles = [
      'अध्याय 1: प्रकाश - परावर्तन तथा अपवर्तन',
      'अध्याय 2: मानव नेत्र तथा रंगबिरंगा संसार',
      'अध्याय 1: संसाधन एवं विकास (भूगोल)',
      'अध्याय 1: वास्तविक संख्याएँ (गणित)',
      'अध्याय 3: विद्युत (Physics Test)',
      'मासिक मूल्यांकन टेस्ट (Science Mock)',
    ];
    const demoScores = [68, 74, 82, 78, 90, 88];

    let sum = 0;
    const demoPoints: ChartDataPoint[] = demoScores.map((score, i) => {
      sum += score;
      return {
        id: `demo-${i}`,
        name: demoDates[i],
        fullTitle: demoTitles[i],
        date: demoDates[i],
        fullDate: `${demoDates[i]}, 2026`,
        score: Math.round((score / 100) * 25),
        totalMarks: 25,
        percentage: score,
        averageSoFar: Math.round(sum / (i + 1)),
        subjectName: i === 2 ? 'सामाजिक विज्ञान' : i === 3 ? 'गणित' : 'विज्ञान',
        isPassed: score >= 40,
        isDemo: true,
      };
    });

    return {
      chartData: demoPoints,
      isUsingDemoData: true,
      statsSummary: {
        highest: 90,
        lowest: 68,
        latest: 88,
        overallAvg: Math.round(sum / demoPoints.length),
        trendDiff: 20,
        totalTests: 0,
      },
    };
  }, [testResults, selectedClass, subjectFilter, subjects]);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-200 shadow-2xs space-y-6">
      {/* Header with Title and Control Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>प्रदर्शन विश्लेषण (Performance Analytics)</span>
            </span>
            {isUsingDemoData ? (
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                नमूना पूर्वावलोकन (Sample Demo)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>सत्यापित डेटा ({statsSummary.totalTests} टेस्ट)</span>
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            समय के साथ औसत टेस्ट स्कोर ग्राफ (Average Scores Over Time)
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-600">
            प्रत्येक टेस्ट के प्राप्तांक और समय के साथ प्रगति कर रहे आपके निरंतर औसत (Cumulative Average) का दृश्य ग्राफ।
          </p>
        </div>

        {/* Filter and View Controls */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
          {/* Chart Type Toggle */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              एरिया ट्रेंड (Trend)
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              बार ग्राफ (Bar)
            </button>
          </div>

          {/* Benchmark Line Toggle */}
          <button
            type="button"
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              showBenchmark
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="प्रथम श्रेणी और पासिंग बेंचमार्क लाइन दिखाएं/छिपाएं"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>बेंचमार्क {showBenchmark ? 'चालू' : 'बंद'}</span>
          </button>
        </div>
      </div>

      {/* Demo Notice Banner (if using demo data) */}
      {isUsingDemoData && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs sm:text-sm">
              <strong className="font-black text-amber-900">
                वर्तमान में कोई टेस्ट पूर्ण नहीं है - नमूना ग्राफ प्रदर्शित है!
              </strong>
              <p className="text-amber-800 font-medium">
                जैसे ही आप कोई ऑनलाइन टेस्ट पूरा करेंगे, आपके वास्तविक प्राप्तांक और औसत स्कोर का ग्राफ यहाँ स्वतः बन जाएगा।
              </p>
            </div>
          </div>

          {onTakeTest && (
            <button
              type="button"
              onClick={onTakeTest}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shrink-0 cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>पहला टेस्ट अभी दें</span>
            </button>
          )}
        </div>
      )}

      {/* 4 Score Highlight Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200/70">
          <span className="text-2xs sm:text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            वर्तमान औसत स्कोर
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1 flex items-baseline gap-1">
            <span>{statsSummary.overallAvg}%</span>
            <span className="text-2xs font-bold text-slate-400">Cumulative</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200/70">
          <span className="text-2xs sm:text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            उच्चतम प्राप्तांक
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 flex items-baseline gap-1">
            <span>{statsSummary.highest}%</span>
            <span className="text-2xs font-bold text-emerald-600">Peak</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200/70">
          <span className="text-2xs sm:text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            नवीनतम टेस्ट स्कोर
          </span>
          <div className="text-xl sm:text-2xl font-black text-indigo-700 mt-1 flex items-baseline gap-1">
            <span>{statsSummary.latest}%</span>
            <span className="text-2xs font-bold text-slate-400">Latest</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200/70">
          <span className="text-2xs sm:text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            स्कोर रुझान (Trend)
          </span>
          <div
            className={`text-xl sm:text-2xl font-black mt-1 flex items-center gap-1 ${
              statsSummary.trendDiff >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {statsSummary.trendDiff >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-rose-600" />
            )}
            <span>
              {statsSummary.trendDiff > 0 ? `+${statsSummary.trendDiff}%` : `${statsSummary.trendDiff}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Recharts Graph Visualizer */}
      <div className="w-full pt-2">
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart
                data={chartData}
                margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
              >
                <defs>
                  {/* Subtle clean gradients */}
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  interval="preserveStartEnd"
                />

                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  unit="%"
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 12, fontSize: 12, fontWeight: 700 }}
                />

                {showBenchmark && (
                  <>
                    <ReferenceLine
                      y={60}
                      stroke="#059669"
                      strokeDasharray="4 4"
                      label={{
                        value: 'प्रथम श्रेणी (60%)',
                        fill: '#059669',
                        fontSize: 10,
                        position: 'right',
                        fontWeight: 700,
                      }}
                    />
                    <ReferenceLine
                      y={40}
                      stroke="#e11d48"
                      strokeDasharray="4 4"
                      label={{
                        value: 'उत्तीर्णांक (40%)',
                        fill: '#e11d48',
                        fontSize: 10,
                        position: 'right',
                        fontWeight: 700,
                      }}
                    />
                  </>
                )}

                {/* Individual Test Score Curve */}
                <Area
                  type="monotone"
                  dataKey="percentage"
                  name="टेस्ट प्राप्तांक (%)"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                  activeDot={{ r: 6, stroke: '#1d4ed8', strokeWidth: 2, fill: '#ffffff' }}
                />

                {/* Cumulative Average Line */}
                <Line
                  type="monotone"
                  dataKey="averageSoFar"
                  name="औसत स्कोर प्रगति (%)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: '#047857', strokeWidth: 2, fill: '#ffffff' }}
                />
              </AreaChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />

                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  unit="%"
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 12, fontSize: 12, fontWeight: 700 }}
                />

                {showBenchmark && (
                  <>
                    <ReferenceLine
                      y={60}
                      stroke="#059669"
                      strokeDasharray="4 4"
                      label={{
                        value: 'प्रथम श्रेणी (60%)',
                        fill: '#059669',
                        fontSize: 10,
                        position: 'right',
                        fontWeight: 700,
                      }}
                    />
                    <ReferenceLine
                      y={40}
                      stroke="#e11d48"
                      strokeDasharray="4 4"
                      label={{
                        value: 'उत्तीर्णांक (40%)',
                        fill: '#e11d48',
                        fontSize: 10,
                        position: 'right',
                        fontWeight: 700,
                      }}
                    />
                  </>
                )}

                <Bar
                  dataKey="percentage"
                  name="टेस्ट प्राप्तांक (%)"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />

                <Line
                  type="monotone"
                  dataKey="averageSoFar"
                  name="औसत स्कोर प्रगति (%)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: '#047857', strokeWidth: 2, fill: '#ffffff' }}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Legend & Insights Note */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-4 flex-wrap font-bold">
          <span className="flex items-center gap-1.5 text-blue-700">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            <span>नीली रेखा: उस टेस्ट का प्राप्तांक (%)</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span>हरी रेखा: निरंतर औसत स्कोर (%)</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-600 inline-block" />
            <span>60% बेंचमार्क (प्रथम श्रेणी)</span>
          </span>
        </div>

        <div className="text-slate-500 font-semibold">
          💡 युक्ति: लगातार 70%+ औसत बनाए रखने से बोर्ड परीक्षा में शीर्ष परिणाम सुनिश्चित होता है।
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip component
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data: ChartDataPoint = payload[0].payload;
  const isPassed = data.isPassed;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-700 max-w-xs space-y-2 z-50 text-xs">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
        <span className="font-extrabold text-blue-300 truncate max-w-[170px]">
          {data.subjectName}
        </span>
        <span className="text-2xs text-slate-400 shrink-0">{data.date}</span>
      </div>

      <div className="font-black text-sm text-white leading-snug">
        {data.fullTitle}
      </div>

      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">प्राप्तांक:</span>
          <span className="font-black text-sm text-amber-300">
            {data.score} / {data.totalMarks} ({data.percentage}%)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-300">औसत स्कोर उस समय:</span>
          <span className="font-extrabold text-emerald-300">
            {data.averageSoFar}%
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-slate-400">परिणाम स्थिति:</span>
          <span
            className={`font-black px-2 py-0.5 rounded text-2xs ${
              isPassed ? 'bg-emerald-900 text-emerald-200' : 'bg-rose-900 text-rose-200'
            }`}
          >
            {isPassed ? '✓ उत्तीर्ण' : 'पुनः प्रयास अनुशंसित'}
          </span>
        </div>
      </div>

      {data.isDemo && (
        <div className="pt-1 border-t border-slate-800 text-2xs text-amber-400 font-semibold italic">
          * यह नमूना डेटा है। आपके वास्तविक टेस्ट से यह स्वतः बदलेगा।
        </div>
      )}
    </div>
  );
}
