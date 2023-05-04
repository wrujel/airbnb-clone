"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = () => {
  const router = useRouter();

  return (
    <Image
      onClick={() => router.push("/")}
      alt="logo"
      className="hidden md:block cursor-pointer h-auto w-auto"
      height={100}
      width={100}
      priority
      src="/images/logo.png"
    />
  );
};

export default Logo;
