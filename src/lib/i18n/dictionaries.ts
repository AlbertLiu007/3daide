export type Locale = 'en' | 'de' | 'fr' | 'ja' | 'ar' | 'zh';

export type ViewerLabels = {
  lightFixed: string;
  lightFollow: string;
  lightFixedShort: string;
  lightFollowShort: string;
  hideGrid: string;
  showGrid: string;
  gridOn: string;
  gridOff: string;
  rotatePan: string;
  rotate: string;
  pan: string;
  resetView: string;
};

export type Dictionary = {
  localeName: string;
  dir: 'ltr' | 'rtl';
  nav: {
    how: string;
    privacy: string;
    github: string;
  };
  hero: {
    title: string;
    subtitle: string;
  };
  tabs: {
    convert: string;
    quote: string;
    dfm: string;
  };
  upload: {
    title: string;
    hint: string;
    formats: string;
    choose: string;
    ready: string;
    processing: string;
  };
  convert: {
    title: string;
    target: string;
    download: string;
    converted: string;
    empty: string;
  };
  quote: {
    title: string;
    material: string;
    quantity: string;
    reference: string;
    dimensions: string;
    volume: string;
    surface: string;
    triangles: string;
    process: string;
    lead: string;
    empty: string;
  };
  dfm: {
    title: string;
    placeholder: string;
    send: string;
    modelContext: string;
    noModel: string;
    fallback: string;
    welcome: string;
  };
  trust: {
    title: string;
    subtitle: string;
    ssl: string;
    delete: string;
    training: string;
  };
  footer: {
    rights: string;
    terms: string;
    privacy: string;
  };
  status: {
    idle: string;
    reading: string;
    parsing: string;
    measuring: string;
    converting: string;
    failed: string;
  };
  viewer: ViewerLabels;
};

