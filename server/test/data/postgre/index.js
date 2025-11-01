const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });

const sequelize = new Sequelize(process.env.POSTGRESQL_URI || 'postgres://user:password@localhost:5432/playlister');

//User
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: true
});

//Playlist
const Playlist = sequelize.define('Playlist', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ownerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    songs: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    }
}, {
    timestamps: true
});

//define the associations
User.hasMany(Playlist, {
    foreignKey: 'userId',
    as: 'playlists'
});

Playlist.belongsTo(User, {
    foreignKey: 'userId'
});

async function fillCollection(collection, collectionName, data) {
    try {
        await collection.bulkCreate(data);
        console.log(collectionName + " filled");
    } catch (err) {
        console.log(err);
    }
}

async function resetPostgre() {
    const testData = require("../example-db-data.json");

    console.log("Resetting the PostgreSQL DB");

    //drops and recreates all tables
    await sequelize.sync({ force: true });
    console.log("Tables cleared");

    // put our test data in
    await fillCollection(User, "User", testData.users);
    await fillCollection(Playlist, "Playlist", testData.playlists);

    console.log("PostgreSQL reset complete!");
    process.exit(0);
}

//connect and run the reset
sequelize
    .authenticate()
    .then(() => { return resetPostgre() })
    .catch(e => {
        console.error('Connection error', e.message);
    });