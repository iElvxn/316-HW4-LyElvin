const Playlist = require('../models/playlist-model')
const User = require('../models/user-model');
const auth = require('../auth')
const DatabaseManager = require('../db/mongodb');
/*
    This is our back-end API. It provides all the data services
    our database needs. Note that this file contains the controller
    functions for each endpoint.
    
    @author McKilla Gorilla
*/
createPlaylist = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body;
    console.log("createPlaylist body: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Playlist',
        })
    }

    try {
        const playlist = await DatabaseManager.createPlaylist(body, req.userId);
        return res.status(201).json({
            playlist: playlist
        })
    } catch (error) {
        return res.status(400).json({
            errorMessage: 'Playlist Not Created!'
        })
    }
}
deletePlaylist = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("delete Playlist with id: " + JSON.stringify(req.params.id));
    console.log("delete " + req.params.id);
    try {
        const playlist = await DatabaseManager.deletePlaylist(req.params.id, req.userId);
        return res.status(200).json({
            playlist: playlist
        })
    } catch (error) {
        if (error.message === "Playlist not found!") {
            return res.status(404).json({
                errorMessage: "Playlist not found!"
            })
        } else if (error.message === "authentication error") {
            return res.status(400).json({
                errorMessage: "authentication error"
            })
        }
    }
}
getPlaylistById = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("Find Playlist with id: " + JSON.stringify(req.params.id));

    try {
        const playlist = await DatabaseManager.getPlaylistById(req.params.id, req.userId);
        return res.status(200).json({ success: true, playlist: playlist })
    } catch (error) {
       return res.status(400).json({
            errorMessage: "authentication error"
        })
    }
}
getPlaylistPairs = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("getPlaylistPairs");
    try {
        const playlists = await DatabaseManager.getPlaylistPairs(req.userId);
        return res.status(200).json({ success: true, idNamePairs: playlists })
    } catch (error) {
        return res.status(400).json({
            errorMessage: "authentication error"
        })
    }
}
getPlaylists = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    await Playlist.find({}, (err, playlists) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!playlists.length) {
            return res
                .status(404)
                .json({ success: false, error: `Playlists not found` })
        }
        return res.status(200).json({ success: true, data: playlists })
    }).catch(err => console.log(err))
}
updatePlaylist = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body
    console.log("updatePlaylist: " + JSON.stringify(body));
    console.log("req.body.name: " + req.body.name);

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        })
    }

    Playlist.findOne({ _id: req.params.id }, (err, playlist) => {
        console.log("playlist found: " + JSON.stringify(playlist));
        if (err) {
            return res.status(404).json({
                err,
                message: 'Playlist not found!',
            })
        }

        // DOES THIS LIST BELONG TO THIS USER?
        async function asyncFindUser(list) {
            await User.findOne({ email: list.ownerEmail }, (err, user) => {
                console.log("user._id: " + user._id);
                console.log("req.userId: " + req.userId);
                if (user._id == req.userId) {
                    console.log("correct user!");
                    console.log("req.body.name: " + req.body.name);

                    list.name = body.playlist.name;
                    list.songs = body.playlist.songs;
                    list
                        .save()
                        .then(() => {
                            console.log("SUCCESS!!!");
                            return res.status(200).json({
                                success: true,
                                id: list._id,
                                message: 'Playlist updated!',
                            })
                        })
                        .catch(error => {
                            console.log("FAILURE: " + JSON.stringify(error));
                            return res.status(404).json({
                                error,
                                message: 'Playlist not updated!',
                            })
                        })
                }
                else {
                    console.log("incorrect user!");
                    return res.status(400).json({ success: false, description: "authentication error" });
                }
            });
        }
        asyncFindUser(playlist);
    })
}
module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist
}