import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";

const App = () => {
  const [page, setPage] = useState("authors");
  const [alert, setAlert] = useState("");

  const notify = (msg) => {
    clearTimeout(window.notif);
    setAlert(msg);
    window.notif = setTimeout(() => setAlert(""), 3000);
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")}>add book</button>
      </div>
      {alert && <p>{alert}</p>}
      <br />

      <Authors show={page === "authors"} notify={notify} />

      <Books show={page === "books"} notify={notify} />

      <NewBook show={page === "add"} notify={notify} />
    </div>
  );
};

export default App;
