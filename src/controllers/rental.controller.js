import connection from '../db/database.js';
import { rentalSchema } from '../schemas/rental.schema.js';

const list = async (req, res) => {
    const { customerId, gameId } = req.query;
    let cond = "";
    const arrayInsert = [];
    try {
        if(customerId){
            cond = `WHERE "customerId" =$1`;
            arrayInsert.push(customerId);
        }
        if(gameId){
            if(cond === ""){
                cond = `WHERE "gameId" =$1`;
                
            }else {
                cond += `AND "gameId" =$2`;
            }
            arrayInsert.push(gameId);
        }

        const rentals = await connection.query(
                `SELECT rentals.*, customers.name as "cName", games.name as "gName", games."categoryId" as "categoryId", categories.name as "categoryName" FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON rentals."gameId" = games.id JOIN categories ON games."categoryId" = categories.id ${cond};`,
                arrayInsert
            ); 
        
        const obj = rentals.rows.map((e) => {
          return {
                id: e.id,
                customerId: e.customerId,
                gameId: e.gameId,
                rentDate: JSON.stringify(e.rentDate).slice(1,11),
                daysRented: e.daysRented,
                returnDate: e.returnDate? JSON.stringify(e.returnDate).slice(1,11): e.returnDate,
                originalPrice: e.originalPrice,
                delayFee: e.delayFee,
                customer: {id: e.customerId, name: e.cName},
                game: {id: e.gameId, name: e.gName, categoryId: e.categoryId, categoryName: e.categoryName}
            };
        });
    
        res.status(200).send(obj);
    } catch (error) {
        res.status(500).send(error.message);
    } 
};

const create = async (req, res) => {
    const { customerId, gameId, daysRented } = req.body;
    const validation = rentalSchema.validate(req.body, { abortEarly: false });
  
    if (validation.error) {
      const erros = validation.error.details.map((detail) => detail.message);
      return res.status(400).send(erros);
    }
  
    try {
        const customer = await connection.query('SELECT * FROM customers WHERE id=$1;', [customerId]);
    
        if(!customer.rows[0]){
          return res.status(400).send("Cliente inexistente");
        }

        const game = await connection.query('SELECT * FROM games WHERE id=$1;', [gameId]);
    
        if(!game.rows[0]){
          return res.status(400).send("Jogo inexistente");
        }

        const rent = await connection.query('SELECT * FROM rentals WHERE "gameId"=$1 AND "returnDate" IS NULL;', [gameId]);
        
        if ((game.rows[0].stockTotal - rent.rows.length) <= 0){
          return res.status(400).send("Capacidade insuficiente");
        }

        const arrayInsert = [
            customerId,
            gameId,
            JSON.stringify(new Date()).slice(1,11),
            daysRented,
            null,
            daysRented * game.rows[0].pricePerDay,
            null
        ];

        await connection.query(
                'INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7);', 
                arrayInsert
            );  
    
        res.status(201).send(); 
    } catch (error) {
        res.status(500).send(error.message);
    } 
};

const finish = async (req, res) => {
    const { id } = req.params;
    try {
        const rental = await connection.query('SELECT rentals.*, games."pricePerDay" FROM rentals JOIN games ON rentals."gameId" = games.id WHERE rentals.id = $1;', [id]);

        if(!rental.rows[0]){
            return res.status(404).send("Aluguel inexistente");
        }

        if(rental.rows[0].returnDate){
            return res.status(400).send("Aluguel já está finalizado");
        }
        
        const rD = JSON.stringify(rental.rows[0].rentDate).slice(1,11).split("-");
        const tD = JSON.stringify(new Date()).slice(1,11).split("-");
        const diffDay = (new Date(tD[0],tD[1],tD[2]) - new Date(rD[0],rD[1],rD[2]) )/(1000*60*60*24);
        const delayFee = (diffDay <= rental.rows[0].daysRented)? 0 : 
            (diffDay - rental.rows[0].daysRented) * rental.rows[0].originalPrice;
        
        const arrayInsert = [
            JSON.stringify(new Date()).slice(1,11),
            delayFee,
            id
        ];

        await connection.query(
            'UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3;', 
            arrayInsert
        ); 

        res.status(200).send(); 
    } catch (error) {
        res.status(500).send(error.message);
    } 
};

const delet = async (req, res) => {
    const { id } = req.params;
    try {
        const rental = await connection.query('SELECT * FROM rentals WHERE id = $1;', [id]);

        if(!rental.rows[0]){
            return res.status(404).send("Aluguel inexistente");
        }

        if(!rental.rows[0].returnDate){
            return res.status(400).send("Aluguel não está finalizado");
        }

        await connection.query('DELETE FROM rentals WHERE id = $1;', [id]);

        res.status(200).send(); 
    } catch (error) {
        res.status(500).send(error.message);
    } 
};

export { create, list, finish, delet };