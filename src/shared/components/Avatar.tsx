export type AvatarProps = {
  src: string;
  title: string;
};

export const Avatar = ({ src, title }: AvatarProps) => {
  return (
    <div>
      <img className="w-10 h-10 rounded-full" src={src} alt={title} />
    </div>
  );
};