const en: Dictionary = {
  localeName: 'English',
  dir: 'ltr',
  nav: { how: 'How it works', privacy: 'Privacy & Security', github: 'Github / Feedback' },
  hero: {
    title: 'Free 3D Tools for Engineers & Creators',
    subtitle: 'Convert, Analyze & Quote your 3D models instantly. Powered by AI.',
  },
  tabs: { convert: 'Convert', quote: 'Instant Quote', dfm: 'AI DFM Expert' },
  upload: {
    title: 'Drop your 3D model here',
    hint: 'Local-first processing for fast, private geometry checks.',
    formats: 'STL, STEP, STP, OBJ, PLY, GLB, 3MF',
    choose: 'Choose file',
    ready: 'Model ready',
    processing: 'Processing model',
  },
  convert: {
    title: 'Convert model',
    target: 'Target format',
    download: 'Download',
    converted: 'Conversion ready',
    empty: 'Upload a model to generate a clean export.',
  },
  quote: {
    title: 'Instant reference quote',
    material: 'Material',
    quantity: 'Qty',
    reference: 'Estimated price',
    dimensions: 'Dimensions',
    volume: 'Volume',
    surface: 'Surface area',
    triangles: 'Triangles',
    process: 'Process',
    lead: 'Lead time',
    empty: 'Upload a model to calculate geometry and price.',
  },
  dfm: {
    title: 'Ask the DFM expert',
    placeholder: "Ask about printability, warping, supports, wall thickness...",
    send: 'Send',
    modelContext: 'Model context attached',
    noModel: 'No model context yet',
    fallback: 'AI is not configured yet. Set OPENAI_API_KEY to enable live expert answers.',
    welcome: "Ask a manufacturing question, or upload a model and I'll use its dimensions and risk signals.",
  },
  trust: {
    title: 'Your Designs are Safe with Us',
    subtitle: 'Built for engineers who care about IP, traceability, and fast deletion.',
    ssl: 'SSL encrypted transfer.',
    delete: 'Server-side files are automatically destroyed within 24 hours when server processing is used.',
    training: 'Non-AI Training Guarantee: uploaded geometry is never used to train AI models.',
  },
  footer: { rights: 'All rights reserved.', terms: 'Terms of Service', privacy: 'Privacy Policy' },
  status: { idle: 'Ready', reading: 'Reading file', parsing: 'Parsing geometry', measuring: 'Measuring model', converting: 'Converting', failed: 'Failed' },
  viewer: {
    lightFixed: 'Use fixed studio light',
    lightFollow: 'Make light follow camera',
    lightFixedShort: 'Fixed',
    lightFollowShort: 'Follow',
    hideGrid: 'Hide grid',
    showGrid: 'Show grid',
    gridOn: 'Grid',
    gridOff: 'No grid',
    rotatePan: 'Toggle rotate and pan',
    rotate: 'Rotate',
    pan: 'Pan',
    resetView: 'Reset view',
  },
};

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  de: {
    ...en,
    localeName: 'Deutsch',
    nav: { how: 'So funktioniert es', privacy: 'Datenschutz & Sicherheit', github: 'Github / Feedback' },
    hero: { title: 'Kostenlose 3D-Tools fuer Ingenieure & Creator', subtitle: 'Konvertieren, analysieren und kalkulieren Sie 3D-Modelle sofort. Mit KI.' },
    tabs: { convert: 'Konvertieren', quote: 'Sofortangebot', dfm: 'KI-DFM-Experte' },
    upload: { ...en.upload, title: '3D-Modell hier ablegen', hint: 'Lokale Verarbeitung fuer schnelle, private Geometriepruefungen.', choose: 'Datei waehlen', ready: 'Modell bereit', processing: 'Modell wird verarbeitet' },
    convert: { ...en.convert, title: 'Modell konvertieren', target: 'Zielformat', download: 'Herunterladen', converted: 'Konvertierung bereit', empty: 'Laden Sie ein Modell hoch, um einen Export zu erzeugen.' },
    quote: { ...en.quote, title: 'Sofortige Referenzkalkulation', material: 'Material', reference: 'Geschaetzter Preis', dimensions: 'Abmessungen', volume: 'Volumen', surface: 'Oberflaeche', process: 'Verfahren', lead: 'Lieferzeit', empty: 'Laden Sie ein Modell hoch, um Geometrie und Preis zu berechnen.' },
    dfm: { ...en.dfm, title: 'DFM-Experten fragen', placeholder: 'Fragen zu Druckbarkeit, Verzug, Stuetzen, Wandstaerke...', send: 'Senden', modelContext: 'Modellkontext angehaengt', noModel: 'Noch kein Modellkontext', fallback: 'KI ist noch nicht konfiguriert. Setzen Sie OPENAI_API_KEY fuer Live-Antworten.', welcome: 'Stellen Sie eine Fertigungsfrage oder laden Sie ein Modell hoch; ich nutze Abmessungen und Risikosignale.' },
    trust: { ...en.trust, title: 'Ihre Designs sind bei uns sicher', subtitle: 'Gebaut fuer Ingenieure, die IP, Nachvollziehbarkeit und schnelle Loeschung ernst nehmen.', ssl: 'SSL-verschluesselte Uebertragung.', delete: 'Serverseitige Dateien werden bei Serververarbeitung innerhalb von 24 Stunden automatisch zerstoert.', training: 'Non-AI Training Guarantee: hochgeladene Geometrie wird nie zum Training von KI-Modellen verwendet.' },
    footer: { rights: 'Alle Rechte vorbehalten.', terms: 'Nutzungsbedingungen', privacy: 'Datenschutzerklaerung' },
  },
  fr: {
    ...en,
    localeName: 'Francais',
    nav: { how: 'Fonctionnement', privacy: 'Confidentialite & securite', github: 'Github / Feedback' },
    hero: { title: 'Outils 3D gratuits pour ingenieurs & createurs', subtitle: 'Convertissez, analysez et chiffrez vos modeles 3D instantanement. Propulse par l IA.' },
    tabs: { convert: 'Convertir', quote: 'Devis instantane', dfm: 'Expert DFM IA' },
    upload: { ...en.upload, title: 'Deposez votre modele 3D ici', hint: 'Traitement local pour des controles rapides et prives.', choose: 'Choisir un fichier', ready: 'Modele pret', processing: 'Traitement du modele' },
    convert: { ...en.convert, title: 'Convertir le modele', target: 'Format cible', download: 'Telecharger', converted: 'Conversion prete', empty: 'Importez un modele pour generer un export propre.' },
    quote: { ...en.quote, title: 'Devis de reference instantane', material: 'Materiau', quantity: 'Qté', reference: 'Prix estime', dimensions: 'Dimensions', volume: 'Volume', surface: 'Surface', process: 'Procede', lead: 'Delai', empty: 'Importez un modele pour calculer la geometrie et le prix.' },
    dfm: { ...en.dfm, title: 'Demander a l expert DFM', placeholder: 'Question sur imprimabilite, deformation, supports, epaisseur...', send: 'Envoyer', modelContext: 'Contexte modele joint', noModel: 'Aucun contexte modele', fallback: 'IA non configuree. Definissez OPENAI_API_KEY pour les reponses en direct.', welcome: 'Posez une question de fabrication ou importez un modele; j utiliserai ses dimensions et signaux de risque.' },
    trust: { ...en.trust, title: 'Vos conceptions sont en securite', subtitle: 'Concu pour les ingenieurs soucieux de la PI, de la tracabilite et de la suppression rapide.', ssl: 'Transfert chiffre SSL.', delete: 'Les fichiers cote serveur sont detruits automatiquement sous 24 heures lorsque le traitement serveur est utilise.', training: 'Garantie sans entrainement IA : la geometrie importee ne sert jamais a entrainer des modeles IA.' },
    footer: { rights: 'Tous droits reserves.', terms: 'Conditions d utilisation', privacy: 'Politique de confidentialite' },
  },
  ja: {
    ...en,
    localeName: '日本語',
    nav: { how: '使い方', privacy: 'プライバシーとセキュリティ', github: 'Github / Feedback' },
    hero: { title: 'エンジニアとクリエイターのための無料3Dツール', subtitle: '3Dモデルをすぐに変換、解析、見積もり。AI対応。' },
    tabs: { convert: '変換', quote: '即時見積もり', dfm: 'AI DFM Expert' },
    upload: { ...en.upload, title: '3Dモデルをここにドロップ', hint: '高速でプライベートな形状チェックのためのローカル優先処理。', choose: 'ファイルを選択', ready: 'モデル準備完了', processing: 'モデル処理中' },
    convert: { ...en.convert, title: 'モデル変換', target: '出力形式', download: 'ダウンロード', converted: '変換準備完了', empty: 'モデルをアップロードしてクリーンな出力を生成します。' },
    quote: { ...en.quote, title: '即時参考見積もり', material: '材料', quantity: '数量', reference: '推定価格', dimensions: '寸法', volume: '体積', surface: '表面積', process: '工法', lead: 'リードタイム', empty: 'モデルをアップロードして形状と価格を計算します。' },
    dfm: { ...en.dfm, title: 'DFM専門家に質問', placeholder: '造形性、反り、サポート、肉厚について質問...', send: '送信', modelContext: 'モデル情報を添付済み', noModel: 'モデル情報なし', fallback: 'AIはまだ設定されていません。OPENAI_API_KEYを設定してください。', welcome: '製造に関する質問をするか、モデルをアップロードしてください。寸法とリスク信号を使います。' },
    trust: { ...en.trust, title: 'あなたの設計データを安全に保護', subtitle: 'IP、追跡性、迅速な削除を重視するエンジニア向けに設計。', ssl: 'SSL暗号化転送。', delete: 'サーバー処理を使う場合、サーバー上のファイルは24時間以内に自動削除されます。', training: 'AI学習不使用保証: アップロードされた形状はAIモデルの学習に使用されません。' },
    footer: { rights: 'All rights reserved.', terms: '利用規約', privacy: 'プライバシーポリシー' },
  },
  ar: {
    ...en,
    localeName: 'العربية',
    dir: 'rtl',
    nav: { how: 'كيف يعمل', privacy: 'الخصوصية والأمان', github: 'Github / Feedback' },
    hero: { title: 'أدوات ثلاثية الأبعاد مجانية للمهندسين والمبدعين', subtitle: 'حوّل وحلل واحصل على تقدير فوري لنماذجك ثلاثية الأبعاد. مدعوم بالذكاء الاصطناعي.' },
    tabs: { convert: 'تحويل', quote: 'تسعير فوري', dfm: 'خبير DFM بالذكاء الاصطناعي' },
    upload: { ...en.upload, title: 'اسحب نموذجك ثلاثي الأبعاد هنا', hint: 'معالجة محلية أولا لفحص هندسي سريع وخاص.', choose: 'اختر ملفا', ready: 'النموذج جاهز', processing: 'جار معالجة النموذج' },
    convert: { ...en.convert, title: 'تحويل النموذج', target: 'صيغة الإخراج', download: 'تنزيل', converted: 'التحويل جاهز', empty: 'ارفع نموذجا لإنشاء تصدير نظيف.' },
    quote: { ...en.quote, title: 'تقدير مرجعي فوري', material: 'المادة', quantity: 'الكمية', reference: 'السعر التقديري', dimensions: 'الأبعاد', volume: 'الحجم', surface: 'مساحة السطح', process: 'العملية', lead: 'مدة التنفيذ', empty: 'ارفع نموذجا لحساب الهندسة والسعر.' },
    dfm: { ...en.dfm, title: 'اسأل خبير DFM', placeholder: 'اسأل عن قابلية الطباعة، الالتواء، الدعامات، سماكة الجدار...', send: 'إرسال', modelContext: 'تم إرفاق سياق النموذج', noModel: 'لا يوجد سياق نموذج بعد', fallback: 'لم يتم إعداد الذكاء الاصطناعي بعد. اضبط OPENAI_API_KEY لتفعيل الإجابات المباشرة.', welcome: 'اسأل سؤال تصنيع أو ارفع نموذجا وسأستخدم أبعاده وإشارات المخاطر.' },
    trust: { ...en.trust, title: 'تصاميمك آمنة معنا', subtitle: 'مصمم للمهندسين الذين يهتمون بالملكية الفكرية والتتبع والحذف السريع.', ssl: 'نقل مشفر عبر SSL.', delete: 'يتم إتلاف الملفات على الخادم تلقائيا خلال 24 ساعة عند استخدام معالجة الخادم.', training: 'ضمان عدم تدريب الذكاء الاصطناعي: لا تستخدم الهندسة المرفوعة لتدريب نماذج الذكاء الاصطناعي.' },
    footer: { rights: 'جميع الحقوق محفوظة.', terms: 'شروط الخدمة', privacy: 'سياسة الخصوصية' },
  },
  zh: {
    ...en,
    localeName: '中文',
    nav: { how: '工作原理', privacy: '隐私与安全', github: 'Github / 反馈' },
    hero: { title: '面向工程师与创作者的免费 3D 工具', subtitle: '即时转换、分析并估算你的 3D 模型。由 AI 驱动。' },
    tabs: { convert: '格式转换', quote: '即时报价', dfm: 'AI DFM 专家' },
    upload: { ...en.upload, title: '将 3D 模型拖到这里', hint: '本地优先处理，快速且保护模型隐私。', choose: '选择文件', ready: '模型已就绪', processing: '正在处理模型' },
    convert: { ...en.convert, title: '模型转换', target: '目标格式', download: '下载', converted: '转换已完成', empty: '上传模型后即可生成干净的导出文件。' },
    quote: { ...en.quote, title: '即时参考报价', material: '材料', quantity: '数量', reference: '预估价格', dimensions: '尺寸', volume: '体积', surface: '表面积', process: '工艺', lead: '交期', empty: '上传模型后计算几何参数与参考价格。' },
    dfm: { ...en.dfm, title: '咨询 DFM 专家', placeholder: '询问可打印性、翘曲、支撑、壁厚等问题...', send: '发送', modelContext: '已附加模型上下文', noModel: '暂无模型上下文', fallback: 'AI 尚未配置。设置 OPENAI_API_KEY 后可启用实时专家回答。', welcome: '你可以直接问制造问题，或上传模型后让我结合尺寸和风险信号分析。' },
    trust: { ...en.trust, title: '你的设计文件安全可靠', subtitle: '为重视知识产权、可追溯性和快速删除的工程师而构建。', ssl: 'SSL 加密传输。', delete: '如使用服务器处理，服务器端文件会在 24 小时内自动销毁。', training: '非 AI 训练保证：上传的几何数据绝不用于训练 AI 模型。' },
    footer: { rights: '版权所有。', terms: '服务条款', privacy: '隐私政策' },
  },
};

export const locales = Object.keys(dictionaries) as Locale[];

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.en;
}

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
