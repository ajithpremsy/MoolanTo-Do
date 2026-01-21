import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch, where } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function TodoApp({ user }) {
    const [tasks, setTasks] = useState([]);
    const [newItem, setNewItem] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (!user) return;

        // Query tasks for current user
        const q = query(collection(db, `users/${user.uid}/tasks`));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const taskList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort locally or add orderBy to query (requires index)
            taskList.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setTasks(taskList);
        });

        return () => unsubscribe();
    }, [user]);

    const addTask = async (e) => {
        e?.preventDefault();
        if (!newItem.trim()) return;

        await addDoc(collection(db, `users/${user.uid}/tasks`), {
            text: newItem,
            completed: false,
            createdAt: serverTimestamp()
        });

        setNewItem("");
        setFilter('all');
    };

    const toggleTask = async (task) => {
        await updateDoc(doc(db, `users/${user.uid}/tasks`, task.id), {
            completed: !task.completed
        });
    };

    const deleteTask = async (id) => {
        await deleteDoc(doc(db, `users/${user.uid}/tasks`, id));
    };

    const clearCompleted = async () => {
        const completedTasks = tasks.filter(t => t.completed);
        const batch = writeBatch(db);
        completedTasks.forEach(task => {
            batch.delete(doc(db, `users/${user.uid}/tasks`, task.id));
        });
        await batch.commit();
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    });

    const activeCount = tasks.filter(t => !t.completed).length;

    return (
        <div className="app-container">
            <header className="main-header">
                <div className="logo-container">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="32" rx="6" fill="#F08434" />
                        <path d="M10 10H14V22H10V10Z" fill="white" />
                        <path d="M18 16H22V22H18V16Z" fill="white" />
                        <circle cx="20" cy="12" r="2" fill="white" />
                    </svg>
                    <h1>MoolanTo-Do</h1>
                    <button onClick={() => signOut(auth)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                        Sign Out
                    </button>
                </div>
            </header>

            <main className="todo-wrapper">
                <div className="input-group">
                    <input
                        type="text"
                        className="task-input"
                        placeholder="Add a new task..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    />
                    <button className="add-btn" onClick={addTask}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                            <path d="M6 1V11M1 6H11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Add Task
                    </button>
                </div>

                <div className="filters-container">
                    <div className="filter-tabs">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 5L4.5 9L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            All <span className="count-badge">({tasks.length})</span>
                        </button>
                        <button
                            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            <div className="circle-icon"></div>
                            Active <span className="count-badge">({activeCount})</span>
                        </button>
                        <button
                            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            Completed <span className="count-badge">({tasks.filter(t => t.completed).length})</span>
                        </button>
                    </div>
                </div>

                <ul className="task-list">
                    {filteredTasks.map(task => (
                        <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                            <div className="task-checkbox-wrapper" onClick={() => toggleTask(task)}>
                                <input type="checkbox" style={{ display: 'none' }} checked={task.completed} readOnly />
                                <div className="custom-checkbox">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                            </div>
                            <span className="task-text">{task.text}</span>
                            <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </li>
                    ))}
                    {filteredTasks.length === 0 && (
                        <li style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No tasks found</li>
                    )}
                </ul>

                <footer className="list-footer">
                    <span>{activeCount} task{activeCount !== 1 ? 's' : ''} remaining</span>
                    <button className="clear-completed-btn" onClick={clearCompleted}>Clear completed</button>
                </footer>
            </main>
        </div>
    );
}
