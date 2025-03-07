// dependencies
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const Fruit = require('./models/fruit');
const methodOverride = require('method-override');
const morgan = require('morgan');
// initialize the express application
const app = express();

// config code
dotenv.config();

// initialize connection to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Mongoose/MongoDB event listeners
mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (error) => {
    console.log(`An error connecting to MongoDB has occurred: ${error}`)
});

// mount middleware functions here

// body parser middleware: this function reads the request body
// and decodes it into req.body so we can access form data!
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method')); 
// method override reads the "_method" query param for 
// DELETE or PUT requests
app.use(morgan('dev'));
// static asset middleware - used to sent static assets (CSS, Imgs and DOM manipulation JS) to the client 
app.use(express.static('public'));

// Root path/route "HomePage"
app.get('/', async (req, res) => {
    res.render('index.ejs');
});

// Path to the page with a form we can fill out
// and submit to add a new fruit to the database
app.get('/fruits/new', (req, res) => {
    // never add a trailing slash with render!
    res.render('fruits/new.ejs'); // <-- relative file path
});

// Path used to receive form submissions
app.post('/fruits', async (req, res) => {
    // conditional logic to handle the 
    // default behavior of HTML form checkbox fields
    // we do this when we need a boolean instead of a string
    if(req.body.isReadyToEat === 'on') {
        req.body.isReadyToEat = true
    } else {
        req.body.isReadyToEat = false
    }
    // req.body.isReadyToEat = !!req.body.isReadyToEat;
    // create the data in our database
    await Fruit.create(req.body);
    // redirect tells the client to navigate to 
    // a new URL path/another page
    res.redirect('/fruits'); // <-- URL path
});

// index route for fruits - sends a page that lists
// all fruits from the database
app.get('/fruits', async (req, res) => {
    const allFruits = await Fruit.find({});
    res.render('fruits/index.ejs', { fruits: allFruits });
});

// show route - for sending a page with the details for
// one particular fruit
app.get('/fruits/:fruitId', async (req, res) => {
    const foundFruit = await Fruit.findById(req.params.fruitId);
    res.render('fruits/show.ejs', { fruit: foundFruit });
});

// delete route, once matched by server.js, sends a
// action to MongoDB to delete a document using it's id to find and delete it
app.delete('/fruits/:fruitId', async (req, res) => {
    await Fruit.findByIdAndDelete(req.params.fruitId);
    res.redirect('/fruits');
});

// edit route - used to send a page to the client with 
// an edit form pre-filled out with fruit details
// so the user can edit the fruit and submit the form
app.get('/fruits/:fruitId/edit', async (req, res) => {
    // 1. look up the fruit by it's id
    const foundFruit = await Fruit.findById(req.params.fruitId);
    // 2. respond with a "edit" template with an edit form
    res.render('fruits/edit.ejs', { fruit: foundFruit });
});


// update route - used to capture edit form submissions
// from the client and send updates to MongoDB
app.put('/fruits/:fruitId', async (req, res) => {
    if(req.body.isReadyToEat === 'on') {
        req.body.isReadyToEat = true;
    } else {
        req.body.isReadyToEat = false;
    }

    await Fruit.findByIdAndUpdate(req.params.fruitId, req.body);

    res.redirect(`/fruits/${req.params.fruitId}`);
});


app.listen(3000, () => {
    console.log('Listening on port 3000');
});