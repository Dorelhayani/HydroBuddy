class UserData{
    constructor(db) { this.DB = db; }
// Read Method
// ---------------------------------------------------------------------------------------------------------------------
    async Read() {
        try {
            const sqlQuery = `
        SELECT
          u.id         AS user_id,
          u.name       AS user_name,
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
//     async Update(user){
//         try{
//             const {id, name, email} = user.body;
//             let [sql,t]= await this.DB.execute(`SELECT * FROM users where id = ?`,[id]);
//             if(sql.length > 0){ await this.DB.execute(`UPDATE users SET name = ?, email = ?
//                  WHERE id = ?`,[name, email, id]);
//             }
//             console.log(sql);
//         } catch (error){ console.log(error); }
//     }

    async Update(id, data){
        try{
            const { name, email } = data;
            const [rows] = await this.DB.execute(`SELECT * FROM users WHERE id = ?`, [id]);
            if (rows.length > 0) {
                await this.DB.execute(`UPDATE users SET name = ?, email = ? WHERE id = ?`, [name, email, id]);
            } else {
                throw new Error('User not found');
            }
        } catch (error) {
            throw error;
        }
    }
// ---------------------------------------------------------------------------------------------------------------------


// Delete Method
// ---------------------------------------------------------------------------------------------------------------------
//     async Delete(user){
//         try {
//             const {id} = user.body;
//             let [sql,t]= await this.DB.execute(`SELECT * FROM users where id = ?`,[id]);
//             if(sql.length > 0){ await this.DB.execute(`DELETE FROM users WHERE id = ?`,[id]); }
//         } catch (error) { console.log(error); }
//     }

    async Delete(id){
        try {
            const [rows] = await this.DB.execute(`SELECT * FROM users WHERE id = ?`, [id]);
            if (rows.length > 0) {
                await this.DB.execute(`DELETE FROM users WHERE id = ?`, [id]);
            } else {
                throw new Error('User not found');
            }
        } catch (error) {
            throw error;
        }
    }
// ---------------------------------------------------------------------------------------------------------------------
}
module.exports = UserData;
