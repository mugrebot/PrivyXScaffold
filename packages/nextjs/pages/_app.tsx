import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import { useDarkMode } from "usehooks-ts";
import { WagmiConfig } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { appChains } from "~~/services/web3/wagmiConnectors";
import { PrivyProvider } from "@privy-io/react-auth";
import {PrivyWagmiConnector} from '@privy-io/wagmi-connector';
import { configureChains } from 'wagmi';
import {publicProvider} from 'wagmi/providers/public';
import "~~/styles/globals.css";

//affect whatever chain config u need here
import { hardhat, polygon, mainnet, base, baseGoerli, baseSepolia, polygonMumbai, polygonZkEvmTestnet, optimism } from "viem/chains";

const handleLogin = (user: { id: any; }) => {
  console.log(`User ${user.id} logged in!`)
}



const chains = wagmiConfig.connectors[0].chains; // Assuming the first connector has the chains
const provider = wagmiConfig.publicClient ?? publicProvider();

const configureChainsConfig = configureChains([ wagmiConfig.connectors[0].chains[1], wagmiConfig.connectors[0].chains[0]], [publicProvider()]);


const ScaffoldEthApp = ({ Component, pageProps }: AppProps) => {
  const price = useNativeCurrencyPrice();
  const setNativeCurrencyPrice = useGlobalState(state => state.setNativeCurrencyPrice);

  useEffect(() => {
    if (price > 0) {
      setNativeCurrencyPrice(price);
    }
  }, [setNativeCurrencyPrice, price]);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="relative flex flex-col flex-1">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

const ScaffoldEthAppWithProviders = (props: AppProps) => {
  // This variable is required for initial client side rendering of correct theme for RainbowKit
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const { isDarkMode } = useDarkMode();
  useEffect(() => {
    setIsDarkTheme(isDarkMode);
  }, [isDarkMode]);

  return (
    <PrivyProvider
    appId={"clpispdty00ycl80fpueukbhl"}
    onSuccess={handleLogin}
    config={{
      loginMethods: ["email", "wallet", "sms", "twitter"],
      //change this and add supported chains!!!
      defaultChain: hardhat,
      supportedChains: [hardhat, polygon, mainnet, base, baseGoerli, baseSepolia, polygonMumbai, polygonZkEvmTestnet, optimism],
      embeddedWallets: { 
        createOnLogin: 'users-without-wallets'
      },
      appearance: {
        showWalletLoginFirst: true,
        theme: 'light',
        accentColor: '#676FFF',
        logo: 'https://your-logo-url',
      },
    }}
  >
<PrivyWagmiConnector wagmiChainsConfig={configureChainsConfig}>

      <NextNProgress />
      <RainbowKitProvider
        chains={appChains.chains}
        avatar={BlockieAvatar}
        theme={isDarkTheme ? darkTheme() : lightTheme()}
      >
        <ScaffoldEthApp {...props} />
      </RainbowKitProvider>

    </PrivyWagmiConnector>
    </PrivyProvider>
  );
};

export default ScaffoldEthAppWithProviders;
