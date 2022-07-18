import { useRouter } from "next/router";

import { Tag } from "@/shared/components";

export type TagCloudProps = {
  tags: string[];
};

export const TagCloud = ({ tags }: TagCloudProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag, index) => (
        <Tag key={`tag${index}`} onClick={() => router.push(`/tags/${tag}`)}>
          {tag}
        </Tag>
      ))}
    </div>
  );
};
