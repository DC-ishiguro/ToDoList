const express = require('express');
const app = express();
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 3001;

//DB接続
const db = mysql.createConnection({
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'todolist'
});

db.connect(err => {
    if (err) {
        console.error('DBエラー:', err.stack);
        return;
    }
    console.log('DB接続');
});

//cors対策
app.use(cors());

//json
app.use(bodyParser.json());

// //API作成
// app.get("/api/get/value", (req, res) => {
//     const sql = 'SELECT * FROM list';
//     db.query(sql, (err, result) => {
//         res.send(result);
//     })
// });

// //起動確認
// app.listen(port, () => {
//     console.log('サーバーが起動しました。');
// });

// タスクの取得
app.get('/tasks', (req, res) => {
    db.query('SELECT * FROM list WHERE dl_time IS NULL', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// タスクの追加
app.post('/tasks', (req, res) => {
    const { text } = req.body;
    db.query('INSERT INTO list (text) VALUES (?)', [text], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: results.insertId, text, flg: false, time: new Date(), up_time: new Date(), dl_time: null });
    });
});

// タスクの更新
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { text, flg } = req.body;
    db.query('UPDATE list SET text = ?, flg = ?, up_time = CURRENT_TIMESTAMP WHERE id = ?', [text, flg, id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id, text, flg });
    });
});

// タスクの削除
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE list SET dl_time = CURRENT_TIMESTAMP WHERE id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id });
    });
});

// サーバーの起動
app.listen(port, () => {
    console.log('サーバー起動');
});