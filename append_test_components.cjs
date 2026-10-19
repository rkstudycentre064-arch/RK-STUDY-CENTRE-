const fs = require('fs');

const testPlayerCode = `
// --- Test Player Component ---
function TestPlayer({ test, onFinish, onCancel }: { test: TestItem, onFinish: (resultId: string) => void, onCancel: () => void }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(test.durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const questions = useMemo(() => TEST_QUESTIONS.filter(q => q.testId === test.id).sort((a, b) => a.order - b.order), [test.id]);
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (test.durationMinutes <= 0 || isSubmitting) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [test.durationMinutes, isSubmitting]);

  const handleAutoSubmit = () => {
    if (!isSubmitting) submitTest(selectedAnswers);
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const confirmSubmit = () => {
    setShowConfirmSubmit(true);
  };

  const submitTest = (answersToSubmit: Record<string, number>) => {
    setIsSubmitting(true);
    setShowConfirmSubmit(false);
    
    // Calculate result
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    let score = 0;

    questions.forEach(q => {
      const selected = answersToSubmit[q.id];
      if (selected === undefined) {
        unattempted++;
      } else if (selected === q.correctOption) {
        correct++;
        score += q.marks;
      } else {
        incorrect++;
        if (test.isNegativeMarking) score -= (q.marks * 0.25); // Example negative marking
      }
    });

    const resultId = 'res-' + Math.random().toString(36).substr(2, 9);
    
    // In real app, save to Firestore here.
    // We will just pass it to localStorage for preview persistence
    const resultObj = {
      id: resultId,
      testId: test.id,
      studentId: 'current-student',
      score,
      totalMarks: test.totalMarks,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unattempted,
      timeTakenMinutes: test.durationMinutes > 0 ? (test.durationMinutes * 60 - timeLeft) / 60 : 0,
      completedAt: new Date().toISOString(),
      studentAnswers: answersToSubmit
    };
    
    localStorage.setItem(\`rk_test_result_\${resultId}\`, JSON.stringify(resultObj));
    
    // Navigate to result
    setTimeout(() => {
      onFinish(resultId);
    }, 500);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return \`\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`;
  };

  if (!currentQuestion) {
    return (
      <div className="bg-white rounded-3xl p-16 border-2 border-slate-200 text-center space-y-5 shadow-sm max-w-3xl mx-auto mt-6">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800">इस टेस्ट में कोई प्रश्न उपलब्ध नहीं है।</h3>
        <button onClick={onCancel} className="px-6 py-3 rounded-xl bg-slate-100 font-bold">वापस जाएं</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-4 z-10">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">चल रहा है (In Progress)</div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 truncate">{test.title}</h2>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {test.durationMinutes > 0 && (
            <div className={\`flex items-center gap-2 px-4 py-2 rounded-xl font-bold border-2 \${timeLeft < 60 ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-blue-50 text-blue-700 border-blue-200'}\`}>
              <Clock className="w-5 h-5" />
              <span className="text-lg tabular-nums">{formatTime(timeLeft)}</span>
            </div>
          )}
          <button onClick={confirmSubmit} className="px-5 py-2 rounded-xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors">
            Test जमा करें
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <div className="text-lg font-black text-slate-900">जमा किया जा रहा है...</div>
          </div>
        )}

        <div className="flex items-start justify-between gap-4 border-b-2 border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-lg">
              {currentQuestionIndex + 1}
            </span>
            <span className="text-slate-500 font-bold">/ {questions.length}</span>
          </div>
          <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
            अंक: {currentQuestion.marks}
          </div>
        </div>

        <div className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
          {currentQuestion.question}
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentQuestion.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                className={\`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 group \${
                  isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-400 bg-white'
                }\`}
              >
                <div className={\`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 \${
                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-blue-400'
                }\`}>
                  {isSelected && <div className="w-3 h-3 rounded-full bg-white" />}
                </div>
                <span className={\`text-lg font-bold \${isSelected ? 'text-blue-900' : 'text-slate-700'}\`}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 rounded-xl font-bold bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          पिछला
        </button>
        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
          className="px-6 py-3 rounded-xl font-bold bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          अगला
        </button>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-2xl font-black text-slate-900">क्या आप Test जमा करना चाहते हैं?</h3>
            <p className="text-slate-600 font-medium text-lg">
              आपने {Object.keys(selectedAnswers).length} / {questions.length} प्रश्नों के उत्तर दिए हैं।
            </p>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setShowConfirmSubmit(false)} className="flex-1 py-3 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200">
                रद्द करें
              </button>
              <button onClick={() => submitTest(selectedAnswers)} className="flex-1 py-3 rounded-xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                जमा करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Test Result Component ---
function TestResultView({ resultId, onBack }: { resultId: string, onBack: () => void }) {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem(\`rk_test_result_\${resultId}\`);
    if (data) setResult(JSON.parse(data));
  }, [resultId]);

  if (!result) return <div className="p-10 text-center text-lg font-bold">लोड हो रहा है...</div>;

  const test = TESTS.find(t => t.id === result.testId);
  if (!test) return <div className="p-10 text-center">टेस्ट नहीं मिला</div>;

  const questions = TEST_QUESTIONS.filter(q => q.testId === test.id).sort((a, b) => a.order - b.order);
  const percentage = (result.score / result.totalMarks) * 100;
  const isPassed = result.score >= test.passingMarks;

  return (
    <div className="space-y-8 py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="px-4 py-2 rounded-xl text-sm font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 cursor-pointer transition-colors">
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>वापस</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-sm text-center space-y-6">
        <div className={\`w-20 h-20 rounded-full flex items-center justify-center mx-auto \${isPassed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}\`}>
          {isPassed ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
        </div>
        
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Test Result</h2>
          <p className="text-slate-600 font-bold text-lg">{test.title}</p>
        </div>

        <div className="flex items-center justify-center gap-6 py-6 border-y-2 border-slate-50">
          <div className="text-center">
            <div className={\`text-4xl font-black \${isPassed ? 'text-green-600' : 'text-red-600'}\`}>
              {result.score} <span className="text-2xl text-slate-400">/ {result.totalMarks}</span>
            </div>
            <div className="text-sm font-bold text-slate-500 uppercase mt-2">प्राप्त अंक (Score)</div>
          </div>
          <div className="w-px h-16 bg-slate-200"></div>
          <div className="text-center">
            <div className="text-4xl font-black text-slate-900">{percentage.toFixed(0)}%</div>
            <div className="text-sm font-bold text-slate-500 uppercase mt-2">प्रतिशत (Percentage)</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <div className="text-2xl font-black text-emerald-700">{result.correctAnswers}</div>
            <div className="text-xs font-bold text-emerald-600 uppercase mt-1">सही उत्तर</div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <div className="text-2xl font-black text-red-700">{result.incorrectAnswers}</div>
            <div className="text-xs font-bold text-red-600 uppercase mt-1">गलत उत्तर</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="text-2xl font-black text-slate-700">{result.unattempted}</div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">छोड़े गए</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-black text-slate-900">उत्तर समीक्षा (Answer Review)</h3>
        <div className="space-y-6">
          {questions.map((q, i) => {
            const studentAns = result.studentAnswers[q.id];
            const isCorrect = studentAns === q.correctOption;
            const isUnattempted = studentAns === undefined;

            return (
              <div key={q.id} className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm">
                      {i + 1}
                    </span>
                    <span className={\`text-xs font-bold px-3 py-1 rounded-md uppercase \${isCorrect ? 'bg-green-100 text-green-700' : isUnattempted ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'}\`}>
                      {isCorrect ? 'सही (Correct)' : isUnattempted ? 'छोड़ा गया (Unattempted)' : 'गलत (Incorrect)'}
                    </span>
                  </div>
                </div>
                
                <h4 className="text-lg font-black text-slate-900">{q.question}</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIdx) => {
                    const isStudentChoice = studentAns === optIdx;
                    const isActualCorrect = q.correctOption === optIdx;
                    
                    let bgClass = "bg-slate-50 border-slate-200 text-slate-700";
                    if (isActualCorrect) bgClass = "bg-green-50 border-green-400 text-green-900 ring-1 ring-green-400";
                    else if (isStudentChoice && !isActualCorrect) bgClass = "bg-red-50 border-red-300 text-red-900";

                    return (
                      <div key={optIdx} className={\`p-4 rounded-xl border-2 font-bold \${bgClass} flex items-center justify-between\`}>
                        <span>{opt}</span>
                        {isStudentChoice && isActualCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                        {isStudentChoice && !isActualCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                        {!isStudentChoice && isActualCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 opacity-50" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

`;

fs.appendFileSync('src/views/TestsView.tsx', testPlayerCode);
