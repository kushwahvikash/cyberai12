import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  email?: string;
}

interface UserContextType {
  user: User;
  updateUser: (userData: Partial<User>) => void;
  isFirstTime: boolean;
  setIsFirstTime: (value: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const savedUser = localStorage.getItem('cyberai_user');
    return savedUser ? JSON.parse(savedUser) : { name: '', email: '' };
  });

  const [isFirstTime, setIsFirstTime] = useState(() => {
    return !localStorage.getItem('cyberai_user');
  });

  useEffect(() => {
    localStorage.setItem('cyberai_user', JSON.stringify(user));
  }, [user]);

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => ({ ...prev, ...userData }));
    setIsFirstTime(false);
  };

  return (
    <UserContext.Provider value={{ user, updateUser, isFirstTime, setIsFirstTime }}>
      {children}
    </UserContext.Provider>
  );
};