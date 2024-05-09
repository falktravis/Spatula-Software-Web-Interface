import React, {useState, useEffect, useRef, useLayoutEffect, useContext } from 'react';
import { app } from './realm';
import { UserContext } from './UserContext';
import NavBar from './NavBar';

//styles
import './styles/dashboard.scss';

//imgs
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import BlockIcon from '@mui/icons-material/Block';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';

//loading spinner
import ClipLoader from "react-spinners/ClipLoader";

//react-swipeable
import { useSwipeable } from 'react-swipeable';

export default function Dashboard() {
    //mongodb
    let watcherActive = false;//blocks mongodb from creating multiple collection watchers
    const [postsCollection, setPostsCollection] = useState(null);//mongodb collection reference
    const [blacklistCollection, setBlacklistCollection] = useState(null);//mongodb collection reference

    //storage states
    const [listings, setListings] = useState([]);//loaded array of listings
    const [currentPost, setCurrentPost] = useState(null);//post which is being currently viewed
    const [searchTerm, setSearchTerm] = useState("");//search query for post lookups
    const listingContainer = useRef(null);//reference to listing container for scroll tracking
    const scrollPosition = useRef(0);//store scroll state for expanding
    let userData = useContext(UserContext);

    //boolean states
    const [initialLoad, setInitialLoad] = useState(true);
    const [isSearching, setIsSearching] = useState(false);//Track if the user is searching for loading more posts properly
    const [isLoading, setIsLoading] = useState(false);//loading state for listings
    const [isEnd, setIsEnd] = useState(false)//true if there are no more posts to load
    const [expanded, setExpanded] = useState(false)//var of whether the results tab is expanded

    //load more posts on scroll to bottom
    const loadMore = async () => {
        let newPosts;
        if(isSearching){
            const regex = new RegExp(searchTerm, "i");
            newPosts = await postsCollection.aggregate([
                {
                    $match: {
                        $or: [
                        { Title: { $regex: regex } },
                        { Description: { $regex: regex } },
                        { Specifics: { $regex: regex } },
                        ],
                        _id: {$lt: listings[listings.length - 1]._id},
                        //!UserId: app?.currentUser?.id
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                },
                {
                    $limit: 10
                }
            ]);
        }else{
            newPosts = await postsCollection.aggregate([
                {
                    $match: {
                        _id: {$lt: listings[listings.length - 1]._id},
                        //!UserId: app?.currentUser?.id
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                },
                {
                    $limit: 10
                }
            ]);
        }

        if(newPosts.length > 0){
            setListings([...listings, ...newPosts]);
            setIsLoading(false);
            if(newPosts.length != 10){
                setIsEnd(true);
            }
        }else{
            setIsLoading(false);
            setIsEnd(true);
        }
    }

    //search for a specific post using the search bar
    const search = async (e) => {
        e.preventDefault();
        setCurrentPost(null);
        setIsEnd(false);
        let newPosts;
        if(searchTerm != ''){
            const regex = new RegExp(searchTerm, "i");
            newPosts = await postsCollection.aggregate([
                {
                    $match: {
                        $or: [
                        { Title: { $regex: regex } },
                        { Description: { $regex: regex } },
                        ],
                        //!UserId: app?.currentUser?.id
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                },
                {
                    $limit: 10
                }
            ]);
            setIsSearching(true);
        }else{
            newPosts = await postsCollection.aggregate([
                {
                    $match: {
                        //!UserId: app?.currentUser?.id
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                },
                {
                    $limit: 10
                }
            ]);
            setIsSearching(false);
        }
        setListings(newPosts);
        if(newPosts.length != 10){
            setIsEnd(true);
        }
    }

    //Filter the search results by owner
    const seeMorePostsOwner = () => {

    }

    //block user based on link
    const block = (ownerLink, ownerName) => {
        setCurrentPost({data: currentPost?.data, index: currentPost?.index, slideNum: currentPost?.slideNum, isBlocked: true});
        const id = ownerLink?.match(/profile\/(\d+)\/\?/) && ownerLink?.match(/profile\/(\d+)\/\?/)[1];
        (async () => {
            if((await blacklistCollection.findOne({UserId: app?.currentUser?.id, OwnerId: id})) == null){
                await blacklistCollection.insertOne({UserId: app?.currentUser?.id, OwnerId: id, OwnerName: ownerName});
            }
        })();
    }

    //update the currently viewed post
    const changeCurrentPost = (index) => {
        //update the db
        postsCollection.updateOne({_id: listings[index]._id}, {$set: {Opened: true}});
    
        //update the state
        if(!listings[index]?.Opened){
            setListings(prevListings => {
                const updatedListings = [...prevListings]; // Create a shallow copy of the array
                updatedListings[index].Opened = true; // Update the item at the specified index
                return updatedListings; // Return the updated array
            });
        }

        //change values in the listings array
        setListings(prevListings => {
            let updatedListings = [...prevListings]; // Create a shallow copy of the array
            if(currentPost?.index != null){
                updatedListings[currentPost?.index].isCurrent = false;
            }
            updatedListings[index].isCurrent = true; 
            return updatedListings; // Return the updated array
        });

        //update the content display
        setCurrentPost({data: listings[index], index: index, slideNum: 0, isBlocked: false});
    }

    // Initialize the page
    useEffect(() => {
        //login and init mongodb shit
        const login = async () => {
            const mongo = app.currentUser.mongoClient('mongodb-atlas');
            const posts = mongo.db('Spatula-Software-Max').collection('Posts');
            setPostsCollection(posts);
            setBlacklistCollection(mongo.db('Spatula-Software-Max').collection('Blacklist'));

            //get 20 current listings
            let initialListings = await posts.aggregate([{$sort: {_id: -1}}, { $limit: 10 }]);
            initialListings[0].isCurrent = true;
            setListings(initialListings)//**{$match: {UserId: app?.currentUser?.id}}, 
            console.log(userData);

            // Ensure that a watcher is not already active
            if (!watcherActive) {
                watcherActive = true;
                
                for await (const change of posts.watch({
                    filter: {
                    operationType: "insert",
                    //**"fullDocument.UserId": app?.currentUser?.id,
                    },
                })) {
                    const { fullDocument } = change;
                    setListings(prevListings => [fullDocument, ...prevListings]);

                    if(userData?.Notifications?.Browser){
                        console.log('notif');
                        Notification.requestPermission().then(function(permission) {
                            if (permission === 'granted') {
                                console.log('granted');
                              // Create notification
                              new Notification('New Listing', {
                                body: 'New Listing'
                              });
                        
                              // Play sound
                              var audio = new Audio('./notification.mp3');
                              audio.play();
                            }
                          });
                    }
                }
            }
        }
        login()
    }, []);

    //update current post on initialization and listing set
    useEffect(() => {
        if (listings?.length > 0 && currentPost?.data == null) {
            changeCurrentPost(0);
            setInitialLoad(false);
        }

        //check if the user has scrolled to the bottom of the page
        const handleScroll = () => {
            const container = listingContainer.current;
            if (listings.length > 0 && container.scrollHeight - container.scrollTop - 10 < container.clientHeight && !isLoading && !isEnd) {
                setIsLoading(true);
                loadMore();
            }
        };

        if (listingContainer.current && !isEnd) {
            listingContainer.current.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (listingContainer.current && !isEnd) {
                listingContainer.current.removeEventListener('scroll', handleScroll);
            }
        };
    }, [listings, isEnd]);

    //Wait for animation and set scroll state on expand
    useLayoutEffect(() => {
        if(expanded && listingContainer.current){
            setTimeout(() => {
                listingContainer.current.scrollTo(0, scrollPosition.current);
            }, 200);
        }
    }, [expanded])

    //react-swipeable
    const handlers = useSwipeable({
        onSwipedLeft: () => {
            if(expanded){
                scrollPosition.current = listingContainer.current.scrollTop;
                setExpanded(false);
            }
        },
        onSwipedRight: () => {
            if(!expanded){
                setExpanded(true)
            }
        },
        swipeDuration: 500,
        trackMouse: true
    });
    
    return (
        <div className="dashboard">
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
                            <main {...handlers}>
                                <button className={`expand expand${expanded.toString()}`} onClick={() => {
                                    if(expanded){
                                        scrollPosition.current = listingContainer.current.scrollTop;
                                    }
                                    setExpanded(!expanded)
                                }}>
                                    <NavigateNextIcon className="expandIcon" />
                                </button>
                                <div className={`results resultsexpand${expanded.toString()}`}>
                                    <div className="searchContainer">
                                        {/**Advanced search - category, platform, owner, price - sort + filter */}
                                        <form className="searchBar" onSubmit={search}>
                                            <input placeholder='Find a Listing...' onChange={(event) => setSearchTerm(event.target.value)} id='search' type="text" />
                                            <SearchIcon className="searchIcon" />
                                            {/*<button onClick={} id="filter">Filter</button>*/}
                                        </form>
                                    </div>
                                    <div className="listingContainer" ref={listingContainer}>
                                        {(() => {
                                            if(listings?.length > 0){
                                                return listings?.map((listing, index) => {
                                                    return(
                                                        <div key={listing._id} onClick={() => {
                                                            changeCurrentPost(index);
                                                            expanded ? setExpanded(false):null
                                                        }} className={`listing ${listing?.Opened ? "true" : ""} ${listing?.isCurrent ? "current" : ""}`}>
                                                            <div className={`indicator`}></div>
                                                            <div className="content">
                                                                <div className="titleContainer">
                                                                    <h3 className='title'>{listing?.Title}</h3><h3 className='price'>${(listing?.Price)?.toLocaleString()}</h3>
                                                                </div>
                                                                <div className="details">
                                                                    <div className="category">Ford{listing?.Category}</div>
                                                                    <div className="platform">{listing?.Platform}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }else{
                                                return(
                                                    <div className="loading">
                                                        <ClipLoader
                                                            color='#9d9d9d'
                                                            size={50}
                                                            aria-label="Loading Spinner"
                                                            data-testid="loader"
                                                        />
                                                    </div>    
                                                )
                                            }
                                        })()}
                                        {(() => {
                                            if(isLoading){
                                                return(
                                                    <div className="loading">
                                                        <ClipLoader
                                                            color='#9d9d9d'
                                                            size={50}
                                                            aria-label="Loading Spinner"
                                                            data-testid="loader"
                                                        />
                                                    </div>    
                                                )
                                            }else if(isEnd){
                                                return(
                                                    <div className="end">
                                                        <p>No More Listings</p>
                                                    </div>
                                                )
                                            }
                                        })()}
                                    </div>
                                </div>
                                <div className={`display ${currentPost?.data?.Specifics?.length > 0 ? 'specificsAvailable' : 'noSpecificsAvailable'}`}>
                                    <div className="mainDetailsContainer">
                                        <div className="imgSlider">
                                            <button onClick={() => currentPost?.slideNum > 0 ? setCurrentPost({data: currentPost?.data, index: currentPost?.index, slideNum: currentPost?.slideNum - 1, isBlocked: currentPost?.isBlocked}): null}>
                                                <NavigateBeforeIcon className="NavigateBefore" />
                                            </button>
                                            <img src={currentPost?.data?.Imgs[currentPost?.slideNum]} alt="Listing Image" />
                                            <button onClick={() => currentPost?.slideNum < currentPost?.data?.Imgs?.length - 1 ? setCurrentPost({data: currentPost?.data, index: currentPost?.index, slideNum: currentPost?.slideNum + 1, isBlocked: currentPost?.isBlocked}): null}>
                                                <NavigateNextIcon className="NavigateNext" />
                                            </button>
                                            <div className="pagination">
                                                {(() => {
                                                    for(let i = 0; i < currentPost?.data?.Imgs?.length; i++){
                                                        return(
                                                            <div className={`bubble ${currentPost?.slideNum == index ? 'active' : ''}`} key={i}></div>
                                                        )
                                                    }
                                                })}
                                            </div>
                                        </div>
                                        <div className="mainDetails">
                                            <div className="mainDetailsContent">
                                                <h2>{currentPost?.data?.Title} - ${(currentPost?.data?.Price)?.toLocaleString()}</h2>
                                                <p>{currentPost?.data?.Description}</p>
                                            </div>
                                            <div className="mainDetailsInteraction">
                                                <div className="ownerContainer">
                                                    <div className="ownerDetails">
                                                        <img src={currentPost?.data?.OwnerImg} alt="Owner Profile Image" />
                                                        <a href={currentPost?.data?.OwnerLink} target="_blank">{currentPost?.data?.OwnerName}</a>
                                                    </div>
                                                    <div className={`blackListButtons blocked${currentPost?.isBlocked.toString()}`}>
                                                        <Tooltip title="Find Other Listings From This Owner" placement="top" TransitionComponent={Fade}>
                                                            <button className='searchOwner' onClick={seeMorePostsOwner}>
                                                                <PersonSearchIcon className="PersonSearchIcon" />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip title="Block This Owner" placement="top" TransitionComponent={Fade}>
                                                            <button className='blockOwner' onClick={() => block(currentPost?.data?.OwnerLink, currentPost?.data?.OwnerName)}>
                                                                <BlockIcon className="BlockIcon" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                                <a href={currentPost?.data?.URL} target="_blank">View Listing</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="specificsContainer">
                                        <div className="general">
                                            <div className="description">
                                                <h4>Description</h4>
                                                <p>{currentPost?.data?.Description}</p>
                                            </div>
                                            <div className="specifics">
                                                <h4>Details</h4>
                                                {currentPost?.data?.Specifics?.length > 0 ? currentPost?.data?.Specifics.map((line, index) => <p key={index}>{line}</p>) : null}
                                            </div>
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
