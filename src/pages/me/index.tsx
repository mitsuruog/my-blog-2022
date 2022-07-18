import Link from "next/link";
import { FaGithub, FaStackOverflow, FaSlideshare } from "react-icons/fa";

import * as Constants from "@/lib/constants";
import { Avatar, Layout, Head } from "@/shared/components";

const AboutMe = () => {
  return (
    <Layout>
      <Head title="About Me" path="me" />
      <h1 className="text-3xl font-bold">About Me</h1>
      <div className="flex gap-8 items-center">
        <div>
          <Avatar
            src={Constants.AUTHOR_AVATAR_URL}
            title={Constants.AUTHOR_NAME}
            size={120}
          />
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-medium">
              {Constants.AUTHOR_DISPLAY_NAME}
            </h2>
            <p>{Constants.AUTHOR_DISCRIPTION}</p>
          </div>
          <div className="flex gap-4 text-2xl">
            <Link href={Constants.GITHUB_PROFILE_URL}>
              <a target="_blank" rel="noreferrer" aria-label="Github">
                <FaGithub />
              </a>
            </Link>
            <Link href={Constants.STACK_OVERFLOW_PROFILE_URL}>
              <a target="_blank" rel="noreferrer" aria-label="StackOverflow">
                <FaStackOverflow />
              </a>
            </Link>
            <Link href={Constants.SLIDE_SHARE_PROFILE_URL}>
              <a target="_blank" rel="noreferrer" aria-label="Slideshare">
                <FaSlideshare />
              </a>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutMe;
