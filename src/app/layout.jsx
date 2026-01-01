import "./globals.css";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "@/components/wallet-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Inter } from "next/font/google";
import { ClientWalletProvider } from "./providers/ClientWalletProvider";

const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: "ChainHire",
  description: "Blockchain-powered freelance escrow platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientWalletProvider>
          <WalletProvider>
            <AuthProvider>
              <Toaster position="top-right" reverseOrder={false} />
              {children}
            </AuthProvider>
          </WalletProvider>
        </ClientWalletProvider>
      </body>
    </html>
  );
}
