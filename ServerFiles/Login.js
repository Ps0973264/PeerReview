import express from 'express';
import uuid from 'uuid-random';

import *  as db from '../database.js'
import *  as authenticateUser from './UserAuthentication.js'

const loginRouter = new express.Router()

/* #region ROUTE: ListOfUsers  */
loginRouter.post('/ListOfUsers/check-userDetails', express.json(), async (req, res) => {
    try {
        let query;
        const { username, universityID, courseID, checkUsernameOnly } = req.body
        if (checkUsernameOnly) {
            query = `SELECT 1 FROM RegisteredUsers WHERE DateDeleted IS NULL AND UserName = '${username.trim()}'`
            const usernameCheck = await db.RunQuery(query)
            if (usernameCheck.length > 0) {
                return res.status(409).json({ message: 'Username already exists' });
            } else [
                res.status(200).json({ message: 'success' })
            ]
        } else {
            query = `SELECT UserID FROM RegisteredUsers WHERE DateDeleted IS NULL AND UserName = '${username.trim()}' AND UniversityID = ${universityID} AND CourseID = ${courseID}`
            const userDetailsCheck = await db.RunQuery(query)
            console.log(userDetailsCheck.length)
            if (userDetailsCheck.length < 1) {
                return res.status(409).json({ message: 'Incorrect user details' });
            } else {
                res.json({token: authenticateUser.generateUserToken({username: username}), message: 'success'})
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


loginRouter.post('/ListOfUsers', express.json(), async (req, res) => {
    try {
        req.body.userID = uuid();
        const user = req.body
        const query = `INSERT INTO RegisteredUsers (UserID, Username, FullName, UniversityID, CourseID, DateCreated, Points) VALUES ('${user.userID}', '${user.username}', '${user.fullName}', ${user.universityID}, ${user.courseID}, GetDate(), ${user.points})`
        await db.RunQuery(query)
        res.json(await db.RunQuery(`SELECT * FROM RegisteredUsers WHERE DateDeleted IS NULL`));
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to add new user, please try again :(');
    }
});
/* #endregion */

loginRouter.get('/ListOfUniversities', async (req, res) => {
    try {
        const ListOfUniversities = await db.RunQuery('SELECT UniversityID ID, UniFullName Name FROM RegisteredUniversities WHERE DateDeleted IS NULL')
        res.json(ListOfUniversities);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

loginRouter.get('/ListOfCourses', async (req, res) => {
    try {
        const ListOfCourses = await db.RunQuery(`SELECT CourseID ID, CourseFullName Name FROM RegisteredCourses WHERE DateDeleted IS NULL`);
        res.json(ListOfCourses);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


export default loginRouter;