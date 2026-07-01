const Header = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`tubebay-text-[20px] tubebay-font-[700] tubebay-leading-[30px] tubebay-text-[#000000]  ${className}`}
    >
      {children}
    </div>
  );
};
export default Header;
