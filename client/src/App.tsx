import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NewQuotation from "./pages/NewQuotation";
import QuotationList from "./pages/QuotationList";
import QuotationDetail from "./pages/QuotationDetail";
import PriceManagement from "./pages/PriceManagement";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/quotations"} component={QuotationList} />
      <Route path={"/quotations/new"} component={NewQuotation} />
      <Route path={"/quotations/:id"} component={QuotationDetail} />
      <Route path={"/prices"} component={PriceManagement} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

