import { Badge } from "@/components/ui/badge"

// Structure d'un événement émis par le smart contract
// Chaque transaction crée un événement avec l'adresse de l'émetteur et le nombre enregistré
interface SimpleStorageEvent {
    by: string;      // Adresse du wallet qui a fait la transaction
    number: string;  // Nombre enregistré dans la blockchain
}

// Composant qui affiche l'historique des transactions
const Events = ({ events } : { events: SimpleStorageEvent[] }) => {

  // Raccourcit les adresses : 0x1234...5678 au lieu de 0x1234567890abcdef...
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Transaction History</h3>

      {/* Si aucune transaction, afficher un message explicatif */}
      {events.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No transactions yet. Submit a number to see your transaction history.
        </p>
      ) : (
        <div className="space-y-2">
          {/*
            Affichage des événements du plus récent au plus ancien
            .slice() copie le tableau sans modifier l'original
            .reverse() inverse l'ordre (plus récent en premier)
            .map() transforme chaque événement en HTML
          */}
          {events.slice().reverse().map((event, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {/* Adresse du wallet qui a effectué la transaction */}
              <div className="flex items-center gap-1">
                <Badge variant="default">setMyNumber</Badge>
                <span className="text-xs text-muted-foreground">
                  By: <span className="font-mono">{shortenAddress(event.by)}</span>
                </span>
              </div>

              {/* Nombre enregistré lors de cette transaction */}
              <div className="text-right">
                <span className="text-sm font-semibold text-primary">
                  {event.number}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Events