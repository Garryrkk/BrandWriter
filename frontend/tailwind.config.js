export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  safelist: [
    // gradients
    'bg-gradient-to-r',
    'from-blue-400', 'to-blue-600',
    'from-pink-400', 'to-purple-600',
    'from-red-400', 'to-red-600',
    'from-green-400', 'to-emerald-600',

    // text colors
    'text-yellow-300',
    'text-green-400',
    'text-blue-400',
    'text-pink-400',
    'text-emerald-400',

    // backgrounds
    'bg-slate-800/50',
    'bg-slate-700/50',
    'bg-slate-700/30',
  ],

  theme: {
    extend: {},
  },
  plugins: [],
}
