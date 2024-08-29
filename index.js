const express = require("express");

const app = express();

app.use(express.json());

const cors= require("cors");

app.use(cors());

const path= require("path");

const {open} = require("sqlite");
const sqlite3= require("sqlite3");


let db;

const dbPath= path.join(__dirname,"weather.db");

const initializeDataBaseAndServer=async()=>{
    try{
        db=await open({
            filename:dbPath,
            driver:sqlite3.Database
        });

        // create table for weather
        await db.run(`CREATE TABLE IF NOT EXISTS weather(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            weather JSON
            )`
        )



        app.listen(3000,()=>{
            console.log("server running at http://localhost:3000/");
        })












    }

    catch(e){
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
}



initializeDataBaseAndServer();



app.post("/weatherSearch",async(request,response)=>{

    try{
    const {search,key}=request.body;

     const api=`https://api.openweathermap.org/data/2.5/weather?q=${search}&units=metric&APPID=${key}`
     const options={
        method:"GET"
     }

     const fetchApi=await fetch(api,options);
     const weather=await fetchApi.json();
     console.log(weather);
     if(fetchApi.ok===true){
        const insertWeatherQuery=`
        INSERT INTO
            weather(weather)
        VALUES
            (
                '${JSON.stringify(weather)}'
            );
        `;

        await db.run(insertWeatherQuery);

            return response.json({
            message:"weather details saved"
        });
     }

    else{
        return response.json();
     }




    }
    catch(error){
        response.send(error.message);
    }

})


// get the latest weather details
app.get("/weather",async(request,response)=>{

    try{

    const getWeatherQuery=`
    SELECT
        *
    FROM
        weather
    ORDER BY
    id DESC
    LIMIT 1;
    `;
    
    const latestWeather=await db.get(getWeatherQuery)
    if(latestWeather){

    response.send(JSON.parse(latestWeather.weather));
    }
    else{
        response.send("No weather data found")
    }


    }
    catch(error){
        response.send(error.message);
    }

})
