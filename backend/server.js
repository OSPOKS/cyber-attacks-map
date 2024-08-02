
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

app.get('/api/attacks', async (req, res) => {
    try {
        const ipAddresses = ['8.8.8.8', '1.1.1.1'];
        const attacks = await Promise.all(ipAddresses.map(ip => 
            axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
                headers: { 'x-apikey': VIRUSTOTAL_API_KEY }
            })
        ));
        
        const formattedData = attacks.map(response => ({
            ip: response.data.data.id,
            country: response.data.data.attributes.country,
            last_analysis_date: response.data.data.attributes.last_analysis_date,
            threat_count: response.data.data.attributes.last_analysis_stats.malicious
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching data from VirusTotal:', error);
        res.status(500).send('Error fetching data');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
