const query = require('../db/db-connection');
const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');
class BidModel {
    tableName = 'bids';

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

    create = async ({ gig_id, user_id, amount, full_name, track_url, track_title, soundslike }) => {
        const sql = `INSERT INTO ${this.tableName}
        (gig_id, user_id, amount, full_name, track_url, track_title,soundslike) VALUES (?,?,?,?,?,?,?)`;

        const result = await query(sql, [gig_id, user_id, amount, full_name, track_url, track_title, soundslike]);

        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }

    userWhereBidded = async (user_id) => {
        const sql = `SELECT DISTINCT gig_id from bids where user_id = ${user_id}  and  gig_id IN
        (SELECT id from gigs where active=1)`

        return await query(sql)
    }

    update = async (params, id) => {
        const { columnSet, values } = multipleColumnSet(params)

        const sql = `UPDATE bids SET ${columnSet} WHERE id = ?`;

        const result = await query(sql, [...values, id]);

        return result;
    }

    delete = async (id) => {
        const sql = `DELETE FROM ${this.tableName}
        WHERE id = ?`;
        const result = await query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new BidModel;