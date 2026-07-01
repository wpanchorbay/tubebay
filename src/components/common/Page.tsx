const Page = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`tubebay-p-x-page-default ${className}`}>{children}</div>
  );
};

export default Page;
