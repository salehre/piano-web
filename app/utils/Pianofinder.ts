/** گزینه‌های سؤال‌های پیشنهاددهنده‌ی پیانو و منطق انتخاب اندازه */

export const FINDER_GOALS = [
    { value: 'songs', label: 'Play specific songs' },
    { value: 'theory', label: 'Read music & learn theory' },
    { value: 'chords', label: 'Learn chords & accompany singing' },
    { value: 'scales', label: 'Practice scales & technique' },
    { value: 'improvise', label: 'Improvise or compose' },
    { value: 'ear', label: 'Train my ear' },
    { value: 'record', label: 'Record my playing' },
    { value: 'teach', label: 'I teach piano' },
    { value: 'fun', label: 'Just play for fun' },
] as const
export type GoalId = (typeof FINDER_GOALS)[number]['value']

/** توضیح کوتاه هر سطح، زیر گزینه‌ها */
export const LEVEL_HINTS: Record<PianoLevel, string> = {
    never: "I've never touched a piano",
    beginner: 'Learning the notes and simple songs',
    'late-beginner': 'Can play easy pieces with both hands',
    intermediate: 'Comfortable with most songs I practice',
    advanced: 'Play complex pieces with confidence',
    professional: 'I perform or study music seriously',
}

export const FINDER_INPUTS = [
    { value: 'keyboard', label: 'Computer keyboard', hint: 'Typing keys play the notes' },
    { value: 'mouse', label: 'Mouse or trackpad', hint: 'Click and drag on the keys' },
    { value: 'tablet', label: 'Tablet touch screen', hint: 'Tap the keys' },
    { value: 'phone', label: 'Phone touch screen', hint: 'Small screen, small keys' },
] as const
export type FinderInput = (typeof FINDER_INPUTS)[number]['value']

export const FINDER_INSTRUMENTS = [
    { value: 'none', label: 'No, only this', hint: 'The website is my main piano' },
    { value: 'digital', label: 'Digital piano or keyboard', hint: 'We can match its size' },
    { value: 'acoustic', label: 'Acoustic piano', hint: 'Upright or grand' },
] as const
export type FinderInstrument = (typeof FINDER_INSTRUMENTS)[number]['value']

export interface FinderAnswers {
    goals: GoalId[]
    level: PianoLevel
    genres: string[]
    input: FinderInput
    instrument: FinderInstrument
    /** تعداد کلید کیبورد دیجیتال، اگه کاربر بدونه */
    instrumentKeys?: number
}

export interface FinderTip {
    text: string
    link?: { to: string; label: string }
}

export interface FinderResult {
    type: PianoType
    /** اندازه‌ی ایده‌آل بر اساس نیاز، وقتی دستگاه ورودی مجبور به کوچک‌تر کردنش کرده */
    ideal: PianoType | null
    reasons: string[]
    tips: FinderTip[]
}

/** توضیح هر اندازه‌ی پیانو توی کارت نتیجه */
export const PIANO_SIZE_NOTES: Record<number, string> = {
    25: 'Two octaves. Small and simple, good for trying out melodies.',
    37: 'Three octaves. Enough for easy songs with both hands.',
    49: 'Four octaves. A balanced size for learning and playing songs.',
    61: 'Five octaves. Most pop, rock and film pieces fit comfortably.',
    76: 'Over six octaves. Room for demanding repertoire.',
    88: 'The full range of a grand piano. Nothing is out of reach.',
}

// اندیس هر اندازه توی PIANO_TYPES: ۰=۲۵، ۱=۳۷، ۲=۴۹، ۳=۶۱، ۴=۷۶، ۵=۸۸
const LEVEL_BASE: Record<PianoLevel, number> = {
    never: 1, beginner: 2, 'late-beginner': 2, intermediate: 3, advanced: 4, professional: 5,
}
/** سقف اندازه برای سطح‌های پایین */
const LEVEL_CAP: Partial<Record<PianoLevel, number>> = { never: 2, beginner: 2, 'late-beginner': 3 }
const LEVEL_REASON: Record<PianoLevel, string> = {
    never: 'For a first-time player, three octaves is a friendly place to start.',
    beginner: 'As a beginner, a mid-sized keyboard is plenty to learn on.',
    'late-beginner': 'At your level, four to five octaves cover the pieces you are working on.',
    intermediate: 'At your level, five octaves let you play most of what you practice.',
    advanced: 'Advanced pieces often use a wide range, so you want more room.',
    professional: 'As a professional, you will want the full range.',
}
// بیشترین اندازه‌ای که هر دستگاه ورودی راحت جواب می‌ده
const INPUT_CAP: Record<FinderInput, number> = { keyboard: 1, mouse: 5, tablet: 3, phone: 1 }
const INPUT_REASON: Record<FinderInput, string> = {
    keyboard: 'About three octaves fit comfortably on computer keys; the rest needs the mouse.',
    mouse: '',
    tablet: 'On a tablet, keys stay easy to tap up to about five octaves.',
    phone: 'On a phone, keys get small quickly, so we kept it compact.',
}
const GOAL_RANGE_REASON: Partial<Record<GoalId, string>> = {
    improvise: 'Improvising needs room to move around the keyboard.',
    teach: 'Teaching means demonstrating across the whole range.',
    scales: 'Scales over several octaves need a wider keyboard.',
}
const LIGHT_GOALS: GoalId[] = ['chords', 'ear', 'record', 'fun']
const COMMON_GENRES = ['Pop', 'Rock', 'Folk']

