import Image from "next/image";

export default function Loader({ size = 24 }: { size?: number }) {
  return (
    <Image
      src="/assets/icons/loader.svg"
      alt=""
      width={size}
      height={size}
      className="animate-spin"
      aria-hidden="true"
    />
  );
}
