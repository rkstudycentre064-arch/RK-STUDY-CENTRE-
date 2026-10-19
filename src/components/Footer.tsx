import { GraduationCap, Mail, Phone, MapPin, ShieldCheck, Heart } from 'lucide-react';
import type { MainNavRoute, ClassLevel, MoreSectionTab } from '../types';
import { useSettings } from '../context/SettingsContext';
import { getStandaloneAppUrl, openPolicyInNewTab } from '../utils/navigationUtils';

interface FooterProps {
  onNavigate: (
    route: MainNavRoute,
    params?: {
      classLevel?: ClassLevel;
      subjectSlug?: string;
      bookSlug?: string;
      chapterSlug?: string;
      moreTab?: MoreSectionTab;
    }
  ) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { settings } = useSettings();
  const websiteName = settings.websiteName || 'RK STUDY CENTRE';
  const supportEmail = settings.supportEmail || 'rkstudycentre064@gmail.com';

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* मुख्य फुटर अनुभाग */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-14">
          
          {/* ब्रांड जानकारी */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                <GraduationCap className="w-7 h-7" />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {websiteName}
              </span>
            </div>
            <p className="text-slate-300 text-base leading-relaxed max-w-md font-medium">
              बिहार बोर्ड माध्यमिक एवं उच्च माध्यमिक विद्यार्थियों के लिए प्रामाणिक अध्ययन सामग्री, 
              अध्यायवार हस्तलिखित नोट्स, पिछले वर्षों के प्रश्न पत्र (PYQs), मॉडल पेपर्स एवं ऑनलाइन टेस्ट की संपूर्ण व्यवस्था।
            </p>
            <div className="pt-2 text-sm sm:text-base text-slate-300 space-y-2.5 font-medium">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                <span>
                  ईमेल:{' '}
                  <a
                    href={`mailto:${supportEmail}`}
                    className="text-white hover:text-blue-300 underline underline-offset-2 font-mono"
                  >
                    {supportEmail}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
                <span>बिहार, भारत • ऑनलाइन शिक्षण पोर्टल</span>
              </div>
            </div>
          </div>

          {/* कक्षाएं (Dedicated Classes) */}
          <div>
            <h4 className="text-white text-base font-extrabold uppercase tracking-wider mb-5">
              कक्षा वर्ग
            </h4>
            <ul className="space-y-3 text-base">
              <li>
                <a
                  href="/classes/class-9"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('classes', { classLevel: 'class-9' });
                  }}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-block"
                >
                  कक्षा 9वीं (Class 9 Notes)
                </a>
              </li>
              <li>
                <a
                  href="/classes/class-10"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('classes', { classLevel: 'class-10' });
                  }}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-block"
                >
                  कक्षा 10वीं (मैट्रिक बोर्ड / BSEB)
                </a>
              </li>
              <li>
                <a
                  href="/classes/class-11"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('classes', { classLevel: 'class-11' });
                  }}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-block"
                >
                  कक्षा 11वीं (इंटर प्रथम वर्ष)
                </a>
              </li>
              <li>
                <a
                  href="/classes/class-12"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('classes', { classLevel: 'class-12' });
                  }}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-block"
                >
                  कक्षा 12वीं (इंटर बोर्ड)
                </a>
              </li>
              <li className="pt-1">
                <a
                  href="/classes"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('classes');
                  }}
                  className="text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer text-left text-sm inline-flex items-center gap-1"
                >
                  <span>सभी कक्षाओं का पाठ्यक्रम देखें →</span>
                </a>
              </li>
            </ul>
          </div>

          {/* अध्ययन व मूल्यांकन (Study & Testing) */}
          <div>
            <h4 className="text-white text-base font-extrabold uppercase tracking-wider mb-5">
              अध्ययन व टेस्ट
            </h4>
            <ul className="space-y-3 text-base">
              <li>
                <a
                  href="/study-material"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('study-material');
                  }}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-block"
                >
                  हस्तलिखित एवं डिजिटल नोट्स (PDF)
                </a>
              </li>
              <li>
                <a
                  href="/formula-bank"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('formula-bank');
                  }}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-block"
                >
                  सूत्र एवं प्रमेय बैंक (Formula Bank)
                </a>
              </li>
              <li>
                <a
                  href="/study-material"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('study-material');
                  }}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-block"
                >
                  प्रश्न बैंक एवं विगत वर्ष प्रश्न (PYQ)
                </a>
              </li>
              <li>
                <a
                  href="/tests"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('tests');
                  }}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-block"
                >
                  ऑनलाइन अध्याय एवं विषय टेस्ट
                </a>
              </li>
              <li>
                <a
                  href="/courses"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('courses');
                  }}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-block"
                >
                  विशेष लक्ष्य बैच एवं कोर्सेज
                </a>
              </li>
              <li>
                <a
                  href="/solve-doubt"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('solve-doubt');
                  }}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-block"
                >
                  24×7 AI शंका समाधान (Doubt Solver)
                </a>
              </li>
              <li>
                <a
                  href="/vlogs"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('vlogs');
                  }}
                  className="text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer text-left py-0.5 inline-flex items-center gap-1.5"
                >
                  <span>🎥 व्लॉग एवं टॉपर वार्ता</span>
                </a>
              </li>
            </ul>
          </div>

          {/* कानूनी व नीतियां (Legal & Information) */}
          <div>
            <h4 className="text-white text-base font-extrabold uppercase tracking-wider mb-5">
              <a
                href={getStandaloneAppUrl('/policies')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => openPolicyInNewTab(e, '/policies', () => onNavigate('policies'))}
                className="hover:text-blue-400 transition-colors"
                title="महत्वपूर्ण नीतियाँ (नए टैब में खोलें)"
              >
                महत्वपूर्ण नीतियाँ
              </a>
            </h4>
            <ul className="space-y-3 text-base">
              <li>
                <a
                  href={getStandaloneAppUrl('/policies')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => openPolicyInNewTab(e, '/policies', () => onNavigate('policies'))}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-flex items-center gap-1.5"
                >
                  <span>महत्वपूर्ण नीतियाँ (Policies Hub)</span>
                </a>
              </li>
              <li>
                <a
                  href={getStandaloneAppUrl('/about-us')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => openPolicyInNewTab(e, '/about-us', () => onNavigate('about-us'))}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-flex items-center gap-1.5"
                >
                  <span>हमारे बारे में (About Us)</span>
                </a>
              </li>
              <li>
                <a
                  href={getStandaloneAppUrl('/faq')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => openPolicyInNewTab(e, '/faq', () => onNavigate('faq'))}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-flex items-center gap-1.5"
                >
                  <span>प्रश्नोत्तरी / सहायता केंद्र (FAQ)</span>
                </a>
              </li>
              <li>
                <a
                  href={getStandaloneAppUrl('/contact-support')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => openPolicyInNewTab(e, '/contact-support', () => onNavigate('contact-support'))}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-flex items-center gap-1.5"
                >
                  <span>संपर्क सहायता (Contact Support)</span>
                </a>
              </li>
              <li>
                <a
                  href={getStandaloneAppUrl('/terms-and-conditions')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => openPolicyInNewTab(e, '/terms-and-conditions', () => onNavigate('terms-and-conditions'))}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-flex items-center gap-1.5"
                >
                  <span>नियम एवं शर्तें (Terms & Conditions)</span>
                </a>
              </li>
              <li>
                <a
                  href={getStandaloneAppUrl('/privacy-policy')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => openPolicyInNewTab(e, '/privacy-policy', () => onNavigate('privacy-policy'))}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-flex items-center gap-1.5"
                >
                  <span>गोपनीयता नीति (Privacy Policy)</span>
                </a>
              </li>
              <li>
                <a
                  href={getStandaloneAppUrl('/refund-cancellation')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => openPolicyInNewTab(e, '/refund-cancellation', () => onNavigate('refund-cancellation'))}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-flex items-center gap-1.5"
                >
                  <span>रिफंड और रद्दीकरण (Refund Policy)</span>
                </a>
              </li>
              <li>
                <a
                  href={getStandaloneAppUrl('/data-privacy')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => openPolicyInNewTab(e, '/data-privacy', () => onNavigate('data-privacy'))}
                  className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer text-left py-0.5 inline-flex items-center gap-1.5"
                >
                  <span>डेटा गोपनीयता अधिकार (Data Privacy)</span>
                </a>
              </li>
              <li className="pt-2 border-t border-slate-800">
                <a
                  href={getStandaloneAppUrl('/admin-access-check')}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  onClick={(e) => openPolicyInNewTab(e, '/admin-access-check', () => onNavigate('admin-access-check'))}
                  className="text-purple-400 hover:text-purple-300 font-bold transition-colors cursor-pointer text-left py-0.5 inline-flex items-center gap-1.5 text-xs"
                >
                  <span>Admin Access Check (अनुमति जांच)</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* SEO Direct Discovery Links for Crawlers & Students */}
        <div className="mt-10 pt-8 border-t border-slate-800/80 space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            लोकप्रिय बोर्ड परीक्षा अध्ययन लिंक (Direct Study &amp; Notes Links)
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-400">
            <a
              href="/class-10-maths-notes"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/class-10-maths-notes');
                onNavigate('study-material', { classLevel: 'class-10', subjectSlug: 'math' });
              }}
              className="hover:text-white transition-colors"
            >
              Class 10 Maths Notes
            </a>
            <span>•</span>
            <a
              href="/class-10-science-notes"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/class-10-science-notes');
                onNavigate('study-material', { classLevel: 'class-10', subjectSlug: 'sci' });
              }}
              className="hover:text-white transition-colors"
            >
              Class 10 Science Notes
            </a>
            <span>•</span>
            <a
              href="/class-10-social-science-notes"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/class-10-social-science-notes');
                onNavigate('study-material', { classLevel: 'class-10', subjectSlug: 'soc' });
              }}
              className="hover:text-white transition-colors"
            >
              Class 10 Social Science Notes
            </a>
            <span>•</span>
            <a
              href="/bihar-board-class-10-notes"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/bihar-board-class-10-notes');
                onNavigate('study-material', { classLevel: 'class-10' });
              }}
              className="hover:text-white transition-colors"
            >
              Bihar Board Class 10 Notes
            </a>
            <span>•</span>
            <a
              href="/bseb-matric-notes"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/bseb-matric-notes');
                onNavigate('study-material', { classLevel: 'class-10' });
              }}
              className="hover:text-white transition-colors"
            >
              BSEB Matric Notes
            </a>
            <span>•</span>
            <a
              href="/class-10-vvi-questions"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/class-10-vvi-questions');
                onNavigate('tests', { classLevel: 'class-10' });
              }}
              className="hover:text-white transition-colors"
            >
              Class 10 VVI Questions
            </a>
            <span>•</span>
            <a
              href="/class-10-online-study"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/class-10-online-study');
                onNavigate('classes', { classLevel: 'class-10' });
              }}
              className="hover:text-white transition-colors"
            >
              Class 10 Online Study
            </a>
            <span>•</span>
            <a
              href="/class-9-to-12-online-study"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/class-9-to-12-online-study');
                onNavigate('classes');
              }}
              className="hover:text-white transition-colors"
            >
              Class 9 to 12 Online Study
            </a>
            <span>•</span>
            <a
              href="/class-12-physics-notes"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/class-12-physics-notes');
                onNavigate('study-material', { classLevel: 'class-12', subjectSlug: 'phy' });
              }}
              className="hover:text-white transition-colors"
            >
              Class 12 Physics Notes
            </a>
            <span>•</span>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Sitemap (XML)
            </a>
          </div>
        </div>
      </div>

      {/* निचली पट्टी (Bottom Bar) */}
      <div className="border-t border-slate-900 bg-slate-950 py-7 px-4 text-sm text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} <strong className="text-white font-bold">{websiteName}</strong>. सर्वाधिकार सुरक्षित।</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>कक्षा 9, 10, 11 एवं 12 हेतु प्रामाणिक डिजिटल शिक्षा मंच</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
