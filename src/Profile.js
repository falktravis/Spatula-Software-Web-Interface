import React, {useState, useEffect, useContext} from 'react';
import NavBar from './NavBar';
import { UserContext } from './UserContext';
import { app } from './realm';

//styles
import './styles/profile.scss';

//react mui icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

//react mui buttons
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

//react mui graph
import { BarChart } from '@mui/x-charts/BarChart';

//loading spinner
import ClipLoader from "react-spinners/ClipLoader";

export default function Profile() {
    let userData = useContext(UserContext);

    const [initialLoad, setInitialLoad] = useState(true);

    //search query display
    const [queryInfo, setQueryInfo] = useState(null);
    const [openCategory, setOpenCategory] = useState(null);

    //stat/graph display
    const [totalPosts, setTotalPosts] = useState(null);
    const [statistics, setStatistics] = useState(null);//users statistics object
    const [displayPeriod, setDisplayPeriod] = useState('Weekly');// weekly/daily value
    const [date, setDate] = useState(0); //value between 0-6 specifying the set date a user is viewing

    useEffect(() => {
        //login and init mongodb shit
        const login = async () => {
            const mongo = app.currentUser.mongoClient('mongodb-atlas');

            //Search Query Shit
            const taskDB = mongo.db('Spatula-Software-Max').collection('Tasks');
            setQueryInfo((await taskDB.find({UserId: '330527268021731330'})).reduce((acc, obj) => {//!app?.currentUser?.id
                //manipulate object before comparing
                delete obj.UserId;
                delete obj.Name;
                delete obj.burnerAccount;
                if((obj.Link).includes('minPrice')){
                    obj.MinPrice = parseInt((obj.Link).match(/minPrice=([^&]*)/)?.[1], 10);
                }
                if((obj.Link).includes('maxPrice')){
                    obj.MaxPrice = parseInt((obj.Link).match(/maxPrice=([^&]*)/)?.[1], 10);
                }
                if((obj.Link).includes('deliveryMethod')){
                    let method = (obj.Link).match(/deliveryMethod=([^&]*)/)?.[1]
                    if(method == 'local_pick_up'){
                        obj.Delivery = 'Pick Up'
                    }else if(method == 'shipping'){
                        obj.Delivery = "Shipped"
                    }
                }else{
                    obj.Delivery = 'Pick Up/Shipped'
                }
                obj.Distance = obj.Distance.toString();
                delete obj.Link;

                const index = acc.findIndex(item => item.Category === obj.Category);
                if (index === -1) {
                    acc.push({ ...obj });
                } else {
                    if(obj.MinPrice < acc[index].MinPrice){
                        acc[index].MinPrice = obj.MinPrice;
                    }
                    if(obj.MaxPrice > acc[index].MaxPrice){
                        acc[index].MaxPrice = obj.MaxPrice;
                    }
                    if(obj.Delivery != acc[index].Delivery && acc[index].Delivery != 'Pick Up/Shipped'){
                        acc[index].Delivery = 'Pick Up/Shipped';
                    }
                    if(!acc[index].Distance.includes(obj.Distance)){
                        acc[index].Distance += "/" + obj.Distance;
                    }
                }
                
                console.log(acc);
                return acc;
            }, []).filter(Boolean)); // Filter out any null values)

            //Graph shit
            const userDB = mongo.db('Spatula-Software-Max').collection('Users');
            const statisticsObj = (await userDB.findOne({UserId: app?.currentUser?.id})).Statistics;
            setTotalPosts((statisticsObj.map(statistics => Object.values(statistics.Posts).reduce((sum, value) => sum + Number(value), 0))).reduce((sum, value) => sum + value, 0));
            setStatistics(statisticsObj);
        }
        login();
    }, []);

    useEffect(() => {
        if(statistics != null){
            setInitialLoad(false);
        }
    }, [statistics])

    const handleOpenCategoryChange = (e, index) => {
        e.preventDefault();
        if(openCategory != index){
            setOpenCategory(index);
        }else{
            setOpenCategory(null);
        }
    }

    const handleDateChange = (event) => {
        event.preventDefault();
        setDate(event.target.value);
    }

    const handlePeriodChange = (event) => {
        event.preventDefault();
        setDisplayPeriod(event.target.value);
    };

    const handleEditProfile = () => {

    }

    useEffect(() => {
        if(statistics != null && date != null){
            //total posts
            if(displayPeriod == 'Weekly'){
                setTotalPosts((statistics.map(statistics => Object.values(statistics.Posts).reduce((sum, value) => sum + value, 0))).reduce((sum, value) => sum + value, 0));
            }else if (displayPeriod == 'Daily'){
                setTotalPosts(Object.values(statistics[date].Posts).reduce((sum, value) => sum + value, 0));
            }
        }
    }, [displayPeriod, date])

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
            <div className="Profile">
                <NavBar />
                <main>
                    <div className="information">
                        <img src={userData?.ProfileImg} alt="Profile Image" />
                        <h5>{userData?.Company}</h5>
                        <p>{userData?.Email}</p>
                        <button onClick={handleEditProfile}>Edit Profile</button>
                    </div>
                    <div className="specifics">
                        <div className="graphContainer">
                            <div className="graphInfo">
                                <div className="totalPosts">
                                    <p id="label">Total Posts</p>
                                    <p id='total'>{totalPosts}</p>
                                </div>
                                <div className="buttons">
                                    {(() => {
                                        if(displayPeriod == 'Daily'){
                                            return(
                                                <Box sx={{ minWidth: 120 }}>
                                                    <FormControl fullWidth>
                                                        <InputLabel id="date-select-label">Date</InputLabel>
                                                        <Select
                                                        labelId="date-select-label"
                                                        id="date-select"
                                                        value={date}
                                                        label="Age"
                                                        onChange={handleDateChange}
                                                        >
                                                            {statistics.map((stat, index) => {
                                                                return <MenuItem key={index} value={index}>{new Date(stat.Date * 1000).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }).replace(/\//g, '/')}</MenuItem>
                                                            })}
                                                        </Select>
                                                    </FormControl>
                                                </Box>
                                            )
                                        }
                                    })()}
                                    <ToggleButtonGroup color="primary" value={displayPeriod} exclusive onChange={handlePeriodChange}>
                                        <ToggleButton value="Weekly">Weekly</ToggleButton>
                                        <ToggleButton value="Daily">Daily</ToggleButton>
                                    </ToggleButtonGroup>
                                </div>
                            </div>
                            <div className="graph">
                                {(() => {
                                    if(displayPeriod == 'Weekly'){
                                        return(
                                            <BarChart
                                            series={[{ data: statistics.map(statistic => Object.values(statistic.Posts).reduce((acc, value) => acc + value, 0)), type: 'bar', color: "#009252" }]}
                                            xAxis={[{ scaleType: 'band', data: statistics.map(obj => new Date(obj.Date * 1000).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }))}]}
                                            width={800}
                                            height={400}
                                            />
                                        )
                                    }else if (displayPeriod == 'Daily'){
                                        return(
                                            <BarChart
                                            series={[{ data: Object.values(statistics[date].Posts), type: 'bar', color: "#009252" }]}
                                            xAxis={[{ scaleType: 'band', data: Object.keys(statistics[date].Posts)}]}
                                            width={800}
                                            height={400}
                                            />
                                        )
                                    }
                                })()}
                            </div>
                        </div>
                        <div className="searchInfo">
                            <h3>Post Queries</h3>
                            <div className="categoryContainer">
                                {queryInfo.map((category, index) => {
                                    return(
                                        <div key={index} onClick={(e) => handleOpenCategoryChange(e, index)} className={`category ${openCategory == index ? 'active' : ''}`}>
                                            <div className="categoryDisplay">
                                                <p>{category.Category}</p>
                                                <ExpandMoreIcon className='icon' />
                                            </div>
                                            <div className="categoryDetails">
                                                <p>Radius: {category.Distance}</p>
                                                <p>Dealership Listings: {}</p>
                                                {category.MinPrice ? <p>Min Price: {category?.MinPrice?.toLocaleString()}</p> : null}
                                                <p>Max Price: {category?.MaxPrice?.toLocaleString()}</p>
                                                <p>Shipping: {category.Delivery}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }
}
