const mongoose = require('mongoose');
const DatabaseManager = require('../DatabaseManager');
const User = require('../../models/user-model');
const Playlist = require('../../models/playlist-model');

class MongoDBManager extends DatabaseManager {
    constructor() {
        super();
        this.User = User;
        this.Playlist = Playlist;
    }

    async connect() {
        mongoose
            .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
            .catch(e => {
                console.error('Connection error', e.message)
            })
            .then(() => {
                console.log('Connected to MongoDB');
            })
    }

    async createUser(userData) {
        try {
            const user = new this.User(userData);
            return await user.save();
        } catch (error) {
            console.error('Error creating user:', error);
            throw error
        }
    }

    async getUserById(userId) {
        try {
            let user = await this.User.findById(userId);
            return user;
        } catch (error) {
            console.error('Error getting user by ID:', error);
        }
    }

    async getUserByEmail(email) {
        try {
            let user = await this.User.findOne({ email });
            return user;
        } catch (error) {
            console.error('Error getting user by email:', error);
        }
    }

    async createPlaylist(playlistData, userID) {
        try {
            const playlist = new Playlist(playlistData);
            console.log("playlist: " + playlist.toString());
            if (!playlist) {
                return null;
            }

            const user = await this.User.findOne({ _id: userID })

            console.log("user found: " + JSON.stringify(user));
            user.playlists.push(playlist._id);
            await user.save();
            await playlist.save();
            return playlist.toObject();
        } catch (error) {
            console.error(error)
            throw error;
        }
    }

    async deletePlaylist(playlistID, userID) {
        try {
            const playlist = await Playlist.findById(playlistID);
            console.log("playlist found: " + JSON.stringify(playlist));

            if (!playlist) {
                throw new Error('Playlist not found!');
            }

            // DOES THIS LIST BELONG TO THIS USER?
            const user = await User.findOne({ email: playlist.ownerEmail });
            console.log("user._id: " + user._id);
            console.log("userID: " + userID);

            if (user._id.toString() === userID.toString()) {
                console.log("correct user!");
                await Playlist.findOneAndDelete({ _id: playlistID });
                return {};
            } else {
                console.log("incorrect user!");
                throw new Error("authentication error");
            }
        } catch (error) {
            console.error('Error deleting playlist:', error);
            throw error;
        }
    }

    async getPlaylistById(playlistID, userID) {
        try {
            const playlist = await Playlist.findById(playlistID);

            if (!playlist) {
                throw new Error('Playlist not found');
            }

            console.log("Found list: " + JSON.stringify(playlist));

            // Verify ownership
            const user = await User.findOne({ email: playlist.ownerEmail });

            console.log("user._id: " + user._id);
            console.log("userID: " + userID);

            if (user._id.toString() === userID.toString()) {
                console.log("correct user!");
                return playlist.toObject();
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
            const user = await User.findOne({ _id: userID })

            console.log("find all Playlists owned by " + user.email);
            const playlists = await Playlist.find({ ownerEmail: user.email });
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
                        _id: list._id,
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
            const playlist = await Playlist.findOne({ _id: playlistID })
            console.log("playlist found: " + JSON.stringify(playlist));


            // DOES THIS LIST BELONG TO THIS USER?
            const user = await User.findOne({ email: playlist.ownerEmail })
            console.log("user._id: " + user._id);
            console.log("req.userId: " + userID);
            if (user._id.toString() == userID.toString()) {
                console.log("correct user!");
                console.log("updateData.name: " + updateData.name);

                playlist.name = updateData.name;
                playlist.songs = updateData.songs;
                const updatedPlaylist = await playlist.save()

                console.log("SUCCESS!!!");
                return updatedPlaylist.toObject()

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
        const playlists = await Playlist.find({})
        if (!playlists.length) {
            return { success: false, error: `Playlists not found` }
        }
        return playlists.map(playlist => playlist.toObject())
    }
}
const dbManager = new MongoDBManager();
module.exports = dbManager;