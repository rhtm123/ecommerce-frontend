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
          "primary": "#0000ff",
          "secondary": "#ff0000",
          "accent": "#689ab8",

          // "neutral": "#1F2937",        // Darker neutral for better readability
          "base-100": "#F9FAFB",       // Base background color
          "base-200": "#E5E7EB",       // Light base background color
          "base-300": "#CBD5E1",       // Lighter base background color
          // "info": "#18C2EC",           // Info color
          // "success": "#0C5F37",        // Success color
          // "warning": "#AD840B",        // Warning color
          // "error": "#EF3C25"           // Error color
        }
      },
      {
        dark: {
          ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
          "primary": "#4093fe",
          "secondary": "#ff0000",
          "accent": "#FF6F61",         // Accent color
          // "neutral": "#2D3748",        // Darker neutral for better contrast
          // "base-100": "#2D3748",       // Dark base background color
          // "base-200": "#1F2937",       // Slightly lighter dark background color
          // "base-300": "#0D1117",       // Even lighter dark background color
          // "info": "#18C2EC",           // Info color
          // "success": "#0C5F37",        // Success color
          // "warning": "#AD840B",        // Warning color
          // "error": "#EF3C25"           // Error color
        }
      },
    ],
  },
  plugins: [
    require('daisyui'),
  ],
};
