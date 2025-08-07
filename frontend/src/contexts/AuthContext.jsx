import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null); // auth contiene token y datos del usuario

  const login = (userData) => {
    setAuth(userData); // { token, usuario, rol, sucursal_id }
  };

  const logout = () => {
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
