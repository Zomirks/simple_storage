'use client';
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <div>
      {isConnected ? (
        <p>Connected with {address}</p>
      ) : (
        <p>Please connect your wallet.</p>
      )}
      <ConnectButton />
    </div>
  );
}
