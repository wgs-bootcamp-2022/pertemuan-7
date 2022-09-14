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

const isDuplicat = async (name) => {
    try{
        const isdup = pool.query(`SELECT * FROM contacts WHERE name = '${name}'`)
        return isdup
    } catch(err) {
        console.error(err.message)
    }
}

const addPostContact = [
    [
        body('name').custom(async(value, {req}) => {
            const duplicat = await isDuplicat(value)
            if(duplicat) {
            throw Error('Contact name is already used')
            }
            return true
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
        body('name').custom(async (value, {req}) => {
            const duplicat = await isDuplicat(value)
            if (value !== req.body.name && duplicat) {
                throw new Error('Contact Name is already used')
            }
            return true
        }),
        check('email', 'Email address is invalid').isEmail(),
        check('number', 'Mobile number is invalid').isMobilePhone('id-ID')
    ],
    async (req, res) => {
        let data = {
            oldname: req.body.name,
            name: req.body.name,
            email: req.body.email,
            number: req.body.number
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('editContact', {
            data,
            errors: errors.array()
            });
        } 
        // const {oldname,name,email,number} = req.body
        pool.query(`UPDATE contacts SET name = '${data.name}', email = '${data.email}', number = '${data.number}' WHERE name = '${data.oldname}'`, (error, results) => {
              if (error) {
                throw error
              }
              console.log(response)
            }
          )
        res.redirect('/contact')
    }
]


const deleteContact = (request, response) => {
    const name = request.params.name
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