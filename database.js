import sql from 'mssql';


const config = {
  server: 'DESKTOP-S0VC9O8',
  database: 'master',
  port: 1433,
  user: 'sa',
  password: '12qwaszx12',
  options: {
    trustServerCertificate: true
  }
};

export async function RunQuery(Query) {
  let queryData
  try {
    await sql.connect(config);
    queryData = await executeQuery(Query);
    await closeConnection();
    return queryData
  } catch (error) {
    console.log(error);
  }
}

async function closeConnection() {
  try {
    await sql.close();
    console.log('Connection closed');
  } catch (error) {
    console.log(error);
  }
}

async function executeQuery(Query) {
  try {
    const result = await sql.query(Query);
    return result.recordset
  } catch (error) {
    console.log(error);
  }
}


export async function RunRamdomSQLQuery() {
  const db = await init();
  // db.run("CREATE TABLE RegisteredUniversities ( UniID INTEGER NOT NULL PRIMARY KEY, UniFullName varchar(250) NULL, DateCreated datetime, DateDeleted datetime)")
  // db.run("INSERT INTO RegisteredUniversities (UniFullName, DateCreated, DateDeleted) VALUES ('University of Oxford', '2023-04-29 12:00:00', NULL), ('University of Cambridge', '2023-04-29 12:00:00', NULL), ('Imperial College London', '2023-04-29 12:00:00', NULL), ('University College London', '2023-04-29 12:00:00', NULL), ('University of Edinburgh', '2023-04-29 12:00:00', NULL), ('University of Manchester', '2023-04-29 12:00:00', NULL), ('University of Bristol', '2023-04-29 12:00:00', NULL), ('University of Warwick', '2023-04-29 12:00:00', NULL), ('University of Glasgow', '2023-04-29 12:00:00', NULL), ('University of Leeds', '2023-04-29 12:00:00', NULL); ")
  // const get = await db.all("SELECT * FROM RegisteredUniversities")
  // console.log(get)
  // return get

  // db.run("UPDATE RegisteredCourses SET DateCreated = DATETIME()")
  console.log("Table created successfully")
}

export async function getDetails(table) {
  const db = await init();
  const get = await db.all(`Select * FROM ${table}`);
  return get;
}



export async function addFile(file, id) {
  const db = await init();
  const date = new Date().toISOString();
  const secs = Math.floor(Date.now() / 1000);
  await db.run('INSERT INTO File VALUES (?,?,?,?,?,?)', [id, file.body.user, file.file.originalname, [], date, secs]);
  return getDetails('File');
}

export async function addSharedFiles(info) {
  const db = await init();
  await db.run('INSERT INTO sharedFile VALUES (?,?,?,?,?,?)', [uuid(), info.peerId, info.senderId, info.fileId, info.fileName, info.timeNow]);
  await db.run('UPDATE File SET sharedWithPeers = sharedWithPeers || ? WHERE id = ?', [',' + info.peerId, info.fileId]);
  return getDetails('sharedFile');
}

export async function addFeedbacks(info) {
  const db = await init();
  if (!info.groupFeedback) {
    await db.run('INSERT INTO feedback VALUES (?,?,?,?)', [info.feedbacks, info.rating, info.senderName, info.fromFile]);
  } else {
    await db.run('INSERT INTO feedback VALUES (?,?,?,?)', [info.feedbacks, info.rating, info.senderName, info.fromFile]);
    const memberPoints = await db.all('SELECT memberPoints FROM groupMember WHERE groupId = ? AND memberId = ?', [info.groupId, info.memberId]);
    const groupPoints = await db.all('SELECT numberOfReviews FROM peerGroup WHERE id = ?', [info.groupId]);
    const points = memberPoints[0].memberPoints + 1;
    let pointsForGroup;
    if (groupPoints[0].numberOfReviews === null) {
      pointsForGroup = 1;
    } else {
      pointsForGroup = groupPoints[0].numberOfReviews + 1;
    }
    await db.run('UPDATE groupMember SET memberPoints = ? WHERE groupId = ? AND memberId = ?', [points, info.groupId, info.memberId]);
    await db.run('UPDATE peerGroup SET numberOfReviews = ? WHERE id = ?', [pointsForGroup, info.groupId]);
  }
  return getDetails('feedback');
}

