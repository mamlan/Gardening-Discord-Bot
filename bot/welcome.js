// const { addData, mongoSearch } = require(`./apicalls.js`);

async function addMember(client) {
  try {
    client.on('guildMemberAdd', async (member) => {
      const channelID = '1120774446794428438';
      console.log(member);
      const welcomeMessage = `Welcome to the server, ${member.user.username}!`;
      const message = `Hello, welcome to our server, ${member.user.username}! User the '/set_location' Slash Command to set your location.`+ 
      'Doing so will allow access to all the features. Example: If you are from New York City, enter "New York City" for the city,  and "NY" for the state.';
      const channel = member.guild.channels.cache.get(channelID);
      channel.send(welcomeMessage);
      const userID = member.id;
    });
  } catch (error) {
    console.log(error);
  }
}

function sendDM(client, userID, message) {
  return client.users.fetch(userID, false).then((user) => {
    return user.send(message);
  });
}



module.exports = { addMember, sendDM };
