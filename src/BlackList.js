import React, {useState, useEffect} from 'react'
import NavBar from './NavBar'
import { app } from './realm';

//styles
import './styles/blacklist.scss';

//loading spinner
import ClipLoader from "react-spinners/ClipLoader";

export default function BlackList() {
  const [blacklist, setBlacklist] = useState(null);
  const [blacklistCollection, setBlacklistCollection] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const unblock = (e, index, ownerId) => {
    e.preventDefault();
    setBlacklist(blacklist => {
      let arr = [...blacklist];
      arr.splice(index, 1);
      return arr
    })
    blacklistCollection.deleteOne({OwnerId: ownerId})
  } 

  useEffect(() => {
    //login and init mongodb shit
    const login = async () => {
      const mongo = app.currentUser.mongoClient('mongodb-atlas');
      const collection = mongo.db('Spatula-Software-Max').collection('Blacklist');
      setBlacklistCollection(collection);
      setBlacklist(await collection.find({UserId: app?.currentUser?.id}));
    }
    login()
  }, []);

  useEffect(() => {
    if(blacklist != null){
      setInitialLoad(false);
    }
  }, [blacklist])

  if(initialLoad){
    return(
      <div className="initialLoad">
          <ClipLoader
              color='#9d9d9d'
              size={100}
              aria-label="Loading Spinner"
              data-testid="loader"
          />
      </div>
    )
  }else{
    return (
      <div className="BlackList">
          <NavBar />
          <main>
              <div className="heading">
                <h2>Blacklist</h2>
                <p>Block Facebook Accounts so you do not get notifications for their listings</p>
              </div>
              <div className="list">
                {(() => {
                  if(blacklist?.length > 0){
                    return blacklist.map((owner, index) => {
                      return(
                        <div key={index} className="owner">
                          <p>{owner.OwnerName}</p>
                          <button onClick={(e) => unblock(e, index, owner.OwnerId)}>Unblock</button>
                        </div>
                      )
                    })
                  }else{
                    return(
                      <div className="noBlocks">
                        <p>No Blocked Users</p>
                      </div>
                    )
                  }
                })()}
              </div>
          </main>
      </div>
    )
  }
}
