import Landing from "./pages/Landing";
import ChatRoom from "./pages/ChatRoom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NotFound } from "./pages/Notfound";

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-center"
        autoClose={2000} 
        hideProgressBar={true} 
        newestOnTop={true} 
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" 
        style={{
          borderRadius: "10px", 
          padding: "10px"
        }}
      />
      <Routes>
        <Route path="/" element={<Landing/>}></Route>
        <Route path="/chat/:roomId" element={<ChatRoom/>}></Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
