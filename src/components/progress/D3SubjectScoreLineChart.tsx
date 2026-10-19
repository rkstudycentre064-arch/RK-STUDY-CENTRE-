/**
 * RK STUDY CENTRE - D3.js Subject Score & Improvement Line Chart
 * 
 * Interactive D3.js visualization tracking student test performance, 
 * subject score trajectories, improvement rates, and board benchmarks over time.
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  TrendingUp,
  Award,
  Calendar,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Info,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Target,
  RotateCcw
} from 'lucide-react';
import type { StoredTestResult, ClassLevel, Subject } from '../../types';

interface D3SubjectScoreLineChartProps {
  testResults: StoredTestResult[];
  selectedClass: ClassLevel;
  subjects?: Subject[];
  onTakeTest?: () => void;
}

export interface ChartDataPoint {
  id: string;
  testId: string;
  testTitle: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  date: Date;
  dateFormatted: string;
  score: number;
  totalMarks: number;
  percentage: number;
  cumulativeAverage: number;
  isPassed: boolean;
  division: string;
  improvementFromPrev?: number;
  isDemo?: boolean;
}

// Subject color mappings
const SUBJECT_COLORS: Record<string, string> = {
  'c10-sci': '#2563eb', // Science / Physics - Blue
  'physics': '#2563eb',
  'science': '#2563eb',
  'c10-math': '#7c3aed', // Mathematics - Violet
  'math': '#7c3aed',
  'mathematics': '#7c3aed',
  'c10-soc': '#ea580c', // Social Science / History - Amber/Orange
  'soc': '#ea580c',
  'history': '#ea580c',
  'geography': '#d97706',
  'c10-hin': '#dc2626', // Hindi - Red
  'hindi': '#dc2626',
  'c10-eng': '#059669', // English - Emerald
  'english': '#059669',
  'c10-san': '#0891b2', // Sanskrit - Cyan
  'sanskrit': '#0891b2',
  'default': '#6366f1', // Indigo fallback
};

export const D3SubjectScoreLineChart: React.FC<D3SubjectScoreLineChartProps> = ({
  testResults = [],
  selectedClass,
  subjects = [],
  onTakeTest,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('single');
  const [showBenchmarkLines, setShowBenchmarkLines] = useState<boolean>(true);
  const [showTrendLine, setShowTrendLine] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  // Generate realistic demo data if student has not taken tests yet
  const demoData: ChartDataPoint[] = useMemo(() => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 35); // 5 weeks ago

    const sampleTests = [
      { subject: 'c10-sci', name: 'भौतिकी (विज्ञान)', title: 'प्रकाश का परावर्तन - 30 VVI टेस्ट', marks: 30, score: 18, daysAfter: 1 },
      { subject: 'c10-math', name: 'गणित (Math)', title: 'वास्तविक संख्याएं - 25 VVI टेस्ट', marks: 25, score: 16, daysAfter: 5 },
      { subject: 'c10-soc', name: 'सामाजिक विज्ञान (इतिहास)', title: 'यूरोप में राष्ट्रवाद - 30 VVI टेस्ट', marks: 30, score: 21, daysAfter: 9 },
      { subject: 'c10-hin', name: 'हिंदी (Godhuli)', title: 'श्रम विभाजन और जाति प्रथा - 20 VVI', marks: 20, score: 15, daysAfter: 13 },
      { subject: 'c10-sci', name: 'भौतिकी (विज्ञान)', title: 'प्रकाश का अपवर्तन - 30 VVI टेस्ट', marks: 30, score: 24, daysAfter: 18 },
      { subject: 'c10-math', name: 'गणित (Math)', title: 'बहुपद (Polynomials) - 25 VVI टेस्ट', marks: 25, score: 21, daysAfter: 22 },
      { subject: 'c10-soc', name: 'सामाजिक विज्ञान (भूगोल)', title: 'भारत: संसाधन एवं उपयोग - 30 VVI', marks: 30, score: 26, daysAfter: 26 },
      { subject: 'c10-sci', name: 'भौतिकी (विज्ञान)', title: 'मानव नेत्र तथा रंगबिरंगा संसार - 30 VVI', marks: 30, score: 27, daysAfter: 30 },
      { subject: 'c10-eng', name: 'अंग्रेजी (English)', title: 'The Pace for Living - 25 VVI', marks: 25, score: 22, daysAfter: 33 },
      { subject: 'c10-sci', name: 'भौतिकी (विज्ञान)', title: '300 VVI अखंड महामैराथन टेस्ट (3 Hr)', marks: 300, score: 276, daysAfter: 35 },
    ];

    let runningSum = 0;
    return sampleTests.map((t, idx) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + t.daysAfter);
      const pct = Math.round((t.score / t.marks) * 100);
      runningSum += pct;

      return {
        id: `demo-${idx + 1}`,
        testId: `demo-test-${idx + 1}`,
        testTitle: t.title,
        subjectId: t.subject,
        subjectName: t.name,
        subjectColor: SUBJECT_COLORS[t.subject] || SUBJECT_COLORS.default,
        date: d,
        dateFormatted: d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' }),
        score: t.score,
        totalMarks: t.marks,
        percentage: pct,
        cumulativeAverage: Math.round(runningSum / (idx + 1)),
        isPassed: pct >= 45,
        division: pct >= 60 ? '1st Division 🌟' : pct >= 45 ? '2nd Division' : 'Passed',
        isDemo: true,
      };
    });
  }, []);

  // Process real results or fallback to demo data
  const { dataset, isUsingDemo } = useMemo(() => {
    const validResults = (testResults || []).filter(
      (r) => !r.classLevel || r.classLevel === selectedClass
    );

    if (validResults.length >= 2) {
      // Sort chronologically ascending
      const sorted = [...validResults].sort((a, b) => {
        const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return timeA - timeB;
      });

      let cumulativeSum = 0;
      const points: ChartDataPoint[] = sorted.map((res, index) => {
        const pct = res.totalMarks > 0 ? Math.round((res.score / res.totalMarks) * 100) : 0;
        cumulativeSum += pct;

        const subId = res.subjectId || 'physics';
        let subName = res.subjectName;
        if (!subName && subjects.length > 0) {
          const matched = subjects.find((s) => s.id === subId || s.slug === subId);
          if (matched) subName = matched.hindiName || matched.name;
        }
        if (!subName) subName = 'विज्ञान / भौतिकी';

        const d = res.completedAt ? new Date(res.completedAt) : new Date();

        return {
          id: res.id || `real-${index}`,
          testId: res.testId || `test-${index}`,
          testTitle: res.testTitle || `ऑनलाइन टेस्ट ${index + 1}`,
          subjectId: subId,
          subjectName: subName,
          subjectColor: SUBJECT_COLORS[subId] || SUBJECT_COLORS[subId.toLowerCase()] || SUBJECT_COLORS.default,
          date: d,
          dateFormatted: d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' }),
          score: res.score,
          totalMarks: res.totalMarks || 100,
          percentage: pct,
          cumulativeAverage: Math.round(cumulativeSum / (index + 1)),
          isPassed: pct >= 45,
          division: pct >= 60 ? '1st Division 🌟' : pct >= 45 ? '2nd Division' : 'Passed',
          isDemo: false,
        };
      });

      return { dataset: points, isUsingDemo: false };
    }

    return { dataset: demoData, isUsingDemo: true };
  }, [testResults, selectedClass, subjects, demoData]);

  // Filter dataset by selected subject
  const filteredData = useMemo(() => {
    if (selectedSubjectFilter === 'all') return dataset;
    return dataset.filter(
      (d) =>
        d.subjectId.toLowerCase().includes(selectedSubjectFilter.toLowerCase()) ||
        selectedSubjectFilter.toLowerCase().includes(d.subjectId.toLowerCase())
    );
  }, [dataset, selectedSubjectFilter]);

  // Improvement Rate & Statistics Summary
  const statsSummary = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        firstScore: 0,
        latestScore: 0,
        improvementPercent: 0,
        highestScore: 0,
        averageScore: 0,
        testsCount: 0,
      };
    }

    const firstScore = filteredData[0].percentage;
    const latestScore = filteredData[filteredData.length - 1].percentage;
    const improvementPercent = latestScore - firstScore;
    const highestScore = Math.max(...filteredData.map((d) => d.percentage));
    const averageScore = Math.round(
      filteredData.reduce((acc, d) => acc + d.percentage, 0) / filteredData.length
    );

    return {
      firstScore,
      latestScore,
      improvementPercent,
      highestScore,
      averageScore,
      testsCount: filteredData.length,
    };
  }, [filteredData]);

  // Distinct subjects in dataset
  const distinctSubjects = useMemo(() => {
    const map = new Map<string, { id: string; name: string; color: string; count: number }>();
    dataset.forEach((d) => {
      if (!map.has(d.subjectId)) {
        map.set(d.subjectId, {
          id: d.subjectId,
          name: d.subjectName,
          color: d.subjectColor,
          count: 0,
        });
      }
      map.get(d.subjectId)!.count += 1;
    });
    return Array.from(map.values());
  }, [dataset]);

  // D3.js Render Hook
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || filteredData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const containerWidth = containerRef.current.clientWidth || 800;
    const height = Math.min(420, Math.max(280, containerWidth * 0.45));
    const margin = { top: 30, right: 35, bottom: 45, left: 45 };
    const width = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${containerWidth} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Gradient definitions
    const defs = svg.append('defs');

    // Area gradient
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'd3-score-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.35);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.0);

    // Glow filter
    const filter = defs
      .append('filter')
      .attr('id', 'd3-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // X Scale (Point scale for discrete test timeline)
    const xScale = d3
      .scalePoint<string>()
      .domain(filteredData.map((_, i) => i.toString()))
      .range([0, width])
      .padding(0.2);

    // Y Scale (Percentage 0 to 100%)
    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0])
      .nice();

    // Gridlines
    const yGrid = d3
      .axisLeft(yScale)
      .tickSize(-width)
      .tickFormat(() => '')
      .ticks(5);

    g.append('g')
      .attr('class', 'grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-dasharray', '3 3')
      .attr('opacity', 0.8);

    g.select('.grid .domain').remove();

    // Benchmark Lines (1st Division 60% and Topper 80%)
    if (showBenchmarkLines) {
      // 80% Topper Zone background band
      g.append('rect')
        .attr('x', 0)
        .attr('y', yScale(100))
        .attr('width', width)
        .attr('height', yScale(80) - yScale(100))
        .attr('fill', '#10b981')
        .attr('opacity', 0.06);

      // 60% First Division Line
      g.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', yScale(60))
        .attr('y2', yScale(60))
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5 4')
        .attr('opacity', 0.85);

      g.append('text')
        .attr('x', width - 8)
        .attr('y', yScale(60) - 6)
        .attr('text-anchor', 'end')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .attr('fill', '#d97706')
        .text('60% प्रथम श्रेणी बेंचमार्क (1st Division)');
    }

    // Trendline (Linear Regression)
    if (showTrendLine && filteredData.length >= 2) {
      const n = filteredData.length;
      let sumX = 0;
      let sumY = 0;
      let sumXY = 0;
      let sumXX = 0;

      filteredData.forEach((d, i) => {
        sumX += i;
        sumY += d.percentage;
        sumXY += i * d.percentage;
        sumXX += i * i;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      const x0 = 0;
      const y0 = Math.max(0, Math.min(100, intercept));
      const x1 = n - 1;
      const y1 = Math.max(0, Math.min(100, slope * (n - 1) + intercept));

      const trendLineX0 = xScale(x0.toString()) || 0;
      const trendLineX1 = xScale(x1.toString()) || width;

      g.append('line')
        .attr('x1', trendLineX0)
        .attr('y1', yScale(y0))
        .attr('x2', trendLineX1)
        .attr('y2', yScale(y1))
        .attr('stroke', '#8b5cf6')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '6 3')
        .attr('opacity', 0.7);

      g.append('text')
        .attr('x', trendLineX1)
        .attr('y', yScale(y1) - 6)
        .attr('text-anchor', 'end')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .attr('fill', '#7c3aed')
        .text(`📈 सुधार रुझान (+${Math.round(slope * (n - 1))}%)`);
    }

    // Area Generator
    const areaGenerator = d3
      .area<ChartDataPoint>()
      .x((_, i) => xScale(i.toString()) || 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.percentage))
      .curve(d3.curveMonotoneX);

    // Draw Area under curve
    g.append('path')
      .datum(filteredData)
      .attr('fill', 'url(#d3-score-area-gradient)')
      .attr('d', areaGenerator);

    // Main Line Generator
    const lineGenerator = d3
      .line<ChartDataPoint>()
      .x((_, i) => xScale(i.toString()) || 0)
      .y((d) => yScale(d.percentage))
      .curve(d3.curveMonotoneX);

    // Draw Main Line with animation
    const path = g
      .append('path')
      .datum(filteredData)
      .attr('fill', 'none')
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 3.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('filter', 'url(#d3-glow)')
      .attr('d', lineGenerator);

    // Animate line path
    const totalLength = path.node()?.getTotalLength() || 1000;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Cumulative Average Line (Dashed secondary line)
    const avgLineGenerator = d3
      .line<ChartDataPoint>()
      .x((_, i) => xScale(i.toString()) || 0)
      .y((d) => yScale(d.cumulativeAverage))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(filteredData)
      .attr('fill', 'none')
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1.8)
      .attr('stroke-dasharray', '4 4')
      .attr('opacity', 0.7)
      .attr('d', avgLineGenerator);

    // Draw Data Point Circles (Nodes)
    const pointsGroup = g.append('g').attr('class', 'data-points');

    filteredData.forEach((d, i) => {
      const cx = xScale(i.toString()) || 0;
      const cy = yScale(d.percentage);
      const color = d.subjectColor || '#3b82f6';

      // Outer ripple/pulse circle
      pointsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 8)
        .attr('fill', color)
        .attr('opacity', 0.15);

      // Core point
      const circle = pointsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 5)
        .attr('fill', '#ffffff')
        .attr('stroke', color)
        .attr('stroke-width', 2.8)
        .attr('cursor', 'pointer')
        .style('transition', 'transform 0.2s, r 0.2s');

      // Top Score label
      pointsGroup
        .append('text')
        .attr('x', cx)
        .attr('y', cy - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', '800')
        .attr('fill', color)
        .text(`${d.percentage}%`);

      // Hover interaction on point
      circle
        .on('mouseenter', () => {
          circle.attr('r', 7.5).attr('stroke-width', 3.5);
          setHoveredPoint(d);
        })
        .on('mouseleave', () => {
          circle.attr('r', 5).attr('stroke-width', 2.8);
        });
    });

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d) => {
        const idx = parseInt(d, 10);
        return filteredData[idx] ? filteredData[idx].dateFormatted : '';
      });

    const xAxisG = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisG.select('.domain').attr('stroke', '#cbd5e1');
    xAxisG
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('fill', '#64748b')
      .attr('dy', '1em');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d}%`);

    const yAxisG = g.append('g').call(yAxis);
    yAxisG.select('.domain').remove();
    yAxisG
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .attr('fill', '#64748b');

    // Crosshair Guide Overlay
    const overlay = g
      .append('rect')
      .attr('width', width)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    const verticalGuide = g
      .append('line')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3 3')
      .attr('opacity', 0);

    overlay
      .on('mousemove', function (event) {
        const [mouseX] = d3.pointer(event);
        // Find nearest point
        let closestIdx = 0;
        let minDiff = Infinity;

        filteredData.forEach((_, i) => {
          const ptX = xScale(i.toString()) || 0;
          const diff = Math.abs(ptX - mouseX);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = i;
          }
        });

        const targetX = xScale(closestIdx.toString()) || 0;
        verticalGuide
          .attr('x1', targetX)
          .attr('x2', targetX)
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('opacity', 0.6);

        setHoveredPoint(filteredData[closestIdx]);
      })
      .on('mouseleave', () => {
        verticalGuide.attr('opacity', 0);
      });
  }, [filteredData, showBenchmarkLines, showTrendLine]);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-200 shadow-sm space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1.5 shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>D3.js स्कोर एवं सुधार ट्रैकर (Improvement Chart)</span>
            </span>

            {isUsingDemo && (
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>प्रतीकात्मक मॉडल डेटा (Live Demo)</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            विषयवार टेस्ट प्राप्तांक एवं समय के साथ प्रदर्शन में प्रगति
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            प्रत्येक टेस्ट के परिणाम, प्रथम श्रेणी (60%) बेंचमार्क और सुधार दर (Trajectory) का गतिशील D3.js विश्लेषण।
          </p>
        </div>

        {/* Toggles & Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowBenchmarkLines(!showBenchmarkLines)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
              showBenchmarkLines
                ? 'bg-amber-50 text-amber-900 border-amber-300 font-black'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <span>60% बेंचमार्क लाइन</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTrendLine(!showTrendLine)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
              showTrendLine
                ? 'bg-purple-50 text-purple-900 border-purple-300 font-black'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <span>📈 सुधार रेखा</span>
          </button>

          {onTakeTest && (
            <button
              type="button"
              onClick={onTakeTest}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>नया टेस्ट दें</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Subject Filter Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="font-black text-slate-400 uppercase text-3xs shrink-0">विषय फ़िल्टर:</span>
        
        <button
          type="button"
          onClick={() => setSelectedSubjectFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all ${
            selectedSubjectFilter === 'all'
              ? 'bg-slate-900 text-white font-black shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          सभी विषय (All Subjects) • {dataset.length}
        </button>

        {distinctSubjects.map((sub) => {
          const isSelected = selectedSubjectFilter === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubjectFilter(sub.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'text-white shadow-xs font-black'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              style={{
                backgroundColor: isSelected ? sub.color : undefined,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: sub.color }}
              />
              <span>{sub.name}</span>
              <span className="opacity-70 text-3xs">({sub.count})</span>
            </button>
          );
        })}
      </div>

      {/* Top 4 Performance Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80">
          <div className="text-3xs uppercase font-bold text-blue-700">सुधार दर (Improvement)</div>
          <div className="text-xl sm:text-2xl font-black text-blue-900 flex items-center gap-1 mt-0.5">
            {statsSummary.improvementPercent >= 0 ? '+' : ''}
            {statsSummary.improvementPercent}%
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xs text-blue-600 font-semibold mt-1">
            प्रारंभिक: {statsSummary.firstScore}% → वर्तमान: {statsSummary.latestScore}%
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
          <div className="text-3xs uppercase font-bold text-emerald-700">सर्वोच्च अंक (Highest)</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-0.5">
            {statsSummary.highestScore}%
          </div>
          <div className="text-3xs text-emerald-600 font-semibold mt-1">
            {statsSummary.highestScore >= 80 ? '🌟 उत्कृष्ट Topper स्कोर' : 'सराहनीय प्रदर्शन'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
          <div className="text-3xs uppercase font-bold text-amber-700">औसत प्रतिशत (Average)</div>
          <div className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">
            {statsSummary.averageScore}%
          </div>
          <div className="text-3xs text-amber-700 font-semibold mt-1">
            प्रथम श्रेणी से {statsSummary.averageScore >= 60 ? 'ऊपर (+)' : 'कम (-)'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80">
          <div className="text-3xs uppercase font-bold text-purple-700">मूल्यांकित टेस्ट (Tests)</div>
          <div className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5">
            {statsSummary.testsCount}
          </div>
          <div className="text-3xs text-purple-600 font-semibold mt-1">
            सफलतापूर्वक जमा किए गए
          </div>
        </div>
      </div>

      {/* D3.js SVG Chart Canvas */}
      <div ref={containerRef} className="relative w-full overflow-hidden bg-slate-50/60 rounded-2xl p-2 sm:p-4 border border-slate-200/80">
        <svg ref={svgRef} className="w-full h-auto" />

        {/* Legend strip */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 pt-2 text-2xs font-bold text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-blue-600 rounded-full" />
            <span>टेस्ट प्राप्तांक (%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-500 border-b border-dashed border-slate-500" />
            <span>संचयी औसत (Average)</span>
          </div>
          {showTrendLine && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-purple-600 border-b border-dashed border-purple-600" />
              <span>प्रगति रुझान (Trendline)</span>
            </div>
          )}
          {showBenchmarkLines && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500 border-b border-dashed border-amber-500" />
              <span>60% प्रथम श्रेणी रेखा</span>
            </div>
          )}
        </div>
      </div>

      {/* Hovered Point Detailed Inspection Panel */}
      {hoveredPoint && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border-2 border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-150">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-2.5 py-0.5 rounded-full text-white text-3xs font-black uppercase shadow-2xs"
                style={{ backgroundColor: hoveredPoint.subjectColor }}
              >
                {hoveredPoint.subjectName}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {hoveredPoint.dateFormatted}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-3xs">
                {hoveredPoint.division}
              </span>
            </div>
            <h4 className="font-black text-sm sm:text-base text-slate-900">
              {hoveredPoint.testTitle}
            </h4>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-3xs uppercase font-bold text-slate-400">प्राप्तांक</div>
              <div className="text-base sm:text-lg font-black text-slate-900">
                {hoveredPoint.score} / {hoveredPoint.totalMarks}
              </div>
            </div>

            <div className="text-right pl-3 border-l border-slate-200">
              <div className="text-3xs uppercase font-bold text-slate-400">प्रतिशत</div>
              <div className="text-2xl font-black text-blue-700">
                {hoveredPoint.percentage}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notice if demo data */}
      {isUsingDemo && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 font-medium flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              यह चार्ट अभी प्रारंभिक मॉडल डेटा प्रदर्शित कर रहा है। जैसे-जैसे आप ऑनलाइन टेस्ट सबमिट करेंगे, यह स्वचालित रूप से आपके वास्तविक प्राप्तांकों से अपडेट हो जाएगा।
            </span>
          </div>
          {onTakeTest && (
            <button
              type="button"
              onClick={onTakeTest}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer shrink-0"
            >
              पहला टेस्ट दें →
            </button>
          )}
        </div>
      )}
    </div>
  );
};
