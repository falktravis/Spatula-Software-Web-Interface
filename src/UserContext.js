import React, { createContext, useState, useEffect } from 'react';
import { app } from './realm'

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  // Fetch user data once when the component mounts
  useEffect(() => {
    const fetchData = async () => {
        if(app?.currentUser){
            const mongo = app.currentUser.mongoClient('mongodb-atlas');
            const users = mongo.db('Spatula-Software-Max').collection('Users');
            setUserData(await users.findOne({UserId: app?.currentUser?.id}));
        }
    };

    fetchData();
  }, []);

  return (
    <UserContext.Provider value={userData}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };