const memberModel = require('../models/memberModel');

const getAll = async (req, res, next) => {
  try {
    const members = await memberModel.getAll();
    res.json({ members });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { name, color, avatar } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const member = await memberModel.create({ name, color, avatar });
    res.status(201).json({ member });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const changes = await memberModel.update(req.params.id, req.body);
    if (changes === 0) return res.status(404).json({ error: 'Member not found' });
    res.json({ message: 'Member updated' });
  } catch (err) {
    if (err.message === 'No fields to update') return res.status(400).json({ error: err.message });
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const changes = await memberModel.remove(req.params.id);
    if (changes === 0) return res.status(404).json({ error: 'Member not found' });
    res.json({ message: 'Member deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove };
