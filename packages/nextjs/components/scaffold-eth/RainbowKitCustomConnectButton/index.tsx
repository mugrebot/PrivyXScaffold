import { Balance } from "../Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { useConnectWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address } from "viem";
import { useAccount, useNetwork, useProvider } from "wagmi";
import { useAutoConnect, useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */ export const RainbowKitCustomConnectButton = () => {

  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();

  const { login, user, createWallet, ready, authenticated, logout, connectWallet } = usePrivy();

  //edgecase



  const handlePrivyConnect = async () => {
    //login state is a bit wonky heres my workaround for now
    if (authenticated && ready) {
      logout
    }
  
    if (!authenticated && !user?.wallet) {
      login();
    } else if (authenticated && !user?.wallet) {
      createWallet();
    }
    else logout();



  };

  const { address } = useAccount();
  

  const { wallets } = useWallets();


  // Function to switch to the target network
  const switchToTargetNetwork = async () => {
    // Replace '0x89' with your target network ID
    await wallets[0]?.switchChain(31337);
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        // Construct a combined account object
        const combinedAccount =
          authenticated && user?.wallet
            ? {
                address: user.wallet.address,
                displayName: user.wallet.address,
                // Default or calculated values for other properties
                balanceDecimals: 18, // Assuming ETH-like decimals
                balanceFormatted: "0", // Default balance; fetch if needed
                balanceSymbol: "ETH", // Default symbol; update based on the actual network
                displayBalance: "0 ETH", // Default display balance; calculate if needed
                ensAvatar: undefined, // Fetch ENS Avatar if needed
                ensName: undefined, // Fetch ENS Name if needed
                hasPendingTransactions: false, // Default value; update as needed
              }
            : account;

        const isConnected = mounted && combinedAccount && chain;

        const blockExplorerAddressLink = combinedAccount?.address
          ? getBlockExplorerAddressLink(targetNetwork, combinedAccount.address)
          : undefined;

        return (
          <>

            {isConnected && (chain?.unsupported || chain?.id !== targetNetwork.id) && <WrongNetworkDropdown />}

            {!isConnected ? (
              <>
                <button className="btn btn-secondary btn-sm" onClick={handlePrivyConnect}>
                  Connect with Privy
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center mr-1">
                  <Balance address={combinedAccount.address as Address} className="min-h-0 h-auto" />
                  <span className="text-xs" style={{ color: networkColor }}>
                    {chain?.name ?? "Privy Network"}
                  </span>
                </div>
                <AddressInfoDropdown
                  address={combinedAccount.address as Address}
                  displayName={combinedAccount.displayName}
                  ensAvatar={combinedAccount.ensAvatar}
                  blockExplorerAddressLink={blockExplorerAddressLink}
                />
                <AddressQRCodeModal address={combinedAccount.address as Address} modalId="qrcode-modal" />
              </>
            )}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
