const http = require('http')
const fs = require('fs')
const path = require('path')

const contentType = {
    "js": { 'content-type': 'text/javascript' },
    "css": { 'content-type': 'text/css' },
    "gif": { 'content-type': 'image/gif' },
}

const db = require('./db')

const mapToObj = m => {
    return Array.from(m).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
    }, {});
};

const server = http.createServer((req, res) => {
    try {
        if (req.url === "/") {
            if (req.method === "GET") {
                res.writeHead(200, { 'content-type': 'text/html' });
                res.write(fs.readFileSync(path.join(__dirname, "public", "pages", "index.html")));
                res.end();
            } else {
                res.writeHead(405, { 'content-type': 'text/html' });
                res.write(fs.readFileSync(path.join(__dirname, "public", "pages", "method_not_allowed.html")));
                res.end();
            }
        } else if (req.url === "/api/names") {
            if (req.method === "GET") {
                res.writeHead(200, { 'content-type': 'application/json' });
                res.write(JSON.stringify(mapToObj(db['memoryDb'])));
                res.end();
            } else if (req.method === "POST") {
                let data = ''
                req.on('data', chunk => {
                    data += chunk;
                })
                req.on('end', () => {
                    try {
                        if (typeof data === undefined) {
                            throw 'bad request'
                        } else {
                            data = JSON.parse(data)
                            if (!('name' in data)) {
                                throw 'bad request - test'
                            }
                            let currentId = db['id']
                            db['memoryDb'].set(db['id']++, data)
                            res.writeHead(201, { 'content-type': 'application/json' });
                            res.write(JSON.stringify(db['memoryDb'].get(currentId)));
                            res.end();
                        }
                    } catch (err) {
                        console.log(err)
                        res.writeHead(400, { 'content-type': 'text/html' });
                        res.write(fs.readFileSync(path.join(__dirname, "public", "pages", "bad_request.html")));
                        res.end()
                    }
                });
            } else {
                res.writeHead(405, { 'content-type': 'text/html' });
                res.write(fs.readFileSync(path.join(__dirname, "public", "pages", "method_not_allowed.html")));
                res.end();
            }
        } else if (req.url.match(/\/api\/name\/*/)) {
            const split = req.url.split('/')
            const id = split[split.length - 1]
            if (!db['memoryDb'].has(parseInt(id))) {
                res.writeHead(404, { 'content-type': 'text/html' });
                res.write(fs.readFileSync(path.join(__dirname, "public", "pages", "not_found.html")));
                res.end();
            }else if (req.method === "GET") {
                res.writeHead(200, { 'content-type': 'application/json' });
                res.write(JSON.stringify(db['memoryDb'].get(parseInt(id))));
                res.end();
            } else if (req.method === "DELETE") {
                db['memoryDb'].delete(parseInt(id))
                res.writeHead(204);
                res.end();
            } else if (req.method === "PUT") {
                let data = '';
                req.on('data', chunk => {
                    data += chunk;
                });
                req.on('end', () => {
                    try {
                        if (typeof data === undefined) {
                            throw 'bad request'
                        } else {
                            data = JSON.parse(data)
                            if (!('name' in data)) {
                                throw 'bad request - test'
                            }
                            db['memoryDb'].set(db['id'], data)
                            res.writeHead(204);
                            res.end();
                        }
                    } catch (err) {
                        console.log(err)
                        res.writeHead(400, { 'content-type': 'text/html' });
                        res.write(fs.readFileSync(path.join(__dirname, "public", "pages", "bad_request.html")));
                        res.end()
                    }
                });
            } else {
                res.writeHead(405, { 'content-type': 'text/html' });
                res.write(fs.readFileSync(path.join(__dirname, "public", "pages", "method_not_allowed.html")));
                res.end();
            }
        } else if (req.url.match(/\/public\/*.*/)) {
            const split = req.url.split('/')
            const file = split[split.length - 1].split('.')
            if (req.method === "GET") {
                res.writeHead(200, contentType[file[1]]);
                res.write(fs.readFileSync(path.join(__dirname, "public", file[1], `${file[0]}.${file[1]}`)));
                res.end();
            } else {
                res.writeHead(405, { 'content-type': 'text/html' });
                res.write(fs.readFileSync(path.join(__dirname, "public", "pages", "method_not_allowed.html")));
                res.end();
            }
        } else {
            res.writeHead(404, { 'content-type': 'text/html' });
            res.write(fs.readFileSync(path.join(__dirname, "public", "pages", "not_found.html")));
            res.end();
        }
    } catch (err) {
        res.writeHead(500, { 'content-type': 'text/html' });
        res.write(fs.readFileSync(path.join(__dirname, "public", "pages", "internal_server_error.html")));
        res.end()
    }
})

module.exports = server
