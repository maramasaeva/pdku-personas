export default function Footer() {
  return (
    <footer className="relative z-[2] text-center py-16 text-white/20 text-xs tracking-widest page-container">
      <div className="neon-divider mb-10" />
      <p>
        <span className="text-neon-cyan/50">pdku</span>
        <span className="text-neon-pink/50">:</span>
        <span className="text-neon-purple/50">personas</span>
        {' // '}
        a <a href="https://plzdontkillus.com" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-neon-cyan transition-colors">plzdontkillus</a> experiment
      </p>
      <p className="mt-3 text-white/10">berkeley, ca // july 2026</p>
      <p className="mt-4 text-white/25">
        made by{' '}
        <span className="text-neon-cyan/60">Messier</span>
        {' & '}
        <span className="text-neon-pink/60">Aemily</span>
      </p>
    </footer>
  )
}
