"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wallet, QrCode, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EthereumProvider from "@walletconnect/ethereum-provider";
import { QRCodeSVG } from "qrcode.react";

interface WalletProvider {
  name: string;
  icon: string;
  id: string;
  available: boolean;
  connect: () => Promise<string | null>;
  type: "extension" | "walletconnect";
}

export function WalletConnectButton({
  onWalletConnected,
  currentAddress,
}: {
  onWalletConnected: (address: string) => void;
  currentAddress?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletConnectProvider, setWalletConnectProvider] = useState<EthereumProvider | null>(null);
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const { toast } = useToast();
  
  // Usar useRef para mantener una referencia estable a la función callback
  const onWalletConnectedRef = useRef(onWalletConnected);
  
  // Actualizar la referencia cuando cambie la función
  useEffect(() => {
    onWalletConnectedRef.current = onWalletConnected;
  }, [onWalletConnected]);

  // Inicializar WalletConnect Provider
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initWalletConnect = async () => {
      try {
        const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
        
        if (!projectId || projectId === "YOUR_PROJECT_ID") {
          console.warn("WalletConnect Project ID not configured. Get one at https://cloud.walletconnect.com");
          return;
        }

        const provider = await EthereumProvider.init({
          projectId: projectId,
          chains: [1, 43114, 43113], // Ethereum, Avalanche Mainnet, Avalanche Fuji
          showQrModal: false, // Deshabilitamos el modal automático para usar nuestro propio
        });

        // Escuchar eventos de WalletConnect
        provider.on("display_uri", (uri: string) => {
          setQrCodeUri(uri);
          setShowQRCode(true);
          setIsConnecting(true); // Asegurar que estamos en estado de conexión
        });

        provider.on("connect", () => {
          const accounts = provider.accounts;
          if (accounts && accounts.length > 0) {
            setIsConnecting(false);
            onWalletConnectedRef.current(accounts[0]);
            setIsOpen(false);
            setShowQRCode(false);
            setQrCodeUri(null);
            toast({
              title: "Wallet Connected",
              description: "Successfully connected via WalletConnect",
            });
          }
        });

        provider.on("disconnect", () => {
          onWalletConnectedRef.current("");
          setShowQRCode(false);
          setQrCodeUri(null);
        });

        setWalletConnectProvider(provider);
      } catch (error) {
        console.error("Error initializing WalletConnect:", error);
      }
    };

    initWalletConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  // Detectar wallets disponibles
  const detectWallets = (): WalletProvider[] => {
    const wallets: WalletProvider[] = [];

    // WalletConnect (para wallets móviles) - solo si está inicializado
    if (walletConnectProvider) {
      wallets.push({
        name: "WalletConnect",
        icon: "🔗",
        id: "walletconnect",
        available: true,
        type: "walletconnect",
        connect: async () => {
          if (!walletConnectProvider) {
            throw new Error("WalletConnect not initialized");
          }
          try {
            setIsConnecting(true);
            // enable() genera el QR code y dispara el evento display_uri inmediatamente
            // Luego espera a que el usuario escanee y apruebe la conexión
            await walletConnectProvider.enable();
            const accounts = walletConnectProvider.accounts;
            return accounts?.[0] || null;
          } catch (error: any) {
            setIsConnecting(false);
            setShowQRCode(false);
            setQrCodeUri(null);
            if (error.code === 4001) {
              throw new Error("Connection rejected");
            }
            throw error;
          }
        },
      });
    }

    // MetaMask
    if (typeof window !== "undefined" && (window.ethereum as any)?.isMetaMask) {
      wallets.push({
        name: "MetaMask",
        icon: "🦊",
        id: "metamask",
        available: true,
        type: "extension",
        connect: async () => {
          try {
            const accounts = await (window.ethereum as any)!.request({
              method: "eth_requestAccounts",
            }) as string[];
            return accounts?.[0] || null;
          } catch (error: any) {
            if (error.code === 4001) {
              throw new Error("Please connect to MetaMask.");
            }
            throw error;
          }
        },
      });
    }

    // Core Wallet (Avalanche)
    if (typeof window !== "undefined" && window.avalanche?.request) {
      wallets.push({
        name: "Core Wallet",
        icon: "🔷",
        id: "core",
        available: true,
        type: "extension",
        connect: async () => {
          try {
            const accounts = await window.avalanche!.request<string[]>({
              method: "eth_requestAccounts",
            });
            return accounts?.[0] || null;
          } catch (error: any) {
            if (error.code === 4001) {
              throw new Error("Please connect to Core Wallet.");
            }
            throw error;
          }
        },
      });
    }

    // Otros proveedores EIP-1193
    if (
      typeof window !== "undefined" &&
      window.ethereum &&
      !(window.ethereum as any).isMetaMask
    ) {
      wallets.push({
        name: "Other Wallet",
        icon: "💼",
        id: "other",
        available: true,
        type: "extension",
        connect: async () => {
          try {
            const accounts = await (window.ethereum as any)!.request({
              method: "eth_requestAccounts",
            }) as string[];
            return accounts?.[0] || null;
          } catch (error: any) {
            if (error.code === 4001) {
              throw new Error("Please connect to your wallet.");
            }
            throw error;
          }
        },
      });
    }

    return wallets;
  };

  const [availableWallets, setAvailableWallets] = useState<WalletProvider[]>([]);

  // Actualizar wallets disponibles cuando cambie el provider de WalletConnect
  useEffect(() => {
    setAvailableWallets(detectWallets());
  }, [walletConnectProvider]);

  // Escuchar cambios de cuenta en MetaMask
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum || !currentAddress) {
      return;
    }

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0 && currentAddress) {
        // Usar la referencia estable en lugar de la función directamente
        onWalletConnectedRef.current(accounts[0]);
      }
    };

    const ethereum = window.ethereum as any;
    ethereum.on?.("accountsChanged", handleAccountsChanged);
    
    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, [currentAddress]); // Solo currentAddress como dependencia

  const handleConnect = async (wallet: WalletProvider) => {
    setIsConnecting(true);
    try {
      if (wallet.type === "walletconnect") {
        // Para WalletConnect, llamamos connect que iniciará el proceso
        // El QR code se mostrará cuando se dispare el evento display_uri
        await wallet.connect();
        // No cerramos el diálogo aquí, se cerrará cuando se conecte exitosamente
        // El evento 'connect' manejará la actualización del estado
      } else {
        // Para wallets de extensión
        const address = await wallet.connect();
        if (address) {
          onWalletConnected(address);
          setIsOpen(false);
          setIsConnecting(false);
          toast({
            title: "Wallet Connected",
            description: `Successfully connected to ${wallet.name}`,
          });
        }
      }
    } catch (error: any) {
      setIsConnecting(false);
      setShowQRCode(false);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectWalletConnect = async () => {
    if (walletConnectProvider) {
      try {
        await walletConnectProvider.disconnect();
        onWalletConnected("");
        setShowQRCode(false);
        setQrCodeUri(null);
      } catch (error) {
        console.error("Error disconnecting WalletConnect:", error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setShowQRCode(false);
        setQrCodeUri(null);
        setIsConnecting(false);
      }
    }}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="default">
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            {showQRCode 
              ? "Scan the QR code with your mobile wallet" 
              : "Select a wallet to connect to your account"}
          </DialogDescription>
        </DialogHeader>
        
        {showQRCode && qrCodeUri ? (
          <div className="space-y-4 mt-4">
            <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
              <div className="w-full max-w-xs p-4 bg-white rounded-lg flex items-center justify-center mb-4">
                <QRCodeSVG
                  value={qrCodeUri}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              {isConnecting ? (
                <div className="flex flex-col items-center gap-2 mb-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Waiting for connection...
                  </p>
                </div>
              ) : null}
              <p className="text-sm text-center text-muted-foreground">
                Scan this QR code with your mobile wallet app
              </p>
              <p className="text-xs text-center text-muted-foreground">
                Or copy the connection link if your wallet supports it
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowQRCode(false);
                setQrCodeUri(null);
                setIsConnecting(false);
                if (walletConnectProvider) {
                  handleDisconnectWalletConnect();
                }
              }}
            >
              Cancel
            </Button>
          </div>
        ) : isConnecting && !showQRCode ? (
          <div className="space-y-4 mt-4">
            <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Preparing connection...
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsConnecting(false);
                if (walletConnectProvider) {
                  handleDisconnectWalletConnect();
                }
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-2 mt-4">
            {availableWallets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  No wallets detected
                </p>
                <p className="text-sm text-muted-foreground">
                  Please install MetaMask or Core Wallet extension, or use WalletConnect
                </p>
              </div>
            ) : (
              availableWallets.map((wallet) => (
                <Button
                  key={wallet.id}
                  type="button"
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handleConnect(wallet)}
                  disabled={isConnecting || !wallet.available}
                >
                  <span className="text-2xl mr-3">{wallet.icon}</span>
                  <div className="flex flex-col items-start flex-1">
                    <span className="font-medium">{wallet.name}</span>
                    {wallet.type === "walletconnect" && (
                      <span className="text-xs text-muted-foreground">
                        Mobile & Desktop wallets
                      </span>
                    )}
                    {!wallet.available && (
                      <span className="text-xs text-muted-foreground">
                        Not available
                      </span>
                    )}
                  </div>
                </Button>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

