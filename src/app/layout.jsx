import "./globals.css";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "@/components/wallet-provider";
import { AuthProvider } from "@/components/auth-provider";

export const metadata = {
  title: "ChainHire",
  description: "Blockchain-powered freelance escrow platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <AuthProvider>
            <Toaster position="top-right" reverseOrder={false} />
            {children}
          </AuthProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
