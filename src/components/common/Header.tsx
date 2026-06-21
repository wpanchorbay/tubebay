const Header = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`wpab-text-[20px] wpab-font-[700] wpab-leading-[30px] wpab-text-[#000000]  ${className}`}
    >
      {children}
    </div>
  );
};
export default Header;
