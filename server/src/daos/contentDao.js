const db = require('../../db');

/**
 * Query the database and get every question
 * @returns {Promise} a Promise that resolves to the full information about the questions
 * @throws the Promise rejects if any errors are encountered
 */


function createTicket(ticketInfo, user_id) {
    console.log("createTicketBACK,", ticketInfo, user_id);
    if (!ticketInfo.category || !ticketInfo.title || !ticketInfo.description) {
        console.log("Invalid ticket data");
        throw new Error('Invalid ticket data');
    }
    return new Promise((resolve, reject) => {
        const timestamp = formatTimestamp();

        db.serialize(() => {
            db.run('BEGIN TRANSACTION', (err) => { // transactions in a database operation ensures atomicity, which means that a series of operations either all succeed or all fail as a unit.
                if (err) {
                    console.log("Error starting transaction:", err);
                    reject(err);
                    return;
                }

                const sqlInsertTicket = `INSERT INTO Tickets (category, owner_id, title, timestamp) VALUES (?, ?, ?, ?)`;
                db.run(sqlInsertTicket, [ticketInfo.category, user_id, ticketInfo.title, timestamp], function(err) {
                    if (err) {
                        db.run('ROLLBACK', (rollbackErr) => {
                            if (rollbackErr) {
                                console.log("Error during rollback:", rollbackErr);
                            }
                        });
                        console.log("Error inserting into Tickets:", err);
                        reject(err);
                        return;
                    }

                    const ticket_id = this.lastID;
                    const sqlInsertBlock = `INSERT INTO TicketBlocks (ticket_id, content, timestamp, author_id) VALUES (?, ?, ?, ?)`;
                    db.run(sqlInsertBlock, [ticket_id, ticketInfo.description, timestamp, user_id], function(err) {
                        if (err) {
                            db.run('ROLLBACK', (rollbackErr) => {
                                if (rollbackErr) {
                                    console.log("Error during rollback:", rollbackErr);
                                }
                            });
                            console.log("Error inserting into TicketBlocks:", err);
                            reject(err);
                            return;
                        }

                        db.run('COMMIT', (commitErr) => {
                            if (commitErr) {
                                console.log("Error committing transaction:", commitErr);
                                reject(commitErr);
                            } else {
                                resolve();
                            }
                        });
                    });
                });
            });
        });
    });
}


function createBlock(blockInfo, ticket_id, user_id) {
    console.log("createBlockBACK,", blockInfo, ticket_id, user_id);
    // Controlla se blockInfo.text è nullo o undefined, se sì assegna una stringa vuota
    if (blockInfo.text === null || blockInfo.text === undefined) {
        blockInfo.text = '';
    }

    return new Promise((resolve, reject) => {
        // Prepara la query SQL per l'inserimento dei dati nel database
        const sql = `INSERT INTO TicketBlocks (ticket_id, content, timestamp, author_id) VALUES (?, ?, ?, ?)`;
        // Esegui la query SQL con i parametri appropriati
        // console.log("SERVER", ticket_id, blockInfo.text, blockInfo.timestamp, user_id);
        db.run(sql, [ticket_id, blockInfo.text, blockInfo.timestamp, user_id], function (err) {
            if (err) {
                console.log("Error:", err);
                reject(err); // Gestisci gli errori del database
            } else {
                resolve();
            }
        });
    });
}

function manageBlock(user_role, ticket_id, category, status) {
    return new Promise((resolve, reject) => {
        let sql;
        let params;

        if (user_role === 0) {
            sql = `UPDATE Tickets SET status = ? WHERE ticket_id = ?`;
            params = [status, ticket_id];
        } else if (user_role === 1) {
            sql = `UPDATE Tickets SET status = ?, category = ? WHERE ticket_id = ?`;
            params = [status, category, ticket_id];
        } else {
            reject(new Error('Invalid user role'));
            return;
        }

        db.run(sql, params, function(err) {
            if (err) {
                console.log("Error:", err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function getPublicData() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                T.ticket_id, 
                T.title, 
                U.username AS owner, 
                T.category, 
                T.status, 
                T.timestamp 
            FROM 
                Tickets T
            LEFT JOIN 
                Users U ON T.owner_id = U.user_id
        `;
        
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const formattedRows = rows.map(row => ({
                    ticket_id: row.ticket_id,
                    title: row.title,
                    owner: row.owner,
                    category: row.category,
                    status: row.status,
                    timestamp: row.timestamp
                }));
                
                resolve(formattedRows);
            }
        });
    });
}


function getUserData() {
    console.log("getUserData called");
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                T.ticket_id, 
                T.title, 
                U.username AS owner, 
                T.category, 
                T.status, 
                T.timestamp AS ticket_timestamp,
                B.content AS block_text, 
                B.timestamp AS block_timestamp, 
                UB.username AS block_author
            FROM 
                Tickets T
            LEFT JOIN 
                TicketBlocks B ON T.ticket_id = B.ticket_id
            LEFT JOIN 
                Users U ON T.owner_id = U.user_id
            LEFT JOIN 
                Users UB ON B.author_id = UB.user_id
        `;

        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const ticketsMap = {};

                rows.forEach(row => {
                    if (!ticketsMap[row.ticket_id]) {
                        ticketsMap[row.ticket_id] = {
                            ticket_id: row.ticket_id,
                            title: row.title,
                            owner: row.owner,
                            category: row.category,
                            status: row.status,
                            timestamp: row.ticket_timestamp,
                            blocksOfText: []
                        };
                    }

                    // Aggiungi il blocco anche se block_text è vuoto
                    ticketsMap[row.ticket_id].blocksOfText.push({
                        text: row.block_text || '', // Usa una stringa vuota se block_text è null o undefined
                        timestamp: row.block_timestamp,
                        author: row.block_author
                    });
                });

                const formattedTickets = Object.values(ticketsMap);
                //console.log("Formatted Tickets:", formattedTickets);
                resolve(formattedTickets);
            }
        });
    });
}


function formatTimestamp() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

exports.createTicket = createTicket;
exports.getPublicData = getPublicData;
exports.getUserData = getUserData;
exports.createBlock = createBlock;
exports.manageBlock = manageBlock;