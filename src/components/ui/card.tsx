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
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${
        hover ? "hover:shadow-lg hover:-translate-y-1 transition-all duration-300" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
