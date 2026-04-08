import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  href?: string;
  className?: string;
  variant?: "full" | "icon"; // full = logo with text, icon = square icon only
}

const sizes = {
  sm: { icon: 28, full: 100 },
  md: { icon: 36, full: 130 },
  lg: { icon: 48, full: 170 },
  xl: { icon: 64, full: 220 },
};

export default function Logo({ size = "md", showText = true, href = "/", className = "", variant = "full" }: LogoProps) {
  const s = sizes[size];

  const content = (
    <div className={`flex items-center space-x-2 ${className}`}>
      {variant === "icon" ? (
        <Image src="/logo-square.png" alt="Nishma Wellness" width={s.icon} height={s.icon} className="rounded-xl" />
      ) : showText ? (
        <Image src="/logo.png" alt="Nishma Wellness" width={s.full} height={s.icon} className="object-contain" />
      ) : (
        <Image src="/logo-square.png" alt="Nishma Wellness" width={s.icon} height={s.icon} className="rounded-xl" />
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
