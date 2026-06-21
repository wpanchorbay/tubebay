const HeaderContainer = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`tubebay-flex tubebay-justify-between ${className}`}>
      {children}
    </div>
  );
};

export default HeaderContainer;
