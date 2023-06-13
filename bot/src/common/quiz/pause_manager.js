const fs = require('fs').promises;
const { mkdirSync } = require('fs');
const globals = require('./../globals.js');
const path = require('path');

const MEMENTO_VERSION = 'v1';

const SAVE_DATA_DIR = path.join(__dirname, '..', '..', '..', 'data', 'quiz_saves');
const QUIZ_SAVES_KEY = 'QuizSaveDataFiles';
const QUIZ_SAVES_BACKUP_KEY = 'QuizSavesBackup';
const MAX_RESTORABLE_PER_USER = 5;

mkdirSync(SAVE_DATA_DIR, { recursive: true });

function createQuizSaveMemento(time, fileName, quizName, userId, gameType) {
  return {
    time: time,
    fileName: fileName,
    quizType: quizName,
    userId: userId,
    gameType: gameType,
    formatVersion: MEMENTO_VERSION,
  };
}

function save(saveData, savingUser, quizName, gameType) {
  let now = Date.now();
  let fileName = savingUser + '_' + now;
  let json = JSON.stringify(saveData);
  return fs.writeFile(path.join(SAVE_DATA_DIR, fileName), json).then(() => {
    return globals.persistence.editDataForUser(savingUser, data => {
      if (!data[QUIZ_SAVES_KEY]) {
        data[QUIZ_SAVES_KEY] = [];
      }

      data[QUIZ_SAVES_KEY].push(createQuizSaveMemento(now, fileName, quizName, savingUser, gameType));
      return data;
    });
  });
}

function getIndexOfMemento(array, memento) {
  return array.findIndex(dbMemento => dbMemento.fileName === memento.fileName);
}

function deleteMemento(memento) {
  let deleteFromDb = globals.persistence.editDataForUser(memento.userId, data => {
    data[QUIZ_SAVES_KEY] = data[QUIZ_SAVES_KEY]
      .filter(otherMemento => otherMemento.time + otherMemento.userId !== memento.time + memento.userId);
    return data;
  });
  let deleteFile = fs.unlink(path.join(SAVE_DATA_DIR, memento.fileName)).catch(() => {});
  return Promise.all([deleteFromDb, deleteFile]).then(() => {
    globals.logger.info({
      event: 'AUTO DELETED NON-COMPATIBLE SAVE'
    });
  });
}

function deleteMementos(mementos) {
  if (mementos.length === 0) {
    return Promise.resolve();
  }
  let deletePromises = [];
  for (let memento of mementos) {
    deletePromises.push(deleteMemento(memento));
  }
  return Promise.all(deletePromises);
}

module.exports.load = function(memento) {
  return fs.readFile(path.join(SAVE_DATA_DIR, memento.fileName), 'utf8').then(data => {
    let json = JSON.parse(data);
    return globals.persistence.editDataForUser(memento.userId, dbData => {
      let mementoIndex = getIndexOfMemento(dbData[QUIZ_SAVES_KEY], memento);
      dbData[QUIZ_SAVES_KEY].splice(mementoIndex, 1);
      dbData[QUIZ_SAVES_BACKUP_KEY] = dbData[QUIZ_SAVES_BACKUP_KEY] || [];
      dbData[QUIZ_SAVES_BACKUP_KEY].push(memento);

      const promises = [];
      while (dbData[QUIZ_SAVES_BACKUP_KEY].length > MAX_RESTORABLE_PER_USER) {
        let mementoToDelete = dbData[QUIZ_SAVES_BACKUP_KEY].shift();
        promises.push(fs.unlink(path.join(SAVE_DATA_DIR, mementoToDelete.fileName)));
      }

      return Promise.all(promises).catch(err => {
        globals.logger.error({
          event: 'FILE FOR SAVE NOT FOUND',
          err,
        });
      }).then(() => {
        return dbData;
      });
    }).then(() => {
      return json;
    });
  }).catch(err => {
    globals.logger.error({
      event: 'FAILED TO LOAD FILE',
      detail: memento.fileName,
      err,
    });
    return globals.persistence.editDataForUser(memento.userId, dbData => {
      let mementoIndex = getIndexOfMemento(dbData[QUIZ_SAVES_KEY], memento);
      dbData[QUIZ_SAVES_KEY].splice(mementoIndex, 1);
      return dbData;
    }).then(() => {
      throw err;
    });
  });
};

module.exports.getSaveMementos = function(savingUser) {
  return globals.persistence.getDataForUser(savingUser).then(data => {
    let allMementos = data[QUIZ_SAVES_KEY] || [];
    let wrongFormatVersionMementos = allMementos.filter(memento => memento.formatVersion !== MEMENTO_VERSION);
    let rightFormatMementos = allMementos.filter(memento => memento.formatVersion === MEMENTO_VERSION);

    return deleteMementos(wrongFormatVersionMementos).then(() => {
      return rightFormatMementos.sort((a, b) => b.time - a.time);
    });
  });
};

module.exports.save = function(saveData, savingUser, quizName, gameType) {
  return save(saveData, savingUser, quizName, gameType);
};

module.exports.getRestorable = function(userId) {
  return globals.persistence.getDataForUser(userId).then(dbData => {
    return (dbData[QUIZ_SAVES_BACKUP_KEY] || []).reverse();
  });
}

module.exports.restore = function(userId, mementoToRestore) {
  return globals.persistence.editDataForUser(userId, dbData => {
    if (!dbData[QUIZ_SAVES_BACKUP_KEY] || !dbData[QUIZ_SAVES_KEY]) {
      throw new Error('That memento is not in the recycling bin.');
    }
    let mementoIndex = getIndexOfMemento(dbData[QUIZ_SAVES_BACKUP_KEY], mementoToRestore);
    if (mementoIndex === -1) {
      throw new Error('That memento is not in the recycling bin.');
    }
    dbData[QUIZ_SAVES_BACKUP_KEY].splice(mementoIndex, 1);
    dbData[QUIZ_SAVES_KEY].push(mementoToRestore);
    return dbData;
  }).then(dbData => {
    return dbData[QUIZ_SAVES_KEY].length - 1;
  });
}

module.exports.userHasAvailableSaveSlots = async function(userId) {
  const mementos = await module.exports.getSaveMementos(userId);
  return mementos.length < MAX_RESTORABLE_PER_USER;
}
