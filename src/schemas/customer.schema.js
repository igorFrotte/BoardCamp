import joi from 'joi';

const customerSchema = joi.object({
    phone: joi.string().pattern(/[0-9]/).min(10).max(11).required(),
    cpf: joi.string().pattern(/[0-9]/).min(11).max(11).required(),
    name: joi.string().required(),
    birthday: joi.date().required()
});

export { customerSchema };