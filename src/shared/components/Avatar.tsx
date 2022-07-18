import Image from "next/image";

export type AvatarProps = {
  src: string;
  title: string;
  size?: number;
};

export const Avatar = ({ src, title, size = 46 }: AvatarProps) => {
  return (
    <Image
      className="rounded-full ring ring-inset"
      src={src}
      alt={title}
      height={size}
      width={size}
    />
  );
};
