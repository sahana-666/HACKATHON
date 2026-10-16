import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PageSkeleton } from "./components/ApiStates";
import Landing from "./pages/Landing";

const Events = lazy(() => import("./pages/Events"));

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
