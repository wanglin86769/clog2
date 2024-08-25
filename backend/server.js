const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const databaseConfig = require('./config/database.js');
const globalConfig = require('./config/global.js');

// Iterate through the object and load global variables
for (const key in globalConfig) {
    if (globalConfig.hasOwnProperty(key)) {
        global[key] = globalConfig[key];
    }
}

// Connecting mongoDB
mongoose.connect(databaseConfig.url)
.then(() => {
        console.log('Database connected')
    },
    error => {
        console.log('Database could not be connected: ' + error)
    }
)

// Setting up express
const app = express();
// app.use(bodyParser.json());
app.use(cors());

app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

// Api root
const authenticateRoute = require('./auth/authenticate.js');
const accountRoute = require('./routes/account_route.js');
const userRoute = require('./routes/user_route.js');
const logbookRoute = require('./routes/logbook_route.js');
const tagRoute = require('./routes/tag_route.js');
const groupRoute = require('./routes/group_route.js');
const logRoute = require('./routes/log_route.js');
const templateRoute = require('./routes/template_route.js');
app.use('/api/authenticate', authenticateRoute);
app.use('/api/accounts', accountRoute);
app.use('/api/users', userRoute);
app.use('/api/logbooks', logbookRoute);
app.use('/api/tags', tagRoute);
app.use('/api/groups', groupRoute);
app.use('/api/logs', logRoute);
app.use('/api/templates', templateRoute);

// Create port
const port = process.env.PORT || 3000;

// Connecting port
const server = app.listen(port, () => {
    console.log('Port connected to: ' + port)
});