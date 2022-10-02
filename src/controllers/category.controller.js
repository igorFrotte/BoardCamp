import connection from '../db/database.js';
import { categorySchema } from '../schemas/category.schema.js';

const list = async (req, res) => {
    try {
        const categories = await connection.query('SELECT * FROM categories;');
    
        res.status(200).send(categories.rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const create = async (req, res) => {
    const { name } = req.body;
    const validation = categorySchema.validate(req.body, { abortEarly: false });
  
    if (validation.error) {
      const erros = validation.error.details.map((detail) => detail.message);
      return res.status(400).send(erros);
    }

    try {
        const categories = await connection.query('SELECT * FROM categories WHERE name=$1;', [name]);
    
        if(categories.rows[0]){
          return res.status(409).send("Categoria existente");
        }
    
        await connection.query('INSERT INTO categories (name) VALUES ($1);', [name]);
    
        res.status(201).send(); 
      } catch (error) {
        res.status(500).send(error.message);
      }
};

export { create, list };