export const theme = {
  colors: {
    primary: '#C2410C',       // Saffron
    primaryDark: '#7C2D12',   // Deep maroon
    secondary: '#FEF3C7',     // Soft cream bg
    surface: '#FFFBEB',       // Warm ivory
    accent: '#166534',        // Forest green
    warning: '#CA8A04',       // Amber
    danger: '#B91C1C',        // Deep red
    text: '#1C1917',          // Charcoal
    muted: '#78716C',         // Warm stone grey
  },
  fonts: {
    heading: '"Cormorant Garamond", Georgia, serif',
    body: '"Poppins", sans-serif',
  },
  roles: {
    student: {
      label: 'Student',
      bg: 'bg-stone-100',
      text: 'text-stone-700',
      border: 'border-stone-300'
    },
    cleaner: {
      label: 'Cleaner',
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300'
    },
    moderator: {
      label: 'Moderator',
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-300'
    },
    admin: {
      label: 'Admin',
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-300'
    },
    superadmin: {
      label: 'Superadmin',
      bg: 'bg-amber-900',
      text: 'text-amber-100',
      border: 'border-amber-800'
    }
  }
};
