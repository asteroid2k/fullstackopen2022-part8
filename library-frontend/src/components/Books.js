import { useLazyQuery } from "@apollo/client";
import { useEffect } from "react";
import { ALL_BOOKS } from "../api/queries";

const Books = (props) => {
  const [getBooks, { loading, data }] = useLazyQuery(ALL_BOOKS);

  useEffect(() => {
    getBooks();
  }, []);

  const changeFilter = (genre) => {
    getBooks({ variables: { genre } });
  };

  const booksToShow = data ? data.allBooks : [];

  if (!props.show) {
    return null;
  }

  return (
    <div>
      <h2>books</h2>
      {loading ? (
        <p>loading...</p>
      ) : (
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
            {booksToShow.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={() => changeFilter("")}>all genres</button>
      {props.genres.map((genre) => (
        <button onClick={() => changeFilter(genre)} key={genre}>
          {genre}
        </button>
      ))}
    </div>
  );
};

export default Books;
