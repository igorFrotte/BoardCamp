import connection from '../db/database.js';
import { gameSchema } from '../schemas/game.schema.js';

const list = async (req, res) => {
    const { name } = req.query;
    let cond = "";
    const arrayInsert = [];
    try {
        if(name){
            cond = `WHERE LOWER(games.name) LIKE $1`;
            arrayInsert.push(name.toLowerCase() + "%");
        }
        const games = await connection.query(
                `SELECT games.*, categories.name as "categoryName" FROM games JOIN categories ON games."categoryId"=categories.id ${cond};`,
                arrayInsert
            ); 
    
        res.status(200).send(games.rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const create = async (req, res) => {
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
    const validation = gameSchema.validate(req.body, { abortEarly: false });
  
    if (validation.error) {
      const erros = validation.error.details.map((detail) => detail.message);
      return res.status(400).send(erros);
    }

    try {
        const categories = await connection.query('SELECT * FROM categories WHERE id=$1;', [categoryId]);
    
        if(!categories.rows[0]){
          return res.status(400).send("Categoria inexistente");
        }

        const games = await connection.query('SELECT * FROM games WHERE name=$1;', [name]);
    
        if(games.rows[0]){
          return res.status(409).send("Jogo existente");
        }
    
        await connection.query(
                'INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1,$2,$3,$4,$5);', 
                [name, image, stockTotal, categoryId, pricePerDay]
            );
    
        res.status(201).send(); 
      } catch (error) {
        res.status(500).send(error.message);
      } 
};

export { create, list };