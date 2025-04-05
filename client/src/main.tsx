import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ABTestProvider } from "./lib/abTestContext";
import { CartProvider } from "./lib/cartContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ABTestProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </ABTestProvider>
  </QueryClientProvider>
);
