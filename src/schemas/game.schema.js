import joi from 'joi';

const gameSchema = joi.object({
    name: joi.string().required(),
    stockTotal: joi.number().min(1).required(),
    pricePerDay: joi.number().min(1).required(),
    categoryId: joi.number().required(),
    image: joi.string().required()
}); 

export { gameSchema };