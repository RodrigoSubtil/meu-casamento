import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Locations from "./pages/Locations"
import Rsvp from "./pages/Rsvp"
import GiftRegistry from "./pages/GiftRegistry"
import Dashboard from "./pages/dashboard/Dashboard"
import Gallery from "./pages/Gallery"
import About from "./pages/About"
import We from "./pages/We"


export default function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/locations" element={<Locations />} />

      <Route path="/rsvp" element={<Rsvp />} />

      <Route path="/gift-registry" element={<GiftRegistry />} />

      <Route path="/we" element={<We />} />

      <Route path="/gallery" element={<Gallery />} />

      <Route path="/about" element={<About />} />

      <Route path="/dashboardmr" element={<Dashboard />} />

    </Routes>
  )
}