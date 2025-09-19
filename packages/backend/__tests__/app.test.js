const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check if items have the expected structure
      const item = response.body[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('created_at');
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      // First, create a new item to delete
      const newItem = { name: 'Item to Delete' };
      const createRes = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');
      expect(createRes.status).toBe(201);
      const id = createRes.body.id;

      // Now, delete the item
      const deleteRes = await request(app).delete(`/api/items/${id}`);
      expect(deleteRes.status).toBe(204);

      // Verify item is gone
      const getRes = await request(app).get('/api/items');
      const ids = getRes.body.map(item => item.id);
      expect(ids).not.toContain(id);
    });

    it('should return 404 for non-existent item', async () => {
      const deleteRes = await request(app).delete('/api/items/99999');
      expect(deleteRes.status).toBe(404);
      expect(deleteRes.body).toHaveProperty('error');
    });

    it('should return 400 for invalid id', async () => {
      const deleteRes = await request(app).delete('/api/items/invalid');
      expect(deleteRes.status).toBe(400);
      expect(deleteRes.body).toHaveProperty('error');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = { name: 'Test Item' };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body).toHaveProperty('created_at');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if name is empty', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '' })
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });
  });
});