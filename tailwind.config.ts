import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // ألوان مستخلصة لتناسب الشعار (تقدر تغيّرها لاحقاً بحرّية)
          green: '#0F5B3A',     // أخضر داكن أساسي
          greenLite: '#1F7C52', // أخضر أفتح للـ hover
          blue:  '#2A5DA8',     // أزرق فاتح أساسي
          blueLite: '#3C76CC',  // أزرق أفتح للـ hover
          gold:  '#C8A24A',     // لمسة ذهبية خفيفة للعناوين/البادج
          ink:   '#12202C',     // نص داكن
        },
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,.06)',
      },
      borderRadius: {
        xl: '14px',
      }
    },
  },
  plugins: [],
}
export default config
