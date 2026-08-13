import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Dashboard } from "@/pages/dashboard";
import { Calendar } from "@/pages/calendar";
import { Assignments } from "@/pages/assignments";
import { NewAssignment } from "@/pages/new-assignment";
import { NewEvent } from "@/pages/new-event";
import { StudyTimer } from "@/pages/study-timer";
import { Classes } from "@/pages/classes";
import { StickyBoard } from "@/pages/sticky-board";
import { WritingMode } from "@/pages/writing-mode";
import { Teachers } from "@/pages/teachers";
import { Resources } from "@/pages/resources";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/assignments" component={Assignments} />
      <Route path="/assignments/new" component={NewAssignment} />
      <Route path="/events/new" component={NewEvent} />
      <Route path="/timer" component={StudyTimer} />
      <Route path="/classes" component={Classes} />
      <Route path="/sticky-board" component={StickyBoard} />
      <Route path="/write" component={WritingMode} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/resources" component={Resources} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
