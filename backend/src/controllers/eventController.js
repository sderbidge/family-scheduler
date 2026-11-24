const eventModel = require('../models/eventModel');

const getAll = async (req, res, next) => {
  try {
    const events = await eventModel.getAll(req.query);
    res.json({ events });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const event = await eventModel.getById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ event });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { title, date } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!date)  return res.status(400).json({ error: 'Date is required' });
    const event = await eventModel.create(req.body);
    res.status(201).json({ event });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const changes = await eventModel.update(req.params.id, req.body);
    if (changes === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event updated' });
  } catch (err) {
    if (err.message === 'No fields to update') return res.status(400).json({ error: err.message });
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const changes = await eventModel.remove(req.params.id);
    if (changes === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove };
