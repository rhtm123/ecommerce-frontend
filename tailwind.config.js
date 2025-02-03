/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,svelte,js,ts}'],

  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            h1: {
              marginTop: '0.5rem',  // Adjust as needed to half the default margin
              marginBottom: '0.5rem', // Adjust as needed to half the default margin
            },
            h2: {
              marginTop: '0.5rem',  // Adjust as needed to half the default margin
              marginBottom: '0.5rem', // Adjust as needed to half the default margin
            },
            h3: {
              marginTop: '0.5rem',  // Adjust as needed to half the default margin
              marginBottom: '0.5rem', // Adjust as needed to half the default margin
            },
            h4: {
              marginTop: '0.5rem',  // Adjust as needed to half the default margin
              marginBottom: '0.5rem', // Adjust as needed to half the default margin
            },
            h5: {
              marginTop: '0.5rem',  // Adjust as needed to half the default margin
              marginBottom: '0.5rem', // Adjust as needed to half the default margin
            },
            h6: {
              marginTop: '0.5rem',  // Adjust as needed to half the default margin
              marginBottom: '0.5rem', // Adjust as needed to half the default margin
            },
            p: {
              marginTop: '0.5rem',  // Adjust as needed to half the default margin
              marginBottom: '0.5rem', // Adjust as needed to half the default margin
            },
            li: {
              marginTop: '0.05rem',  // Adjust as needed to half the default margin
              marginBottom: '0.05rem', // Adjust as needed to half the default margin
            },
            pre: {
              marginTop: '0.1rem', // Adjust as needed to half the
              marginBottom: '0.1rem', // Adjust as needed to half the
            }
          },
        },
      },
    },
    fontFamily: {
      'sans': ['ui-sans-serif', 'system-ui'],
      'serif': ['ui-serif', 'Georgia'],
      'mono': ['ui-monospace', 'SFMono-Regular', 'monospace'],
      'display': ['Oswald'],
      'body': ['"Open Sans"'],
    },
    container: {
      margin: "auto",
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
  },

  // rgb 
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['[data-theme=light]'],
          "primary": "#3D3BF3",       // Vibrant blue
          "secondary": "#6366f1",     // Indigo (complements blue)
          "accent": "#60a5fa",        // Soft sky blue
          "neutral": "#374151",       // Dark gray for contrast
          "base-100": "#F9FAFB",      // Base background (slightly off-white)
          "base-200": "#E5E7EB",      // Light gray
          "base-300": "#D1D5DB",      // Medium light gray
          "info": "#3b82f6",          // Info blue
          "success": "#22c55e",       // Fresh green
          "warning": "#f59e0b",       // Amber
          "error": "#ef4444",         // Alert red
          "--rounded-btn": "0.5rem",  // Button border radius
          "--rounded-box": "0.5rem"   // Component border radius
        }
      },
      // {
      //   dark: {
      //     ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
      //     "primary": "#4093fe",
      //     "secondary": "#ff0000",
      //     "accent": "#FF6F61",         // Accent color
      //     // "neutral": "#2D3748",        // Darker neutral for better contrast
      //     // "base-100": "#2D3748",       // Dark base background color
      //     // "base-200": "#1F2937",       // Slightly lighter dark background color
      //     // "base-300": "#0D1117",       // Even lighter dark background color
      //     // "info": "#18C2EC",           // Info color
      //     // "success": "#0C5F37",        // Success color
      //     // "warning": "#AD840B",        // Warning color
      //     // "error": "#EF3C25"           // Error color
      //   }
      // },
    ],
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
  ],
};
