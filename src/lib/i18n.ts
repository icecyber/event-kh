export type Locale = "en" | "km" | "zh";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "km", label: "ខ្មែរ", flag: "🇰🇭" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

// Flat key→translation dictionary per locale
const translations = {
  // ── NavBar ──────────────────────────────────────────────
  "nav.browseEvents": { en: "Browse Events", km: "រកមើលព្រឹត្តិការណ៍", zh: "浏览活动" },
  "nav.dashboard": { en: "Dashboard", km: "ផ្ទាំងគ្រប់គ្រង", zh: "控制台" },
  "nav.signOut": { en: "Sign out", km: "ចាកចេញ", zh: "退出登录" },
  "nav.logIn": { en: "Log in", km: "ចូល", zh: "登录" },
  "nav.signUp": { en: "Sign up", km: "ចុះឈ្មោះ", zh: "注册" },

  // ── Landing page ───────────────────────────────────────
  "home.badge": { en: "🎉 Free to use", km: "🎉 ប្រើប្រាស់ដោយឥតគិតថ្លៃ", zh: "🎉 免费使用" },
  "home.heroTitle1": { en: "The easiest way to manage ", km: "មធ្យោបាយងាយស្រួលបំផុតក្នុងការគ្រប់គ្រង ", zh: "管理柬埔寨活动" },
  "home.heroTitle2": { en: "events in Cambodia", km: "ព្រឹត្តិការណ៍នៅកម្ពុជា", zh: "最简单的方式" },
  "home.heroDesc": {
    en: "Create events, build custom registration forms, issue QR tickets, redeem check-ins, and export participant data — all in one place.",
    km: "បង្កើតព្រឹត្តិការណ៍ សង់ទម្រង់ចុះឈ្មោះផ្ទាល់ខ្លួន ចេញសំបុត្រ QR ស្កេនចូល និងនាំចេញទិន្នន័យអ្នកចូលរួម — ទាំងអស់នៅកន្លែងតែមួយ។",
    zh: "创建活动、构建自定义注册表单、发放二维码门票、扫码签到、导出参与者数据——一站式完成。",
  },
  "home.getStarted": { en: "Get Started Free →", km: "ចាប់ផ្តើមដោយឥតគិតថ្លៃ →", zh: "免费开始 →" },
  "home.browseEvents": { en: "Browse Events", km: "រកមើលព្រឹត្តិការណ៍", zh: "浏览活动" },
  "home.featuresTitle": { en: "Everything you need to run great events", km: "អ្វីគ្រប់យ៉ាងដែលអ្នកត្រូវការដើម្បីរៀបចំព្រឹត្តិការណ៍ល្អ", zh: "举办精彩活动所需的一切" },
  "home.featuresDesc": { en: "From registration to check-in, EventKH has you covered end-to-end.", km: "ពីការចុះឈ្មោះរហូតដល់ការស្កេនចូល EventKH គ្របដណ្តប់គ្រប់ជំហាន។", zh: "从注册到签到，EventKH 为您提供端到端服务。" },
  "home.ctaTitle": { en: "Ready to host your next event?", km: "ត្រៀមខ្លួនរៀបចំព្រឹត្តិការណ៍បន្ទាប់របស់អ្នកហើយ?", zh: "准备好举办您的下一个活动了吗？" },
  "home.ctaDesc": { en: "Sign up as an organizer and create your first event in minutes.", km: "ចុះឈ្មោះជាអ្នករៀបចំ ហើយបង្កើតព្រឹត្តិការណ៍ដំបូងរបស់អ្នកក្នុងរយៈពេលប៉ុន្មាននាទី។", zh: "注册成为组织者，几分钟内创建您的第一个活动。" },
  "home.createEvent": { en: "Create your event →", km: "បង្កើតព្រឹត្តិការណ៍ →", zh: "创建您的活动 →" },
  "home.footer": { en: "All rights reserved.", km: "រក្សាសិទ្ធិគ្រប់យ៉ាង។", zh: "版权所有。" },

  // ── Feature cards ──────────────────────────────────────
  "feat.createEvents": { en: "Create Events", km: "បង្កើតព្រឹត្តិការណ៍", zh: "创建活动" },
  "feat.createEventsDesc": { en: "Set up events with title, description, date, location, capacity, and banner image in minutes.", km: "រៀបចំព្រឹត្តិការណ៍ជាមួយចំណងជើង ការពិពណ៌នា កាលបរិច្ឆេទ ទីតាំង សមត្ថភាព និងរូបភាពបដា ក្នុងរយៈពេលប៉ុន្មាននាទី។", zh: "几分钟内设置活动的标题、描述、日期、地点、容量和横幅图片。" },
  "feat.customForms": { en: "Custom Forms", km: "ទម្រង់ផ្ទាល់ខ្លួន", zh: "自定义表单" },
  "feat.customFormsDesc": { en: "Build tailored registration forms with text, select, checkbox, and number fields.", km: "សង់ទម្រង់ចុះឈ្មោះផ្ទាល់ខ្លួនជាមួយវាលអត្ថបទ ជ្រើសរើស ប្រអប់ធីក និងលេខ។", zh: "使用文本、选择、复选框和数字字段构建定制注册表单。" },
  "feat.qrTickets": { en: "QR Code Tickets", km: "សំបុត្រ QR Code", zh: "二维码门票" },
  "feat.qrTicketsDesc": { en: "Every attendee gets a unique QR code for seamless check-in at the door.", km: "អ្នកចូលរួមគ្រប់រូបទទួលបាន QR code ពិសេសសម្រាប់ការស្កេនចូលដោយរលូន។", zh: "每位参与者获得唯一的二维码，实现无缝入场签到。" },
  "feat.pngBadges": { en: "PNG Badges", km: "ផ្លាកសញ្ញា PNG", zh: "PNG 徽章" },
  "feat.pngBadgesDesc": { en: "Issue beautiful branded badges with a custom background — ready to download instantly.", km: "ចេញផ្លាកសញ្ញាដ៏ស្រស់ស្អាតជាមួយផ្ទៃខាងក្រោយផ្ទាល់ខ្លួន — រួចរាល់សម្រាប់ទាញយកភ្លាមៗ។", zh: "发放带有自定义背景的精美品牌徽章——可立即下载。" },
  "feat.searchFilter": { en: "Search & Filter", km: "ស្វែងរក និងត្រង", zh: "搜索和筛选" },
  "feat.searchFilterDesc": { en: "Find any participant by name or email across all your events in real time.", km: "ស្វែងរកអ្នកចូលរួមតាមឈ្មោះ ឬអ៊ីមែលក្នុងព្រឹត្តិការណ៍ទាំងអស់របស់អ្នកក្នុងពេលវេលាជាក់ស្តែង។", zh: "实时通过姓名或电子邮件在所有活动中查找任何参与者。" },
  "feat.exportCsv": { en: "Export CSV", km: "នាំចេញ CSV", zh: "导出 CSV" },
  "feat.exportCsvDesc": { en: "Download all participant data including custom field answers to a spreadsheet.", km: "ទាញយកទិន្នន័យអ្នកចូលរួមទាំងអស់រួមទាំងចម្លើយវាលផ្ទាល់ខ្លួនទៅក្នុងសៀវភៅបញ្ជី។", zh: "下载所有参与者数据（包括自定义字段答案）到电子表格。" },

  // ── Auth pages ─────────────────────────────────────────
  "auth.signInTitle": { en: "Sign in to your account", km: "ចូលទៅគណនីរបស់អ្នក", zh: "登录您的账户" },
  "auth.orCreateAccount": { en: "Or", km: "ឬ", zh: "或者" },
  "auth.createNewAccount": { en: "create a new account", km: "បង្កើតគណនីថ្មី", zh: "创建新账户" },
  "auth.emailPlaceholder": { en: "Email address", km: "អាសយដ្ឋានអ៊ីមែល", zh: "电子邮箱" },
  "auth.passwordPlaceholder": { en: "Password", km: "ពាក្យសម្ងាត់", zh: "密码" },
  "auth.signInBtn": { en: "Sign in", km: "ចូល", zh: "登录" },
  "auth.signingIn": { en: "Signing in...", km: "កំពុងចូល...", zh: "正在登录..." },
  "auth.invalidCredentials": { en: "Invalid credentials. Please try again.", km: "ព័ត៌មានមិនត្រឹមត្រូវ។ សូមព្យាយាមម្តងទៀត។", zh: "凭据无效，请重试。" },
  "auth.createAccountTitle": { en: "Create a new account", km: "បង្កើតគណនីថ្មី", zh: "创建新账户" },
  "auth.alreadyHaveAccount": { en: "Already have an account?", km: "មានគណនីរួចហើយ?", zh: "已经有账户？" },
  "auth.signIn": { en: "Sign in", km: "ចូល", zh: "登录" },
  "auth.fullNamePlaceholder": { en: "Full Name", km: "ឈ្មោះពេញ", zh: "全名" },
  "auth.iAmA": { en: "I am a:", km: "ខ្ញុំជា:", zh: "我是：" },
  "auth.attendee": { en: "Attendee", km: "អ្នកចូលរួម", zh: "参与者" },
  "auth.organizer": { en: "Event Organizer", km: "អ្នករៀបចំព្រឹត្តិការណ៍", zh: "活动组织者" },
  "auth.registerBtn": { en: "Register", km: "ចុះឈ្មោះ", zh: "注册" },
  "auth.registering": { en: "Registering...", km: "កំពុងចុះឈ្មោះ...", zh: "正在注册..." },

  // ── Browse Events ──────────────────────────────────────
  "events.title": { en: "Browse Events", km: "រកមើលព្រឹត្តិការណ៍", zh: "浏览活动" },
  "events.subtitle": { en: "Discover and register for upcoming events near you.", km: "ស្វែងរក និងចុះឈ្មោះសម្រាប់ព្រឹត្តិការណ៍នៅជិតអ្នក។", zh: "发现并注册您附近即将举行的活动。" },
  "events.noEvents": { en: "No events yet", km: "មិនទាន់មានព្រឹត្តិការណ៍", zh: "暂无活动" },
  "events.checkBackSoon": { en: "Check back soon — new events are being added all the time.", km: "សូមពិនិត្យមកម្តងទៀត — ព្រឹត្តិការណ៍ថ្មីកំពុងត្រូវបានបន្ថែម។", zh: "请稍后再来查看——新活动正在不断添加。" },
  "events.registered": { en: "registered", km: "បានចុះឈ្មោះ", zh: "已注册" },
  "events.capacity": { en: "capacity", km: "សមត្ថភាព", zh: "容量" },
  "events.by": { en: "By", km: "ដោយ", zh: "组织者" },
  "events.full": { en: "FULL", km: "ពេញ", zh: "已满" },
  "events.free": { en: "Free", km: "ឥតគិតថ្លៃ", zh: "免费" },

  // ── Event Detail ───────────────────────────────────────
  "event.about": { en: "About this event", km: "អំពីព្រឹត្តិការណ៍នេះ", zh: "关于此活动" },
  "event.registrationRequires": { en: "What you need to register", km: "អ្វីដែលអ្នកត្រូវការដើម្បីចុះឈ្មោះ", zh: "注册所需信息" },
  "event.organizedBy": { en: "Organized by", km: "រៀបចំដោយ", zh: "组织者" },
  "event.spotsLeft": { en: "spots left", km: "កន្លែងនៅសល់", zh: "剩余名额" },
  "event.tickets": { en: "Tickets", km: "សំបុត្រ", zh: "门票" },
  "event.alreadyRegistered": { en: "✅ You are already registered!", km: "✅ អ្នកបានចុះឈ្មោះរួចហើយ!", zh: "✅ 您已经注册了！" },
  "event.viewTicket": { en: "View My Ticket →", km: "មើលសំបុត្ររបស់ខ្ញុំ →", zh: "查看我的门票 →" },
  "event.eventFull": { en: "🚫 This event is full.", km: "🚫 ព្រឹត្តិការណ៍នេះពេញហើយ។", zh: "🚫 此活动已满。" },
  "event.registerNow": { en: "Register Now →", km: "ចុះឈ្មោះឥឡូវ →", zh: "立即注册 →" },
  "event.registerNoLogin": { en: "Register Now — No Login Required →", km: "ចុះឈ្មោះឥឡូវ — មិនចាំបាច់ចូលគណនី →", zh: "立即注册 — 无需登录 →" },
  "event.noAccountPhone": { en: "✨ No account needed — just your name & phone number", km: "✨ មិនចាំបាច់គណនី — គ្រាន់តែឈ្មោះ និងលេខទូរសព្ទ", zh: "✨ 无需账户——只需您的姓名和手机号" },
  "event.noAccountEmail": { en: "✨ No account needed — just your name & email address", km: "✨ មិនចាំបាច់គណនី — គ្រាន់តែឈ្មោះ និងអ៊ីមែល", zh: "✨ 无需账户——只需您的姓名和电子邮箱" },
  "event.exhibition": { en: "🎪 Exhibition", km: "🎪 ពិព័រណ៍", zh: "🎪 展览" },
  "event.standard": { en: "📅 Standard", km: "📅 ស្តង់ដារ", zh: "📅 标准" },
  "event.optional": { en: "(optional)", km: "(ជម្រើស)", zh: "(可选)" },

  // ── Registration form ──────────────────────────────────
  "reg.title": { en: "Registering for", km: "កំពុងចុះឈ្មោះសម្រាប់", zh: "注册参加" },
  "reg.guestAttendee": { en: "Guest Attendee", km: "អ្នកចូលរួមភ្ញៀវ", zh: "访客" },
  "reg.registeringAs": { en: "Registering as", km: "ចុះឈ្មោះក្នុងនាម", zh: "注册身份" },
  "reg.completeRegistration": { en: "Complete your registration", km: "បំពេញការចុះឈ្មោះរបស់អ្នក", zh: "完成您的注册" },
  "reg.yourDetails": { en: "Your Details", km: "ព័ត៌មានរបស់អ្នក", zh: "您的信息" },
  "reg.noAccountNeeded": { en: "No account needed! Just fill in your name and phone number.", km: "មិនចាំបាច់គណនី! គ្រាន់តែបំពេញឈ្មោះ និងលេខទូរសព្ទ។", zh: "无需账户！只需填写您的姓名和手机号。" },
  "reg.preFilled": { en: "We've pre-filled your info from your account. Feel free to update it.", km: "យើងបានបំពេញព័ត៌មានពីគណនីរបស់អ្នក។ អ្នកអាចកែប្រែវាបាន។", zh: "我们已从您的账户预填了信息，您可以随时修改。" },
  "reg.enterDetails": { en: "Please enter your contact details to register.", km: "សូមបំពេញព័ត៌មានទំនាក់ទំនងដើម្បីចុះឈ្មោះ។", zh: "请输入您的联系方式进行注册。" },
  "reg.fullName": { en: "Full Name", km: "ឈ្មោះពេញ", zh: "全名" },
  "reg.phoneNumber": { en: "Phone Number", km: "លេខទូរសព្ទ", zh: "手机号码" },
  "reg.emailAddress": { en: "Email Address", km: "អាសយដ្ឋានអ៊ីមែល", zh: "电子邮箱" },
  "reg.selectTicket": { en: "Select Ticket Type", km: "ជ្រើសរើសប្រភេទសំបុត្រ", zh: "选择门票类型" },
  "reg.completeBtn": { en: "Complete Registration →", km: "បញ្ចប់ការចុះឈ្មោះ →", zh: "完成注册 →" },
  "reg.registering": { en: "Registering…", km: "កំពុងចុះឈ្មោះ…", zh: "正在注册…" },

  // ── Common ─────────────────────────────────────────────
  "common.required": { en: "Required", km: "ចាំបាច់", zh: "必填" },
  "common.optional": { en: "Optional", km: "ជម្រើស", zh: "可选" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key]?.[locale] ?? translations[key]?.en ?? key;
}

export default translations;
