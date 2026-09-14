export const getFromLocalStorage = (key) => {
    if (!key) return null;
    return localStorage.getItem(key);
};

export const setToLocalStorage = (key, value) => {
    if (!key) return;
    localStorage.setItem(key, value);
};

export const removeFromLocalStorage = (key) => {
    if (!key) return;
    localStorage.removeItem(key);
};
