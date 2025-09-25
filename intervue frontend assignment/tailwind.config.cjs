/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#7765DA',
        'brand-blue': '#5767D0',
        'brand-deep': '#4F0DCE',
        'bg-muted': '#F2F2F2',
        'dark-gray': '#373737',
        'muted-gray': '#6E6E6E',
      },
      boxShadow: {
        'card': '0 6px 20px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        'xl2': '12px',
      },
    },
  },
  plugins: [],
};
