import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../api/queries";

const Books = (props) => {
  const { loading, error, data } = useQuery(ALL_BOOKS);

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
            {data &&
              data.allBooks.map((a) => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{a.author}</td>
                  <td>{a.published}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Books;
