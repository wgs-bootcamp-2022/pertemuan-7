const { body, validationResult, check } = require('express-validator'); // Express Validator
const morgan = require('morgan');
const pool = require('../data/db');
const { response } = require('express');
const { emptyQuery } = require('pg-protocol/dist/messages');
morgan(':method :url :status :response-time ms - :res[content-length]');

const getHome = (req,res) => {
    res.render('index')

}
const getAbout = (req, res, next) => {
    console.log('Time:', Date.now())
    res.render('about')
    next()
}


const getByName = (name) => {
    return pool.query(`SELECT * FROM contacts WHERE LOWER(name) = '${name}'`);
}

const updateByName = (data) => {
    const { oldname, name, email, number } = data;
    return pool.query(
      `UPDATE contacts SET name = '${name}', email = '${email}', number = '${number}'  WHERE name = '${oldname}'`,
    );
  }

const getContact = (request, response) => {
    pool.query(`SELECT * FROM contacts ORDER BY name ASC`, (err, res)=>{
        if(err) {
            throw err
        }
        const data = res.rows
        response.render('contact', {data})
    })
}
const getDetailContact = (req, response) => {
    const name = req.params.name
    pool.query(`SELECT * FROM contacts where name = '${name}'`, (err, res)=>{
        if(err) {
            throw err
        }
        const data = res.rows
        response.render('detailContact', {data})
    })
}
const addContact = (req, res) => {
    res.render('add')
}

const addPostContact = [
    [
        body('name').custom( async(value, { req }) => {
            const contact = await getByName(value.toLowerCase());
            if (value !== req.body.oldname && contact.rows[0]) {
              throw new Error('Name Already Used!');
            }
            return true;
          }),
        check('email', 'Email address is invalid').isEmail(),
        check('number', 'Mobile number is invalid').isMobilePhone('id-ID')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('add', {
            data: req.body,
            errors: errors.array()
            });
        } 
        const {name, email, number} = req.body
        pool.query(`INSERT INTO contacts (name, email, number) VALUES ('${name}', '${email}', '${number}')`,(error, results) => {
            if (error) {
                throw error
            }
            console.log(results)
          })
        res.redirect('/contact')    
    }
]

const updateContact = (req, response) => {
    const name = req.params.name
    pool.query(`SELECT * FROM contacts where name = '${name}'`, (err, res)=>{
        if(err) {
            throw err
        }
        const data = res.rows
        response.render('editContact',{data})
    })
}

const editPostContact = [
    [
        body('name').custom( async(value, { req }) => {
            const contact = await updateByName(value.toLowerCase());
            if (value !== req.body.oldname && contact.rows[0]) {
              throw new Error('Name already used!');
            }
            return true;
          }),
        check('email', 'Email address is invalid').isEmail(),
        check('number', 'Mobile number is invalid').isMobilePhone('id-ID')
    ],
    
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('editContact', {
            data: req.body,
            errors: errors.array()
            });
        } 
        let objparam = {
            name: req.body.name,
            email: req.body.email,
            number: req.body.number
        }
        console.log(errors)
        updateByName(objparam);
        res.redirect('/contact');

    }
]


const deleteContact = (request, response) => {
    const name = request.params.name.toLowerCase()
    console.log(name)
    pool.query('DELETE FROM contacts WHERE name = $1', [name], (error, results) => {
      if (error) {
        throw error
      }
      console.log(results)
    })
    response.redirect('/contact')
}

module.exports = {
                    getHome, 
                    getAbout,
                    getContact, 
                    getDetailContact,
                    addContact,     
                    deleteContact, 
                    updateContact,      
                    addPostContact, 
                    editPostContact
                 }