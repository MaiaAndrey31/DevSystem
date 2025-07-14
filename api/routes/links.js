const express = require('express');
const router = express.Router();
const Link = require('../models/link');

// Middleware de autenticação JWT
const authenticateJWT = (req, res, next) => {
  // Implementar lógica de autenticação JWT aqui
  // Por enquanto, apenas continuamos para a próxima rota
  next();
};

// Listar todos os links
router.get('/', async (req, res) => {
  try {
    const links = await Link.findAll();
    res.json(links);
  } catch (error) {
    console.error('Erro ao buscar links:', error);
    res.status(500).json({ error: 'Erro ao buscar links' });
  }
});

// Obter um link específico
router.get('/:id', async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Link não encontrado' });
    }
    res.json(link);
  } catch (error) {
    console.error('Erro ao buscar link:', error);
    res.status(500).json({ error: 'Erro ao buscar link' });
  }
});

// Criar novo link (protegido por autenticação)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const link = await Link.create(req.body);
    res.status(201).json(link);
  } catch (error) {
    console.error('Erro ao criar link:', error);
    res.status(400).json({ error: error.message });
  }
});

// Atualizar link existente (protegido por autenticação)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const link = await Link.update(req.params.id, req.body);
    if (!link) {
      return res.status(404).json({ error: 'Link não encontrado' });
    }
    res.json(link);
  } catch (error) {
    console.error('Erro ao atualizar link:', error);
    res.status(400).json({ error: error.message });
  }
});

// Remover link (protegido por autenticação)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const deleted = await Link.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Link não encontrado' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover link:', error);
    res.status(500).json({ error: 'Erro ao remover link' });
  }
});

module.exports = router;
