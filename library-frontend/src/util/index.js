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
