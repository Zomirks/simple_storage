'use client';
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
  return (
    <nav className="flex items-center justify-between p-5 border-b border-border">
        <div className="font-bold text-xl">
            SimpleStorage <span className="text-primary">DApp</span>
        </div>
        <div>
            <ConnectButton />
        </div>
    </nav>
  )
}
export default Header