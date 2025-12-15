/**
 * DP Shop (Proxy)
 * 
 * Proxies incoming Wii ECS requests to the WiiMart server.
 * The ECS server's structure is controlled by the WiiMart team.
 * Content of the DLCs are controlled by DanceParty team.
 * 
 * Made by yunyl
 */

require("dotenv").config();

const express = require('express');
const axios = require('axios');
const app = express();
const signale = require('signale');

const logger = signale;
const config = require('./config');

app.use(express.json());
app.use(express.text({ type: 'text/*' }));
app.use(express.raw({ type: 'application/*', limit: '10mb' }));

app.post('/ecs/services/ECommerceSOAP', async (req, res) => {
  try {
    logger.debug('Received POST request to /ecs/services/ECommerceSOAP');
    
    // Forward request to target server with same headers and body
    const response = await axios({
      method: 'POST',
      url: `${config.WIIMART_FQDN}/SOAP/ECommerceSOAP.jsp`,
      headers: req.headers,
      data: req.body,
      validateStatus: () => true, // Accept any status code
      maxRedirects: 0
    });
    
    // Forward response headers back to client
    Object.keys(response.headers).forEach(key => {
      res.setHeader(key, response.headers[key]);
    });
    
    // Send response with same status code and body
    res.status(response.status).send(response.data);
    logger.info(`Forwarded response with status: ${response.status}`);
    
  } catch (error) {
    logger.error('Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message 
    });
  }
});

app.listen(config.PORT, () => {
  logger.success(`DP Shop Proxy running on port ${config.PORT}`);
});