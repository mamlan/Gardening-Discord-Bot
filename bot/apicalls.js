const database = 'aquasage';
const citiesCollection='cities';
const users='users';
require("dotenv").config();
const uri = `mongodb+srv://mamlan:${process.env.MONGOPASSWORD}@project.rif2wzr.mongodb.net/?retryWrites=true&w=majority&ssl=true`;
const { MongoClient } = require('mongodb');
// const fs = require('fs');
// const ca = [fs.readFileSync(__dirname + "/ssl/ca.pem")];
var client

async function addData( username, city, lat, lng, signed){
    try{
        client = new MongoClient(uri);
        await client.connect();
        // console.log(latitude)
        await client.db(database).collection(users).updateOne(
        {name:username},
        {$set: {        
            username: username,
            city: city,
            lat: lat,
            lng: lng,
            signed:signed,
        }},
        {upsert:true});
    console.log(`data added for user ${username}`);
    }
    catch(e){
        console.log(e);
    }finally {
        await client.close();
    }
    
}
    
async function mongoSearch(object, coll, num){
    /**
     * 1= city search
     * 2= user search
     */
    try{
         client = new MongoClient(uri);
        await client.connect();
        let temp=''
        if(num===1) 
         temp= await client.db(database).collection(coll).findOne({name: object});
         else if(num===2)
         temp= await client.db(database).collection(coll).findOne({username: object});
        console.log(temp)
        const result= {
            name: temp.name,
            lat: temp.lat,
            lng: temp.lng
        }
        return result;
    }
    catch(e){
        console.log(e)
        }
    finally {
        await client.close();
    }
}
async function plantQuery(name){
    try{
        const response = await fetch(`https://trefle.io/api/v1/plants/search?token=${process.env.PLANTAPIKEY}&q=${name}`);
        const json = await response.json();
        // console.log(json.data[0])
        return json.data;
    }
    catch (error) {
        console.log('Error fetching data:', error);
        throw error;
      }
}
 plantQuery("coconut")
    module.exports= {mongoSearch, addData, plantQuery};