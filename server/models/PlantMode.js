const req = require("express/lib/request");

class PlantData{
    constructor(db) { this.DB = db; }


// Ssend ESP Data
// ---------------------------------------------------------------------------------------------------------------------
    async storeESPData(temp, light, moisture, isRunning) {
        // const curr_user = req.user_id;
        const activeUserId = 1;
        await this.DB.execute(
            `INSERT INTO datasensors (PlantID, temp, light, moisture, isRunning, Date)
             VALUES (
                        (SELECT p.ID
                         FROM plant p
                                  JOIN planttype pt ON pt.ID = p.PlantTypeID
                         WHERE pt.user_id = ?
                         ORDER BY p.ID DESC
                            LIMIT 1),
                 ?, ?, ?, ?, CURDATE()
                 )`,
            [activeUserId, temp, light, moisture, isRunning]
        );
    }
// ---------------------------------------------------------------------------------------------------------------------


// Creat Method
// ---------------------------------------------------------------------------------------------------------------------
    async Create(plantName,userId) {
        try {
            const date = new Date();
            const formattedDate = date.toISOString().split('T')[0];

            let [sql, t] = await this.DB.execute(`SELECT * FROM planttype WHERE name = ?`, [plantName]);
            let plantTypeID;
            if (sql.length > 0) {  plantTypeID = sql[0].ID; }
            else {
                let [newPlantType] = await this.DB.execute(`INSERT INTO planttype(name, user_id) VALUES(?,?)`, [plantName,userId]);
                plantTypeID = newPlantType.insertId;
            }
            let [newPlant] = await this.DB.execute(`INSERT INTO plant(PlantTypeID, Date) VALUES(?, ?)`, [plantTypeID, formattedDate]);
            return newPlant.insertId;
        } catch (error) { throw error; }
    }
// ---------------------------------------------------------------------------------------------------------------------


// Read Method
// ---------------------------------------------------------------------------------------------------------------------
    async Read(){
        try{
            // let [sql]= await this.DB.execute(`SELECT * FROM planttype`);

            let [sql,t] = await this.DB.execute(`SELECT plant.*, planttype.* FROM plant
                JOIN planttype ON plant.PlantTypeID = planttype.ID` );
            return sql;
        } catch (error){ console.log(error); }
    }
// ---------------------------------------------------------------------------------------------------------------------


// Update Method
// ---------------------------------------------------------------------------------------------------------------------
async Update(plantName){
     try{
         const {name, ID} = plantName.body;
         let [sql,t]= await this.DB.execute(`SELECT * FROM planttype where ID = ?`,[ID]);
         if(sql.length > 0){ await this.DB.execute(`UPDATE planttype SET name = ? WHERE id = ?`,[name, ID]); }
     } catch (error){ console.log(error); }
}
// ---------------------------------------------------------------------------------------------------------------------


// Delete Method
// ---------------------------------------------------------------------------------------------------------------------
// async Delete(plantName){
//     try {
//         const {ID} = plantName.body;
//         let [sql,t]= await this.DB.execute(`SELECT * FROM planttype where ID = ?`,[ID]);
//         if(sql.length > 0){ await this.DB.execute(`DELETE FROM planttype WHERE id = ?`,[ID]); }
//     } catch (error) { console.log(error); }
// }

    async Delete(plantName){
        try {
            const {ID} = plantName.body;
            let [sql,t]= await this.DB.execute(`SELECT * FROM planttype where ID = ?`,[ID]);
            if(sql.length > 0){ await this.DB.execute(`DELETE FROM planttype WHERE id = ?`,[ID]); }
        } catch (error) { console.log(error); }
    }
// ---------------------------------------------------------------------------------------------------------------------
}
module.exports = PlantData;