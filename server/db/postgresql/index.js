const { Sequelize, DataTypes } = require('sequelize');
const DatabaseManager = require('../DatabaseManager');

class SequelizeManager extends DatabaseManager {
    constructor() {
        super();
        this.sequelize = new Sequelize(process.env.POSTGRESQL_URI);
        this.User = null;
        this.Playlist = null;
        this.initializeModels();
    }

    async initializeModels() {
        //User
        this.User = this.sequelize.define('User', {
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
        this.Playlist = this.sequelize.define('Playlist', {
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
        this.User.hasMany(this.Playlist, {
            foreignKey: 'userId',
            as: 'playlists'
        });

        this.Playlist.belongsTo(this.User, {
            foreignKey: 'userId'
        });
    }

    async connect() {
        await this.sequelize.authenticate()
        console.log('Connected to Postgres');

    }

    async createUser(userData) {
        try {
            return await this.User.create(userData);

        } catch (error) {
            console.error('Error creating user:', error);
            throw error
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
            const user = await this.User.findByPk(userID);
            console.log("user found: " + JSON.stringify(user));

            playlistData.userId = userID;
            const playlist = await this.Playlist.create(playlistData);
            console.log("playlist: " + JSON.stringify(playlist));

            return {
                ...playlist.toJSON(),
                _id: playlist.id
            };

        } catch (error) {
            console.error('Error creating playlist:', error);
            return null;
        }
    }

    async deletePlaylist(playlistID, userID) {
        const playlist = await this.Playlist.findByPk(playlistID);
        console.log("playlist found: " + JSON.stringify(playlist));

        if (!playlist) {
            throw new Error('Playlist not found!');
        }

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await this.User.findOne({ where: { email: playlist.ownerEmail } });
        console.log("user._id: " + user.id);
        console.log("userID: " + userID);

        if (user.id == userID) {
            console.log("correct user!");
            await playlist.destroy();
            return {};
        } else {
            console.log("incorrect user!");
            throw new Error("authentication error");
        }
    }

    async getPlaylistById(playlistID, userID) {
        try {
            const playlist = await this.Playlist.findByPk(playlistID);

            if (!playlist) {
                throw new Error('Playlist not found');
            }

            console.log("Found list: " + JSON.stringify(playlist));

            // Verify ownership
            const user = await this.User.findOne({ where: { email: playlist.ownerEmail } });
            console.log("user._id: " + user.id);
            console.log("userID: " + userID);

            if (user.id.toString() === userID.toString()) {
                console.log("correct user!");
                return {
                    ...playlist.toJSON(),
                    _id: playlist.id
                };
            } else {
                console.log("incorrect user!");
                throw new Error('authentication error');
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async getPlaylistPairs(userID) {
        try {
            console.log("find user with id " + userID);
            const user = await this.User.findByPk(userID);

            console.log("find all Playlists owned by " + user.email);
            const playlists = await this.Playlist.findAll({
                where: { ownerEmail: user.email },
                attributes: ['id', 'name'] //we only need the id and name
            })
            console.log("found Playlists: " + JSON.stringify(playlists));

            if (!playlists) {
                console.log("!playlists.length");
                return { success: false, error: 'Playlists not found' }
            }
            else {
                console.log("Send the Playlist pairs");
                // PUT ALL THE LISTS INTO ID, NAME PAIRS
                let pairs = [];
                for (let key in playlists) {
                    let list = playlists[key];
                    let pair = {
                        _id: list.id,
                        name: list.name
                    };
                    pairs.push(pair);
                }
                return pairs
            }
        } catch (err) {
            console.error(err)
            throw err
        }
    }

    async updatePlaylist(playlistID, userID, updateData) {
        try {
            const playlist = await this.Playlist.findByPk(playlistID);
            console.log("playlist found: " + JSON.stringify(playlist));


            // DOES THIS LIST BELONG TO THIS USER?
            const user = await this.User.findOne({ where: { email: playlist.ownerEmail } });
            console.log("user._id: " + user.id);
            console.log("req.userId: " + userID);
            if (user.id == userID) {
                console.log("correct user!");
                console.log("updateData.name: " + updateData.name);

                playlist.name = updateData.name;
                playlist.songs = updateData.songs;
                const updatedPlaylist = await playlist.save()

                console.log("SUCCESS!!!");
                return {
                    ...updatedPlaylist.toJSON(),
                    _id: updatedPlaylist.id
                }

            }
            else {
                console.log("incorrect user!");
                return { success: false, description: "authentication error" }
            }
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    async getPlaylists() {
        const playlists = await this.Playlist.findAll();
        if (!playlists.length) {
            return { success: false, error: `Playlists not found` }
        }
        return playlists.map(playlist => ({
            ...playlist.toJSON(),
            _id: playlist.id
        }));
    }
}

const dbManager = new SequelizeManager();
module.exports = dbManager;