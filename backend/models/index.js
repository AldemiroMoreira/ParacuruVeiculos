const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Anuncio = require('./Anuncio');
const Plano = require('./Plano');
const Payment = require('./Payment');
const AnuncioImage = require('../models/AnuncioImage'); // Keep old one or migrate?
const Fabricante = require('./Fabricante');
const Modelo = require('./Modelo');
const State = require('./State');
const City = require('./City');
const Message = require('./Message');
const Favorite = require('./Favorite');
const Propaganda = require('./Propaganda');
const Categoria = require('./Categoria');
const Bonificacao = require('./Bonificacao');

// Associations
Usuario.hasMany(Anuncio, { foreignKey: 'usuario_id' });
Anuncio.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Message Associations
Usuario.hasMany(Message, { foreignKey: 'remetente_id', as: 'sentMessages' });
Usuario.hasMany(Message, { foreignKey: 'destinatario_id', as: 'receivedMessages' });
Message.belongsTo(Usuario, { foreignKey: 'remetente_id', as: 'sender' });
Message.belongsTo(Usuario, { foreignKey: 'destinatario_id', as: 'receiver' });

Anuncio.hasMany(Message, { foreignKey: 'anuncio_id' });
Message.belongsTo(Anuncio, { foreignKey: 'anuncio_id' });

// Favorites Associations
Usuario.hasMany(Favorite, { foreignKey: 'usuario_id', as: 'favorites' });
Favorite.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Anuncio.hasMany(Favorite, { foreignKey: 'anuncio_id' });
Favorite.belongsTo(Anuncio, { foreignKey: 'anuncio_id' });
// Many-to-Many through Favorites (Optional but useful)
Usuario.belongsToMany(Anuncio, { through: Favorite, foreignKey: 'usuario_id', as: 'favoriteAds' });
Anuncio.belongsToMany(Usuario, { through: Favorite, foreignKey: 'anuncio_id', as: 'favoritedBy' });

// Fabricantes / Modelos
Fabricante.hasMany(Modelo, { foreignKey: 'fabricante_id' });
Modelo.belongsTo(Fabricante, { foreignKey: 'fabricante_id' });
Modelo.belongsTo(Categoria, { foreignKey: 'categoria_id' });

Anuncio.belongsTo(Fabricante, { foreignKey: 'fabricante_id' });
Anuncio.belongsTo(Modelo, { foreignKey: 'modelo_id' });
Anuncio.belongsTo(Categoria, { foreignKey: 'categoria_id' });

// Locations
Anuncio.belongsTo(State, { foreignKey: 'estado_id', targetKey: 'abbreviation' });
Anuncio.belongsTo(City, { foreignKey: 'cidade_id' });

// Images - Use old model for now but might need renaming foreign key 'anuncio_id' -> 'anuncio_id' (it was 'anuncio_id' already).
Anuncio.hasMany(AnuncioImage, { foreignKey: 'anuncio_id', as: 'images' });
AnuncioImage.belongsTo(Anuncio, { foreignKey: 'anuncio_id' });

module.exports = {
    sequelize,
    Usuario,
    Anuncio,
    Plano,
    Payment,
    Fabricante,
    Modelo,
    State,
    City,
    AnuncioImage,
    Message,
    Favorite,
    Propaganda,
    Categoria,
    Bonificacao
};
