import React, { useState, useEffect } from 'react';
import { app } from './realm';
import NavBar from './NavBar';

//styles
import './styles/notifications.scss';

//switch
import Switch from '@mui/material/Switch';

//icons
import AddIcon from '@mui/icons-material/Add';

//loading spinner
import ClipLoader from "react-spinners/ClipLoader";

export default function Notifications() {
  //mongo collections
  const [usersCollection, setUsersCollection] = useState(null);

  const [initialLoad, setInitialLoad] = useState(true);

  const [newEmail, setNewEmail] = useState(null);//email input text
  const [newEmailError, setNewEmailError] = useState(false);//boolean value for displaying an error on incorrect email
  const [browserNotifications, setBrowserNotifications] = useState(false);//notification setting
  const [emailNotifications, setEmailNotifications] = useState(false);//boolean email notification setting
  const [emailNotificationList, setEmailNotificationList] = useState(null);//list of emails to notify

  //returns true if notifications will work
  const handleNotificationPermissions = async () => {
    if ('Notification' in window) {
      if (Notification?.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          return true;
        }
      }else{
        return true;
      }
    } else {
      return false;
    }
  }

  const handleBrowserNotificationChange = async (event) => {//change notification preference
    if(event.target.checked){
      let permission = await handleNotificationPermissions();
      if (permission) {
        if(app?.currentUser){
          await usersCollection.updateOne({UserId: app?.currentUser?.id}, {$set: {'Notifications.Browser': true}});
        }
        setBrowserNotifications(true);
      } else {
        setBrowserNotifications(false);

        //!display an error message of some sort
      }
    }else{
      if(app?.currentUser){
        await usersCollection.updateOne({UserId: app?.currentUser?.id}, {$set: {'Notifications.Browser': false}});
      }
      setBrowserNotifications(false);
    }
  }

  const handleEmailNotificationChange = async (event) => {
    setEmailNotifications(event.target.checked);
    await usersCollection.updateOne({UserId: app?.currentUser?.id}, {$set: {'Notifications.IsEmail': event.target.checked}});
  }

  const handleDelete = (e, index) => {
    e.preventDefault();
    setEmailNotificationList(emailList => {
      let arr = [...emailList];
      arr.splice(index, 1);

      //set new db and state arrays
      usersCollection.updateOne({UserId: app?.currentUser?.id}, {$set: {'Notifications.EmailList': arr}});
      
      return arr
    })
  }

  const addEmail = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(emailRegex.test(newEmail)){
      setNewEmailError(false);
  
      //set new db and state arrays
      setEmailNotificationList([...emailNotificationList, newEmail]);
      setNewEmail('');
      usersCollection.updateOne({UserId: app?.currentUser?.id}, {$set: {'Notifications.EmailList': [...emailNotificationList, newEmail]}});
    }else if(!newEmailError){
      setNewEmailError(true);
    }
  }

  useEffect(() => {
    const login = async () => {
      if(app?.currentUser){
        const mongo = app.currentUser.mongoClient('mongodb-atlas');

        //set notification preference based on current storage
        const users = mongo.db('Spatula-Software-Max').collection('Users');

        //set mongodb states
        setUsersCollection(users);
        setBrowserNotifications((await users.findOne({UserId: app?.currentUser?.id}))?.Notifications.Browser);
        setEmailNotifications((await users.findOne({UserId: app?.currentUser?.id}))?.Notifications.IsEmail);
        setEmailNotificationList((await users.findOne({UserId: app?.currentUser?.id}))?.Notifications.EmailList);

        setInitialLoad(false);
      }
    }
    login();
  }, [])

  return (
    <div>
      {(() => {
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
          return(
            <>
              <NavBar />
              <main className='notifications'>
                  <h2>Notifications</h2>
                  <div className="browser">
                    <div className="info">
                      <h3>Browser</h3>
                      <p>Get sound notifications for new posts when you have an active browser open.</p>
                    </div>
                    <Switch className='switch' checked={browserNotifications} onChange={handleBrowserNotificationChange} color='#009252' />
                  </div>
                  <div className={`email ${emailNotifications.toString()}`}>
                    <div className="emailContainer">
                      <div className="info">
                        <h3>Email</h3>
                        <p>Each email entered will receive a notification each time a listing is picked up.</p>
                      </div>
                      <Switch className='switch' checked={emailNotifications} onChange={handleEmailNotificationChange} color='#009252' />
                    </div>
                    <div className="emailListContainer">
                      <div className="emailList">
                        <h4>Current Emails</h4>
                        {(() => {
                          if(emailNotificationList?.length > 0){
                            return emailNotificationList.map((email, index) => {
                              return(
                                <div key={index} className="activeEmail">
                                  <p>{email}</p>
                                  <div className="actions">
                                    <button onClick={(e) => handleDelete(e, index)} className='delete'>Delete</button>
                                  </div>
                                </div>
                              )
                            })
                          }else{
                            return(
                              <div className="noEmails">
                                <p>No Active Emails</p>
                              </div>
                            )
                          }
                        })()}
                      </div>
                      <div className="addEmailContainer">
                        <h4>Add Emails</h4>
                        <form onSubmit={addEmail} className="addEmail">
                          <input placeholder='Email' value={newEmail} onChange={(event) => setNewEmail(event.target.value)} type="email" name="email" id="email" />
                          <button type="submit"><AddIcon className="icon"/></button>
                        </form>
                        {(() => {
                          if(newEmailError){
                            return(
                              <div className="emailError">
                                <p>Email is Invalid</p>
                              </div>
                            )
                          }
                        })()}
                      </div>
                    </div>
                  </div>
              </main>
            </>
          )
        }
      })()}
    </div>
  )
}
