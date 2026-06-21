const Page = ({
  children,
  className = "tubebay-flex tubebay-flex-col tubebay-gap-[32px]",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`${className}`}>{children}</div>;
};

export default Page;
