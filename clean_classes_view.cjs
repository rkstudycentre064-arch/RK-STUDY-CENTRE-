const fs = require('fs');

let content = fs.readFileSync('src/views/ClassesView.tsx', 'utf8');

// Remove states
content = content.replace('  const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(false);\n', '');
content = content.replace('  const [materialError, setMaterialError] = useState<string | null>(null);\n', '');
content = content.replace('  const [chapterMaterials, setChapterMaterials] = useState<any[]>([]);\n', '');

// Remove the effect
const effectBlockStart = '  // Simulate fetching study materials for the chapter\n  useEffect(() => {';
const effectIndex = content.indexOf(effectBlockStart);

if (effectIndex !== -1) {
  // Find the end of this effect. It ends with: `  }, [selectedChapter, selectedClass, selectedSubject, selectedBook]);`
  const effectEnd = '  }, [selectedChapter, selectedClass, selectedSubject, selectedBook]);\n';
  const effectEndIndex = content.indexOf(effectEnd, effectIndex);
  
  if (effectEndIndex !== -1) {
    const toRemove = content.substring(effectIndex, effectEndIndex + effectEnd.length);
    content = content.replace(toRemove, '');
  }
}

// Remove FileText since it might be unused?
// Actually we used FileText in the new block. 
// "import { ..., FileText, FolderOpen ... } from 'lucide-react';"
// No need to touch imports, it's fine.

fs.writeFileSync('src/views/ClassesView.tsx', content);
