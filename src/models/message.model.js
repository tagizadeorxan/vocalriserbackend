const query = require('../db/db-connection');
const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');
class MessageModel {
    tableName = 'messages';

    find = async (params = {}) => {
        let sql = `SELECT * FROM ${this.tableName}`;

        if (!Object.keys(params).length) {
            return await query(sql);
        }

        const { columnSet, values } = multipleColumnSet(params)
        sql += ` WHERE ${columnSet}`;

        return await query(sql, [...values]);
    }

    findOne = async (params) => {

        const { columnSet, values } = multipleColumnSet(params)

        const sql = `SELECT * FROM ${this.tableName}
        WHERE ${columnSet}`;

        const result = await query(sql, [...values]);

        // return back the first row (user)
        return result[0];
    }

    create = async ({ sender, sender_fullname, reciever, reciever_fullname,message }) => {
        
        const sql = `INSERT INTO ${this.tableName}
        (sender, sender_fullname, reciever, reciever_fullname,message) VALUES (?,?,?,?,?) `;

        const result = await query(sql, [sender, sender_fullname, reciever, reciever_fullname,message]);
        
        const affectedRows = result ? result.affectedRows : 0;
        
        return affectedRows;
    }

    update = async (params, id) => {
        const { columnSet, values } = multipleColumnSet(params)

        const sql = `UPDATE messages SET ${columnSet} WHERE id = ?`;

        const result = await query(sql, [...values, id]);

        return result;
    }

    getLastInserted = async () => {
        const sql = `SELECT id FROM messages where id=(select max(id) from messages)`
        const result = await query(sql)
      
        return result
    }

    delete = async (id) => {
        const sql = `DELETE FROM ${this.tableName}
        WHERE id = ?`;
        const result = await query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }

    getMessage = async(id) => {
        let sql = `SELECT * FROM ${this.tableName} WHERE  sender = ${id} OR reciever = ${id}`;
        return await query(sql);

    }
}

module.exports = new MessageModel;