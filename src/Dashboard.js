import React, {useState, useEffect, useRef} from 'react';
import ClipLoader from "react-spinners/ClipLoader";
import { app } from './realm';
import './styles/dashboard.scss';
import './styles/navBar.scss'


export default function Dashboard() {
    let watcherActive = false;//blocks mongodb from creating multiple collection watchers
    const [initialLoad, setInitialLoad] = useState(true);
    const [listings, setListings] = useState([]);//loaded array of listings
    const [currentPost, setCurrentPost] = useState(null);//post which is being currently viewed
    const [postsCollection, setPostsCollection] = useState(null);//mongodb collection reference
    const [searchTerm, setSearchTerm] = useState("");//search query for post lookups
    const [isSearching, setIsSearching] = useState(false);//Track if the user is searching for loading more posts properly
    const [isLoading, setIsLoading] = useState(false);//loading state for listings
    const [isEnd, setIsEnd] = useState(false)//true if there are no more posts to load
    const listingContainer = useRef(null);//reference to listing container for scroll tracking

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
        setCurrentPost({data: listings[index], index: index});
    }

    // Initialize the page
    useEffect(() => {
        const login = async () => {
            const mongo = app.currentUser.mongoClient('mongodb-atlas');
            const posts = mongo.db('Spatula-Software').collection('Posts');
            setPostsCollection(posts);

            //get 20 current listings
            let initialListings = await posts.aggregate([{$sort: {_id: -1}}, { $limit: 10 }]);
            initialListings[0].isCurrent = true;
            setListings(initialListings)//**{$match: {UserId: app?.currentUser?.id}}, 

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
                    setListings(prevListings => [fullDocument, ...prevListings])
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
                console.log('Reached the bottom of the container');
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
    
    return (
        <div className="dashboard">
            <nav className='NavBar'>
                <h1><a href='/'>Spatula Software</a></h1>
                <ul>
                    <li><a>Dashboard</a></li>
                    <li><a href="/settings">Settings</a></li>
                    <li><a href="/support">Support</a></li>
                </ul>
            </nav>
                {(() => {
                    if(initialLoad){
                        return(
                            <div className="initialLoad">
                                <ClipLoader
                                    size={100}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                />
                            </div>
                        )
                    }else{
                        return(
                            <main>
                                <div className="results">
                                    <div className="searchContainer">
                                        <form className="searchBar" onSubmit={search}>
                                            <input placeholder='Search...' onChange={(event) => setSearchTerm(event.target.value)} id='search' type="text" />
                                            <button id="filter">Filter</button>
                                        </form>
                                    </div>
                                    <div className="listingContainer" ref={listingContainer}>
                                        {(() => {
                                            if(listings?.length > 0){
                                                return listings?.map((listing, index) => {
                                                    (listing?._id == undefined ? console.log(listing):null)
                                                    return(
                                                        <div key={listing._id} onClick={() => changeCurrentPost(index)} className={`listing ${listing?.Opened ? "true" : ""} ${listing?.isCurrent ? "current" : ""}`}>
                                                            <div className={`indicator`}></div>
                                                            <div className="content">
                                                                <h3>{listing?.Title} - ${listing?.Price}</h3>
                                                                <div className="details">
                                                                    <div className="category">{listing?.Category}</div>
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
                                <div className={`display ${currentPost?.data?.Specifics != null ? 'specificsAvailable' : 'noSpecificsAvailable'}`}>
                                    <div className="mainDetailsContainer">
                                        <div className="imgSlider">
                                            <img src={currentPost?.data?.Img} alt="Listing Image" />
                                        </div>
                                        <div className="mainDetails">
                                            <h2><a href={currentPost?.data?.URL} target="_blank">{currentPost?.data?.Title} - ${currentPost?.data?.Price}</a></h2>
                                            <p>{currentPost?.data?.Description}</p>
                                        </div>
                                    </div>
                                    <div className="specifics">
                                        <div className="general">
                                            {currentPost?.data?.Specifics?.split('\n')?.map((line, index) => (<p key={index}>{line}</p>))}
                                        </div>
                                    </div>
                                </div>
                            </main>
                        )
                    }
                })()}
        </div>
    )
}
