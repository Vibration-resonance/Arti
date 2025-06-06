/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,vue,html}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs principales de l'extension
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Couleurs de statut
        status: {
          'ai': '#ef4444',      // Rouge - Page signalée IA
          'domain': '#f97316',  // Orange - Domaine signalé
          'clean': '#10b981',   // Vert - Confirmé non-IA
          'unknown': '#6b7280', // Gris - Non signalé
          'whitelist': '#ffffff' // Blanc - Whitelist
        },
        // Couleurs des badges
        badge: {
          'bronze': '#cd7f32',
          'silver': '#c0c0c0',
          'gold': '#ffd700',
          'platinum': '#e5e4e2',
          'diamond': '#b9f2ff',
          'master': 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
