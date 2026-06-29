export default function RedBeanLogo({ size = "md" }) {
  const sizes = {
    sm: { wrap: "w-8 h-8", text: "text-[7px]", sub: "text-[4px]" },
    md: { wrap: "w-12 h-12", text: "text-[10px]", sub: "text-[6px]" },
    lg: { wrap: "w-20 h-20", text: "text-[17px]", sub: "text-[9px]" },
  };
  const s = sizes[size] || sizes.md;
  return (
    <div className={`${s.wrap} relative flex items-center justify-center rounded-full border-2 border-brand-700 bg-white shrink-0`}>
      <div className="text-center leading-tight">
        <div className={`font-black text-brand-700 ${s.text} tracking-tight`}>red</div>
        <div className={`font-black text-brand-700 ${s.text} tracking-tight`}>bean</div>
        <div className={`text-gray-500 font-semibold uppercase tracking-widest ${s.sub}`}>hospitality</div>
      </div>
    </div>
  );
}
