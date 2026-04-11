import './globals.css';
import ToastContainer from '@/components/ToastContainer';
import StoreInitializer from '@/components/StoreInitializer';

export const metadata = {
  title: 'LiveStockInvest — Invest in Sustainable Livestock Farming',
  description: 'A fintech-grade platform for transparent, profitable livestock investment in Ghana. Browse plans, invest, and track your returns.',
  keywords: 'livestock investment, poultry, cattle, goat farming, Ghana, agriculture, agri-tech',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <StoreInitializer>
          {children}
          <ToastContainer />
        </StoreInitializer>
      </body>
    </html>
  );
}
