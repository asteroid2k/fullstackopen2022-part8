import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { ALL_AUTHORS, UPDATE_AUTHOR } from "../api/queries";

const AddBirthYear = () => {
  const [updateAuthor] = useMutation(UPDATE_AUTHOR);
  const { data: authors } = useQuery(ALL_AUTHORS);
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    updateAuthor({
      variables: { name, setBornTo: Number(born) },
      refetchQueries: [ALL_AUTHORS],
    });
    setBorn("");
    setName("");
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <select value={name} onChange={(e) => setName(e.target.value)}>
            {authors &&
              authors.allAuthors.map(({ name }) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label htmlFor="born">Born</label>
          <input
            type="number"
            id="born"
            onChange={(e) => setBorn(e.target.value)}
          />
        </div>
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

const Authors = (props) => {
  const { loading, error, data } = useQuery(ALL_AUTHORS);

  if (!props.show) {
    return null;
  }

  return (
    <div>
      <h2>authors</h2>
      {loading ? (
        <p>loading...</p>
      ) : (
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>born</th>
              <th>books</th>
            </tr>

            {data &&
              data.allAuthors.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.born}</td>
                  <td>{a.bookCount}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
      <br />
      <AddBirthYear />
    </div>
  );
};

export default Authors;
