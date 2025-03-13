const mongoose = require('mongoose');

const PositivacaoSchema = new mongoose.Schema({
    codigo_cliente: { type: String, required: true },
    nome: { type: String, required: true },
    ano: String,
    mes: String,
    meta: Number,
    realizado: Number,
    atingido: Number,
}, { collection: 'positivacao' });

module.exports = mongoose.model('Positivacao', PositivacaoSchema);