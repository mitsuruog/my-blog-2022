import Link from "next/link";

import * as Constants from "@/lib/constants";
import { Avatar } from "@/shared/components";

export const Author = () => {
  return (
    <Link href="/me">
      <a
        className="flex gap-2 items-center"
        aria-label={`Author ${Constants.AUTHOR_DISPLAY_NAME}`}
      >
        <Avatar
          src={Constants.AUTHOR_AVATAR_URL}
          title={Constants.AUTHOR_NAME}
        />
        {Constants.AUTHOR_DISPLAY_NAME}
      </a>
    </Link>
  );
};