export async function deleteFile(id) {
  const db = await init();
  await db.run('DELETE FROM File WHERE id = ?', [id]);
  return getDetails('File');
}

export async function requestNoti() {
  const db = await init();
  const getData = await db.all('SELECT groupId, peerGroup.name AS groupName, peerGroup.creator AS groupCreator, User.name AS groupMember, memberId FROM groupMember INNER JOIN peerGroup ON groupMember.groupId = peerGroup.id INNER JOIN User ON User.id = groupMember.memberId WHERE groupMember.responded = ? AND groupMember.creator != memberId', [false]);
  return getData;
}

export async function getAllGroupMembers() {
  const db = await init();
  const getData = await db.all('SELECT groupId, peerGroup.name AS groupName, peerGroup.creator AS groupCreator, peerGroup.numberOfReviews AS groupPoints, User.name AS groupMember, memberId, memberPoints FROM groupMember INNER JOIN peerGroup ON groupMember.groupId = peerGroup.id INNER JOIN User ON User.id = groupMember.memberId WHERE groupMember.hasJoined = ? OR groupMember.creator = groupMember.memberId ORDER BY groupName ASC', [true]);
  return getData;
}

export async function createGroups(info) {
  const db = await init();
  const groupId = uuid();
  if (info[0] === 'inviteRequest') {
    const requestExist = await db.all('SELECT responded FROM groupMember WHERE groupId = ? AND memberId = ?', [info[1].groupId, info[1].memberId]);
    if (requestExist.length === 0) {
      await db.run('INSERT INTO groupMember VALUES (?,?,?,?,?,?)', [info[1].groupId, info[1].memberId, info[1].groupCreator, info[1].hasJoined, info[1].responded, 0]);
    }
  } else {
    await db.run('INSERT INTO peerGroup VALUES (?,?,?,?,?)', [groupId, info[0].name, info[0].creator, info[0].joindate, info[0].numberOfReviews]);
    const allMembers = info[1].memberId;
    for (const member of allMembers) {
      await db.run('INSERT INTO groupMember VALUES (?,?,?,?,?,?)', [groupId, member, info[1].groupCreator, info[1].hasJoined, info[1].responded, 0]);
    }
  }
  return getDetails('groupMember');
}

export async function addgroupFile(info, fileId) {
  const db = await init();
  if (info.fileSent === 'false') {
    fileId = undefined;
  }
  try {
    await db.run('INSERT INTO groupData VALUES (?,?,?,?,?,?,?,?)', [uuid(), info.message, info.senderId, info.senderName, info.groupId, info.sentAt, fileId, info.groupFileName]);
  } catch (e) {
    console.log(e, 'cannot add message');
  }
  return getDetails('groupData');
}

export async function changeGroupInfo(info) {
  let hasJoined;
  if (info.hasJoined === 'Accept') {
    hasJoined = true;
  } else {
    hasJoined = false;
  }
  const db = await init();
  await db.run('UPDATE groupMember SET hasJoined = ? WHERE groupId = ? AND memberId = ?', [hasJoined, info.groupId, info.person]);
  await db.run('UPDATE groupMember SET responded = ? WHERE groupId = ? AND memberId = ?', [true, info.groupId, info.person]);
  return getDetails('groupMember');
}

export async function getGroupFiles() {
  const db = await init();
  const getData = await db.all('SELECT * FROM groupData WHERE fileId IS NOT NULL');
  return getData;
}

export async function leaveGroup(data) {
  const db = await init();
  await db.run('DELETE FROM groupMember WHERE groupId = ? AND memberId = ?', [data.groupId, data.userId]);
  return getDetails('groupMember');
}


export async function getUserFiles(id) {
  const db = await init();
  const get = await db.all('Select * FROM File WHERE user_id = ?', [id]);
  return get;
}
