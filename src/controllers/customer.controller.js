import connection from '../db/database.js';
import { customerSchema } from '../schemas/customer.schema.js';

const list = async (req, res) => {
  const { cpf } = req.query;
  let cond = "";
  try {
      if(cpf){
          cond = `WHERE LOWER(cpf) LIKE '${cpf.toLowerCase()}%'`;
      }
      const games = await connection.query(
              `SELECT * FROM customers ${cond};`
          ); 
      
      const obj = games.rows.map((e) => {
        return {...e, birthday: JSON.stringify(e.birthday).slice(1,11) };
      });
  
      res.status(200).send(obj);
  } catch (error) {
      res.status(500).send(error.message);
  }
};

const listById = async (req, res) => {
  const { id } = req.params;
  try {
    const games = await connection.query(
            `SELECT * FROM customers WHERE id=${id} ;`
        ); 
    
    if (!games.rows[0]) {  
      return res.status(404).send("Cliente inexistente");
    }

    const obj = games.rows.map((e) => {
      return {...e, birthday: JSON.stringify(e.birthday).slice(1,11) };
    });

    res.status(200).send(obj);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const create = async (req, res) => {
  const { name, phone, cpf, birthday } = req.body;
  const validation = customerSchema.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const erros = validation.error.details.map((detail) => detail.message);
    return res.status(400).send(erros);
  }

  try {
      const customer = await connection.query('SELECT * FROM customers WHERE cpf=$1;', [cpf]);
  
      if(customer.rows[0]){
        return res.status(409).send("Cliente existente");
      }
  
      await connection.query(
              'INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1,$2,$3,$4);', 
              [name, phone, cpf, birthday]
          ); 
  
      res.status(201).send(); 
  } catch (error) {
      res.status(500).send(error.message);
  } 
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, phone, cpf, birthday } = req.body;
  const validation = customerSchema.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const erros = validation.error.details.map((detail) => detail.message);
    return res.status(400).send(erros);
  }
  
  try {
    const customerById = await connection.query(
      `SELECT * FROM customers WHERE id=${id} ;`
    ); 

    if (!customerById.rows[0]) {  
      return res.status(404).send("Cliente inexistente");
    }

    const customer = await connection.query('SELECT * FROM customers WHERE cpf=$1;', [cpf]);
  
    if(customer.rows[0] && customerById.rows[0].cpf !== cpf){
      return res.status(409).send("Cpf já caastrado");
    }

    await connection.query(
            'UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;',
            [name, phone, cpf, birthday, id]
        ); 

    res.status(200).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export { create, list, listById, update };