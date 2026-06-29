export default function RedBeanLogo({ size = "md", className = "" }) {
  const dim = { sm: 36, md: 56, lg: 88 }[size] || 56;
  return (
    <img
      src="/logo.webp"
      alt="Red Bean Hospitality"
      width={dim}
      height={dim}
      className={`object-contain ${className}`}
      style={{ width: dim, height: dim }}
    />
  );
}
