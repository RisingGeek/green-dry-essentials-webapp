import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import Product from "@/pages/product";
import Category from "@/pages/category";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/product/:slug" component={Product} />
        <Route path="/category/:slug" component={Category} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
