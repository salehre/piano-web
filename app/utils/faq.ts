export interface FaqItem {
  question: string
  answer: string
}

/** سؤال‌های متداول صفحه‌ی اصلی؛ برای اضافه یا ویرایش فقط همین لیست رو عوض کن */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Do I need to install anything or create an account?',
    answer:
      'No. Web Piano runs entirely in your browser, so you can open the Virtual Piano page and start playing right away. An account is optional.',
  },
  {
    question: 'How can I play the piano?',
    answer:
      'You can click the keys with your mouse, drag across them for a glissando, tap them on a touch screen, or use your computer keyboard. Each computer key is mapped to a piano note.',
  },
  {
    question: 'Can I change which computer key plays which note?',
    answer:
      'Yes. Open Settings, click the field next to any note, and press the key you want. Keys are matched by position, so shortcuts work with any keyboard language. You can also reset everything to the defaults.',
  },
  {
    question: 'Which piano size should I choose?',
    answer:
      'Web Piano offers 25, 37, 49, 61, 76 and 88 keys. If you are just starting out, 49 or 61 keys is a comfortable choice. Use the piano finder on this page if you want a recommendation based on your goals and level.',
  },
  {
    question: 'Can I record what I play?',
    answer:
      'Yes. On the Virtual Piano page, press record, play your piece, then stop. You can listen to the recording again, download it, or clear it and start over.',
  },
  {
    question: 'Why is there no sound when I press a key?',
    answer:
      'Browsers only allow audio after you interact with the page, so click or tap the piano once first. Also check that your device is not muted and that the in-app volume is above zero.',
  },
  {
    question: 'Does it work on my phone or tablet?',
    answer:
      'Yes. Touch is supported, so you can tap and slide across the keys. A larger screen or a smaller piano size makes the keys easier to hit.',
  },
]