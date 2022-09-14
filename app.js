const controller = require('./controllers/controller')
const expressLayouts = require('express-ejs-layouts')
const express = require('express');
const app = express();
const path = require('path');


const morgan = require('morgan');

app.use(expressLayouts)
app.use(express.json()) //req body diterima sbg data json
app.use(express.urlencoded({ extended: true })); // Untuk parsing body request

app.set('layout', './layout/home')

app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, 'public')))

app.use(morgan('dev'))


app.get('/test', async (req, res) => {
    try{
        console.log('connected')
    } catch (err) {
        console.error(err.message)
    }
})


app.get('/', controller.getHome);
app.get('/about', controller.getAbout)
app.get('/contact', controller.getContact)
app.get('/contact/add', controller.addContact)
app.post('/contact/add', controller.addPostContact)
app.get('/contact/:name/detail', controller.getDetailContact)
app.get('/contact/:name/edit', controller.updateContact)
app.post('/contact/:name/edit', controller.editPostContact)
app.get('/contact/:name/delete', controller.deleteContact)

const port = 3000;
app.listen(port, console.log(`Server has started at port ${port}`))
