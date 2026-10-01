/** نواختن پیانو با کیبورد کامپیوتر بر اساس تنظیمات useKeyBindings */
export const useKeyboardInput = (canPlay: (note: string) => boolean) => {
  const { noteOn, noteOff } = usePiano()
  const { codeToNote } = useKeyBindings()

  // کلیدهای فعلاً فشرده: code → note (تا موقع رها کردن همون نت قطع بشه)
  const pressed = new Map<string, string>()

  function isTyping(target: EventTarget | null) {
    const el = target as HTMLElement | null
    return !!el && (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable)
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return
    const note = codeToNote.value.get(e.code)
    if (!note || !canPlay(note)) return
    e.preventDefault()
    pressed.set(e.code, note)
    noteOn(note)
  }

  function onKeyUp(e: KeyboardEvent) {
    const note = pressed.get(e.code)
    if (!note) return
    pressed.delete(e.code)
    noteOff(note)
  }

  function releaseAll() {
    for (const note of pressed.values()) noteOff(note)
    pressed.clear()
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', releaseAll)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', releaseAll)
    releaseAll()
  })
}