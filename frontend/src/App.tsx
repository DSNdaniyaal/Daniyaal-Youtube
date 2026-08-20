import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { Landing } from "./screens/Landing";
import { Signup } from "./screens/Signup";
import { Signin } from "./screens/Signin";
import { Videopage } from "./screens/Videopage";
import { Upload } from "./screens/Upload";
import { Appbar } from "./components/Appbar";


export function App() {
  return (
    <div>
        <Appbar />
      <BrowserRouter>
      <Routes>
        <Route path="/" element={ <Landing /> } />
        <Route path="/signup" element={ <Signup /> } />
        <Route path="/upload" element={ <Upload /> } />
        <Route path="/signin" element={ <Signin /> } />
        <Route path="/watch" element={ <Videopage /> } />
        </Routes> 
        </BrowserRouter>
    </div>
  );
}

export default App;
