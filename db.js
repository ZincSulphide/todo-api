const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('todos.db');

db.exec(
`
  CREATE TABLE IF NOT EXISTS TODOS (
    id integer primary key autoincrement,
    title text not null,
    description text,
    deadline datetime,
    priority text check (priority in ('p1', 'p2', 'p3')) default 'p2',
    tags text,
    done integer not null default 0,
    created_at text not null default current_timestamp
  );
`

);

module.exports = db;