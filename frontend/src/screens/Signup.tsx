import axios from "axios";

export function Signup() {
  async function signup() {
    await axios.post("http://localhost:8080/api/signup", {
            username: document.getElementById("username")!.value,
            password: document.getElementById("password")!.value,
            channelName: document.getElementById("channelName")!.value,
            gender: "Male"
        }).then(res => {
          localStorage.setItem("token", res.data.token)
          window.location = "/signin"
        })

  }

  return (
    <div>
      <input id="username" type="text" placeholder="Username" />
      <input id="password" type="text" placeholder="Password" />     
      <input id="channelName" type="text" placeholder="channelName" />
      <button onClick={signup}>Sign Up</button>
    </div>
  );
}