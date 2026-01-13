const { BetterSQLiteWrapper } = require('./db_better_sqlite3');
const fs = require('fs');
const {DB_SCHEME, TABLE} = require('./constant_sql')


/// Bảng VĐV thi
class DBChampionEventService {
    constructor() {
        this.db = new BetterSQLiteWrapper(DB_SCHEME);
        this.db.serialize(() => {
            this.db.run(TABLE.CRE_CHP_EVT);
        })
    }
}

const instance = new DBChampionEventService ();
module.exports = instance;
