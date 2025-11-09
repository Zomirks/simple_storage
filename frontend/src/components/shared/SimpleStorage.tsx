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
        console.log(inputNumber);
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