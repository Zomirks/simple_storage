import { AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const NotConnected = () => {
  return (
    <>
        <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Please connect your Web3 wallet (e.g., MetaMask) to interact with the smart contract.
              Click the &quot;Connect Wallet&quot; button in the header to get started.
            </AlertDescription>
        </Alert>
    </>
  )
}
export default NotConnected