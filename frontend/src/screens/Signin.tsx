import axios from "axios";
import { useNavigate } from "react-router";

export function Signin() {
  const navigate = useNavigate();
  async function signin() {
    await axios.post("http://localhost:8080/api/signin", {
            username: document.getElementById("username")!.value,
            password: document.getElementById("password")!.value
        }).then(res => {
          localStorage.setItem("token", res.data.token)
          navigate("/")
        })

  }

  return (
    <div>
      <input id="username" type="text" placeholder="Username" />
      <input id="password" type="text" placeholder="Password" />
      <button onClick={signin}>Sign In</button>
    </div>
  );
}