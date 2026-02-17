import { LOGO_TEXT } from "@/config/constants";

interface LogoProps {
  className?: string;
  text?: string;
}

export function Logo({ className = "", text = LOGO_TEXT }: LogoProps) {
  return (
    <div className={`flex items-center font-bold text-3xl ${className}`}>
      {text}<span className="text-[#B91434]">.</span>
    </div>
  );
}
