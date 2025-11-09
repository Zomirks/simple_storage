'use client'; // Indique que ce composant s'exécute côté client (nécessaire pour utiliser les hooks React)

// Hooks React pour gérer l'état et les effets de bord
import { useState, useEffect } from "react";

// Imports des composants UI de shadcn
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CheckCircle2Icon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Constantes du smart contract (adresse et ABI)
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/utils/constants";

// Hooks Wagmi pour interagir avec la blockchain
import { type BaseError, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

// Viem pour créer un client qui lit les événements de la blockchain
import { publicClient } from "@/lib/client";
import { parseAbiItem } from "viem";

// Composant pour afficher l'historique des transactions
import Events from "./Events";

// Structure des événements émis par le smart contract
interface SimpleStorageEvent {
    by: string;      // Adresse du wallet
    number: string;  // Nombre enregistré
}

const SimpleStorage = () => {

    // États locaux pour gérer le formulaire et les données
    const [inputNumber, setInputNumber] = useState('');                    // Valeur saisie par l'utilisateur
    const [validationError, setValidationError] = useState('');            // Message d'erreur de validation
    const [events, setEvents] = useState<SimpleStorageEvent[]>([]);        // Historique des transactions

    // Hook Wagmi pour écrire dans le smart contract (envoyer une transaction)
    const { data: hash, error: writeError, writeContract, isPending: writeIsPending } = useWriteContract()

    // Hook Wagmi pour lire depuis le smart contract (pas de transaction, juste une lecture)
    const { data: number, error: readError, isPending: readIsPending, refetch } = useReadContract({
        address: CONTRACT_ADDRESS,     // Adresse du contrat déployé
        abi: CONTRACT_ABI,             // Interface du contrat (liste des fonctions)
        functionName: 'getMyNumber',   // Fonction à appeler sur le contrat
    });

    // Fonction appelée quand l'utilisateur clique sur "Submit to Blockchain"
    const handleSetNumber = async() => {
        setValidationError(''); // Réinitialise les erreurs précédentes

        // Validation 1 : Vérifie que l'input n'est pas vide
        if (!inputNumber || inputNumber.trim() === '') {
            setValidationError('Please enter a number');
            return;
        }

        // Validation 2 : Vérifie que c'est bien un nombre valide
        if (isNaN(Number(inputNumber))) {
            setValidationError('Please enter a valid number');
            return;
        }

        // Validation 3 : Les smart contracts utilisent des uint256 (entiers non signés)
        // Donc pas de nombres négatifs autorisés
        if (Number(inputNumber) < 0) {
            setValidationError('Please enter a positive number (negative numbers are not allowed)');
            return;
        }

        // Validation 4 : Les smart contracts n'acceptent que des nombres entiers
        if (inputNumber.includes('.') || inputNumber.includes(',')) {
            setValidationError('Please enter a whole number (no decimals allowed)');
            return;
        }

        // Si toutes les validations passent, envoie la transaction sur la blockchain
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'setMyNumber',      // Fonction du contrat à appeler
            args: [BigInt(inputNumber)],      // Convertit en BigInt pour le smart contract
        })
    }

    // Hook Wagmi pour surveiller l'état de la transaction
    // isConfirming = transaction en attente de confirmation
    // isConfirmed = transaction validée par la blockchain
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
        hash,  // Hash de la transaction à surveiller
    })

    // Affiche un état de chargement pendant la lecture du contrat
    if (readIsPending) return <div className="p-6 text-center">Loading your stored number...</div>

    // Affiche une erreur si impossible de lire le contrat (problème de réseau ou contrat non déployé)
    if (readError)
    return (
      <div className="p-6">
        <Alert variant="destructive">
            <AlertDescription>
                Unable to read from smart contract. Make sure you are connected to the correct network (Hardhat local network).
            </AlertDescription>
        </Alert>
      </div>
    )

    return (
        <>
            {/* Section 1 : Affiche le nombre actuellement stocké dans le smart contract */}
            <div className="p-6 border border-border rounded-lg bg-card">
                <div className="text-lg">
                    Your stored number is: <span className="font-bold text-primary">{number?.toString()}</span>
                </div>
            </div>

            {/* Section 2 : Formulaire pour modifier le nombre */}
            <div className="p-6 border border-border rounded-lg bg-card mt-5">
                {/* Alerte : Transaction envoyée (affiche le hash) */}
                {hash && (
                    <Alert className="mb-4">
                        <AlertDescription>
                            <div className="font-semibold mb-1">Transaction sent!</div>
                            <div className="text-xs break-all">Hash: {hash}</div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Alerte : En attente de confirmation par la blockchain */}
                {isConfirming && (
                    <Alert className="mb-4">
                        <AlertDescription>
                            Waiting for blockchain confirmation... This may take a few seconds.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Alerte : Transaction confirmée avec succès */}
                {isConfirmed && (
                    <Alert className="mb-4 border-green-600 bg-green-500/10">
                        <AlertDescription className="text-foreground">
                            ✅ Transaction confirmed! Your number has been updated on the blockchain.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Alerte : Erreur de validation (input invalide) */}
                {validationError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>
                            {validationError}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Alerte : Erreur blockchain (transaction rejetée ou échouée) */}
                {writeError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>
                            <div className="font-semibold mb-1">Transaction failed</div>
                            <div className="text-sm">{(writeError as BaseError).shortMessage || writeError.message}</div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Formulaire de saisie */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="number-input" className="text-base font-semibold">
                            Update your number
                        </Label>
                        <Input
                            id="number-input"
                            type="number"
                            placeholder="Enter a whole number (e.g., 42)..."
                            value={inputNumber}
                            onChange={(e) => setInputNumber(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleSetNumber}
                        className="w-full"
                        disabled={writeIsPending || isConfirming}
                    >
                        {writeIsPending || isConfirming ? 'Processing...' : 'Submit to Blockchain'}
                    </Button>
                </div>
            </div>
        </>
    )
}
export default SimpleStorage