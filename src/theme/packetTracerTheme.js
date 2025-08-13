// src/theme/packetTracerTheme.js
import { createTheme } from '@mui/material/styles';

const colors = {
  bg:        '#0f1220',
  panel:     '#11182b',
  panel2:    '#0b1120',
  border:    '#223355',
  text:      '#e8eefc',
  subtext:   '#a6b2cf',
  cyan:      '#2cd9ff',
  blue:      '#3a7afe',
  green:     '#2ecc71',
  yellow:    '#f1c40f',
  red:       '#e74c3c',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: colors.bg, paper: colors.panel },
    text: { primary: colors.text, secondary: colors.subtext },
    primary: { main: colors.blue },
    secondary: { main: colors.cyan },
    success: { main: colors.green },
    warning: { main: colors.yellow },
    error: { main: colors.red },
    divider: colors.border,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: [
      'Inter','ui-sans-serif','system-ui','-apple-system',
      'Segoe UI','Roboto','Ubuntu','Cantarell','Noto Sans',
      'Helvetica','Arial'
    ].join(','),
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: .2 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        html, body, #root { background: radial-gradient(1200px 600px at 10% -10%, rgba(18,38,82,.45), transparent 60%), ${colors.bg}; }
        ::selection { background: rgba(44,217,255,.25); }
        /* React Flow grid más "tech" */
        .react-flow__background {
          background-color: #0f1220 !important;
        }
        .react-flow__background svg path {
          stroke: rgba(86, 106, 160, .18) !important; /* líneas del grid */
        }
        /* Paneles flotantes */
        .pt-panel {
          background: linear-gradient(180deg, ${colors.panel}, ${colors.panel2});
          border: 1px solid ${colors.border};
          border-radius: 14px;
          box-shadow: 0 10px 28px rgba(7, 14, 30, .5);
        }
        /* Botón PT base (gradiente) */
        .pt-btn {
          background: linear-gradient(180deg, #2a5fff, #1343c7);
          color: #e9f0ff;
          border: 1px solid #1740a8;
          border-radius: 12px;
          box-shadow: 0 6px 16px rgba(19,67,199,.35), inset 0 1px 0 rgba(255,255,255,.15);
        }
        .pt-btn:hover { filter: brightness(1.08); box-shadow: 0 10px 24px rgba(19,67,199,.45); }
        .pt-btn--green {
          background: linear-gradient(180deg, #2ecc71, #1f9d53);
          border-color: #1f9d53;
        }
        .pt-btn--yellow {
          background: linear-gradient(180deg, #f1c40f, #c9a00a);
          color: #0d101a;
          border-color: #b38c09;
        }
        .pt-btn--red {
          background: linear-gradient(180deg, #e74c3c, #c0392b);
          border-color: #ab3324;
        }
        .pt-toolbar {
          display: flex; gap: 10px; padding: 10px;
          align-items: center; justify-content: flex-end;
        }
        .pt-toolbar__group { display: flex; gap: 8px; }
        .pt-toolbar__title {
          margin-right: auto; font-weight: 700; letter-spacing:.3px; color: ${colors.text};
        }
        /* Icon buttons estilo PT */
        .pt-ibtn {
          background: rgba(255,255,255,.06);
          border: 1px solid ${colors.border};
          color: ${colors.text};
          border-radius: 10px;
        }
        .pt-ibtn:hover { border-color: ${colors.cyan}; }
      `
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: `linear-gradient(180deg, ${colors.panel}, ${colors.panel2})`,
          border: `1px solid ${colors.border}`,
        }
      }
    },
    MuiButton: {
      defaultProps: { disableElevation: true, size: 'small' },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 14,
        }
      }
    }
  }
});

export default theme;
