const { Sequelize, DataTypes } = require('sequelize');
const DatabaseManager = require('../DatabaseManager');

class SequelizeManager extends DatabaseManager {
    constructor() {
        super();
        this.sequelize = new Sequelize(process.env.POSTGRESQL_URI);
        this.User = null;
        this.Playlist = null;
    }

    async initializeModels() {
        //User
        this.User = sequelize.define('User', {
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
        this.Playlist = sequelize.define('Playlist', {
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
        this.User.hasMany(Playlist, {
            foreignKey: 'userId',
            as: 'playlists'
        });

        this.Playlist.belongsTo(User, {
            foreignKey: 'userId'
        });
    }

    async connect() {
        await this.sequelize.authenticate()
        console.log('Connected to MongoDB');

    }

    async createUser(userData) {
        try {
            return await this.User.create(userData);

        } catch (error) {
            console.error('Error creating user:', error);
        }
    }

    async getUserById(userId) {
        try {
            let user = await this.User.findByPk(userId);
            return user;
        } catch (error) {
            console.error('Error getting user by ID:', error);
        }
    }

    async getUserByEmail(email) {
        try {
            let user = await this.User.findOne({ where: { email } });
            return user;
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    }

    async createPlaylist(playlistData, userID) {
        try {
            
        } catch (error) {
            console.error('Error creating playlist:', error);
            return null;
        }


        // const playlist = new Playlist(playlistData);
        // console.log("playlist: " + playlist.toString());
        // if (!playlist) {
        //     return null;
        // }

        // this.User.findOne({ _id: userID }, (err, user) => {
        //     console.log("user found: " + JSON.stringify(user));
        //     user.playlists.push(playlist._id);
        //     user
        //         .save()
        //         .then(() => {
        //             playlist
        //                 .save()
        //                 .then(() => {
        //                     return playlist;
        //                 })
        //                 .catch(error => {
        //                     return null;
        //                 })
        //         });
        // })
        // return playlist;
    }
}