import Image from "next/image";

export default function RobotMascot({ className }: { className?: string }) {
  return (
    <Image
      src="/robot-mascot.png"
      alt="CreatorPulse AI robot mascot"
      priority
      width={736}
      height={1308}
      unoptimized
      className={className}
    />
  );
}
