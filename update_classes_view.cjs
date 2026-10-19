const fs = require('fs');

let content = fs.readFileSync('src/views/ClassesView.tsx', 'utf8');

const startStr = '{selectedChapter && (';
const startIndex = content.indexOf(startStr);

if (startIndex !== -1) {
  // Let's replace everything from startStr to the end of the file with our custom block.
  // Actually, wait, it's safer to use regex or string replace if we know the exact structure.
  
  // It's the last selectedChapter block.
  // It starts at: {/* Step 4: Chapter Content (Study Material) */}
  const marker = '{/* Step 4: Chapter Content (Study Material) */}';
  const markerIndex = content.indexOf(marker);
  
  if (markerIndex !== -1) {
    const newBlock = `        {/* Step 4: Chapter Options */}
        {selectedChapter && (
           <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  अध्याय {selectedChapter.chapterNumber}: {selectedChapter.hindiTitle || selectedChapter.title}
                </h2>
                <p className="text-slate-700 text-sm sm:text-base font-medium mt-1">
                  आप इस अध्याय के लिए क्या देखना चाहते हैं?
                </p>
              </div>
              <button
                onClick={handleBackToChapters}
                className="px-4 py-2 rounded-xl text-sm font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-center"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">वापस</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div 
                onClick={() => onNavigate('study-material', { classLevel: selectedClass, subjectSlug: selectedSubjectSlug, bookSlug: selectedBookSlug, chapterSlug: selectedChapterSlug })}
                className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group text-center space-y-4"
              >
                <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                  अध्ययन सामग्री (Study Material)
                </h3>
                <p className="text-slate-600 font-medium">
                  नोट्स, PDF, मॉडल पेपर, प्रश्न बैंक एवं अन्य महत्वपूर्ण अध्ययन सामग्री देखें।
                </p>
              </div>

              <div 
                onClick={() => onNavigate('tests')}
                className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer group text-center space-y-4"
              >
                <div className="w-16 h-16 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-green-700 transition-colors">
                  ऑनलाइन टेस्ट (Online Tests)
                </h3>
                <p className="text-slate-600 font-medium">
                  इस अध्याय के लिए विषयवार ऑब्जेक्टिव (MCQ) एवं सब्जेक्टिव टेस्ट दें।
                </p>
              </div>
            </div>
           </div>
        )}
      </div>
    </div>
  );
}
`;
    content = content.substring(0, markerIndex) + newBlock;
    fs.writeFileSync('src/views/ClassesView.tsx', content);
    console.log("Updated ClassesView.tsx");
  }
}
