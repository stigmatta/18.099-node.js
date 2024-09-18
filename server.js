const express = require('express');
const mssql = require('mssql');

const app = express();
const port = 8080;

const config = {
    user: 'test',
    password: '12345',
    server: 'ANDREYPC',
    database: 'Library',
    port: 1433,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, 
        trustServerCertificate: true 
    }
};

const poolPromise = new mssql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

app.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();
        
        const result = await request.query('SELECT Name,Pages,YearPress FROM Books');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Error retrieving books');
    }
});

app.get('/teachers',async(req,res) =>{
    try{
        const pool = await poolPromise;
        const request = pool.request();
        const result = await request.query('SELECT FirstName,LastName FROM Teachers');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Error retrieving books');
    }
})

app.get('/faculties',async(req,res) =>{
    try{
        const pool = await poolPromise;
        const request = pool.request();
        const result = await request.query('SELECT Name FROM Faculties');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Error retrieving books');
    }
})



const authors = express.Router();

authors.route("/:param")
    .get(async (req, res) => {
        const param = parseInt(req.params.param); 

        if (isNaN(param)) {
            return res.status(400).send('Invalid parameter');
        }

        try {
            const pool = await poolPromise; 
            const ps = new mssql.PreparedStatement(pool);
            ps.input('param', mssql.Int);
            
            await ps.prepare('SELECT Name,Pages,YearPress FROM Books WHERE Id_Author = @param');

            const result = await ps.execute({ param });
            res.json(result.recordset);
            console.log('Prepared statement executed');
        } catch (err) {
            console.error('SQL error:', err);
            res.status(500).send(`Error executing query: ${err.message}`);
        } 
    });


app.use("/authors", authors);


const publishers = express.Router();

publishers.route("/:param")
    .get(async (req, res) => {
        const param = parseInt(req.params.param); 

        if (isNaN(param)) {
            return res.status(400).send('Invalid parameter');
        }

        try {
            const pool = await poolPromise; 
            const ps = new mssql.PreparedStatement(pool);
            ps.input('param', mssql.Int);
            
            await ps.prepare('SELECT Name,Pages,YearPress FROM Books WHERE Id_Press = @param');

            const result = await ps.execute({ param });
            res.json(result.recordset);
            console.log('Prepared statement executed');
        } catch (err) {
            console.error('SQL error:', err);
            res.status(500).send(`Error executing query: ${err.message}`);
        } 
    });


app.use("/publishers", publishers);

const students = express.Router();

students.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();
        
        const result = await request.query('SELECT FirstName, LastName FROM Students');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Error retrieving students');
    }
});

students.route("/:param")
    .get(async (req, res) => {
        const param = parseInt(req.params.param); 

        if (isNaN(param)) {
            return res.status(400).send('Invalid parameter');
        }

        try {
            const pool = await poolPromise; 
            const ps = new mssql.PreparedStatement(pool);
            ps.input('param', mssql.Int);
            
            await ps.prepare('SELECT FirstName,LastName, Groups.Name FROM Students,Groups WHERE @param = Groups.Id');

            const result = await ps.execute({ param });
            res.json(result.recordset);
            console.log('Prepared statement executed');
        } catch (err) {
            console.error('SQL error:', err);
            res.status(500).send(`Error executing query: ${err.message}`);
        } 
    });


app.use("/students", students);




app.listen(port, () => {
    console.log('App listening on port ' + port);
});
