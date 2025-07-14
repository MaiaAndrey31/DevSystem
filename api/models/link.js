const db = require('../db');

// Lista de ícones permitidos
const ALLOWED_ICONS = [
  'Link', 'CoinVertical', 'Headset', 'Gear', 'Globe', 'Book', 'Github',
  'Linkedin', 'Twitter', 'Youtube', 'Instagram', 'Facebook', 'Discord',
  'Code', 'Database', 'Layers', 'Terminal', 'Rocket', 'Lightbulb'
];

class Link {
  static async create({ title, url, description = '', icon = 'Link' }) {
    if (!title || !url) {
      throw new Error('Title and URL are required');
    }

    if (!this.isValidUrl(url)) {
      throw new Error('Invalid URL format');
    }

    if (!ALLOWED_ICONS.includes(icon)) {
      throw new Error('Invalid icon');
    }

    const query = `
      INSERT INTO links (title, url, description, icon)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `;
    
    const values = [title, url, description, icon];
    const [result] = await db.query(query, values);
    return result[0];
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM links ORDER BY created_at DESC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM links WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, { title, url, description, icon }) {
    const updates = [];
    const values = [];

    if (title) {
      updates.push('title = ?');
      values.push(title);
    }

    if (url) {
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid URL format');
      }
      updates.push('url = ?');
      values.push(url);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (icon) {
      if (!ALLOWED_ICONS.includes(icon)) {
        throw new Error('Invalid icon');
      }
      updates.push('icon = ?');
      values.push(icon);
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const query = `
      UPDATE links 
      SET ${updates.join(', ')}
      WHERE id = ?
      RETURNING *
    `;

    const [result] = await db.query(query, values);
    return result[0];
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM links WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  }
}

module.exports = Link;
