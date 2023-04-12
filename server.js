const express = require('express');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const cors = require('cors')

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config()

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL
});

// CREATE - POST 
app.post(`/api/todo`, (req, res) => {
    const { name, due_date } = req.body;
    if (!name || !due_date) {
        res.status(400).json({error: 'Internal Server Error'})
    } else {
        pool.query(`INSERT INTO todo (name, due_date) VALUES ($1, $2) RETURNING *`, [name, due_date])
        .then((result) => {
            res.status(201).json(result.rows[0])
        })
    }
})


// READ - GET all 
app.get('/api/todo', (req, res) => {
    pool.query(`SELECT * FROM todo;`, (err, result) => {
        if (err) {
            console.error(err)
            res.status(500).json({error: 'Internal Server Error'})
        } else {
            res.json(result.rows);
        }
    })
})


// READ - GET by ID 
app.get('/api/todo/:id', (req, res) => {
    const todoId = req.params.id;
    pool.query(`SELECT * FROM todo WHERE id = $1;`, [todoId])
    .then((result) => {
        if (result.rows.length === 0) {
            res.status(404).json({error: 'To-Do Not Found'})
        } else {
            res.json(result.rows[0]);
        }
    })
})

//UPDATE - PUT by ID
app.put('/api/todo/:id', (req, res) => {
    const todoId = req.params.id;
    const { name, due_date } = req.body;
    pool.query(`UPDATE todo SET name=$1, due_date=$2 WHERE id = $3;`, [name, due_date, todoId])
    .then((result) => {
        if (result.rowCount === 0) {
            res.status(500).json({error: 'Internal Server Error'})
        } else {
            res.json({message: `To-Do with ID ${todoId} updated successfully`});
        }
    })
})

//DELETE by ID
app.delete('/api/todo/:id', (req, res) => {
    const todoId = req.params.id;
    pool.query(`DELETE FROM todo WHERE id = $1`, [todoId])
    .then((result) => {
        if (result.rows.length === 0) {
            res.status(404).json({error: 'To-Do Not Found'})
        } else {
            res.json({message: `To-Do with ID ${todoId} deleted succesfully`})
        }
    })
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening to port: ${PORT}`)
});