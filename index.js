const express = require('express');
const db = require('./db')
const app = express();
const PRIORITIES = ['p1', 'p2', 'p3']



app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'server is running' });
});

app.get('/todos', (req, res) => {
    let sql = "SELECT * FROM TODOS WHERE 1 = 1"
    const values = []

    if(req.query.priority !== undefined) {
        sql += " AND PRIORITY = ?"
        values.push(req.query.priority)
    }

    if (req.query.done !== undefined) {
        sql += " AND DONE = ?"
        values.push(Number(req.query.done))
    }

    const rows = db.prepare(sql).all(...values)
    res.json(rows)
});

app.get('/todos/:id', (req, res) => {
    const id = Number(req.params.id)

    const result = db.prepare(
        'SELECT * FROM TODOS WHERE id = ?'
    ).get(id)
    if (!result) {
        res.status(404).json({error: "task not found"})
        return
    }
    res.json(result)
})

app.post('/todos', (req, res) => {
    if(!req.body.title) {
        res.status(400).json({error: "Cannot make a task without title"});
        return 
    } 
    if (req.body.priority !== undefined && !PRIORITIES.includes(req.body.priority)) {
        res.status(400).json({ error: "priority must be p1, p2 or p3" })
        return
    }

    const result = db.prepare(
        'INSERT INTO TODOS (title, description, deadline, priority, tags) VALUES (?, ?, ?, ?, ?)')
        .run(
            req.body.title,
            req.body.description ?? null,
            req.body.deadline ?? null,
            req.body.priority ?? 'p2',
            req.body.tags ?? null
    )

    const row = db.prepare (
        'SELECT * FROM TODOS WHERE  id = ?'
    ).get(
        result.lastInsertRowid
    )
    
    res.status(201).json(row)

    
});

app.patch('/todos/:id', (req, res) => {
    const id = Number(req.params.id)
    const result = db.prepare(
        'SELECT * FROM TODOS WHERE ID = ?'
    ).get(id)
    if (!result) {
        res.status(404).json({error: "task not found"})
        return
    }
    if (req.body.priority !== undefined && !PRIORITIES.includes(req.body.priority)) {
        res.status(400).json({ error: "priority must be p1, p2 or p3" })
        return
    }
    if (req.body.done !== undefined) {
        db.prepare(
            'UPDATE TODOS SET DONE = ? WHERE ID = ?'
        ).run(
            req.body.done ? 1 : 0, 
            id
        )
    }
    
    if (req.body.title) {
        db.prepare(
            'UPDATE TODOS SET TITLE = ? WHERE ID = ?'
        ).run(
            req.body.title,
            id
        )
    }

    if(req.body.description !== undefined) {
        db.prepare(
            'UPDATE TODOS SET DESCRIPTION = ? WHERE ID = ?'
        ).run(
            req.body.description,
            id
        )
    }
    if(req.body.tags !== undefined) {
        db.prepare(
            'UPDATE TODOS SET TAGS = ? WHERE ID = ?'
        ).run(
            req.body.tags,
            id
        )
    }
    if(req.body.deadline !== undefined) {
        db.prepare(
            'UPDATE TODOS SET DEADLINE = ? WHERE ID = ?'
        ).run(
            req.body.deadline,
            id
        )
    }


    const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id)
    res.json(updated)

})

app.delete('/todos/:id', (req, res) => {
    const id = Number(req.params.id)
    
    const result =db.prepare(
        'DELETE FROM TODOS WHERE id = ?'
    ).run(
        id
    )

    if(!result.changes) {
        res.status(404).json({error: "Task not found"})
        return
    }

    res.status(204).send()
}) 

app.listen(3000, () => {
  console.log('listening on port 3000');
});