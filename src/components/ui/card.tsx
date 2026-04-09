interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = "", hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#16152a] rounded-2xl shadow-sm border border-[#e8e6f0] dark:border-[#2a2845] ${
        hover ? "hover:shadow-lg hover:shadow-[#80A8FF]/10 hover:-translate-y-1 transition-all duration-300" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
