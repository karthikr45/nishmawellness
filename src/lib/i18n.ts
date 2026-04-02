// Internationalization framework
// Add translations here. Components use t("key") to get translated text.

export type Locale = "en" | "es" | "fr" | "de" | "pt" | "hi" | "zh" | "ja" | "ko" | "ar";

export const LOCALES: { code: Locale; name: string; flag: string; dir?: "rtl" }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦", dir: "rtl" },
];

type Translations = Record<string, Record<Locale, string>>;

const translations: Translations = {
  // Navigation
  "nav.dashboard": { en: "Dashboard", es: "Panel", fr: "Tableau de bord", de: "Dashboard", pt: "Painel", hi: "डैशबोर्ड", zh: "仪表板", ja: "ダッシュボード", ko: "대시보드", ar: "لوحة القيادة" },
  "nav.appointments": { en: "Appointments", es: "Citas", fr: "Rendez-vous", de: "Termine", pt: "Consultas", hi: "अपॉइंटमेंट", zh: "预约", ja: "予約", ko: "예약", ar: "المواعيد" },
  "nav.programs": { en: "Programs", es: "Programas", fr: "Programmes", de: "Programme", pt: "Programas", hi: "कार्यक्रम", zh: "课程", ja: "プログラム", ko: "프로그램", ar: "البرامج" },
  "nav.messages": { en: "Messages", es: "Mensajes", fr: "Messages", de: "Nachrichten", pt: "Mensagens", hi: "संदेश", zh: "消息", ja: "メッセージ", ko: "메시지", ar: "الرسائل" },
  "nav.profile": { en: "Profile", es: "Perfil", fr: "Profil", de: "Profil", pt: "Perfil", hi: "प्रोफ़ाइल", zh: "个人资料", ja: "プロフィール", ko: "프로필", ar: "الملف الشخصي" },

  // Common
  "common.welcome_back": { en: "Welcome back", es: "Bienvenido de nuevo", fr: "Bienvenue", de: "Willkommen zurück", pt: "Bem-vindo de volta", hi: "वापसी पर स्वागत है", zh: "欢迎回来", ja: "おかえりなさい", ko: "다시 오신 것을 환영합니다", ar: "مرحبًا بعودتك" },
  "common.book_session": { en: "Book Session", es: "Reservar sesión", fr: "Réserver", de: "Sitzung buchen", pt: "Agendar sessão", hi: "सत्र बुक करें", zh: "预约会话", ja: "セッション予約", ko: "세션 예약", ar: "حجز جلسة" },
  "common.save": { en: "Save", es: "Guardar", fr: "Sauvegarder", de: "Speichern", pt: "Salvar", hi: "सहेजें", zh: "保存", ja: "保存", ko: "저장", ar: "حفظ" },
  "common.cancel": { en: "Cancel", es: "Cancelar", fr: "Annuler", de: "Abbrechen", pt: "Cancelar", hi: "रद्द करें", zh: "取消", ja: "キャンセル", ko: "취소", ar: "إلغاء" },
  "common.submit": { en: "Submit", es: "Enviar", fr: "Soumettre", de: "Absenden", pt: "Enviar", hi: "जमा करें", zh: "提交", ja: "送信", ko: "제출", ar: "إرسال" },
  "common.loading": { en: "Loading...", es: "Cargando...", fr: "Chargement...", de: "Laden...", pt: "Carregando...", hi: "लोड हो रहा है...", zh: "加载中...", ja: "読み込み中...", ko: "로딩 중...", ar: "جار التحميل..." },
  "common.search": { en: "Search", es: "Buscar", fr: "Rechercher", de: "Suchen", pt: "Pesquisar", hi: "खोजें", zh: "搜索", ja: "検索", ko: "검색", ar: "بحث" },

  // Mood
  "mood.how_feeling": { en: "How are you feeling today?", es: "¿Cómo te sientes hoy?", fr: "Comment vous sentez-vous aujourd'hui?", de: "Wie fühlen Sie sich heute?", pt: "Como você está se sentindo hoje?", hi: "आज आप कैसा महसूस कर रहे हैं?", zh: "你今天感觉怎么样？", ja: "今日の気分は？", ko: "오늘 기분이 어떠세요?", ar: "كيف تشعر اليوم؟" },
  "mood.terrible": { en: "Terrible", es: "Terrible", fr: "Terrible", de: "Schrecklich", pt: "Terrível", hi: "बहुत बुरा", zh: "糟糕", ja: "最悪", ko: "최악", ar: "سيء جداً" },
  "mood.bad": { en: "Bad", es: "Mal", fr: "Mal", de: "Schlecht", pt: "Mal", hi: "बुरा", zh: "不好", ja: "悪い", ko: "나쁨", ar: "سيء" },
  "mood.okay": { en: "Okay", es: "Regular", fr: "Correct", de: "Okay", pt: "Ok", hi: "ठीक है", zh: "一般", ja: "普通", ko: "보통", ar: "عادي" },
  "mood.good": { en: "Good", es: "Bien", fr: "Bien", de: "Gut", pt: "Bem", hi: "अच्छा", zh: "好", ja: "良い", ko: "좋음", ar: "جيد" },
  "mood.great": { en: "Great", es: "Excelente", fr: "Excellent", de: "Großartig", pt: "Ótimo", hi: "बहुत अच्छा", zh: "很好", ja: "最高", ko: "최고", ar: "ممتاز" },

  // Crisis
  "crisis.not_alone": { en: "You're Not Alone", es: "No estás solo/a", fr: "Vous n'êtes pas seul(e)", de: "Sie sind nicht allein", pt: "Você não está sozinho/a", hi: "आप अकेले नहीं हैं", zh: "你并不孤单", ja: "あなたは一人じゃない", ko: "당신은 혼자가 아닙니다", ar: "أنت لست وحدك" },
  "crisis.call_911": { en: "Call 911", es: "Llama al 911", fr: "Appelez le 911", de: "Rufen Sie 112 an", pt: "Ligue 192", hi: "112 पर कॉल करें", zh: "拨打120", ja: "119に電話", ko: "119에 전화", ar: "اتصل بالطوارئ" },
};

let currentLocale: Locale = "en";

export function setLocale(locale: Locale) {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    localStorage.setItem("nishma-locale", locale);
    const dir = LOCALES.find((l) => l.code === locale)?.dir;
    document.documentElement.dir = dir || "ltr";
    document.documentElement.lang = locale;
  }
}

export function getLocale(): Locale {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("nishma-locale") as Locale | null;
    if (saved && LOCALES.some((l) => l.code === saved)) {
      currentLocale = saved;
    }
  }
  return currentLocale;
}

export function t(key: string): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[currentLocale] || entry.en || key;
}
