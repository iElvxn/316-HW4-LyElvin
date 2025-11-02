import { beforeAll, beforeEach, afterEach, afterAll, expect, test } from 'vitest';
const dotenv = require('dotenv');
dotenv.config();
const { DatabaseManager } = require('../db/index.js');
const mongoose = require('mongoose')
const DATABASE_TYPE = process.env.DATABASE_TYPE;

let testUser;
let testPlaylist;


/**
 * Vitest test script for the Playlister app's Mongo Database Manager. Testing should verify that the Mongo Database Manager 
 * will perform all necessarily operations properly.
 *  
 * Scenarios we will test:
 *  1) Reading a User from the database
 *  2) Creating a User in the database
 *  3) ...
 * 
 * You should add at least one test for each database interaction. In the real world of course we would do many varied
 * tests for each interaction.
 */

/**
 * Executed once before all tests are performed.
 */
beforeAll(async () => {
    // SETUP THE CONNECTION VIA MONGOOSE JUST ONCE - IT IS IMPORTANT TO NOTE THAT INSTEAD
    // OF DOING THIS HERE, IT SHOULD BE DONE INSIDE YOUR Database Manager (WHICHEVER)
    await DatabaseManager.connect();

    // reseta our mongodb database
    if (DATABASE_TYPE === 'mongodb') {
        await mongoose.connection.dropDatabase();
    } else if (DATABASE_TYPE === 'postgresql') {
        // reset our postgres database
        await DatabaseManager.sequelize.sync({ force: true });
    }
});

/**
 * Executed before each test is performed.
 */
beforeEach(() => {
});

/**
 * Executed after each test is performed.
 */
afterEach(() => {
});

/**
 * Executed once after all tests are performed.
 */
afterAll(() => {
});

/**
 * Vitest test to see if the Database Manager can get a User.
 */
test('Test #1) createUser', async () => {
    // FILL IN A USER WITH THE DATA YOU EXPECT THEM TO HAVE
    const expectedUser = {
        firstName: 'Joe',
        lastName: 'Mama',
        email: 'joe.mama@stonybrook.edu',
        passwordHash: 'passwordHash'
    };

    // CREATE THE USER
    testUser = await DatabaseManager.createUser(expectedUser)

    // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
    expect(testUser.firstName).toBe(expectedUser.firstName);
    expect(testUser.lastName).toBe(expectedUser.lastName);
    expect(testUser.email).toBe(expectedUser.email);
});

test('Test #2) getUserById', async () => {
    const userId = testUser._id || testUser.id;
    const actualUser = await DatabaseManager.getUserById(userId);

    expect(actualUser).toBeDefined(); //it exists
    expect(actualUser.firstName).toBe(testUser.firstName);
    expect(actualUser.lastName).toBe(testUser.lastName)
    expect(actualUser.email).toBe(testUser.email);

});

test('Test #3) getUserByEmail', async () => {
    const actualUser = await DatabaseManager.getUserByEmail(testUser.email);

    expect(actualUser).toBeDefined(); //it exists
    expect(actualUser.firstName).toBe(testUser.firstName);
    expect(actualUser.lastName).toBe(testUser.lastName)
    expect(actualUser.email).toBe(testUser.email);
});

test('Test #4) createPlaylist', async () => {
    const expectedPlaylist = {
        name: 'Test Playlist',
        ownerEmail: testUser.email,
        songs: [
            {
                title: 'Song 1',
                artist: 'Artist1',
                youTubeId: '123'
            },
            {
                title: 'Song 2',
                artist: 'Artist2',
                youTubeId: '456',
            }
        ]
    };

    const userId = testUser._id || testUser.id;
    testPlaylist = await DatabaseManager.createPlaylist(expectedPlaylist, userId);

    expect(testPlaylist).toBeDefined();
    expect(testPlaylist.name).toBe(expectedPlaylist.name);
    expect(testPlaylist.ownerEmail).toBe(expectedPlaylist.ownerEmail);
    expect(testPlaylist.songs).toEqual(expectedPlaylist.songs);
});

test('Test #5) getPlaylistById', async () => {
    const playlistId = testPlaylist._id || testPlaylist.id;
    const userId = testUser._id || testUser.id;

    const actualPlaylist = await DatabaseManager.getPlaylistById(playlistId, userId);

    expect(actualPlaylist).toBeDefined();
    expect(actualPlaylist.name).toBe(testPlaylist.name);
    expect(actualPlaylist.ownerEmail).toBe(testPlaylist.ownerEmail);
    expect(actualPlaylist.songs).toEqual(testPlaylist.songs);
});

test('Test #6) getPlaylistPairs', async () => {
    const userId = testUser._id || testUser.id;

    const pairs = await DatabaseManager.getPlaylistPairs(userId);

    expect(pairs).toBeDefined();

    const testPlaylistPair = pairs.find(playlist => playlist.name === testPlaylist.name);
    expect(testPlaylistPair).toBeDefined();
    expect(testPlaylistPair.name).toBe(testPlaylist.name);
});

test('Test #7) getPlaylists', async () => {
    const playlists = await DatabaseManager.getPlaylists();

    expect(playlists).toBeDefined();
    expect(playlists.length).toBeGreaterThan(0); 

    //it should have our test playlist in it
    const foundPlaylist = playlists.find(playlist => playlist.name === testPlaylist.name);
    expect(foundPlaylist).toBeDefined();
    expect(foundPlaylist.ownerEmail).toBe(testPlaylist.ownerEmail);
    expect(foundPlaylist.songs).toEqual(testPlaylist.songs);
});

test('Test #8) updatePlaylist', async () => {
    const playlistId = testPlaylist._id || testPlaylist.id;
    const userId = testUser._id || testUser.id;
    const updateData = {
        name: "Joe Mama",
        songs: [
            {
                title: "New Song",
                artist: "Joe Mama",
                youTubeId: "67",
            },
            {
                title: "1738",
                artist: "Fetty Wap",
                youTubeId: "69",
            },
            {
                title: "Rick ROll",
                artist: "Rick Astley",
                youTubeId: "420",
            }
        ]
    };

    const updatedPlaylist = await DatabaseManager.updatePlaylist(playlistId, userId, updateData);
    expect(updatedPlaylist).toBeDefined();
    expect(updatedPlaylist.name).toBe(updateData.name);
    expect(updatedPlaylist.songs).toEqual(updateData.songs);

    testPlaylist = updatedPlaylist; //update our global to continue our tsts

});

test('Test #9) deletePlaylist', async () => {
    const playlistId = testPlaylist._id || testPlaylist.id;
    const userId = testUser._id || testUser.id;

    await DatabaseManager.deletePlaylist(playlistId, userId);

    await expect(DatabaseManager.getPlaylistById(playlistId, userId)).rejects.toThrow();
});

