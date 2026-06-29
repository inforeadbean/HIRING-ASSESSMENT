export default function RedBeanLogo({ size = "md", className = "" }) {
  const dim = { sm: 36, md: 56, lg: 88 }[size] || 56;
  return (
    <svg width={dim} height={dim} viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Outer dotted ring */}
      <circle cx="50" cy="50" r="47" fill="none" stroke="#C41E3A" strokeWidth="1.5" strokeDasharray="3 4" />
      {/* Inner circle line */}
      <circle cx="50" cy="50" r="40" fill="none" stroke="#C41E3A" strokeWidth="0.8" opacity="0.4" />
      {/* Curved top text: FOOD FOR HAPPINESS */}
      <path id="topArc" d="M 15,50 A 35,35 0 0,1 85,50" fill="none" />
      <text fontSize="7" fill="#1C1C1C" fontFamily="system-ui,sans-serif" fontWeight="600" letterSpacing="2">
        <textPath href="#topArc" startOffset="5%">FOOD FOR HAPPINESS</textPath>
      </text>
      {/* red text */}
      <text x="50" y="46" textAnchor="middle" fontSize="20" fontWeight="900" fill="#C41E3A" fontFamily="Georgia,serif" letterSpacing="-1">red</text>
      {/* Coffee bean icon */}
      <ellipse cx="50" cy="52" rx="5" ry="3.5" fill="#C41E3A" opacity="0.85"/>
      <path d="M 45,52 Q 50,49 55,52" fill="none" stroke="white" strokeWidth="0.8"/>
      {/* bean text */}
      <text x="50" y="67" textAnchor="middle" fontSize="20" fontWeight="900" fill="#C41E3A" fontFamily="Georgia,serif" letterSpacing="-1">bean</text>
      {/* HOSPITALITY */}
      <path id="bottomArc" d="M 20,72 A 32,32 0 0,0 80,72" fill="none" />
      <text fontSize="5.5" fill="#555" fontFamily="system-ui,sans-serif" fontWeight="600" letterSpacing="2.5">
        <textPath href="#bottomArc" startOffset="8%">— HOSPITALITY —</textPath>
      </text>
    </svg>
  );
}
