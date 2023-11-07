
const {Client, GatewayIntentBits, Partials} = require('discord.js');
require("dotenv").config();
const {addMember, sendDM} = require('./welcome')
const {mongoSearch, addData, plantQuery} = require('./apicalls');
const { fetchSoilMoisture } = require('./commands');
const cron = require('node-cron')
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
  ],
    partials: [
        Partials.Channel, // Required to receive DMs
    ]});


    const { Configuration, OpenAIApi } = require('openai');

const config = new Configuration({
    apiKey: process.env.CHATKEY
})
const openai = new OpenAIApi(config)

client.on('ready', async () => {
    console.log('Logged in <3');
    addMember(client);
    cron.schedule('0 10 * * *', ()=>{
      daily_reminder(); 
    })
  });
  


	client.on('interactionCreate', async (interaction) => {
		if (!interaction.isChatInputCommand()) return;
	


    if(interaction.commandName === 'plant_search'){
      await interaction.deferReply();
      const name = interaction.options.get('query').value;
      const response = await plantQuery(name);
      if(!response){
        await interaction.editReply('No plant could be found. :(')
        return;
      }
      if(response[0].common_name.toLowerCase()!=name.toLowerCase()){
        await interaction.editReply({content: `Could not find a plant of that name, but we found
         ${response.data[0].common_name}. If this is the plant, please search again with this name.`, ephemeral: true});
        return;
        /**
         * finish this 
         */
      }
      await interaction.editReply({content:
        `Name: ${response[0].common_name},\n Synonym: ${response[0].synonyms[0]},\n


        `, ephemeral: true})
        return;
    }



		if (interaction.commandName === 'get_reading') {
			await interaction.deferReply();
      try{
      const username= interaction.user.username;
      const result= await mongoSearch(username, 'users', 2);
      if(result==null) {
        await interaction.editReply("Couldn't receive a reading. Please make sure your location is set using the **${/set_location}**. :/")
        return;
      }
      const lat = parseFloat(result.lat)
      const lng = parseFloat(result.lng)

      const reading= await fetchSoilMoisture(lat, lng)
      console.log("Moisture level: "+reading)
			await interaction.editReply({ content: `Here is the data at your location:  \n`
      +`Soil moisture reading:  ${reading.moisture} m³/m³\n`
      + `Inches of rain: ${reading.rain} mm\n`
      + `Inches of showers: ${reading.showers} mm\n`
      + `Vapor pressure deficit: ${reading.vpd} kPa`, ephemeral: true });
      return;
    }
    catch(e){
      console.log(e);
      await interaction.editReply('Could not give reading due to an error. :/')
    }
		}



		if (interaction.commandName === 'set_location') {  
      const city= interaction.options.get('city').value;
      const state= interaction.options.get('state').value;
      const result = await mongoSearch(city, 'cities', 1);
      console.log("Latitude: "+result.lat)

      if(!result){
        await interaction.reply("Couldn't find your city. :(. Please make sure there are no errors when spelling your city and state. ");
        return;
      }
      await addData(interaction.user.username, result.name, result.lat, result.lng, true);
			await interaction.reply({ content: `Congrats, ${interaction.user.username}! Your location has been updated!`, ephemeral: true });
		}



		if (interaction.commandName === 'reminder') {
      const seconds = interaction.options.get('seconds').value;
      const mins = interaction.options.get('minutes').value
      const hours = interaction.options.get('hours').value
      const days = interaction.options.get('days').value
      if(Boolean((24*days)+hours)>170){
        await interaction.reply("Maximum hours inputted. Please input a smaller value.");
        return;
      }
      const content= interaction.options.get('description').value;
      const time = (((days * 24 * 60 * 60) + (hours * 60 * 60) + (mins * 60) + seconds) * 1000);
      reminder(content, time, interaction.user)
      await interaction.reply("Reminder has been set!")
		}




    if(interaction.commandName=== 'askgpt'){
      const query = interaction.options.get('query').value;
      await interaction.deferReply();

      let log = [{
        role: 'system',
        content: 'You answer all questions regarding plants, agriculture, and gardening.'
    }]
    log.push({
        role:'user',
        content: query,
    })
    const result = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: query,
    })

      await interaction.editReply(result.data.choices[0].message)
    } 
	});


  async function reminder(content, time, user){
    setTimeout(()=>{
      
      user.send({ content: `Your reminder for : ${content}`, ephemeral: true });
  }, time)
  }



  async function daily_reminder(){
      const guild = client.guilds.cache.get(process.env.GUILDID)
      guild.members.cache.forEach(async (member)=>{
        const result= mongoSearch(member.user.username, users, 2);
        if(!result.signed)
        return;
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lng)
        const reading= await fetchSoilMoisture(lat, lng)
        const showerR = parseFloat(reading.showers);
        const rainR = parseFloat(reading.rain);
        let temp=''
        Boolean(rainR>0||showerR>0?temp='Rain is expected, so water accordingly.':temp=`There is no chance of rain. Please try` +
        ` to water twice a today, or adjusting to each individual plant.`)

        const message = `Beautiful day today, ${member.user.username}!`+
        `Here is the data at your location:  \n`
        +`Soil moisture reading:  ${reading.moisture} m³/m³\n`
        + `Inches of rain: ${reading.rain} mm\n`
        + `Inches of showers: ${reading.showers} mm\n`
        + `Vapor pressure deficit: ${reading.vpd} kPa`
        + temp;
        try{
          sendDM(client, member.id, message)
        }
        catch(e){
          console.log('error during execution of reminder command')
        }
      })
  }


client.login(process.env.DISCORDTOKEN);
