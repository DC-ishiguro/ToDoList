// import Axios from "axios";

// const App = () => {
//     const [tasks, setTasks] = useState([]);

//     useEffect(() => {
//         Axios.get("http://localhost:3001/api/get/value").then((response) =>{
//             setTasks(response.data);
//         });
//     }, []);

//     return (
//         <ul>
//             {tasks.map((val, index) => {
//                 return <li key={index}>{val.text}</li>
//             })}
//         </ul>
//     );
// }

// export default App;

import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';
import './App.css';

const App = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [editTaskId, setEditTaskId] = useState(null);
    const [editTaskText, setEditTaskText] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:3001/tasks');
            setTasks(response.data);
        } catch (error) {
            console.error('エラーが発生しました:', error);
        }
    };

    const addTask = async () => {
        if (newTask.trim()) {
            try {
                const response = await axios.post('http://localhost:3001/tasks', { text: newTask });
                setTasks([...tasks, response.data]);
                setNewTask('');
            } catch (error) {
                console.error('追加の際にエラー:', error);
            }
        }
    };

    const toggleTask = async (id) => {
        const task = tasks.find(t => t.id === id);
        try {
            await axios.put(`http://localhost:3001/tasks/${id}`, { ...task, flg: !task.flg });
            setTasks(tasks.map(t => t.id === id ? { ...t, flg: !t.flg } : t));
        } catch (error) {
            console.error('更新の際にエラー:', error);
        }
    };

    const deleteTask = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/tasks/${id}`);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (error) {
            console.error('削除の際にエラー:', error);
        }
    };

    const startEditing = (id, text) => {
        setEditTaskId(id);
        setEditTaskText(text);
    };

    const updateTask = async (id) => {
        if (editTaskText.trim()) {
            try {
                await axios.put(`http://localhost:3001/tasks/${id}`, { text: editTaskText });
                setTasks(tasks.map(t => t.id === id ? { ...t, text: editTaskText } : t));
                setEditTaskId(null);
                setEditTaskText('');
            } catch (error) {
                console.error('更新の際にエラー:', error);
            }
        }
    };

    const completedTasks = tasks.filter(task => task.flg).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const data = {
        labels: ['達成', '未達成'],
        datasets: [
            {
                data: [completedTasks, totalTasks - completedTasks],
                backgroundColor: ['#36A2EB', 'red'],
            },
        ],
    };

    return (
        <div className="App">
            <h1>ToDo List</h1>
            <div className="content">
                <div className="chart">
                    <Doughnut data={data} options={{
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        return `${context.label}: ${context.raw}`;
                                    }
                                }
                            }
                        }
                    }} />
                    <div className="chart-text">{`達成率 ${completionRate}%`}</div>
                </div>
                <div className="todo-list">
                    <div className="input-container">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="やること追加"
                        />
                        <button onClick={addTask}>追加</button>
                    </div>
                    <ul>
                        {tasks.map(task => (
                            <li key={task.id}>
                                <input
                                    type="checkbox"
                                    checked={task.flg}
                                    onChange={() => toggleTask(task.id)}
                                />
                                {editTaskId === task.id ? (
                                    <input
                                        type="text"
                                        value={editTaskText}
                                        onChange={(e) => setEditTaskText(e.target.value)}
                                    />
                                ) : (
                                    <span>{task.text}</span>
                                )}
                                <div>
                                    {editTaskId === task.id ? (
                                        <button class="edit" onClick={() => updateTask(task.id)}>更新</button>
                                    ) : (
                                        <button class="edit" onClick={() => startEditing(task.id, task.text)}>編集</button>
                                    )}
                                    <button onClick={() => deleteTask(task.id)}>削除</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default App;
