const Audit = require('../models/Audit');

exports.logAction = async ({ documentId, action, user, email, ip }) => {
  try {
    await Audit.create({
      documentId,
      action,
      user,
      email,
      ip
    });
  } catch (err) {
    console.error('Audit Log Error:', err.message);
  }
};
