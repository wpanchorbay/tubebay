const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`tubebay-bg-white tubebay-rounded-[16px] tubebay-p-[32px] tubebay-shadow-lg ${className}`}>{children}</div>;
};

export default Card;