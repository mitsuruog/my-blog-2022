import classnames from "classnames";

export type TagProps = {
  onClick?: () => void;
  children: React.ReactNode;
};

export const Tag = ({ children, onClick }: TagProps) => {
  const rootStyle = classnames(
    "text-xs font-semibold inline-block py-1 px-2 rounded text-slate-600 bg-slate-200",
    {
      "cursor-pointer": Boolean(onClick),
    }
  );
  return (
    <span
      className={rootStyle}
      {...(Boolean(onClick) && { role: "button", onClick })}
    >
      {children}
    </span>
  );
};
