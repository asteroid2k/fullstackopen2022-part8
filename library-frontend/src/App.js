import {
  useApolloClient,
  useLazyQuery,
  useQuery,
  useSubscription,
} from "@apollo/client";
import { useEffect, useState } from "react";
import { ALL_BOOKS, BOOK_ADDED, GET_USER } from "./api/queries";
import Authors from "./components/Authors";
import Books from "./components/Books";
import Login from "./components/Login";
import NewBook from "./components/NewBook";
import Recommended from "./components/Recommended";
import { getFromLocal, updateCache } from "./util";

const App = () => {
  const [page, setPage] = useState("authors");
  const [alert, setAlert] = useState("");
  const [token, setToken] = useState(null);
  const [genres, setGenres] = useState([]);
  const [user, setUser] = useState({});

  const client = useApolloClient();
  const { data } = useQuery(ALL_BOOKS);
  const [getUser] = useLazyQuery(GET_USER);

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData, client }) => {
      const addedBook = subscriptionData.data.bookAdded;
      notify(`NEW BOOK ADDED '${addedBook.title}'`);
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook);
    },
  });

  useEffect(() => {
    const tkn = getFromLocal("library-token");
    if (!tkn) {
      return setPage("login");
    }
    setToken(tkn);
  }, []);

  useEffect(() => {
    if (token) {
      getUser().then((res) => setUser(res.data.me));
    }
  }, [getUser, token]);

  const notify = (msg) => {
    clearTimeout(window.notif);
    setAlert(msg);
    window.notif = setTimeout(() => setAlert(""), 3000);
  };

  const parseGenres = () => {
    let allGenres = data.allBooks.reduce(
      (all, curr) => all.concat(curr.genres),
      []
    );
    allGenres = [...new Set(allGenres)].sort((a, b) => a.localeCompare(b));
    setGenres(allGenres);
  };

  useEffect(() => {
    if (data) {
      parseGenres();
    }
  }, [data]);

  const logout = () => {
    notify("Logged out");
    setToken(null);
    localStorage.clear();
    client.resetStore();
    setPage("authors");
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && (
          <button onClick={() => setPage("recommended")}>recommended</button>
        )}
        {!token ? (
          <button onClick={() => setPage("login")}>login</button>
        ) : (
          <button onClick={logout}>logout</button>
        )}
      </div>
      {alert && <p>{alert}</p>}
      <br />

      <Login
        show={page === "login"}
        notify={notify}
        setToken={setToken}
        setPage={setPage}
      />
      <Authors show={page === "authors"} notify={notify} token={token} />
      <Books show={page === "books"} notify={notify} genres={genres} />
      <NewBook show={page === "add"} notify={notify} />
      <Recommended show={page === "recommended"} user={user} />
    </div>
  );
};

export default App;
