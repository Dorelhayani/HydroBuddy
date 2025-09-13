class UserData{
    constructor(db) { this.DB = db; }

// Creat Method
// ---------------------------------------------------------------------------------------------------------------------
    async Create(name, email, password, type){
        try {
            let date = new Date();
            let creatAt = date.toISOString().split('T')[0];
            const Query = `INSERT INTO users(name, email, password, type, created_at) VALUES (?, ?, ?, ?, ?)`;
            const pararms = [name, email, password, type, creatAt];
            const [result] = await this.DB.execute(Query, pararms);
            return result.insertId;
        } catch (error) { throw error; }
    }
// ---------------------------------------------------------------------------------------------------------------------


// Read Method
// ---------------------------------------------------------------------------------------------------------------------
    async Read() {
        try {
            const sqlQuery = `
        SELECT
          u.id         AS user_id,
          u.name       AS user_name,
          u.type       AS user_type,
          p.ID         AS plant_id,
          p.name       AS plant_name,
          p.user_id    AS plant_user_id
        FROM users AS u
        JOIN planttype AS p
          ON u.id = p.user_id;
      `;
            let [rows] = await this.DB.execute(sqlQuery);
            return rows;
        } catch (error) {
            console.error("Error in Read():", error);
            throw error;
        }
    }
// ---------------------------------------------------------------------------------------------------------------------

// Get Users List - For Client Side
// ---------------------------------------------------------------------------------------------------------------------
    async List(){
        try{
            let [sql]= await this.DB.execute(`SELECT * FROM users`);
            return sql;
        } catch (error){ console.log(error); }

    }
// ---------------------------------------------------------------------------------------------------------------------


// Update Method
// ---------------------------------------------------------------------------------------------------------------------
    async Update(user){
        try{
            const {id, name, email, password, type} = user.body;
            let [sql,t]= await this.DB.execute(`SELECT * FROM users where id = ?`,[id]);
            if(sql.length > 0){ await this.DB.execute(`UPDATE users SET name = ?, email = ?,password = ?, type = ?
                 WHERE id = ?`,[name, email, password, type, id]);
            }
            console.log(sql);
        } catch (error){ console.log(error); }
    }
// ---------------------------------------------------------------------------------------------------------------------


// Delete Method
// ---------------------------------------------------------------------------------------------------------------------
    async Delete(user){
        try {
            const {id} = user.body;
            let [sql,t]= await this.DB.execute(`SELECT * FROM users where id = ?`,[id]);
            if(sql.length > 0){ await this.DB.execute(`DELETE FROM users WHERE id = ?`,[id]); }
        } catch (error) { console.log(error); }
    }
// ---------------------------------------------------------------------------------------------------------------------
}
module.exports = UserData;
