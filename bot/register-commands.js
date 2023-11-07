const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');
require("dotenv").config();

const commands = [
  {
    name: 'get_reading',
    description: 'Replies with a reading at your location!',
  },
  {
    name:'plant_search',
    description: 'Get infomation of your plant from a realtime database.',
    options:[
      {
        name: 'query',
        description: 'give the name of the plant you wish to search.',
        type: ApplicationCommandOptionType.String,
        require: true,
    }
    ]
  },
  {
    name: 'reminder',
    description: 'A one-time reminder. Time must not exceed roughly 170 hours, or a little over 7 days.',
    options:[
      {
        name: 'description',
        description:'What to remind you for.',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'seconds',
        description: 'Enter the amount of seconds till event.',
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
        {
        name: 'minutes',
        description: 'Enter the amount of minutes till event.',
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
      {
      name: 'hours',
      description: 'Enter the amount of hours till event.',
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
      {
        name: 'days',
        description: 'Enter the amount of days till event.',
        type: ApplicationCommandOptionType.Number,
        required: true,

      }]
  },
  {
    name: 'set_location',
    description: 'Needed to access some of the features. Use this to set your location!',
    options:[
      {
      name:'city',
      description:'Enter your city.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name:'state',
      description:'Enter your state.',
      type: ApplicationCommandOptionType.String,
      required: true,
    }]
  },
  {
    name: 'askgpt',
    description: 'allows you to ask ChatGPT a question!',
    options:[
      {
      name: 'query',
      description: 'Ask your question. Field is required.',
      type: ApplicationCommandOptionType.String,
      required: true,
      }
    ]
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORDTOKEN);
(async()=>{
try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(process.env.CLIENTID, process.env.GUILDID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}

})();