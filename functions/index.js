'use strict';
 
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const { dialogflow, Permission, SimpleResponse } = require("actions-on-google");

const app = dialogflow();

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
  	databaseURL: 'ws://yoyopizza-nciepm.firebaseio.com/'
});
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function addorder(agent){
    const pizzatype = agent.parameters.type;
    const pizzasize = agent.parameters.size;
    const pizzacount = agent.parameters.count;
    const customername = agent.parameters.name;
    const customerphone = agent.parameters.phone;
    const customeraddress = agent.parameters.address;
	  const hungry = agent.parameters.hungry;
	  const menu = agent.parameters.menu;
          const info = agent.parameters.info;
	  
    return admin.database().ref('data').set({
	    hungry=hungry,
	    menu=menu,
	    info=info;
    	pizzatype: pizzatype,
      	pizzasize: pizzasize,
      	pizzacount: pizzacount,
      customername: customername,
      customerphone: customerphone,
      customeraddress: customeraddress
	    
    });
  }
	app.intent("get_current_location", (conv, params, permissionGranted) => {
  if (permissionGranted) {
    const { requestedPermission } = conv.data;
    let address;
    if (requestedPermission === "DEVICE_PRECISE_LOCATION") {
      const { coordinates } = conv.device.location;
      console.log('coordinates are', coordinates);

      if (coordinates && address) {
        return conv.close(new SimpleResponse(`Your Location details ${address}`));
      } else {
       
        return conv.close("Sorry, I could not figure out where you are.");
      }
    }
  } else {
    return conv.close("Sorry, permission denied.");
  }
});
  let intentMap = new Map();
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Welcome', addorder);
  agent.handleRequest(intentMap);
});
