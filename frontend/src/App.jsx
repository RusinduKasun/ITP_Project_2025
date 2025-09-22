import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Reports from "./pages/finance/Reports.jsx";
import Expenses from "./pages/finance/Expenses.jsx";
import Income from "./pages/finance/Income.jsx";
import Wastage from "./pages/finance/Wastage.jsx";
import BreakEven from "./pages/finance/BreakEven.jsx";
import ProfitMargin from "./pages/finance/ProfitMargin.jsx";

function App() {
  return (
    <div className="app-container">
      <Header />
      <div className="content-wrapper">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/reports" />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/income" element={<Income />} />
            <Route path="/wastage" element={<Wastage />} />
            <Route path="/breakeven" element={<BreakEven />} />
            <Route path="/profitmargin" element={<ProfitMargin />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
