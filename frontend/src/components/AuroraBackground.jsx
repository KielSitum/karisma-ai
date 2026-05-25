export function AuroraBackground({ children }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: '#F8F9FE' }}>

      {/* Layer kanan atas */}
      <div className="pointer-events-none absolute inset-0" style={{
        opacity: 0.55,
        backgroundImage: `repeating-linear-gradient(100deg,
          #5B4FE8 0%, #818CF8 10%, #A78BFA 18%, #C4B5FD 26%,
          #7C3AED 34%, #5B4FE8 44%, transparent 50%,
          transparent 55%, #818CF8 60%, #A78BFA 68%, transparent 75%)`,
        backgroundSize: '300% 100%',
        filter: 'blur(50px)',
        animation: 'aurora 50s linear infinite',
        maskImage: 'radial-gradient(ellipse at 90% 0%, black 0%, black 35%, transparent 72%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 90% 0%, black 0%, black 35%, transparent 72%)',
      }} />

      {/* Layer kiri bawah */}
      <div className="pointer-events-none absolute inset-0" style={{
        opacity: 0.3,
        backgroundImage: `repeating-linear-gradient(110deg,
          #C4B5FD 0%, #818CF8 12%, #5B4FE8 22%, transparent 35%,
          transparent 45%, #A78BFA 55%, #7C3AED 65%, transparent 78%)`,
        backgroundSize: '250% 100%',
        filter: 'blur(60px)',
        animation: 'aurora 70s linear infinite reverse',
        maskImage: 'radial-gradient(ellipse at 10% 100%, black 0%, black 30%, transparent 68%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 10% 100%, black 0%, black 30%, transparent 68%)',
      }} />

      {children}
    </div>
  );
}