export const saveToLocal = (field, value) => {
  value = JSON.stringify(value);
  localStorage.setItem(field, value);
};

export const getFromLocal = (field) => {
  const value = localStorage.getItem(field);
  if (!value) {
    return null;
  }
  return JSON.parse(value);
};

export const updateCache = (cache, query, addedBook) => {
  const uniqByName = (a) => {
    let seen = new Set();
    return a.filter((item) => {
      let k = item.title;
      return seen.has(k) ? false : seen.add(k);
    });
  };
  cache.updateQuery(query, ({ allBooks }) => {
    return { allBooks: uniqByName(allBooks.concat(addedBook)) };
  });
};
