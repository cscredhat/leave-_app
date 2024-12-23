import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import { ConfigProvider, theme, Spin } from "antd";
import Home from "./components/home";
import routes from "tempo-routes";
import { motion } from "framer-motion";

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Spin size="large" />
        </div>
      }
    >
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#1677ff",
            borderRadius: 8,
          },
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </motion.div>
      </ConfigProvider>
    </Suspense>
  );
}

export default App;
