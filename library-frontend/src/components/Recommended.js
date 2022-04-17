import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../api/queries";

const Recommended = ({ user, show }) => {
  const { data } = useQuery(ALL_BOOKS, {
    variables: { genre: "War" },
  });

  if (!show) {
    return null;
  }

  return (
    <div>
      <h2>books</h2>
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
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommended;
