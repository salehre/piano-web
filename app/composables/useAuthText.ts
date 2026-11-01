// متن‌های تازه‌ی صفحه‌های ورود و ثبت‌نام (بقیه‌ی متن‌ها از i18n/locales می‌آن).
// برای زبانی که اینجا نیست، انگلیسی نشون داده می‌شه.
const AUTH_TEXT = {
  fa: {
    loginHint: 'برای ورود، موبایل و رمز عبور خود را وارد کنید.',
    or: 'یا',
    createAccount: 'ساخت حساب جدید',
    registerTitle: 'ساخت حساب',
    registerHint: 'به وب پیانو بپیوندید',
    registerButton: 'ثبت‌نام',
    backToLogin: 'بازگشت به ورود',
    phoneTaken: 'این شماره قبلاً ثبت‌نام کرده است. وارد شوید.',
  },
  en: {
    loginHint: 'Sign in with your mobile number and password.',
    or: 'or',
    createAccount: 'Create an account',
    registerTitle: 'Create account',
    registerHint: 'Join Web Piano',
    registerButton: 'Sign up',
    backToLogin: 'Back to login',
    phoneTaken: 'This number is already registered. Please log in.',
  },
  fr: {
    loginHint: 'Connectez-vous avec votre numéro de mobile et votre mot de passe.',
    or: 'ou',
    createAccount: 'Créer un compte',
    registerTitle: 'Créer un compte',
    registerHint: 'Rejoignez Web Piano',
    registerButton: 'S’inscrire',
    backToLogin: 'Retour à la connexion',
    phoneTaken: 'Ce numéro est déjà inscrit. Connectez-vous.',
  },
  tr: {
    loginHint: 'Cep telefonu numaran ve şifrenle giriş yap.',
    or: 'veya',
    createAccount: 'Hesap oluştur',
    registerTitle: 'Hesap oluştur',
    registerHint: 'Web Piano’ya katıl',
    registerButton: 'Kayıt ol',
    backToLogin: 'Girişe dön',
    phoneTaken: 'Bu numara zaten kayıtlı. Lütfen giriş yap.',
  },
} as const

type AuthLang = keyof typeof AUTH_TEXT

export function useAuthText() {
  const { locale } = useI18n()
  return computed(() => AUTH_TEXT[(locale.value in AUTH_TEXT ? locale.value : 'en') as AuthLang])
}