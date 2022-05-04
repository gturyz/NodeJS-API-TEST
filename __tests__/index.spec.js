const server = require('../index')
const request = require('supertest')

// const request = supertest(server)

describe("L'api name", () => {
    test('GET /api/names', async () => {
        const response = await request(server)
            .get('/api/names')
            .expect(200)
            .expect('Content-Type', 'application/json')
        expect(response.body).toMatchObject({
            '0': { nom: 'Alice' },
            '1': { nom: 'Bob' },
            '2': { nom: 'Charlie' }
        })
    })
})

describe("Syteme statique", () => {
    test("GET /", async () => {
        const response = await request(server)
            .get('/')
            .expect(200)
            .expect('Content-Type', 'text/html')
        expect(response.text).toMatch(/HELLO/)
    })
})