import { useMutation } from "@apollo/client";
import { useState } from "react";
import { LOGIN } from "../api/queries";
import { saveToLocal } from "../util";

const Login = ({ setToken, notify, show, setPage }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login] = useMutation(LOGIN);

  if (!show) {
    return null;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    login({
      variables: { username, password },
      onCompleted: (data) => {
        setToken(data.login.value);
        saveToLocal("library-token", data.login.value);
        notify(`Signed in`);
        setPage("authors");
      },
      onError: ({ graphQLErrors }) =>
        notify(
          (graphQLErrors[0] && graphQLErrors[0].message) || "Could not signin"
        ),
    });
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="username">password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
