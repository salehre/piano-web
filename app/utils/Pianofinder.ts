/**
 * گزینه‌های سؤال‌های پیشنهاددهنده‌ی پیانو و منطق انتخاب اندازه.
 * اینجا فقط شناسه و منطق هست؛ برچسب گزینه‌ها، دلیل‌ها و نکته‌ها توی i18n/locales/<زبان>/finder.json
 * هستن و recommendPiano فقط ارجاع به پیام (MessageRef) برمی‌گردونه.
 */

export const FINDER_GOALS = ['songs', 'theory', 'chords', 'scales', 'improvise', 'ear', 'record', 'teach', 'fun'] as const
export type GoalId = (typeof FINDER_GOALS)[number]

export const PIANO_LEVELS = ['never', 'beginner', 'lateBeginner', 'intermediate', 'advanced', 'professional'] as const
export type PianoLevel = (typeof PIANO_LEVELS)[number]

export const FAVORITE_GENRES = ['classical', 'jazz', 'pop', 'rock', 'film', 'folk', 'other'] as const
export type FavoriteGenre = (typeof FAVORITE_GENRES)[number]

export const FINDER_INPUTS = ['keyboard', 'mouse', 'tablet', 'phone'] as const
export type FinderInput = (typeof FINDER_INPUTS)[number]

export const FINDER_INSTRUMENTS = ['none', 'digital', 'acoustic'] as const
export type FinderInstrument = (typeof FINDER_INSTRUMENTS)[number]

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
    text: MessageRef
    link?: { to: string; label: MessageRef }
}

export interface FinderResult {
    type: PianoType
    /** اندازه‌ی ایده‌آل بر اساس نیاز، وقتی دستگاه ورودی مجبور به کوچک‌تر کردنش کرده */
    ideal: PianoType | null
    reasons: MessageRef[]
    tips: FinderTip[]
}

// اندیس هر اندازه توی PIANO_TYPES: ۰=۲۵، ۱=۳۷، ۲=۴۹، ۳=۶۱، ۴=۷۶، ۵=۸۸
const LEVEL_BASE: Record<PianoLevel, number> = {
    never: 1, beginner: 2, lateBeginner: 2, intermediate: 3, advanced: 4, professional: 5,
}
/** سقف اندازه برای سطح‌های پایین */
const LEVEL_CAP: Partial<Record<PianoLevel, number>> = { never: 2, beginner: 2, lateBeginner: 3 }
// بیشترین اندازه‌ای که هر دستگاه ورودی راحت جواب می‌ده
const INPUT_CAP: Record<FinderInput, number> = { keyboard: 1, mouse: 5, tablet: 3, phone: 1 }
const LIGHT_GOALS: GoalId[] = ['chords', 'ear', 'record', 'fun']
const COMMON_GENRES = ['pop', 'rock', 'folk']
const RANGE_GOALS: GoalId[] = ['improvise', 'teach', 'scales']

/**
 * از جواب‌ها اندازه‌ی پیانوی مناسب و چند نکته‌ی کاربردی درمیاره.
 * ترتیب: سطح ← سبک ← هدف‌ها ← سقف سطح ← کیبورد خودش ← دستگاه ورودی.
 */
export function recommendPiano(a: FinderAnswers): FinderResult {
    const last = PIANO_TYPES.length - 1
    const clamp = (n: number) => Math.min(Math.max(n, 0), last)
    let reasons: MessageRef[] = [msgRef(`finder.reasons.level.${a.level}`)]
    let i = LEVEL_BASE[a.level]

    // سبک موسیقی
    if (a.genres.includes('classical')) {
        i = clamp(i + 1)
        reasons.push(msgRef('finder.reasons.genre.classical'))
    } else if (a.genres.length && a.genres.every((g) => COMMON_GENRES.includes(g)) && i > 3 && a.level !== 'professional') {
        i = 3
        reasons.push(msgRef('finder.reasons.genre.fiveOctaves', { genres: a.genres.map((g) => msgRef(`finder.genres.${g}`)) }))
    }

    // هدف‌ها
    const upper = ['intermediate', 'advanced', 'professional'].includes(a.level)
    const rangeGoal = RANGE_GOALS.find((g) => a.goals.includes(g) && (g !== 'scales' || upper))
    if (rangeGoal && i < 3) {
        i = 3
        reasons.push(msgRef(`finder.reasons.goal.${rangeGoal}`))
    } else if (!rangeGoal && a.goals.length && a.goals.every((g) => LIGHT_GOALS.includes(g)) && i > 3 && a.level !== 'professional') {
        i = 3
        reasons.push(msgRef('finder.reasons.goal.light'))
    }

    // سطح‌های پایین سقف دارن
    const levelCap = LEVEL_CAP[a.level]
    if (levelCap !== undefined && i > levelCap) {
        i = levelCap
        reasons.push(msgRef(a.level === 'never' ? 'finder.reasons.cap.never' : 'finder.reasons.cap.early'))
    }

    // هم‌اندازه شدن با کیبورد خودش، تا جای انگشت‌ها آشنا باشه
    if (a.instrument === 'acoustic') {
        i = last
        reasons = [msgRef('finder.reasons.instrument.acoustic')] // جایگزین دلیل‌های قبلی
    } else if (a.instrument === 'digital' && a.instrumentKeys) {
        const idx = PIANO_TYPES.findIndex((t) => t.keys === a.instrumentKeys)
        if (idx >= 0) {
            i = idx
            reasons = [msgRef('finder.reasons.instrument.digital', { n: a.instrumentKeys })]
        }
    }

    // دستگاه ورودی (برای ماوس دلیلی لازم نیست)
    const ideal = i
    if (i > INPUT_CAP[a.input]) {
        i = INPUT_CAP[a.input]
        if (a.input !== 'mouse') reasons.push(msgRef(`finder.reasons.input.${a.input}`))
    }

    const tips: FinderTip[] = []
    if (a.input === 'keyboard') {
        tips.push({
            text: msgRef('finder.tips.shortcuts'),
            link: { to: '/settings', label: msgRef('finder.tips.openSettings') },
        })
    }
    if (a.input === 'phone') tips.push({ text: msgRef('finder.tips.rotate') })
    if (a.goals.some((g) => ['theory', 'ear', 'chords'].includes(g))) {
        tips.push({ text: msgRef('finder.tips.noteNames') })
    }
    if (a.goals.includes('record')) tips.push({ text: msgRef('finder.tips.recorder') })

    return {
        type: PIANO_TYPES[clamp(i)]!,
        ideal: ideal !== i ? PIANO_TYPES[clamp(ideal)]! : null,
        reasons,
        tips: tips.slice(0, 3),
    }
}
