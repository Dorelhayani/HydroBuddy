// Plant.js

class PlantData {
    constructor(db) {
        this.DB = db;
    }

    // insert sensor data for the most-recent plant of a user
    async storeESPData(userId, temp, light, moisture, isPumpON) {
        if (!userId) throw new Error('Missing user id');

        // find latest plant id for user
        const [rows] = await this.DB.execute(
            `SELECT p.ID as plantId
       FROM plant p
       JOIN planttype pt ON pt.ID = p.PlantTypeID
       WHERE pt.user_id = ?
       ORDER BY p.ID DESC
       LIMIT 1`,
            [userId]
        );

        if (!rows || rows.length === 0) throw new Error('No plant found for user');

        const plantId = rows[0].plantId;
        await this.DB.execute(
            `INSERT INTO datasensors (PlantID, temp, light, moisture, isPumpON, Date)
       VALUES (?, ?, ?, ?, ?, CURDATE())`,
            [plantId, temp, light, moisture, isPumpON]
        );

        return { message: 'Sensor data stored', plantId };
    }

    // Create a plant: ensure planttype exists for this user, then insert plant row
    async Create(plantName, userId) {
        if (!userId) throw new Error('Missing user id');
        if (!plantName || String(plantName).trim() === '') throw new Error('Missing plant name');

        const name = String(plantName).trim();
        const createdAt = new Date().toISOString().split('T')[0];

        // try find existing planttype for this user
        const [existing] = await this.DB.execute(
            `SELECT ID FROM planttype WHERE name = ? AND user_id = ? LIMIT 1`,
            [name, userId]
        );

        let plantTypeID;
        if (existing && existing.length > 0) {
            plantTypeID = existing[0].ID;
        } else {
            const [ins] = await this.DB.execute(
                `INSERT INTO planttype (name, user_id) VALUES (?, ?)`,
                [name, userId]
            );
            plantTypeID = ins.insertId;
        }

        const [newPlant] = await this.DB.execute(
            `INSERT INTO plant (PlantTypeID, Date) VALUES (?, ?)`,
            [plantTypeID, createdAt]
        );

        return newPlant.insertId;
    }

    // Read all plants (joined with planttype) - admin / public listing
    async Read() {
        const [rows] = await this.DB.execute(
            `SELECT p.*, pt.name AS planttype_name, pt.user_id AS plant_owner
       FROM plant p
       JOIN planttype pt ON p.PlantTypeID = pt.ID`
        );
        return rows;
    }

    // Read plants belonging to a specific user
    async ReadUserPlant(userId) {
        if (!userId) throw new Error('Missing user id');
        const [rows] = await this.DB.execute(
            `SELECT p.*, pt.name AS planttype_name
       FROM plant p
       JOIN planttype pt ON p.PlantTypeID = pt.ID
       WHERE pt.user_id = ?`,
            [userId]
        );
        return rows;
    }

    // Update a planttype name (only if owned by user)
    async Update(plantTypeId, newName, userId) {
        if (!plantTypeId) throw new Error('Missing plant type id');
        if (!userId) throw new Error('Missing user id');
        if (!newName || String(newName).trim() === '') throw new Error('Missing new name');

        const [rows] = await this.DB.execute( `SELECT ID FROM planttype WHERE ID = ? AND user_id = ? LIMIT 1`,
            [plantTypeId, userId] );
        if (!rows || rows.length === 0) throw new Error('Plant type not found or not owned by user');

        await this.DB.execute( `UPDATE planttype SET name = ? WHERE ID = ?`, [String(newName).trim(), plantTypeId] );
        return true;
    }

    // Delete a planttype (only if owned by user)
    async Delete(plantTypeId, userId) {
        if (!plantTypeId) throw new Error('Missing plant type id');
        if (!userId) throw new Error('Missing user id');

        const [rows] = await this.DB.execute(
            `SELECT ID FROM planttype WHERE ID = ? AND user_id = ? LIMIT 1`,
            [plantTypeId, userId]
        );
        if (!rows || rows.length === 0) throw new Error('Plant type not found or not owned by user');

        await this.DB.execute(`DELETE FROM planttype WHERE ID = ?`, [plantTypeId]);
        return true;
    }
}

module.exports = PlantData;