/**
 * از جواب‌ها اندازه‌ی پیانوی مناسب و چند نکته‌ی کاربردی درمیاره.
 * ترتیب: سطح ← سبک ← هدف‌ها ← سقف سطح ← کیبورد خودش ← دستگاه ورودی.
 */
export function recommendPiano(a: FinderAnswers): FinderResult {
    const last = PIANO_TYPES.length - 1
    const clamp = (n: number) => Math.min(Math.max(n, 0), last)
    let reasons = [LEVEL_REASON[a.level]]
    let i = LEVEL_BASE[a.level]

    // سبک موسیقی
    if (a.genres.includes('Classical')) {
        i = clamp(i + 1)
        reasons.push('Classical music travels across the whole keyboard, so a wider range helps.')
    } else if (a.genres.length && a.genres.every((g) => COMMON_GENRES.includes(g)) && i > 3 && a.level !== 'professional') {
        i = 3
        reasons.push(`${a.genres.join(', ')} music fits comfortably in five octaves.`)
    }

    // هدف‌ها
    const upper = ['intermediate', 'advanced', 'professional'].includes(a.level)
    const rangeGoal = (['improvise', 'teach', 'scales'] as GoalId[]).find(
        (g) => a.goals.includes(g) && (g !== 'scales' || upper),
    )
    if (rangeGoal && i < 3) {
        i = 3
        reasons.push(GOAL_RANGE_REASON[rangeGoal]!)
    } else if (!rangeGoal && a.goals.length && a.goals.every((g) => LIGHT_GOALS.includes(g)) && i > 3 && a.level !== 'professional') {
        i = 3
        reasons.push('For chords, ear training and playing for fun, five octaves is plenty.')
    }

    // سطح‌های پایین سقف دارن
    const levelCap = LEVEL_CAP[a.level]
    if (levelCap !== undefined && i > levelCap) {
        i = levelCap
        reasons.push(a.level === 'never'
            ? "Since you haven't played before, a smaller keyboard is less overwhelming."
            : "You're still early on, so there's no need for the largest keyboard yet.")
    }

    // هم‌اندازه شدن با کیبورد خودش، تا جای انگشت‌ها آشنا باشه
    if (a.instrument === 'acoustic') {
        i = last
        reasons = ['An acoustic piano has 88 keys, so that layout would feel familiar.'] // جایگزین دلیل‌های قبلی
    } else if (a.instrument === 'digital' && a.instrumentKeys) {
        const idx = PIANO_TYPES.findIndex((t) => t.keys === a.instrumentKeys)
        if (idx >= 0) {
            i = idx
            reasons = [`Your keyboard has ${a.instrumentKeys} keys, so that size would feel familiar.`]
        }
    }

    // دستگاه ورودی
    const ideal = i
    if (i > INPUT_CAP[a.input]) {
        i = INPUT_CAP[a.input]
        reasons.push(INPUT_REASON[a.input])
    }

    const tips: FinderTip[] = []
    if (a.input === 'keyboard') {
        tips.push({
            text: 'By default only C4 to E5 have computer-key shortcuts. Assign the rest of your keys in Settings.',
            link: { to: '/settings', label: 'Open settings' },
        })
    }
    if (a.input === 'phone') tips.push({ text: 'Turn your phone sideways to make the keys wider.' })
    if (a.goals.some((g) => ['theory', 'ear', 'chords'].includes(g))) {
        tips.push({ text: 'Every note you press shows its name above the keyboard.' })
    }
    if (a.goals.includes('record')) {
        tips.push({ text: 'Use the recorder under the piano to capture a take, play it back or download it.' })
    }

    return {
        type: PIANO_TYPES[clamp(i)]!,
        ideal: ideal !== i ? PIANO_TYPES[clamp(ideal)]! : null,
        reasons,
        tips: tips.slice(0, 3),
    }
}