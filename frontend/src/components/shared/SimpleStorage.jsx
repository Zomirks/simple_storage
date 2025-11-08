'use client';
import { useState, useEffect } from "react";

import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { CheckCircle2Icon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { contractAddress, contractAbi } from "@/constants";

import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import { parseAbiItem } from "viem";

import { publicClient } from "@/utils/client";

const SimpleStorage = () => {
  return (
    <div>SimpleStorage</div>
  )
}
export default SimpleStorage