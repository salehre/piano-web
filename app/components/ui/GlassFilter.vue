<template>
  <!-- فیلتر دیستورشن کارت‌های شیشه‌ای (کلاس glass-card)؛ فقط یک بار توی app.vue قرار می‌گیره -->
  <svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
    <defs>
<filter id="glass-distortion-08" x="0%" y="0%" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.006 0.006" numOctaves="2" seed="92" result="noise" />
  <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
  <feDisplacementMap in="SourceGraphic" in2="blurred" scale="45" xChannelSelector="R" yChannelSelector="G" />
</filter>
    </defs>
  </svg>
</template>